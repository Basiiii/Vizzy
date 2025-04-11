import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { GeocodingValidationException } from '../helpers/geocoding-validator.helper';
import { Response } from 'express';

@Catch(GeocodingValidationException)
export class GeocodingExceptionFilter implements ExceptionFilter {
  catch(exception: GeocodingValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.message,
      timestamp: new Date().toISOString(),
      type: exception.constructor.name,
    });
  }
}
