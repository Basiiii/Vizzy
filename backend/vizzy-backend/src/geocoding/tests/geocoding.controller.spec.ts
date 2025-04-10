import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingController } from '../geocoding.controller';
import { GeocodingService } from '../geocoding.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ForwardGeocodeDto } from '@/dtos/geocoding/forward-geocoding.dto';
import { ReverseGeocodeDto } from '@/dtos/geocoding/reverse-geocoding.dto';
import { GeocodingValidationException } from '../helpers/geocoding-validator.helper';

describe('GeocodingController', () => {
  let controller: GeocodingController;
  // let service: GeocodingService;
  let logger: any;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockGeocodingService = {
    forwardGeocode: jest.fn(),
    reverseGeocode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeocodingController],
      providers: [
        {
          provide: GeocodingService,
          useValue: mockGeocodingService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<GeocodingController>(GeocodingController);
    // service = module.get<GeocodingService>(GeocodingService);
    logger = module.get(WINSTON_MODULE_PROVIDER);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forwardGeocode', () => {
    it('should call service.forwardGeocode with the correct address', async () => {
      // Arrange
      const dto: ForwardGeocodeDto = {
        address: '1600 Amphitheatre Parkway, Mountain View, CA',
      };
      const expectedResult = {
        latitude: 37.4224764,
        longitude: -122.0842499,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };
      mockGeocodingService.forwardGeocode.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.forwardGeocode(dto);

      // Assert
      expect(mockGeocodingService.forwardGeocode).toHaveBeenCalledWith(
        dto.address,
      );
      expect(result).toEqual(expectedResult);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(dto.address),
      );
    });

    it('should handle service errors and pass them through', async () => {
      // Arrange
      const dto: ForwardGeocodeDto = { address: 'Invalid Address' };
      const error = new Error('Service error');
      mockGeocodingService.forwardGeocode.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.forwardGeocode(dto)).rejects.toThrow(error);
      expect(mockGeocodingService.forwardGeocode).toHaveBeenCalledWith(
        dto.address,
      );
    });

    it('should handle validation errors from the service', async () => {
      // Arrange
      const dto: ForwardGeocodeDto = { address: '' };
      const validationError = new GeocodingValidationException(
        'Address cannot be empty',
      );
      mockGeocodingService.forwardGeocode.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.forwardGeocode(dto)).rejects.toThrow(
        validationError,
      );
      expect(mockGeocodingService.forwardGeocode).toHaveBeenCalledWith(
        dto.address,
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should call service.reverseGeocode with the correct coordinates', async () => {
      // Arrange
      const dto: ReverseGeocodeDto = {
        latitude: 37.4224764,
        longitude: -122.0842499,
      };
      const expectedResult = {
        latitude: 37.4224764,
        longitude: -122.0842499,
        fullAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
        town: 'Mountain View',
        county: 'Santa Clara County',
        country: 'United States',
        countryCode: 'us',
      };
      mockGeocodingService.reverseGeocode.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.reverseGeocode(dto);

      // Assert
      expect(mockGeocodingService.reverseGeocode).toHaveBeenCalledWith(
        dto.latitude,
        dto.longitude,
      );
      expect(result).toEqual(expectedResult);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(`${dto.latitude}, ${dto.longitude}`),
      );
    });

    it('should handle service errors and pass them through', async () => {
      // Arrange
      const dto: ReverseGeocodeDto = { latitude: 999, longitude: 999 };
      const error = new Error('Service error');
      mockGeocodingService.reverseGeocode.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.reverseGeocode(dto)).rejects.toThrow(error);
      expect(mockGeocodingService.reverseGeocode).toHaveBeenCalledWith(
        dto.latitude,
        dto.longitude,
      );
    });

    it('should handle validation errors from the service', async () => {
      // Arrange
      const dto: ReverseGeocodeDto = { latitude: 100, longitude: 200 };
      const validationError = new GeocodingValidationException(
        'Latitude must be between -90 and 90',
      );
      mockGeocodingService.reverseGeocode.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.reverseGeocode(dto)).rejects.toThrow(
        validationError,
      );
      expect(mockGeocodingService.reverseGeocode).toHaveBeenCalledWith(
        dto.latitude,
        dto.longitude,
      );
    });
  });
});
