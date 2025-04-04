import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Profile } from '@/dtos/profile/profile.dto';
import {
  UpdateProfileDto,
  UpdateProfileSchema,
} from '@/dtos/profile/update-profile.dto';
import { ProfileCacheHelper } from './helpers/profile-cache.helper';
import { ProfileDatabaseHelper } from './helpers/profile-database.helper';
import { ProfileImageHelper } from './helpers/profile-image.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ProfileService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getProfileByUsername(username: string): Promise<Profile | null> {
    this.logger.info(
      `Using service getProfileByUsername for username: ${username}`,
    );
    const redisClient = this.redisService.getRedisClient();

    const cachedProfile = await ProfileCacheHelper.getProfileFromCache(
      redisClient,
      username,
    );
    if (cachedProfile) {
      this.logger.info(`Cache hit for username: ${username}`);
      return cachedProfile;
    }

    this.logger.info(`Cache miss for username: ${username}, querying database`);
    const supabase = this.supabaseService.getPublicClient();
    const profile = await ProfileDatabaseHelper.getProfileByUsername(
      supabase,
      username,
    );

    if (profile) {
      this.logger.info(`Caching profile data for username: ${username}`);
      await ProfileCacheHelper.cacheProfile(redisClient, username, profile);
    } else {
      this.logger.warn(`No profile found for username: ${username}`);
    }

    return profile;
  }

  async updateProfile(
    username: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    this.logger.info(`Using service updateProfile for username: ${username}`);
    if (!username) {
      this.logger.error('Username is required for updating profile');
      throw new Error('Username is required');
    }

    try {
      UpdateProfileSchema.parse(updateProfileDto);
    } catch (error) {
      this.logger.error('Validation error:', error);
      throw new Error('Invalid profile data');
    }

    const supabase = this.supabaseService.getAdminClient();
    await ProfileDatabaseHelper.updateProfile(
      supabase,
      userId,
      updateProfileDto,
    );

    const redisClient = this.redisService.getRedisClient();
    this.logger.info(`Invalidating cache for username: ${username}`);
    await ProfileCacheHelper.invalidateCache(redisClient, username);

    this.logger.info(`Profile updated successfully for username: ${username}`);
    return 'Profile updated successfully';
  }

  async processAndUploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ data: any }> {
    this.logger.info(
      `Using service processAndUploadProfilePicture for user ID: ${userId}`,
    );
    ProfileImageHelper.validateImageType(file.mimetype);

    const processedImage = await ProfileImageHelper.processImage(file.buffer);

    const supabase = this.supabaseService.getAdminClient();
    this.logger.info(
      `Uploading processed image for user ID: ${userId} to Supabase`,
    );
    return await ProfileImageHelper.uploadImage(
      supabase,
      userId,
      processedImage,
    );
  }
}
