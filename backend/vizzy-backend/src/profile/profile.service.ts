import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { ProfileDatabaseHelper } from './helpers/profile-database.helper';
import { ProfileImageHelper } from './helpers/profile-image.helper';
import { UpdateProfileSchema } from '@/dtos/profile/update-profile.dto';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { CACHE_KEYS } from '@/constants/cache.constants';

/**
 * Service responsible for managing user profile operations
 * Handles profile retrieval, updates, and avatar management with caching support
 */
@Injectable()
export class ProfileService {
  private readonly CACHE_EXPIRATION = 3600; // 1 hour

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Retrieves a user profile by username
   * Checks cache first, then falls back to database if not found
   * @param username - The username to look up
   * @returns The user profile if found, null otherwise
   */
  async getProfileByUsername(username: string): Promise<Profile | null> {
    this.logger.info(
      `Using service getProfileByUsername for username: ${username}`,
    );
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = CACHE_KEYS.PROFILE(username);

    const cachedProfile = await GlobalCacheHelper.getFromCache<Profile>(
      redisClient,
      cacheKey,
    );

    if (cachedProfile) {
      this.logger.info(`Cache hit for profile username: ${username}`);
      return cachedProfile;
    }

    this.logger.info(
      `Cache miss for profile username: ${username}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const profile = await ProfileDatabaseHelper.getProfileByUsername(
      supabase,
      username,
    );

    if (profile) {
      this.logger.info(`Caching profile data for username: ${username}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        profile,
        this.CACHE_EXPIRATION,
      );
    } else {
      this.logger.warn(`No profile found for username: ${username}`);
    }

    return profile;
  }

  /**
   * Updates a user profile
   * @param username - Username of the profile to update
   * @param userId - User ID of the profile owner
   * @param updateProfileDto - Data for updating the profile
   * @returns Success message
   * @throws BadRequestException if username is not provided or validation fails
   */
  async updateProfile(
    username: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    this.logger.info(`Using service updateProfile for username: ${username}`);

    if (!username) {
      this.logger.error('Username is required for updating profile');
      throw new BadRequestException('Username is required');
    }

    try {
      UpdateProfileSchema.parse(updateProfileDto);

      const supabase = this.supabaseService.getAdminClient();
      await ProfileDatabaseHelper.updateProfile(
        supabase,
        userId,
        updateProfileDto,
      );

      const redisClient = this.redisService.getRedisClient();
      const cacheKey = CACHE_KEYS.PROFILE(username);

      this.logger.info(`Invalidating cache for username: ${username}`);
      await GlobalCacheHelper.invalidateCache(redisClient, cacheKey);

      return 'Profile updated successfully';
    } catch (error) {
      this.logger.error(`Error updating profile: ${error.message}`);
      throw new BadRequestException('Invalid profile data');
    }
  }

  /**
   * Processes and uploads a profile picture
   * @param file - The image file to process and upload
   * @param userId - User ID of the profile owner
   * @returns Upload response with path information
   */
  async processAndUploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ) {
    this.logger.info(`Processing profile picture for user ID: ${userId}`);
    ProfileImageHelper.validateImageType(file.mimetype);

    this.logger.info('Compressing and resizing image');
    const processedImage = await ProfileImageHelper.processImage(file.buffer);

    this.logger.info('Uploading processed image to storage');
    const supabase = this.supabaseService.getAdminClient();
    const result = await ProfileImageHelper.uploadImage(
      supabase,
      userId,
      processedImage,
    );

    this.logger.info(
      `Profile picture uploaded successfully for user ID: ${userId}`,
    );
    return result;
  }
}
