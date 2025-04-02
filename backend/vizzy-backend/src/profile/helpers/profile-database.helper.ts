import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { VERIFICATION_THRESHOLD } from '@/constants/user.constants';
import {
  PROFILE_PICTURE_PATH,
  SUPABASE_STORAGE_URL,
} from '@/constants/storage';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
export class ProfileDatabaseHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    ProfileDatabaseHelper.logger = logger;
  }
  static async getProfileByUsername(
    supabase: SupabaseClient,
    username: string,
  ): Promise<Profile | null> {
    ProfileDatabaseHelper.logger.info(
      `Helper getProfileByUsername called for username: ${username}`,
    );
    const { data, error } = await supabase.rpc('get_user_profile', {
      username,
    });

    if (error) {
      ProfileDatabaseHelper.logger.error(
        `Error fetching profile ${username}: ${error.message}`,
      );
      throw new HttpException(
        `Failed to fetch user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) return null;
    ProfileDatabaseHelper.logger.info(
      `Profile of ${username} successfully found in database`,
    );
    return {
      id: data.id,
      name: data.name,
      location: 'Not Yet Implemented',
      avatarUrl: `${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${data.id}`,
      isVerified: data.active_listings > VERIFICATION_THRESHOLD,
      memberSince: data.created_year,
      activeListings: data.active_listings ?? 0,
      totalSales: data.totalSales ?? 0,
    };
  }

  static async updateProfile(
    supabase: SupabaseClient,
    userId: string,
    profileData: UpdateProfileDto,
  ): Promise<void> {
    ProfileDatabaseHelper.logger.info(
      `Helper updateProfile called for userId: ${userId}`,
    );
    const { error } = await supabase.rpc('update_user_data', {
      user_id_text: userId,
      profile_data: profileData,
    });

    if (error) {
      ProfileDatabaseHelper.logger.error(
        `Error updating profile for user ${userId}: ${error.message}`,
      );
      throw new HttpException(
        `Failed to update profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    ProfileDatabaseHelper.logger.info(
      `Profile of ${userId} successfully updated in database`,
    );
  }
}
