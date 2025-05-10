import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from '../favorite.controller';
import { FavoriteService } from '../favorite.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  const mockFavoriteService = {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getUserFavoriteProducts: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 'user-1' },
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        FavoriteService,
        SupabaseService,
        RedisService,
        {
          provide: 'winston',
          useValue: {
            log: jest.fn(), // Mocking winston log method
            error: jest.fn(), // Mocking winston error method
            info: jest.fn(), // Mocking winston info method
          },
        },
      ],
    }).compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should call service to add favorite', async () => {
      mockFavoriteService.addFavorite.mockResolvedValue(undefined);

      const reqWithUser = { user: { sub: 'user-1' } };
      const result = await controller.addFavorite(reqWithUser as any, 1);
      expect(result).toEqual({ success: true });
      expect(mockFavoriteService.addFavorite).toHaveBeenCalledWith('user-1', 1);
    });

    it('should throw if user ID or listing ID is missing', async () => {
      await expect(
        controller.addFavorite({ user: null } as any, 1),
      ).rejects.toThrow();
    });
  });

  describe('removeFavorite', () => {
    it('should call service to remove favorite', async () => {
      mockFavoriteService.removeFavorite.mockResolvedValue(undefined);

      const result = await controller.removeFavorite(mockRequest as any, 1);
      expect(result).toEqual({ success: true });
      expect(mockFavoriteService.removeFavorite).toHaveBeenCalledWith(
        'user-1',
        1,
      );
    });

    it('should throw if user ID or listing ID is missing', async () => {
      await expect(
        controller.removeFavorite({ user: null } as any, 1),
      ).rejects.toThrow();
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorite products', async () => {
      const mockFavorites = [{ id: 'fav1' }];
      mockFavoriteService.getUserFavoriteProducts.mockResolvedValue(
        mockFavorites,
      );

      const result = await controller.getUserFavorites(mockRequest as any);
      expect(result).toEqual(mockFavorites);
      expect(mockFavoriteService.getUserFavoriteProducts).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should throw if user is not authenticated', async () => {
      await expect(
        controller.getUserFavorites({ user: null } as any),
      ).rejects.toThrow();
    });
  });
});
