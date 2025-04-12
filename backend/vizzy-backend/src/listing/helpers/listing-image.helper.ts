import { HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export class ListingImageHelper {
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 500,
    dimensions: { width: 1200, height: 1200 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };

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

  private static getFileSizeInKB(buffer: Buffer): number {
    return buffer.length / 1024;
  }

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
}
