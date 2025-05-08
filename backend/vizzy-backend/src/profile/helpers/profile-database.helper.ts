import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VERIFICATION_THRESHOLD } from '@/constants/user.constants';
import {
  PROFILE_PICTURE_PATH,
  SUPABASE_STORAGE_URL,
} from '@/constants/storage';

/**
 * Helper class for profile database operations
 * Manages retrieving and updating profile data in Supabase
 */
export class ProfileDatabaseHelper {
  /**
   * Retrieves a user profile by username from the database
   * @param supabase - Supabase client instance
   * @param username - Username to look up
   * @returns The user profile if found, null otherwise
   * @throws HttpException if database operation fails
   */
  static async getProfileByUsername(
    supabase: SupabaseClient,
    username: string,
  ): Promise<Profile | null> {
    const { data, error } = await supabase.rpc('get_user_profile', {
      username,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      location: data.location,
      avatarUrl: `${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${data.id}`,
      isVerified: data.active_listings > VERIFICATION_THRESHOLD,
      memberSince: data.created_year,
      activeListings: data.active_listings ?? 0,
      totalSales: data.total_sales ?? 0,
    };
  }

  /**
   * Updates a user profile in the database
   * @param supabase - Supabase client instance
   * @param userId - User ID of the profile to update
   * @param profileData - Data for updating the profile
   * @throws HttpException if database operation fails
   */
  static async updateProfile(
    supabase: SupabaseClient,
    userId: string,
    profileData: UpdateProfileDto,
  ): Promise<void> {
    const { error } = await supabase.rpc('update_user_data', {
      user_id: userId,
      profile_data: profileData,
    });

    if (error) {
      throw new HttpException(
        `Failed to update profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
