import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from '../favorite.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let supabaseService: SupabaseService;
  let mockRedisService: any;
  let mockSupabaseService: any;
  let mockLogger: any;
  let mockRedisClient: any;
  let mockSupabaseClient: any;
  let mockAdminClient: any;
  let originalConsoleLog: any;

  beforeEach(async () => {
    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
    };

    const mockSupabaseService = {
      getAdminClient: jest.fn(() => mockSupabaseClient),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should insert favorite successfully', async () => {
      mockSupabaseClient.insert.mockResolvedValue({ error: null });

      await expect(
        service.addFavorite('user-1', 'listing-1'),
      ).resolves.toBeUndefined();
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        listing_id: 'listing-1',
      });
    });

    it('should throw error if insertion fails', async () => {
      mockSupabaseClient.insert.mockResolvedValue({
        error: { message: 'Insert error' },
      });

      await expect(service.addFavorite('user-1', 'listing-1')).rejects.toThrow(
        'Failed to add favorite: Insert error',
      );
    });
  });

  describe('removeFavorite', () => {
    it('should delete favorite successfully', async () => {
      mockSupabaseClient.delete.mockResolvedValue({ error: null });

      await expect(
        service.removeFavorite('user-1', 'listing-1'),
      ).resolves.toBeUndefined();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'listing_id',
        'listing-1',
      );
    });

    it('should throw error if deletion fails', async () => {
      mockSupabaseClient.delete.mockResolvedValue({
        error: { message: 'Delete error' },
      });

      await expect(
        service.removeFavorite('user-1', 'listing-1'),
      ).rejects.toThrow('Failed to remove favorite: Delete error');
    });
  });

  describe('getUserFavoriteProducts', () => {
    it('should return favorite products successfully', async () => {
      const mockData = [{ id: 'fav1' }, { id: 'fav2' }];
      mockSupabaseClient.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await service.getUserFavoriteProducts('user-1');
      expect(result).toEqual(mockData);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('fetch_favorite', {
        p_user_id: 'user-1',
      });
    });

    it('should throw error if RPC fails', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      await expect(service.getUserFavoriteProducts('user-1')).rejects.toThrow(
        'Failed to fetch favorites: RPC error',
      );
    });
  });
});
