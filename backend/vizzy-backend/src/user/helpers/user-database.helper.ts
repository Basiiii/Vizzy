import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserLocationDto } from '@/dtos/user/user-location.dto';

/**
 * Helper class for database operations related to users
 * Provides methods for retrieving and managing user data in Supabase
 */
export class UserDatabaseHelper {
  /**
   * Retrieves a user by their ID
   * @param supabase - Supabase client instance
   * @param userId - ID of the user to retrieve
   * @returns The user information or null if not found
   */
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

  /**
   * Retrieves a user by their username
   * @param supabase - Supabase client instance
   * @param username - Username of the user to retrieve
   * @returns Basic user lookup information or null if not found
   * @throws Error if fetching fails
   */
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

  /**
   * Performs a soft delete on a user account
   * @param supabase - Supabase client instance
   * @param userId - ID of the user to soft delete
   * @throws HttpException if the operation fails
   */
  static async softDeleteUser(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_user', {
      user_id: userId,
    });

    if (error) {
      throw new HttpException(
        `Failed to execute stored procedure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new HttpException(
        `Failed to delete user: ${deleteError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves the location information for a specific user
   * @param supabase - Supabase client instance
   * @param userId - ID of the user whose location to retrieve
   * @returns The user's location information or null if not found
   */
  static async getUserLocation(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<UserLocationDto | null> {
    const { data, error } = await supabase.rpc('fetch_user_location', {
      user_id: userId,
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
