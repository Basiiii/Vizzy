import { HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
import { PROFILE_AVATAR_FOLDER } from '@/constants/storage';

export class ProfileImageHelper {
  private static readonly CONFIG = {
    initialQuality: 80,
    maxAttempts: 5,
    maxSizeKB: 250,
    dimensions: { width: 500, height: 500 },
    minQuality: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  };

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
        `Could not reduce file size below ${this.CONFIG.maxSizeKB}KB`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return compressedImage;
  }

  static async uploadImage(
    supabase: SupabaseClient,
    userId: string,
    imageBuffer: Buffer,
  ): Promise<{ data: any }> {
    const filePath = `${PROFILE_AVATAR_FOLDER}/${userId}`;
    const { data, error } = await supabase.storage
      .from('user')
      .upload(filePath, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '300',
        upsert: true,
      });

    if (error) {
      throw new HttpException(
        `Storage upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data };
  }

  private static async compressImage(
    buffer: Buffer,
    quality: number,
  ): Promise<Buffer> {
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
