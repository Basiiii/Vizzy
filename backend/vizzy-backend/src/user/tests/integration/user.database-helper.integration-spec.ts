import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { UserDatabaseHelper } from '../../helpers/user-database.helper';
import { HttpException } from '@nestjs/common';

describe('UserDatabaseHelper Integration Tests', () => {
  let supabase: SupabaseClient;
  const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
  const TEST_USERNAME = 'Basi';
  const TEST_USER2_ID = '11111111-1111-1111-1111-111111111111';
  const NON_EXISTENT_ID = '99999999-9999-9999-9999-999999999999';

  beforeAll(() => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  });

  describe('getUserById', () => {
    it('should return user data for existing user', async () => {
      const user = await UserDatabaseHelper.getUserById(supabase, TEST_USER_ID);
      expect(user).toBeDefined();
      expect(user?.id).toBe(TEST_USER_ID);
      expect(user?.username).toBe(TEST_USERNAME);
      expect(user?.is_deleted).toBe(false);
    });

    it('should return null for non-existent user', async () => {
      const user = await UserDatabaseHelper.getUserById(
        supabase,
        NON_EXISTENT_ID,
      );
      expect(user).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should return user lookup data for existing username', async () => {
      const user = await UserDatabaseHelper.getUserByUsername(
        supabase,
        TEST_USERNAME,
      );
      expect(user).toBeDefined();
      expect(user?.id).toBe(TEST_USER_ID);
      expect(user?.username).toBe(TEST_USERNAME);
    });

    it('should return null for non-existent username', async () => {
      const user = await UserDatabaseHelper.getUserByUsername(
        supabase,
        'non-existent-username',
      );
      expect(user).toBeNull();
    });
  });

  describe('softDeleteUser', () => {
    it('should successfully soft delete a user', async () => {
      const userToDelete = await UserDatabaseHelper.getUserByUsername(
        supabase,
        'testuser3',
      );
      let TEST_USER3_ID = userToDelete?.id;
      if (!userToDelete) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: 'test3@example.com',
          password: 'password123',
          email_confirm: true, // Immediately confirms the email
          user_metadata: {
            name: 'Test User 3',
            username: 'testuser3',
            email_verified: true,
            phone_verified: false,
          },
          app_metadata: {
            provider: 'email',
            providers: ['email'],
          },
        });
        if (error) {
          throw new Error(`Error creating test user: ${error.message}`);
        }
        if (!data) {
          throw new Error('No data returned from createUser');
        }

        const { error: userError } = await supabase.from('profiles').insert({
          id: data.user?.id,
          username: 'testuser3',
          email: 'test3@example.com',
          name: 'Test User 3',
        });
        if (userError) {
          throw new Error(`Error creating test user: ${userError.message}`);
        }
        TEST_USER3_ID = data.user?.id;
      }
      await UserDatabaseHelper.softDeleteUser(supabase, TEST_USER3_ID);
      const user = await UserDatabaseHelper.getUserById(
        supabase,
        TEST_USER3_ID,
      );
      expect(user?.is_deleted).toBe(true);
      expect(user?.deleted_at).toBeDefined();
    });
    it('should throw HttpException when trying to delete non-existent user', async () => {
      await expect(
        UserDatabaseHelper.softDeleteUser(supabase, NON_EXISTENT_ID),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getUserLocation', () => {
    it('should return location data for user with location', async () => {
      const location = await UserDatabaseHelper.getUserLocation(
        supabase,
        TEST_USER_ID,
      );
      expect(location).toBeDefined();
      expect(location?.full_address).toBe('Test Location, Test City');
      expect(location?.lat).toBe(40.73061);
      expect(location?.lon).toBe(-73.935242);
    });

    it('should return null for user without location', async () => {
      const location = await UserDatabaseHelper.getUserLocation(
        supabase,
        TEST_USER2_ID,
      );
      expect(location).toBeNull();
    });
  });
});
