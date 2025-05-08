/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingService } from '../geocoding.service';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RedisService } from '@/redis/redis.service';
import { GeocodingApiHelper } from '../helpers/geocoding-api.helper';
import { GeocodingValidator } from '../helpers/geocoding-validator.helper';
import { GeocodingValidationException } from '../helpers/geocoding-validator.helper';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { GEOCODING_CACHE_KEYS } from '@/constants/cache/geocoding.cache-keys';

jest.mock('@/common/helpers/global-cache.helper');
jest.mock('../helpers/geocoding-api.helper');

// Create a manual mock for the validator helper using factory pattern
jest.mock('../helpers/geocoding-validator.helper', () => {
  const mockValidateAddress = jest.fn();
  const mockValidateCoordinates = jest.fn();

  return {
    GeocodingValidator: {
      validateAddress: mockValidateAddress,
      validateCoordinates: mockValidateCoordinates,
    },
    GeocodingValidationException: jest.requireActual(
      '../helpers/geocoding-validator.helper',
    ).GeocodingValidationException,
  };
});

// Get references to the mocked functions for use in tests
const mockValidateAddress = GeocodingValidator.validateAddress as jest.Mock;

describe('GeocodingService', () => {
  let service: GeocodingService;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockRedisService = {
    getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const createMockConfigService = (
    apiKey = 'test-api-key',
    baseUrl = 'https://test-api.com',
  ) => {
    return {
      get: jest.fn((key) => {
        if (key === 'GEOCODING_API_KEY') return apiKey;
        if (key === 'GEOCODING_BASE_API_URL') return baseUrl;
        return null;
      }),
    };
  };

  const mockConfigService = createMockConfigService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocodingService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<GeocodingService>(GeocodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if API key is not defined', () => {
    const testMissingApiKey = () => {
      const testConfigService = createMockConfigService(
        null,
        'https://test-api.com',
      );

      return Test.createTestingModule({
        providers: [
          GeocodingService,
          {
            provide: ConfigService,
            useValue: testConfigService,
          },
          {
            provide: RedisService,
            useValue: mockRedisService,
          },
          {
            provide: WINSTON_MODULE_PROVIDER,
            useValue: mockLogger,
          },
        ],
      }).compile();
    };

    void expect(testMissingApiKey).rejects.toThrow(
      'GEOCODING_API_KEY is not defined in environment variables',
    );
  });

  it('should throw error if base URL is not defined', () => {
    const testMissingBaseUrl = () => {
      const testConfigService = createMockConfigService('test-api-key', null);

      return Test.createTestingModule({
        providers: [
          GeocodingService,
          {
            provide: ConfigService,
            useValue: testConfigService,
          },
          {
            provide: RedisService,
            useValue: mockRedisService,
          },
          {
            provide: WINSTON_MODULE_PROVIDER,
            useValue: mockLogger,
          },
        ],
      }).compile();
    };

    void expect(testMissingBaseUrl).rejects.toThrow(
      'GEOCODING_BASE_API_URL is not defined in environment variables',
    );
  });

  describe('forwardGeocode', () => {
    it('should validate the address', async () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const mockResult = {
        latitude: 37.4224764,
        longitude: -122.0842499,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await service.forwardGeocode(address);

      expect(GeocodingValidator.validateAddress).toHaveBeenCalledWith(address);
    });

    it('should return cached result when available', async () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const mockCachedResult = {
        latitude: 37.4224764,
        longitude: -122.0842499,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockCachedResult,
      );

      const result = await service.forwardGeocode(address);

      expect(result).toEqual(mockCachedResult);
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        GEOCODING_CACHE_KEYS.FORWARD(address),
      );
      expect(
        GeocodingApiHelper.makeForwardGeocodingRequest,
      ).not.toHaveBeenCalled();
    });

    it('should call API and cache result when cache misses', async () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const mockApiResult = {
        latitude: 37.4224764,
        longitude: -122.0842499,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        GeocodingApiHelper.makeForwardGeocodingRequest as jest.Mock
      ).mockResolvedValue(mockApiResult);

      const result = await service.forwardGeocode(address);

      expect(result).toEqual(mockApiResult);
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        GEOCODING_CACHE_KEYS.FORWARD(address),
      );
      expect(
        GeocodingApiHelper.makeForwardGeocodingRequest,
      ).toHaveBeenCalledWith(
        'https://test-api.com',
        'test-api-key',
        address,
        mockLogger,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        GEOCODING_CACHE_KEYS.FORWARD(address),
        mockApiResult,
        86400, // CACHE_EXPIRATION
      );
    });

    it('should not cache error results', async () => {
      // Arrange
      const address = 'Invalid Address';
      const mockApiResult = {
        error: 'No results found for the given address',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        GeocodingApiHelper.makeForwardGeocodingRequest as jest.Mock
      ).mockResolvedValue(mockApiResult);

      // Act
      const result = await service.forwardGeocode(address);

      // Assert
      expect(result).toEqual(mockApiResult);
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        GEOCODING_CACHE_KEYS.FORWARD(address),
      );
      expect(GeocodingApiHelper.makeForwardGeocodingRequest).toHaveBeenCalled();
      expect(GlobalCacheHelper.setCache).not.toHaveBeenCalled();
    });

    it('should propagate validation errors', async () => {
      // Arrange
      const address = '';
      const validationError = new GeocodingValidationException(
        'Address cannot be empty',
      );

      mockValidateAddress.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(service.forwardGeocode(address)).rejects.toThrow(
        'Address cannot be empty',
      );
      expect(GlobalCacheHelper.getFromCache).not.toHaveBeenCalled();
      expect(
        GeocodingApiHelper.makeForwardGeocodingRequest,
      ).not.toHaveBeenCalled();
    });
  });

  describe('reverseGeocode', () => {
    it('should validate the coordinates', async () => {
      const latitude = 37.4224764;
      const longitude = -122.0842499;
      const mockResult = {
        latitude,
        longitude,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockResult,
      );

      await service.reverseGeocode(latitude, longitude);

      expect(GeocodingValidator.validateCoordinates).toHaveBeenCalledWith(
        latitude,
        longitude,
      );
    });

    it('should return cached result when available', async () => {
      const latitude = 37.4224764;
      const longitude = -122.0842499;
      const mockCachedResult = {
        latitude,
        longitude,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockCachedResult,
      );

      const result = await service.reverseGeocode(latitude, longitude);

      expect(result).toEqual(mockCachedResult);
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        GEOCODING_CACHE_KEYS.REVERSE(latitude, longitude),
      );
      expect(
        GeocodingApiHelper.makeReverseGeocodingRequest,
      ).not.toHaveBeenCalled();
    });
  });
});
