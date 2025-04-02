import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

export class UserDatabaseHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    UserDatabaseHelper.logger = logger;
  }
  static async getUserById(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<User | null> {
    UserDatabaseHelper.logger.info(
      `Helper getUserById called for userId: ${userId}`,
    );
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, email, is_deleted, deleted_at')
      .eq('id', userId)
      .single();

    if (error) {
      UserDatabaseHelper.logger.error(
        `Error fetching user ${userId}: ${error.message}`,
      );
      return null;
    }
    UserDatabaseHelper.logger.info(
      `User ${userId} successfully found in database`,
    );

    return data;
  }

  static async getUserByUsername(
    supabase: SupabaseClient,
    username: string,
  ): Promise<UserLookupDto | null> {
    UserDatabaseHelper.logger.info(
      `Helper getUserByUsername called for username: ${username}`,
    );
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      UserDatabaseHelper.logger.error(
        `Error fetching user ${username}: ${error.message}`,
      );

      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    UserDatabaseHelper.logger.info(
      `User ${username} successfully found in database`,
    );

    return data;
  }

  static async softDeleteUser(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<void> {
    UserDatabaseHelper.logger.info(
      `softDeleteUser called for userId: ${userId}`,
    );
    const { error } = await supabase.rpc('soft_delete_user', {
      _user_id: userId,
    });

    if (error) {
      UserDatabaseHelper.logger.error(
        `Error deleting user ${userId}: ${error.message}`,
      );
      throw new HttpException(
        `Failed to execute stored procedure: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    UserDatabaseHelper.logger.info(`User ${userId} successfully soft deleted`);
  }
}
