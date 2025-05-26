import { Test, TestingModule } from '@nestjs/testing';
import { ListingController } from '../../listing.controller';
import { ListingService } from '../../listing.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotFoundException, HttpException } from '@nestjs/common';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { ListingType } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ListingPaginatedResponse } from '@/dtos/listing/listing-paginated-response.dto';
import {
  ListingImagesResponseDto,
  UpdateListingImagesDto,
} from '@/dtos/listing/listing-images.dto';

describe('ListingController', () => {
  let controller: ListingController;
  let originalConsoleLog: any;

  const mockListingService = {
    getListingsByUserId: jest.fn(),
    getHomeListings: jest.fn(),
    getListingById: jest.fn(),
    createListing: jest.fn(),
    getListingImages: jest.fn(),
    verifyListingAccess: jest.fn(),
    getListingImageCount: jest.fn(),
    processAndUploadListingImages: jest.fn(),
    updateListingImages: jest.fn(),
    getProductCategories: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    // Save original console.log and mock it
    originalConsoleLog = console.log;
    console.log = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [
        {
          provide: ListingService,
          useValue: mockListingService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<ListingController>(ListingController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getListings', () => {
    const mockListings: ListingBasic[] = [
      {
        id: 'listing-123',
        title: 'Test Listing',
        type: 'sale',
        price: '100',
        image_url: 'image1.jpg',
        owner_username: 'test-user',
      },
    ];

    it('should return listings successfully', async () => {
      mockListingService.getListingsByUserId.mockResolvedValue(mockListings);

      const result = await controller.getListings(
        'false',
        'user-123',
        '1',
        '8',
      );

      expect(result).toEqual(mockListings);
      expect(mockListingService.getListingsByUserId).toHaveBeenCalledWith(
        'user-123',
        { limit: 8, offset: 0 },
        false,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no userId provided', async () => {
      await expect(
        controller.getListings('false', '', '1', '8'),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockListingService.getListingsByUserId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when no listings found', async () => {
      mockListingService.getListingsByUserId.mockResolvedValue([]);

      await expect(
        controller.getListings('false', 'user-123', '1', '8'),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getHomeListings', () => {
    const mockPaginatedResponse: ListingPaginatedResponse = {
      listings: [
        {
          id: 'listing-123',
          title: 'Test Listing',
          type: 'sale',
          price: '100',
          image_url: 'image1.jpg',
          owner_username: 'test-user',
        },
      ],
      totalPages: 1,
      currentPage: 1,
    };

    it('should return paginated listings successfully', async () => {
      mockListingService.getHomeListings.mockResolvedValue({
        listings: mockPaginatedResponse.listings,
        totalPages: 1,
        currentPage: 1,
      });

      const result = await controller.getHomeListings('false', '1', '8');

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockListingService.getHomeListings).toHaveBeenCalledWith(
        {
          limit: 8,
          offset: 0,
          page: 1,
          listingType: undefined,
          search: undefined,
          latitude: undefined,
          longitude: undefined,
          distance: undefined,
        },
        false,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle location parameters correctly', async () => {
      mockListingService.getHomeListings.mockResolvedValue({
        listings: mockPaginatedResponse.listings,
        totalPages: 1,
        currentPage: 1,
      });

      await controller.getHomeListings(
        'false',
        '1',
        '8',
        undefined,
        undefined,
        '40.7128',
        '-74.0060',
        '1000',
      );

      expect(mockListingService.getHomeListings).toHaveBeenCalledWith(
        {
          limit: 8,
          offset: 0,
          page: 1,
          listingType: undefined,
          search: undefined,
          latitude: 40.7128,
          longitude: -74.006,
          distance: 1000,
        },
        false,
      );
    });

    it('should throw NotFoundException when no listings found', async () => {
      mockListingService.getHomeListings.mockResolvedValue({
        listings: [],
        totalPages: 0,
        currentPage: 1,
      });

      await expect(
        controller.getHomeListings('false', '1', '8'),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getListingById', () => {
    const mockListing = {
      id: '123',
      title: 'Test Listing',
      description: 'Test description',
      date_created: '2023-01-01',
      owner_id: 'user-123',
      category_id: 'category-1',
      listing_status: 'active',
      listing_type: 'sale',
      image_url: 'image1.jpg',
    };

    it('should return a listing successfully', async () => {
      mockListingService.getListingById.mockResolvedValue(mockListing);

      const result = await controller.getListingById(undefined, 123);

      expect(result).toEqual(mockListing);
      expect(mockListingService.getListingById).toHaveBeenCalledWith(
        123,
        false,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when listing not found', async () => {
      mockListingService.getListingById.mockResolvedValue(null);

      await expect(controller.getListingById(undefined, 123)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('createListing', () => {
    const mockCreateListingDto: CreateListingDto = {
      title: 'New Listing',
      description: 'Test description',
      category: 'test-category',
      listing_type: 'sale' as ListingType,
      price: 100,
      is_negotiable: true,
      product_condition: 'New',
    };

    it('should create a listing successfully', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.createListing.mockResolvedValue(123);

      const result = await controller.createListing(
        mockRequest,
        mockCreateListingDto,
      );

      expect(result).toBe(123);
      expect(mockListingService.createListing).toHaveBeenCalledWith(
        mockCreateListingDto,
        'user-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when creation fails', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.createListing.mockResolvedValue(null);

      await expect(
        controller.createListing(mockRequest, mockCreateListingDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getListingImages', () => {
    const mockImages: ListingImagesResponseDto = {
      images: [
        { path: 'image1.jpg', url: 'https://example.com/image1.jpg' },
        { path: 'image2.jpg', url: 'https://example.com/image2.jpg' },
      ],
    };

    it('should return listing images successfully', async () => {
      mockListingService.getListingImages.mockResolvedValue(mockImages);

      const result = await controller.getListingImages(123);

      expect(result).toEqual(mockImages);
      expect(mockListingService.getListingImages).toHaveBeenCalledWith(123);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('updateListingImages', () => {
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

    const mockUploadResponse: ListingImagesResponseDto = {
      images: [
        { path: 'image1.jpg', url: 'https://example.com/image1.jpg' },
        { path: 'image2.jpg', url: 'https://example.com/image2.jpg' },
      ],
    };

    it('should upload images successfully', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.verifyListingAccess.mockResolvedValue(true);
      mockListingService.getListingImageCount.mockResolvedValue(0);
      mockListingService.updateListingImages.mockResolvedValue(
        mockUploadResponse,
      );

      const result = await controller.updateListingImages(
        mockRequest,
        mockFiles,
        123,
        {} as UpdateListingImagesDto,
      );

      expect(result).toEqual(mockUploadResponse);
      expect(mockListingService.verifyListingAccess).toHaveBeenCalledWith(
        123,
        'user-123',
      );
      expect(mockListingService.getListingImageCount).toHaveBeenCalledWith(123);
      expect(mockListingService.updateListingImages).toHaveBeenCalledWith(
        123,
        mockFiles,
        {} as UpdateListingImagesDto,
      );
    });

    it('should throw HttpException when no files provided and no delete operations', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.verifyListingAccess.mockResolvedValue(true);

      await expect(
        controller.updateListingImages(
          mockRequest,
          [],
          123,
          {} as UpdateListingImagesDto,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockListingService.updateListingImages).not.toHaveBeenCalled();
    });

    it('should throw HttpException when maximum image count reached', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.verifyListingAccess.mockResolvedValue(true);
      mockListingService.getListingImageCount.mockResolvedValue(10);

      await expect(
        controller.updateListingImages(
          mockRequest,
          mockFiles,
          123,
          {} as UpdateListingImagesDto,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockListingService.updateListingImages).not.toHaveBeenCalled();
    });

    it('should throw HttpException when trying to upload more than remaining slots', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      mockListingService.verifyListingAccess.mockResolvedValue(true);
      mockListingService.getListingImageCount.mockResolvedValue(9);

      await expect(
        controller.updateListingImages(
          mockRequest,
          mockFiles,
          123,
          {} as UpdateListingImagesDto,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockListingService.updateListingImages).not.toHaveBeenCalled();
    });

    it('should allow update with only delete operations', async () => {
      const mockRequest: RequestWithUser = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      const updateDto: UpdateListingImagesDto = {
        imagesToDelete: ['image1.jpg'],
      };

      mockListingService.verifyListingAccess.mockResolvedValue(true);
      mockListingService.getListingImageCount.mockResolvedValue(5);
      mockListingService.updateListingImages.mockResolvedValue(
        mockUploadResponse,
      );

      const result = await controller.updateListingImages(
        mockRequest,
        [],
        123,
        updateDto,
      );

      expect(result).toEqual(mockUploadResponse);
      expect(mockListingService.updateListingImages).toHaveBeenCalledWith(
        123,
        [],
        updateDto,
      );
    });
  });

  describe('getProductCategories', () => {
    const mockCategories = ['Electronics', 'Furniture', 'Clothing', 'Books'];

    it('should return categories successfully', async () => {
      mockListingService.getProductCategories.mockResolvedValue(mockCategories);

      const result = await controller.getProductCategories();

      expect(result).toEqual(mockCategories);
      expect(mockListingService.getProductCategories).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no categories found', async () => {
      mockListingService.getProductCategories.mockResolvedValue(null);

      await expect(controller.getProductCategories()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
