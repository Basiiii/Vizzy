import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VERIFICATION_THRESHOLD } from '@/constants/user.constants';

export class ProfileDatabaseHelper {
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
      location: 'Not Yet Implemented',
      avatarUrl: '',
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
    const { error } = await supabase.rpc('update_user_data', {
      user_id_text: userId,
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
