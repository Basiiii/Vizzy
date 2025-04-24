import { HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';
import { ProposalImageDto } from '@/dtos/proposal/proposal-images.dto';
import {
  PROPOSAL_IMAGES_BUCKET,
  SUPABASE_STORAGE_URL,
} from '@/constants/storage';

/**
 * Helper class for handling proposal image processing and storage operations
 */
export class ProposalImageHelper {
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 500,
    dimensions: { width: 1200, height: 1200 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };

  /**
   * Validates if the image type is allowed
   * @param mimetype - The MIME type of the image
   * @param logger - Logger instance for logging
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
   * Processes an image to reduce its size while maintaining quality
   * @param buffer - The image buffer to process
   * @param logger - Logger instance for logging
   * @returns Promise<Buffer> - The processed image buffer
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
   * Compresses an image with specified quality
   * @param buffer - The image buffer to compress
   * @param quality - The quality level for compression
   * @param logger - Logger instance for logging
   * @returns Promise<Buffer> - The compressed image buffer
   * @throws HttpException if compression fails
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
   * @param buffer - The buffer to measure
   * @returns number - The size in kilobytes
   */
  private static getFileSizeInKB(buffer: Buffer): number {
    return buffer.length / 1024;
  }

  /**
   * Uploads an image to storage
   * @param supabase - Supabase client instance
   * @param proposalId - ID of the proposal
   * @param imageBuffer - The image buffer to upload
   * @param originalFilename - The original filename of the image
   * @param logger - Logger instance for logging
   * @returns Promise<{ data: ProposalImageDto }> - The uploaded image data
   * @throws HttpException if upload fails
   */
  static async uploadImage(
    supabase: SupabaseClient,
    proposalId: number,
    imageBuffer: Buffer,
    originalFilename: string,
    logger: Logger,
  ): Promise<{ data: ProposalImageDto }> {
    const fileExtension =
      originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${proposalId}/${uniqueFilename}`;
    const contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    logger.info(
      `Uploading image to path: ${filePath}, size: ${this.getFileSizeInKB(imageBuffer)}KB, type: ${contentType}`,
    );

    const { data: uploadData, error } = await supabase.storage
      .from(PROPOSAL_IMAGES_BUCKET)
      .upload(filePath, imageBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.error(`Storage upload failed: ${error.message}`, error);
      throw new HttpException(
        `Storage upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!uploadData) {
      logger.error('No data returned from storage upload');
      throw new HttpException(
        'No data returned from storage upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const publicUrl = `${SUPABASE_STORAGE_URL}/${PROPOSAL_IMAGES_BUCKET}/${filePath}`;

    logger.info(`Image uploaded successfully: ${filePath}`);
    logger.debug(`Constructed Public URL: ${publicUrl}`);

    return {
      data: {
        path: filePath,
        url: publicUrl,
      },
    };
  }
  /**
   * Fetches the public URLs and paths of images associated with a proposal
   * @param supabase - Supabase client instance
   * @param proposalId - ID of the proposal
   * @param logger - Logger instance for logging
   * @returns Promise<ProposalImageDto[]> - Array of image data objects
   * @throws HttpException if fetching fails
   */
  static async fetchProposalImageUrls(
    supabase: SupabaseClient,
    proposalId: number,
    logger: Logger,
  ): Promise<ProposalImageDto[]> {
    const folderPath = `${proposalId}/`;
    logger.info(`Fetching images from storage path: ${folderPath}`);

    try {
      const fileList = await this.fetchFileList(supabase, folderPath, logger);
      return this.processFileList(fileList, folderPath, logger);
    } catch (error) {
      this.handleFetchError(error, proposalId, logger);
    }
  }

  /**
   * Fetches list of files from Supabase storage for a given folder path
   * @param supabase - Supabase client instance
   * @param folderPath - Path to the folder containing images
   * @param logger - Logger instance for logging
   * @returns Promise<any[]> - Array of file objects from storage
   * @throws HttpException if listing operation fails
   */
  private static async fetchFileList(
    supabase: SupabaseClient,
    folderPath: string,
    logger: Logger,
  ) {
    const { data: fileList, error: listError } = await supabase.storage
      .from(PROPOSAL_IMAGES_BUCKET)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      logger.error(
        `Storage list failed for path ${folderPath}: ${listError.message}`,
        listError,
      );
      if (listError.message.includes('Not Found')) {
        logger.warn(`No image folder found. Returning empty list.`);
        return [];
      }
      throw new HttpException(
        `Failed to list proposal images: ${listError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!fileList || fileList.length === 0) {
      logger.warn(`No file list returned or empty for path ${folderPath}`);
      return [];
    }

    return fileList;
  }

  /**
   * Processes a list of files into ProposalImageDto objects
   * @param fileList - Array of file objects from storage
   * @param folderPath - Path to the folder containing images
   * @param logger - Logger instance for logging
   * @returns ProposalImageDto[] - Array of processed image DTOs
   */
  private static processFileList(
    fileList: any[],
    folderPath: string,
    logger: Logger,
  ): ProposalImageDto[] {
    const imageDtos = fileList
      .filter((file) => file.name !== '.emptyFolderPlaceholder')
      .map((file) => ({
        path: `${folderPath}${file.name}`,
        url: `${SUPABASE_STORAGE_URL}/${PROPOSAL_IMAGES_BUCKET}/${folderPath}${file.name}`,
      }));

    logger.info(`Found ${imageDtos.length} images`);
    return imageDtos;
  }

  /**
   * Handles errors that occur during image fetching operations
   * @param error - The error that occurred
   * @param proposalId - ID of the proposal
   * @param logger - Logger instance for logging
   * @throws HttpException with appropriate error message and status
   */
  private static handleFetchError(
    error: any,
    proposalId: number,
    logger: Logger,
  ): never {
    logger.error(
      `Error fetching proposal images for ID ${proposalId}: ${error.message}`,
      error,
    );
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      'Failed to retrieve proposal images',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
