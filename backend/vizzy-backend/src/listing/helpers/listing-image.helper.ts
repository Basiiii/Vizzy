import { HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

/**
 * Helper class for managing listing image operations
 * Provides methods for validating, processing, and uploading listing images
 */
export class ListingImageHelper {
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 500,
    dimensions: { width: 1200, height: 1200 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };

  /**
   * Validates that the image has an allowed MIME type
   * @param mimetype - MIME type of the image to validate
   * @param logger - Winston logger instance for logging
   * @throws HttpException if the image type is not allowed
   */
  static validateImageType(mimetype: string, logger: Logger): void {
    logger.info(`Validating image type: ${mimetype}`);

    if (
      !this.CONFIG.allowedMimeTypes.includes(
        mimetype as (typeof this.CONFIG.allowedMimeTypes)[number],
      )
    ) {
      logger.warn(`Invalid file format: ${mimetype}`);
      throw new HttpException(
        'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    logger.debug('Image type validation passed');
  }

  /**
   * Processes an image by resizing and compressing it to meet size requirements
   * Uses an iterative approach to reduce quality until size constraints are met
   * @param buffer - Buffer containing the original image data
   * @param logger - Winston logger instance for logging
   * @returns Buffer containing the processed image data
   */
  static async processImage(buffer: Buffer, logger: Logger): Promise<Buffer> {
    logger.info(`Processing image of size: ${this.getFileSizeInKB(buffer)}KB`);

    let quality = this.CONFIG.initialQuality;
    let compressedImage = await this.compressImage(buffer, quality, logger);

    let attempts = 0;
    while (
      this.getFileSizeInKB(compressedImage) > this.CONFIG.maxSizeKB &&
      attempts < this.CONFIG.maxAttempts &&
      quality > this.CONFIG.minQuality
    ) {
      quality -= 10;
      logger.debug(
        `Compression attempt ${attempts + 1}: reducing quality to ${quality}`,
      );
      compressedImage = await this.compressImage(buffer, quality, logger);
      attempts++;
    }

    logger.info(
      `Image processed. Final size: ${this.getFileSizeInKB(compressedImage)}KB, quality: ${quality}, attempts: ${attempts}`,
    );
    return compressedImage;
  }

  /**
   * Compresses an image with the specified quality setting
   * @param buffer - Buffer containing the original image data
   * @param quality - Quality setting for compression (1-100)
   * @param logger - Winston logger instance for logging
   * @returns Buffer containing the compressed image data
   * @throws HttpException if image compression fails
   */
  private static async compressImage(
    buffer: Buffer,
    quality: number,
    logger: Logger,
  ): Promise<Buffer> {
    try {
      logger.debug(`Compressing image with quality: ${quality}`);

      const result = await sharp(buffer)
        .resize({
          width: this.CONFIG.dimensions.width,
          height: this.CONFIG.dimensions.height,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      logger.debug(
        `Compression successful, new size: ${this.getFileSizeInKB(result)}KB`,
      );
      return result;
    } catch (error) {
      logger.error(`Error compressing image: ${error.message}`, error);
      throw new HttpException(
        'Failed to process image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculates the size of a buffer in kilobytes
   * @param buffer - Buffer to calculate the size of
   * @returns Size of the buffer in kilobytes
   */
  private static getFileSizeInKB(buffer: Buffer): number {
    return buffer.length / 1024;
  }

  /**
   * Uploads an image to Supabase storage
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to associate the image with
   * @param imageBuffer - Buffer containing the processed image data
   * @param originalFilename - Original filename of the image
   * @param logger - Winston logger instance for logging
   * @returns Object containing the path and URL of the uploaded image
   * @throws HttpException if image upload fails
   */
  static async uploadImage(
    supabase: SupabaseClient,
    listingId: number,
    imageBuffer: Buffer,
    originalFilename: string,
    logger: Logger,
  ): Promise<{ data: { path: string; url: string } }> {
    const fileExtension = originalFilename.split('.').pop() || 'jpg';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${listingId}/${uniqueFilename}`;

    logger.info(
      `Uploading image to path: ${filePath}, size: ${this.getFileSizeInKB(imageBuffer)}KB`,
    );

    const { data, error } = await supabase.storage
      .from('listings')
      .upload(filePath, imageBuffer, {
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      logger.error(`Storage upload failed: ${error.message}`, error);
      throw new HttpException(
        `Storage upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      logger.error('No data returned from storage upload');
      throw new HttpException(
        'No data returned from storage upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info(`Image uploaded successfully: ${filePath}`);
    return {
      data: {
        path: filePath,
        url: `${process.env.SUPABASE_URL}/storage/v1/object/public/listings/${filePath}`,
      },
    };
  }

  /**
   * Deletes all images for a listing from Supabase storage
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing whose images to delete
   * @param logger - Winston logger instance for logging
   * @throws HttpException if image deletion fails
   */
  static async deleteImages(
    supabase: SupabaseClient,
    listingId: number,
    logger: Logger,
  ): Promise<void> {
    logger.info(`Deleting all images for listing ID: ${listingId}`);

    // First list all files in the listing's folder
    const { data: files, error: listError } = await supabase.storage
      .from('listings')
      .list(`${listingId}`);

    if (listError) {
      logger.error(`Failed to list images: ${listError.message}`, listError);
      throw new HttpException(
        `Failed to list images: ${listError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!files || files.length === 0) {
      logger.info(`No images found for listing ID: ${listingId}`);
      return;
    }

    const filePaths = files.map((file) => `${listingId}/${file.name}`);

    // Delete all files
    const { error: deleteError } = await supabase.storage
      .from('listings')
      .remove(filePaths);

    if (deleteError) {
      logger.error(
        `Failed to delete images: ${deleteError.message}`,
        deleteError,
      );
      throw new HttpException(
        `Failed to delete images: ${deleteError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info(
      `Successfully deleted ${files.length} images for listing ID: ${listingId}`,
    );
  }

  /**
   * Updates the images for a listing by adding new ones without removing existing ones
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to update images for
   * @param files - Array of files to process and upload
   * @param logger - Winston logger instance for logging
   * @returns Array of uploaded image information
   * @throws HttpException if image processing or upload fails
   */
  static async addListingImages(
    supabase: SupabaseClient,
    listingId: number,
    files: Express.Multer.File[],
    logger: Logger,
  ): Promise<{ path: string; url: string }[]> {
    const results: { path: string; url: string }[] = [];

    for (const file of files) {
      try {
        // Validate and process each image
        this.validateImageType(file.mimetype, logger);
        const processedImage = await this.processImage(file.buffer, logger);

        // Upload the processed image
        const result = await this.uploadImage(
          supabase,
          listingId,
          processedImage,
          file.originalname,
          logger,
        );

        results.push(result.data);
      } catch (error) {
        logger.error(`Error processing image: ${error.message}`);
        throw new HttpException(
          `Failed to process image: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return results;
  }

  /**
   * Updates images for a listing by handling deletions, reordering, and setting main image
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing
   * @param imagesToDelete - Array of image paths to delete
   * @param mainImage - Path of the image to set as main
   * @param logger - Winston logger instance
   */
  static async updateListingImages(
    supabase: SupabaseClient,
    listingId: number,
    imagesToDelete?: string[],
    mainImage?: string,
    logger?: Logger,
  ): Promise<void> {
    // Delete specified images if any
    if (imagesToDelete?.length) {
      logger?.info(
        `Deleting ${imagesToDelete.length} images from listing ${listingId}`,
      );

      for (const path of imagesToDelete) {
        const { error } = await supabase.storage
          .from('listings')
          .remove([path]);

        if (error) {
          logger?.error(`Error deleting image ${path}: ${error.message}`);
          throw new HttpException(
            `Failed to delete image: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }

    // Update main image if specified
    if (mainImage) {
      logger?.info(
        `Setting main image for listing ${listingId} to ${mainImage}`,
      );
      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/listings/${mainImage}`;
      await this.updateListingImageUrl(supabase, listingId, imageUrl);
    }
  }

  /**
   * Updates the main image URL for a listing
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to update
   * @param imageUrl - The URL of the main image
   * @returns Promise resolving when update is complete
   * @throws HttpException if update fails
   */
  private static async updateListingImageUrl(
    supabase: SupabaseClient,
    listingId: number,
    imageUrl: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('update_listing_image_url', {
      listing_id: listingId,
      image_url: imageUrl,
    });

    if (error) {
      throw new HttpException(
        `Failed to update listing image URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
