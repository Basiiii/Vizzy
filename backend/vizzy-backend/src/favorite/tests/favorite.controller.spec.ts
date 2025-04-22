import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from '../favorite.controller';
import { FavoriteService } from '../favorite.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  const mockFavoriteService = {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getUserFavoriteProducts: jest.fn(),
  };

  // Simula usuário autenticado
  const mockRequest = {
    user: { sub: 'user-1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        {
          provide: FavoriteService,
          useValue: mockFavoriteService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockRequest.user;
          return true;
        },
      })
      .compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should call service to add favorite', async () => {
      mockFavoriteService.addFavorite.mockResolvedValue(undefined);

      const result = await controller.addFavorite(
        mockRequest as any,
        'listing-1',
      );
      expect(result).toEqual({ success: true });
      expect(mockFavoriteService.addFavorite).toHaveBeenCalledWith(
        'user-1',
        'listing-1',
      );
    });

    it('should throw if user ID or listing ID is missing', async () => {
      await expect(
        controller.addFavorite({ user: null } as any, ''),
      ).rejects.toThrow();
    });
  });

  describe('removeFavorite', () => {
    it('should call service to remove favorite', async () => {
      mockFavoriteService.removeFavorite.mockResolvedValue(undefined);

      const result = await controller.removeFavorite(
        mockRequest as any,
        'listing-1',
      );
      expect(result).toEqual({ success: true });
      expect(mockFavoriteService.removeFavorite).toHaveBeenCalledWith(
        'user-1',
        'listing-1',
      );
    });

    it('should throw if user ID or listing ID is missing', async () => {
      await expect(
        controller.removeFavorite({ user: null } as any, ''),
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
