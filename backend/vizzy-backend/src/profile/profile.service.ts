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
    const redisClient = this.redisService.getRedisClient();

    const cachedProfile = await ProfileCacheHelper.getProfileFromCache(
      redisClient,
      username,
    );
    if (cachedProfile) return cachedProfile;

    const supabase = this.supabaseService.getPublicClient();
    const profile = await ProfileDatabaseHelper.getProfileByUsername(
      supabase,
      username,
    );

    if (profile) {
      await ProfileCacheHelper.cacheProfile(redisClient, username, profile);
    }

    return profile;
  }

  async updateProfile(
    username: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    if (!username) {
      throw new Error('Username is required');
    }

    try {
      UpdateProfileSchema.parse(updateProfileDto);
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error('Invalid profile data');
    }

    const supabase = this.supabaseService.getAdminClient();
    await ProfileDatabaseHelper.updateProfile(
      supabase,
      userId,
      updateProfileDto,
    );

    const redisClient = this.redisService.getRedisClient();
    await ProfileCacheHelper.invalidateCache(redisClient, username);

    return 'Profile updated successfully';
  }

  async processAndUploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ data: any }> {
    ProfileImageHelper.validateImageType(file.mimetype);

    const processedImage = await ProfileImageHelper.processImage(file.buffer);

    const supabase = this.supabaseService.getAdminClient();
    return await ProfileImageHelper.uploadImage(
      supabase,
      userId,
      processedImage,
    );
  }
}
