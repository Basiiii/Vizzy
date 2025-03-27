import { CACHE_KEYS, VERIFICATION_THRESHOLD } from '@/constants/constants';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProfileDto } from '@/dtos/update-profile.dto';
import { Profile } from '@/dtos/user-profile.dto';
import sharp from 'sharp';

@Injectable()
export class ProfileService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getProfileByUsername(username: string): Promise<Profile> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const redisClient = this.redisService.getRedisClient();

    // Try to get cached response from Redis
    try {
      const cachedLookup = await redisClient.get(cacheKey);

      if (cachedLookup) {
        console.log('Cache hit for profile of user:', username);
        return JSON.parse(cachedLookup) as Profile;
      }
    } catch (error) {
      console.error(error);
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();
    const { data, error } = await supabase.rpc('get_user_profile', {
      username,
    });

    // Error handling
    if (error) {
      console.error(
        `Error fetching user profile: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
    if (!data) {
      console.log(`User profile not found: ${username}`);
      return null;
    }

    // Cache and return valid user profile
    console.log(`Cache miss for profile of user: ${username}`);
    const profileData: Profile = {
      id: data.id,
      name: data.name,
      location: 'Not Yet Implemented',
      avatarUrl: '',
      isVerified: data.active_listings > VERIFICATION_THRESHOLD ? true : false,
      memberSince: data.created_year,
      activeListings: data.active_listings ?? 0,
      totalSales: data.totalSales ?? 0,
    };
    await redisClient.set(cacheKey, JSON.stringify(profileData), 'EX', 3600);

    return profileData;
  }

  /**
   * Updates the user's profile information in the database.
   *
   * This function validates the provided profile data, calls a Supabase RPC function (`update_user_data`)
   * to update both `auth.users` and `public.profiles` tables, and clears the related cache in Redis.
   *
   * @param {string} username - The username of the user whose profile is being updated.
   * @param {string} userId - The UUID of the user whose profile needs to be updated.
   * @param {UpdateProfileDto} updateProfileDto - The profile data to be updated (validated using Zod).
   * @returns {Promise<string>} A success message if the update is successful.
   *
   * @throws {Error} If the username is missing.
   * @throws {Error} If the profile data does not match the expected schema.
   */
  async updateProfile(
    username: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    if (!username) {
      throw new Error('Profile data not found!');
    }
    try {
      UpdateProfileDto.parse(updateProfileDto);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Update data doesnt match the pattern:', error);
        throw new Error('Invalid data');
      }
      throw error;
    }
    console.log(userId);
    const supabaseClient = this.supabaseService.getAdminClient();
    const { data, error } = await supabaseClient.rpc('update_user_data', {
      user_id_text: userId,
      profile_data: updateProfileDto,
    });
    if (error) console.log('Erro:', error.message);

    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const redisClient = this.redisService.getRedisClient();
    await redisClient.del(cacheKey);

    console.log('Update response:', data);
    return 'Profile updated successfully';
  }

  /**
   * Processes and uploads a user's profile picture.
   * The image is validated, compressed, and resized before being uploaded to Supabase storage.
   *
   * @param file - The uploaded file from Express.Multer
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to an object containing the upload response data
   * @throws {HttpException} When file format is invalid
   * @throws {HttpException} When file size cannot be reduced to target size
   * @throws {HttpException} When storage upload fails
   * @throws {HttpException} When image processing fails
   */
  async processAndUploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ data: any }> {
    try {
      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ] as const;
      const mimetype = String(file.mimetype);
      if (
        !allowedMimeTypes.includes(
          mimetype as (typeof allowedMimeTypes)[number],
        )
      ) {
        throw new HttpException(
          'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Image processing configuration
      const config = {
        initialQuality: 80,
        maxAttempts: 5,
        maxSizeKB: 250,
        dimensions: { width: 500, height: 500 },
        minQuality: 10,
      };

      let quality = config.initialQuality;
      let compressedImage = await this.compressImage(
        file.buffer,
        quality,
        config.dimensions,
      );

      // Attempt to reduce file size if needed
      let attempts = 0;
      while (
        compressedImage.byteLength > config.maxSizeKB * 1024 &&
        attempts < config.maxAttempts &&
        quality > config.minQuality
      ) {
        quality -= 10;
        compressedImage = await this.compressImage(
          file.buffer,
          quality,
          config.dimensions,
        );
        attempts++;
      }

      // Check final file size
      if (compressedImage.byteLength > config.maxSizeKB * 1024) {
        throw new HttpException(
          `Could not reduce the file size below ${config.maxSizeKB} KB after ${config.maxAttempts} attempts.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const filePath = `profile-picture/${userId}`;

      // Upload to Supabase
      const supabase = this.supabaseService.getAdminClient();
      const { data, error } = await supabase.storage
        .from('user')
        .upload(filePath, compressedImage, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new HttpException(
          `Storage upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Image processing failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Compresses and resizes an image buffer using Sharp.
   *
   * @param buffer - The input image buffer to process
   * @param quality - The JPEG quality level (0-100)
   * @param dimensions - Object containing width and height dimensions
   * @param dimensions.width - Target width in pixels
   * @param dimensions.height - Target height in pixels
   * @returns Promise resolving to the compressed image buffer
   */
  private async compressImage(
    buffer: Buffer,
    quality: number,
    dimensions: { width: number; height: number },
  ): Promise<Buffer> {
    const result = await sharp(buffer)
      .resize({
        width: dimensions.width,
        height: dimensions.width,
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
      .toBuffer();

    return Buffer.from(result);
  }
}
