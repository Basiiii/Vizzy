import { HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_FOLDER,
} from '@/constants/storage';

/**
 * Helper class for profile image operations
 * Manages image validation, processing, and storage
 */
export class ProfileImageHelper {
  /**
   * Configuration for image processing and validation
   * @private
   */
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 250,
    dimensions: { width: 500, height: 500 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };

  /**
   * Validates that the image type is allowed
   * @param mimetype - MIME type of the image
   * @throws HttpException if image format is not allowed
   */
  static validateImageType(mimetype: string): void {
    if (
      !this.CONFIG.allowedMimeTypes.includes(
        mimetype as (typeof this.CONFIG.allowedMimeTypes)[number],
      )
    ) {
      throw new HttpException(
        'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Processes an image by resizing and compressing it
   * @param buffer - Raw image buffer
   * @returns Processed image buffer
   * @throws HttpException if image cannot be compressed to target size
   */
  static async processImage(buffer: Buffer): Promise<Buffer> {
    let quality = this.CONFIG.initialQuality;
    let compressedImage = await this.compressImage(buffer, quality);

    let attempts = 0;
    while (
      compressedImage.byteLength > this.CONFIG.maxSizeKB * 1024 &&
      attempts < this.CONFIG.maxAttempts &&
      quality > this.CONFIG.minQuality
    ) {
      quality -= 10;
      compressedImage = await this.compressImage(buffer, quality);
      attempts++;
    }

    if (compressedImage.byteLength > this.CONFIG.maxSizeKB * 1024) {
      throw new HttpException(
        `Image is too large. Maximum size is ${this.CONFIG.maxSizeKB}KB.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return compressedImage;
  }

  /**
   * Compresses an image to a specific quality level
   * @param buffer - Raw image buffer
   * @param quality - WebP quality level (1-100)
   * @returns Compressed image buffer
   * @private
   */
  private static async compressImage(
    buffer: Buffer,
    quality: number,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(this.CONFIG.dimensions.width, this.CONFIG.dimensions.height, {
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality })
      .toBuffer();
  }

  /**
   * Uploads an image to storage
   * @param supabase - Supabase client instance
   * @param userId - User ID for the image filename
   * @param imageBuffer - Processed image buffer to upload
   * @returns Upload response with path information
   * @throws HttpException if upload fails
   */
  static async uploadImage(
    supabase: SupabaseClient,
    userId: string,
    imageBuffer: Buffer,
  ) {
    const { data, error } = await supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(`${PROFILE_AVATAR_FOLDER}/${userId}`, imageBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      throw new HttpException(
        `Failed to upload image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data };
  }
}
