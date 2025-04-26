import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ProfileDatabaseHelper } from '../../helpers/profile-database.helper';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { HttpException } from '@nestjs/common';

describe('ProfileDatabaseHelper Integration Tests', () => {
  let supabase: SupabaseClient;
  const testUser1Id = '11111111-1111-1111-1111-111111111111';
  const testUser2Id = '22222222-2222-2222-2222-222222222222';
  const nonExistentUsername = 'nonexistentuser';

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('profiles').select('count').single();
    if (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data before each test
    await supabase
      .from('profiles')
      .update({ is_deleted: false })
      .eq('id', testUser1Id);
    await supabase
      .from('profiles')
      .update({ is_deleted: false })
      .eq('id', testUser2Id);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('profiles')
      .update({ is_deleted: false })
      .eq('id', testUser1Id);
    await supabase
      .from('profiles')
      .update({ is_deleted: false })
      .eq('id', testUser2Id);
  });

  describe('basic operations', () => {
    describe('getProfileByUsername', () => {
      it('should successfully retrieve a profile by username', async () => {
        const profile = await ProfileDatabaseHelper.getProfileByUsername(
          supabase,
          'testuser1',
        );

        expect(profile).toBeDefined();
        expect(profile.id).toBe(testUser1Id);
        expect(profile.name).toBe('Test User 1');
      });

      it('should return null for non-existent username', async () => {
        const profile = await ProfileDatabaseHelper.getProfileByUsername(
          supabase,
          nonExistentUsername,
        );
        expect(profile).toBeNull();
      });
    });

    describe('updateProfile', () => {
      it('should successfully update a profile', async () => {
        const updateData: UpdateProfileDto = {
          name: 'Updated Name',
        };

        await ProfileDatabaseHelper.updateProfile(
          supabase,
          testUser1Id,
          updateData,
        );

        const profile = await ProfileDatabaseHelper.getProfileByUsername(
          supabase,
          'testuser1',
        );

        expect(profile).toBeDefined();
        expect(profile.name).toBe(updateData.name);
      });

      it('should throw HttpException when updating non-existent user', async () => {
        const updateData: UpdateProfileDto = {
          name: 'Invalid User',
        };

        await expect(
          ProfileDatabaseHelper.updateProfile(
            supabase,
            '99999999-9999-9999-9999-999999999999',
            updateData,
          ),
        ).rejects.toThrow(HttpException);
      });
    });
  });
});
