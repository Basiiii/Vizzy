/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserDatabaseHelper } from '../helpers/user-database.helper';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { USER_CACHE_KEYS } from '@/constants/cache/user.cache-keys';

jest.mock('@/common/helpers/global-cache.helper');
jest.mock('../helpers/user-database.helper');
jest.mock('../helpers/user-database.helper');

describe('UserService', () => {
  let service: UserService;
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
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn(),
      update: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
    };

    mockAdminClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn(),
      update: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
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
        UserService,
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

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserIdByUsername', () => {
    const username = 'testuser';
    const mockLookup = { id: 'user-123', username };

    it('should return user lookup from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockLookup,
      );

      const result = await service.getUserIdByUsername(username);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.LOOKUP(username),
      );
      expect(UserDatabaseHelper.getUserByUsername).not.toHaveBeenCalled();
      expect(result).toEqual(mockLookup);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch and cache user lookup when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (UserDatabaseHelper.getUserByUsername as jest.Mock).mockResolvedValue(
        mockLookup,
      );

      const result = await service.getUserIdByUsername(username);

      expect(UserDatabaseHelper.getUserByUsername).toHaveBeenCalledWith(
        mockSupabaseClient,
        username,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.LOOKUP(username),
        mockLookup,
        expect.any(Number),
      );
      expect(result).toEqual(mockLookup);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUserById', () => {
    const userId = 'user-123';
    const mockUser = { id: userId, username: 'testuser' };

    it('should return user from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.DETAIL(userId),
      );
      expect(UserDatabaseHelper.getUserById).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch and cache user when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (UserDatabaseHelper.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(UserDatabaseHelper.getUserById).toHaveBeenCalledWith(
        mockSupabaseClient,
        userId,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.DETAIL(userId),
        mockUser,
        expect.any(Number),
      );
      expect(result).toEqual(mockUser);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('getUserLocation', () => {
    const userId = 'user-123';
    const mockLocation = {
      id: 'loc-123',
      full_address: 'Test Address',
      lat: 0,
      lon: 0,
      created_at: new Date(),
    };

    it('should return location from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockLocation,
      );

      const result = await service.getUserLocation(userId);

      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.LOCATION(userId),
      );
      expect(UserDatabaseHelper.getUserLocation).not.toHaveBeenCalled();
      expect(result).toEqual(mockLocation);
    });

    it('should fetch and cache location when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (UserDatabaseHelper.getUserLocation as jest.Mock).mockResolvedValue(
        mockLocation,
      );

      const result = await service.getUserLocation(userId);

      expect(UserDatabaseHelper.getUserLocation).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        USER_CACHE_KEYS.LOCATION(userId),
        mockLocation,
        expect.any(Number),
      );
      expect(result).toEqual(mockLocation);
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-123';

    it('should soft delete user successfully', async () => {
      (UserDatabaseHelper.softDeleteUser as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.deleteUser(userId);

      expect(UserDatabaseHelper.softDeleteUser).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
      );
      expect(result).toEqual({
        message:
          'User successfully soft deleted and removed from blocked table',
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('isUserBlocked', () => {
    const userId = 'user-123';
    const targetUserId = 'target-123';

    it('should return true when user is blocked', async () => {
      mockAdminClient
        .from()
        .select()
        .eq()
        .eq()
        .single.mockResolvedValue({
          data: { blocked_id: targetUserId },
          error: null,
        });

      const result = await service.isUserBlocked(userId, targetUserId);

      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledTimes(4);
    });

    it('should return false when user is not blocked', async () => {
      mockAdminClient.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: null,
        status: 406,
      });

      const result = await service.isUserBlocked(userId, targetUserId);

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      const userId = 'user1';
      const targetUserId = 'user2';

      mockAdminClient
        .from()
        .select()
        .eq()
        .eq()
        .single.mockRejectedValue(new Error('Database error'));

      await expect(service.isUserBlocked(userId, targetUserId)).rejects.toThrow(
        'Failed to check block status',
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('toggleBlockUser', () => {
    const userId = 'user1';
    const targetUserId = 'user2';

    it('should block user when not blocked', async () => {
      // Mock the check for existing block
      mockAdminClient.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock the insert operation
      mockAdminClient.from().insert.mockResolvedValue({
        data: [{ blocker_id: userId, blocked_id: targetUserId }],
        error: null,
      });

      const result = await service.toggleBlockUser(userId, targetUserId);
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `User ${targetUserId} is not blocked by ${userId}. Blocking...`,
      );
    });

    it('should unblock user when already blocked', async () => {
      mockAdminClient
        .from()
        .select()
        .eq()
        .eq()
        .single.mockResolvedValue({
          data: { blocked_id: targetUserId },
          error: null,
        });

      const result = await service.toggleBlockUser(userId, targetUserId);

      expect(mockAdminClient.from().delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      mockAdminClient
        .from()
        .select()
        .eq()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

      await expect(
        service.toggleBlockUser(userId, targetUserId),
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
