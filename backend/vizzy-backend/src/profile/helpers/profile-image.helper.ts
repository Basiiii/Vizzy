import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import { PROFILE_AVATAR_FOLDER } from '@/constants/storage';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
export class ProfileImageHelper {
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 250,
    dimensions: { width: 500, height: 500 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };
  private static logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    ProfileImageHelper.logger = logger;
  }

  static validateImageType(mimetype: string): void {
    ProfileImageHelper.logger.info(`Validating image type: ${mimetype}`);
    if (
      !this.CONFIG.allowedMimeTypes.includes(
        mimetype as (typeof this.CONFIG.allowedMimeTypes)[number],
      )
    ) {
      ProfileImageHelper.logger.error(
        `Invalid file format: ${mimetype}. Allowed formats are JPEG, PNG, and WEBP.`,
      );
      throw new HttpException(
        'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }
    ProfileImageHelper.logger.info(`Image type ${mimetype} is valid`);
  }

  static async processImage(buffer: Buffer): Promise<Buffer> {
    ProfileImageHelper.logger.info(`Processing image...`);
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
      ProfileImageHelper.logger.error(
        `Failed to reduce image size below ${this.CONFIG.maxSizeKB}KB after ${attempts} attempts`,
      );
      throw new HttpException(
        `Could not reduce file size below ${this.CONFIG.maxSizeKB}KB`,
        HttpStatus.BAD_REQUEST,
      );
    }
    ProfileImageHelper.logger.info(
      `Image processed successfully. Final size: ${compressedImage.byteLength} bytes`,
    );

    return compressedImage;
  }

  static async uploadImage(
    supabase: SupabaseClient,
    userId: string,
    imageBuffer: Buffer,
  ): Promise<{ data: any }> {
    ProfileImageHelper.logger.info(`Uploading image for userId: ${userId}`);
    const filePath = `${PROFILE_AVATAR_FOLDER}/${userId}`;
    const { data, error } = await supabase.storage
      .from('user')
      .upload(filePath, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '300',
        upsert: true,
      });

    if (error) {
      ProfileImageHelper.logger.error(
        `Error uploading image to Supabase: ${error.message}`,
      );
      throw new HttpException(
        `Storage upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    ProfileImageHelper.logger.info(
      `Image uploaded successfully. File path: ${filePath}`,
    );
    return { data };
  }

  private static async compressImage(
    buffer: Buffer,
    quality: number,
  ): Promise<Buffer> {
    ProfileImageHelper.logger.info(
      `Compressing image with quality: ${quality}`,
    );
    const { width, height } = this.CONFIG.dimensions;
    return await sharp(buffer)
      .resize({
        width,
        height,
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
      .toBuffer();
  }
}
