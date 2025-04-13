/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProfileCacheHelper } from '../helpers/profile-cache.helper';
import { ProfileDatabaseHelper } from '../helpers/profile-database.helper';
import { ProfileImageHelper } from '../helpers/profile-image.helper';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';

jest.mock('../helpers/profile-cache.helper');
jest.mock('../helpers/profile-database.helper');
jest.mock('../helpers/profile-image.helper');
jest.mock('@/dtos/profile/update-profile.dto', () => ({
  UpdateProfileSchema: {
    parse: jest.fn(),
  },
}));

describe('ProfileService', () => {
  let service: ProfileService;
  let mockRedisService: any;
  let mockSupabaseService: any;
  let mockLogger: any;
  let mockRedisClient: any;
  let mockSupabaseClient: any;
  let mockAdminClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn(),
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
      },
    };

    mockAdminClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn(),
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
      },
    };

    mockRedisService = {
      getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    mockSupabaseService = {
      getPublicClient: jest.fn().mockReturnValue(mockSupabaseClient),
      getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfileByUsername', () => {
    const username = 'testuser';
    const mockProfile: Profile = {
      id: 'user-123',
      name: 'Test User',
      location: 'Test Location',
      avatarUrl: 'https://example.com/avatar.jpg',
      isVerified: true,
      memberSince: 2023,
      activeListings: 5,
      totalSales: 10,
    };

    it('should return profile from cache when available', async () => {
      // Setup mocks
      (ProfileCacheHelper.getProfileFromCache as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      // Execute
      const result = await service.getProfileByUsername(username);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(ProfileCacheHelper.getProfileFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        username,
      );
      expect(mockSupabaseService.getPublicClient).not.toHaveBeenCalled();
      expect(ProfileDatabaseHelper.getProfileByUsername).not.toHaveBeenCalled();
      expect(ProfileCacheHelper.cacheProfile).not.toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch profile from database and cache it when not in cache', async () => {
      // Setup mocks
      (ProfileCacheHelper.getProfileFromCache as jest.Mock).mockResolvedValue(
        null,
      );
      (
        ProfileDatabaseHelper.getProfileByUsername as jest.Mock
      ).mockResolvedValue(mockProfile);
      (ProfileCacheHelper.cacheProfile as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Execute
      const result = await service.getProfileByUsername(username);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(ProfileCacheHelper.getProfileFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        username,
      );
      expect(mockSupabaseService.getPublicClient).toHaveBeenCalled();
      expect(ProfileDatabaseHelper.getProfileByUsername).toHaveBeenCalledWith(
        mockSupabaseClient,
        username,
      );
      expect(ProfileCacheHelper.cacheProfile).toHaveBeenCalledWith(
        mockRedisClient,
        username,
        mockProfile,
      );
      expect(result).toEqual(mockProfile);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should return null when profile not found in database', async () => {
      // Setup mocks
      (ProfileCacheHelper.getProfileFromCache as jest.Mock).mockResolvedValue(
        null,
      );
      (
        ProfileDatabaseHelper.getProfileByUsername as jest.Mock
      ).mockResolvedValue(null);

      // Execute
      const result = await service.getProfileByUsername(username);

      // Verify
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(ProfileCacheHelper.cacheProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    const username = 'testuser';
    const userId = 'user-123';
    const updateProfileDto: UpdateProfileDto = {
      name: 'Updated Name',
      location: 'Updated Location',
    };

    it('should update a profile successfully and invalidate cache', async () => {
      // Setup mocks
      (ProfileDatabaseHelper.updateProfile as jest.Mock).mockResolvedValue(
        undefined,
      );
      (ProfileCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Execute
      const result = await service.updateProfile(
        username,
        userId,
        updateProfileDto,
      );

      // Verify
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ProfileDatabaseHelper.updateProfile).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
        updateProfileDto,
      );
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(ProfileCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        username,
      );
      expect(result).toEqual('Profile updated successfully');
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should throw error when username is not provided', async () => {
      // Execute and verify
      await expect(
        service.updateProfile('', userId, updateProfileDto),
      ).rejects.toThrow('Username is required');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('processAndUploadProfilePicture', () => {
    const userId = 'user-123';
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File;
    const mockProcessedImage = Buffer.from('processed');
    const mockUploadResponse = { data: { path: 'avatars/user-123' } };

    it('should process and upload profile picture successfully', async () => {
      // Setup mocks
      (ProfileImageHelper.validateImageType as jest.Mock).mockReturnValue(
        undefined,
      );
      (ProfileImageHelper.processImage as jest.Mock).mockResolvedValue(
        mockProcessedImage,
      );
      (ProfileImageHelper.uploadImage as jest.Mock).mockResolvedValue(
        mockUploadResponse,
      );

      // Execute
      const result = await service.processAndUploadProfilePicture(
        mockFile,
        userId,
      );

      // Verify
      expect(ProfileImageHelper.validateImageType).toHaveBeenCalledWith(
        mockFile.mimetype,
      );
      expect(ProfileImageHelper.processImage).toHaveBeenCalledWith(
        mockFile.buffer,
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ProfileImageHelper.uploadImage).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
        mockProcessedImage,
      );
      expect(result).toEqual(mockUploadResponse);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });
});
