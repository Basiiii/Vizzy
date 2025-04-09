import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserLocationDto } from '@/dtos/user/user-location.dto';

export class UserDatabaseHelper {
  static async getUserById(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, email, is_deleted, deleted_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  static async getUserByUsername(
    supabase: SupabaseClient,
    username: string,
  ): Promise<UserLookupDto | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  static async softDeleteUser(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_user', {
      _user_id: userId,
    });

    if (error) {
      throw new HttpException(
        `Failed to execute stored procedure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async getUserLocation(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<UserLocationDto | null> {
    const { data, error } = await supabase.rpc('fetch_user_location', {
      _user_id: userId,
    });

    if (error) {
      console.error('Error fetching user location:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Return the first (and should be only) result
    return {
      id: data[0].location_id,
      full_address: data[0].full_address,
      lat: data[0].lat,
      lon: data[0].lon,
      created_at: data[0].created_at,
    };
  }
}
