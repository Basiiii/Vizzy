/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from '../../listing.service';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { LISTING_CACHE_KEYS } from '@/constants/cache/listing.cache-keys';
import { ListingDatabaseHelper } from '../../helpers/listing-database.helper';
import { ListingImageHelper } from '../../helpers/listing-image.helper';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { Listing, ListingType } from '@/dtos/listing/listing.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('@/common/helpers/global-cache.helper');
jest.mock('../../helpers/listing-database.helper');
jest.mock('../../helpers/listing-image.helper');

describe('ListingService', () => {
  let service: ListingService;
  let mockRedisService: any;
  let mockSupabaseService: any;
  let mockLogger: any;
  let mockRedisClient: any;
  let mockSupabaseClient: any;
  let mockAdminClient: any;
  let originalConsoleLog: any;

  beforeEach(async () => {
    // Save original console.log and mock it
    originalConsoleLog = console.log;
    console.log = jest.fn();

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      storage: {
        from: jest.fn().mockReturnValue({
          list: jest.fn(),
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
        }),
      },
      rpc: jest.fn().mockReturnThis(),
    };

    mockAdminClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      storage: {
        from: jest.fn().mockReturnValue({
          list: jest.fn(),
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
        }),
      },
      rpc: jest.fn().mockReturnThis(),
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
        ListingService,
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

    service = module.get<ListingService>(ListingService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getListingsByUserId', () => {
    const userId = 'user-123';
    const options = { limit: 10, offset: 0 };
    const mockListings: ListingBasic[] = [
      {
        id: 'listing-123',
        title: 'Test Listing',
        type: 'sale',
        price: '100',
        image_url: 'image1.jpg',
      },
    ];

    it('should return listings from cache when available', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockListings,
      );

      // Execute
      const result = await service.getListingsByUserId(userId, options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.PAGINATED_BY_USER(userId, 1, options.limit),
      );
      expect(mockSupabaseService.getAdminClient).not.toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingsByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(mockListings);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch listings from database and cache them when not in cache', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ListingDatabaseHelper.getListingsByUserId as jest.Mock
      ).mockResolvedValue(mockListings);

      // Execute
      const result = await service.getListingsByUserId(userId, options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.PAGINATED_BY_USER(userId, 1, options.limit),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingsByUserId).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
        options,
      );
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.PAGINATED_BY_USER(userId, 1, options.limit),
      );
      expect(result).toEqual(mockListings);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should not cache when no listings are found', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ListingDatabaseHelper.getListingsByUserId as jest.Mock
      ).mockResolvedValue([]);

      // Execute
      const result = await service.getListingsByUserId(userId, options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.PAGINATED_BY_USER(userId, 1, options.limit),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingsByUserId).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
        options,
      );
      expect(GlobalCacheHelper.setCache).not.toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('getListingById', () => {
    const listingId = 123;
    const mockListing: Listing = {
      id: 'listing-123',
      title: 'Test Listing',
      description: 'Test description',
      date_created: '2023-01-01',
      owner_id: 'user-123',
      category_id: 'category-1',
      listing_status: 'active',
      listing_type: 'sale',
      image_url: 'image1.jpg',
    };

    it('should return listing from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockListing,
      );

      // Execute
      const result = await service.getListingById(listingId);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.DETAIL(listingId),
      );
      expect(mockSupabaseService.getAdminClient).not.toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingById).not.toHaveBeenCalled();
      expect(result).toEqual(mockListing);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch listing from database and cache it when not in cache', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ListingDatabaseHelper.getListingById as jest.Mock).mockResolvedValue(
        mockListing,
      );

      // Execute
      const result = await service.getListingById(listingId);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.DETAIL(listingId),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingById).toHaveBeenCalledWith(
        mockAdminClient,
        listingId,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.DETAIL(listingId),
        mockListing,
        3600, // expiration time in seconds
      );
      expect(result).toEqual(mockListing);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should handle case when listing is not found', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ListingDatabaseHelper.getListingById as jest.Mock).mockResolvedValue(
        null,
      );

      // Execute
      const result = await service.getListingById(listingId);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.DETAIL(listingId),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getListingById).toHaveBeenCalledWith(
        mockAdminClient,
        listingId,
      );
      expect(GlobalCacheHelper.setCache).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getHomeListings', () => {
    const options = {
      limit: 10,
      offset: 0,
      page: 1,
      listingType: 'sale',
      search: 'test',
      latitude: 40.7128,
      longitude: -74.006,
      distance: 1000,
    };
    const mockListings: ListingBasic[] = [
      {
        id: 'listing-123',
        title: 'Test Listing',
        type: 'sale',
        price: '100',
        image_url: 'image1.jpg',
      },
    ];
    const mockResponse = {
      listings: mockListings,
      totalPages: 1,
      currentPage: 1,
    };

    it('should return listings from cache when available', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      // Execute
      const result = await service.getHomeListings(options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.HOME(
          options.page,
          options.limit,
          options.listingType,
          options.search,
          options.latitude,
          options.longitude,
          options.distance,
        ),
      );
      expect(mockSupabaseService.getAdminClient).not.toHaveBeenCalled();
      expect(ListingDatabaseHelper.getHomeListings).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch listings from database and cache them when not in cache', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ListingDatabaseHelper.getHomeListings as jest.Mock).mockResolvedValue({
        listings: mockListings,
        totalPages: 1,
      });

      // Execute
      const result = await service.getHomeListings(options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.HOME(
          options.page,
          options.limit,
          options.listingType,
          options.search,
          options.latitude,
          options.longitude,
          options.distance,
        ),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getHomeListings).toHaveBeenCalledWith(
        mockAdminClient,
        options,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.HOME(
          options.page,
          options.limit,
          options.listingType,
          options.search,
          options.latitude,
          options.longitude,
          options.distance,
        ),
        expect.objectContaining({
          listings: mockListings,
          totalPages: 1,
          currentPage: options.page,
        }),
        900, // expiration time in seconds
      );
      expect(result).toEqual({
        listings: mockListings,
        totalPages: 1,
        currentPage: options.page,
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should handle case when no listings are found', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ListingDatabaseHelper.getHomeListings as jest.Mock).mockResolvedValue({
        listings: [],
        totalPages: 0,
      });

      // Execute
      const result = await service.getHomeListings(options);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        LISTING_CACHE_KEYS.HOME(
          options.page,
          options.limit,
          options.listingType,
          options.search,
          options.latitude,
          options.longitude,
          options.distance,
        ),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.getHomeListings).toHaveBeenCalledWith(
        mockAdminClient,
        options,
      );
      expect(GlobalCacheHelper.setCache).not.toHaveBeenCalled();
      expect(result).toEqual({
        listings: [],
        totalPages: 0,
        currentPage: options.page,
      });
    });
  });

  describe('createListing', () => {
    const userId = 'user-123';
    const createListingDto: CreateListingDto = {
      title: 'New Listing',
      description: 'Test description',
      category: 'test-category',
      listing_type: 'sale' as ListingType,
      price: 100,
      is_negotiable: true,
      product_condition: 'New',
    };

    it('should create a listing successfully', async () => {
      // Setup mocks
      (ListingDatabaseHelper.createListing as jest.Mock).mockResolvedValue(123);

      // Execute
      const result = await service.createListing(createListingDto, userId);

      // Verify
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingDatabaseHelper.createListing).toHaveBeenCalledWith(
        mockAdminClient,
        createListingDto,
        userId,
      );
      expect(result).toBe(123);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw error when creation fails', async () => {
      // Setup mocks
      (ListingDatabaseHelper.createListing as jest.Mock).mockResolvedValue(
        null,
      );

      // Execute and verify
      await expect(
        service.createListing(createListingDto, userId),
      ).rejects.toThrow('Failed to create listing');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('verifyListingAccess', () => {
    const listingId = 123;
    const userId = 'user-123';

    it('should verify access successfully', async () => {
      // Setup mocks
      mockAdminClient
        .from()
        .select()
        .eq.mockReturnValue({
          data: [{ owner_id: userId }],
          error: null,
        });

      // Execute
      await service.verifyListingAccess(listingId, userId);

      // Verify
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(mockAdminClient.from).toHaveBeenCalledWith(
        'full_product_listings',
      );
      expect(mockAdminClient.from().select).toHaveBeenCalledWith('owner_id');
      expect(mockAdminClient.from().select().eq).toHaveBeenCalledWith(
        'id',
        listingId,
      );
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw HttpException when listing not found', async () => {
      // Setup mocks
      mockAdminClient.from().select().eq.mockReturnValue({
        data: [],
        error: null,
      });

      // Execute and verify
      await expect(
        service.verifyListingAccess(listingId, userId),
      ).rejects.toThrow(
        new HttpException('Listing not found', HttpStatus.NOT_FOUND),
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw HttpException when user does not have access', async () => {
      // Setup mocks
      mockAdminClient
        .from()
        .select()
        .eq.mockReturnValue({
          data: [{ owner_id: 'different-user' }],
          error: null,
        });

      // Execute and verify
      await expect(
        service.verifyListingAccess(listingId, userId),
      ).rejects.toThrow(
        new HttpException(
          'You do not have permission to access this listing',
          HttpStatus.FORBIDDEN,
        ),
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw HttpException when database error occurs', async () => {
      // Setup mocks
      mockAdminClient
        .from()
        .select()
        .eq.mockReturnValue({
          data: null,
          error: { message: 'Database error' },
        });

      // Execute and verify
      await expect(
        service.verifyListingAccess(listingId, userId),
      ).rejects.toThrow(
        new HttpException(
          'Failed to verify proposal access',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('processAndUploadListingImages', () => {
    const listingId = 123;
    const mockFiles = [
      {
        originalname: 'test1.jpg',
        buffer: Buffer.from('test1'),
        mimetype: 'image/jpeg',
      },
      {
        originalname: 'test2.jpg',
        buffer: Buffer.from('test2'),
        mimetype: 'image/jpeg',
      },
    ] as Express.Multer.File[];

    it('should process and upload images successfully', async () => {
      // Setup mocks
      (ListingImageHelper.validateImageType as jest.Mock).mockReturnValue(true);
      (ListingImageHelper.processImage as jest.Mock).mockResolvedValue(
        Buffer.from('processed'),
      );
      (ListingImageHelper.uploadImage as jest.Mock).mockResolvedValue({
        data: {
          path: 'path/to/image.jpg',
          url: 'https://example.com/image.jpg',
        },
      });

      // Execute
      const result = await service.processAndUploadListingImages(
        mockFiles,
        listingId,
      );

      // Verify
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ListingImageHelper.validateImageType).toHaveBeenCalledTimes(2);
      expect(ListingImageHelper.processImage).toHaveBeenCalledTimes(2);
      expect(ListingImageHelper.uploadImage).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        images: [
          { path: 'path/to/image.jpg', url: 'https://example.com/image.jpg' },
          { path: 'path/to/image.jpg', url: 'https://example.com/image.jpg' },
        ],
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw HttpException when no images are successfully uploaded', async () => {
      // Setup mocks
      (ListingImageHelper.validateImageType as jest.Mock).mockImplementation(
        () => {
          throw new Error('Invalid image type');
        },
      );

      // Execute and verify
      await expect(
        service.processAndUploadListingImages(mockFiles, listingId),
      ).rejects.toThrow(
        new HttpException(
          'Failed to upload any images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('getListingImageCount', () => {
    const listingId = 123;

    it('should return the correct image count', async () => {
      // Setup mocks
      mockAdminClient.storage.from().list.mockReturnValue({
        data: [{ name: 'image1.jpg' }, { name: 'image2.jpg' }],
        error: null,
      });

      // Execute
      const result = await service.getListingImageCount(listingId);

      // Verify
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(mockAdminClient.storage.from).toHaveBeenCalledWith('listings');
      expect(mockAdminClient.storage.from().list).toHaveBeenCalledWith(
        `${listingId}`,
      );
      expect(result).toBe(2);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return 0 when no images are found', async () => {
      // Setup mocks
      mockAdminClient.storage.from().list.mockReturnValue({
        data: [],
        error: null,
      });

      // Execute
      const result = await service.getListingImageCount(listingId);

      // Verify
      expect(result).toBe(0);
    });

    it('should return 0 when folder not found error occurs', async () => {
      // Setup mocks
      mockAdminClient.storage.from().list.mockReturnValue({
        data: null,
        error: { message: 'not found' },
      });

      // Execute
      const result = await service.getListingImageCount(listingId);

      // Verify
      expect(result).toBe(0);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw HttpException when other error occurs', async () => {
      // Setup mocks
      mockAdminClient.storage.from().list.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Execute and verify
      await expect(service.getListingImageCount(listingId)).rejects.toThrow(
        new HttpException(
          'Failed to get listing images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getListingImages', () => {
    const listingId = 123;
    const mockImages = [{ name: 'image1.jpg' }, { name: 'image2.jpg' }];

    beforeEach(() => {
      process.env.SUPABASE_URL = 'https://example.com';
    });

    it('should return images from cache when available', async () => {
      // Setup mocks
      const mockCachedImages = {
        images: [
          {
            path: '123/image1.jpg',
            url: 'https://example.com/storage/v1/object/public/listings/123/image1.jpg',
          },
          {
            path: '123/image2.jpg',
            url: 'https://example.com/storage/v1/object/public/listings/123/image2.jpg',
          },
        ],
      };
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockCachedImages,
      );

      // Execute
      const result = await service.getListingImages(listingId);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(mockSupabaseService.getAdminClient).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedImages);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch images from storage and cache them when not in cache', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      mockAdminClient.storage.from().list.mockReturnValue({
        data: mockImages,
        error: null,
      });

      // Execute
      const result = await service.getListingImages(listingId);

      // Verify
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(mockAdminClient.storage.from).toHaveBeenCalledWith('listings');
      expect(mockAdminClient.storage.from().list).toHaveBeenCalledWith(
        `${listingId}`,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalled();
      expect(result).toEqual({
        images: [
          {
            path: `${listingId}/image1.jpg`,
            url: `https://example.com/storage/v1/object/public/listings/${listingId}/image1.jpg`,
          },
          {
            path: `${listingId}/image2.jpg`,
            url: `https://example.com/storage/v1/object/public/listings/${listingId}/image2.jpg`,
          },
        ],
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(4);
    });

    it('should return empty array when no images are found', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      mockAdminClient.storage.from().list.mockReturnValue({
        data: [],
        error: null,
      });

      // Execute
      const result = await service.getListingImages(listingId);

      // Verify
      expect(result).toEqual({ images: [] });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return empty array when folder not found error occurs', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      mockAdminClient.storage.from().list.mockReturnValue({
        data: null,
        error: { message: 'not found' },
      });

      // Execute
      const result = await service.getListingImages(listingId);

      // Verify
      expect(result).toEqual({ images: [] });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw HttpException when other error occurs', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      mockAdminClient.storage.from().list.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Execute and verify
      await expect(service.getListingImages(listingId)).rejects.toThrow(
        new HttpException(
          'Failed to get listing images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
