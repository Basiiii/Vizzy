import {
  Controller,
  Post,
  Body,
  Version,
  Inject,
  UseFilters,
} from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { API_VERSIONS } from '@/constants/api-versions';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  ForwardGeocodeDto,
  ForwardGeocodingResponse,
} from '@/dtos/geocoding/forward-geocoding.dto';
import {
  ReverseGeocodeDto,
  ReverseGeocodingResponse,
} from '@/dtos/geocoding/reverse-geocoding.dto';
import { GeocodingExceptionFilter } from './filters/geocoding.filter';

/**
 * Controller for managing geocoding operations
 */
@ApiTags('Geocoding')
@Controller('geocoding')
@UseFilters(GeocodingExceptionFilter)
export class GeocodingController {
  constructor(
    private readonly geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Converts an address to geographic coordinates
   * @param forwardGeocodeDto Data containing the address to geocode
   * @returns Geographic coordinates and address information
   */
  @Post('forward')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Forward geocoding',
    description: 'Converts an address to geographic coordinates',
  })
  @ApiBody({ type: ForwardGeocodeDto, description: 'Address to geocode' })
  @ApiResponse({
    status: 200,
    description: 'Address successfully geocoded',
    type: ForwardGeocodingResponse,
  })
  @ApiResponse({ status: 500, description: 'Failed to geocode address' })
  async forwardGeocode(
    @Body() forwardGeocodeDto: ForwardGeocodeDto,
  ): Promise<ForwardGeocodingResponse> {
    this.logger.info(
      `Using controller forwardGeocode for address: ${forwardGeocodeDto.address}`,
    );
    return await this.geocodingService.forwardGeocode(
      forwardGeocodeDto.address,
    );
  }

  /**
   * Converts geographic coordinates to an address
   * @param reverseGeocodeDto Data containing the coordinates to reverse geocode
   * @returns Address information for the provided coordinates
   */
  @Post('reverse')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Reverse geocoding',
    description: 'Converts geographic coordinates to an address',
  })
  @ApiBody({
    type: ReverseGeocodeDto,
    description: 'Coordinates to reverse geocode',
  })
  @ApiResponse({
    status: 200,
    description: 'Coordinates successfully reverse geocoded',
    type: ReverseGeocodingResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to reverse geocode coordinates',
  })
  async reverseGeocode(
    @Body() reverseGeocodeDto: ReverseGeocodeDto,
  ): Promise<ReverseGeocodingResponse> {
    this.logger.info(
      `Using controller reverseGeocode for coordinates: ${reverseGeocodeDto.latitude}, ${reverseGeocodeDto.longitude}`,
    );
    return await this.geocodingService.reverseGeocode(
      reverseGeocodeDto.latitude,
      reverseGeocodeDto.longitude,
    );
  }
}
