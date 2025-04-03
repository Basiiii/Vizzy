import { Controller, Post, Body, Version, Inject } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import {
  ForwardGeocodeDto,
  ReverseGeocodeDto,
  ForwardGeocodingResponse,
  ReverseGeocodingResponse,
} from '@/dtos/geocoding/geocoding.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { API_VERSIONS } from '@/constants/api-versions';

@Controller('geocoding')
export class GeocodingController {
  constructor(
    private readonly geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('forward')
  @Version(API_VERSIONS.V1)
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

  @Post('reverse')
  @Version(API_VERSIONS.V1)
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
