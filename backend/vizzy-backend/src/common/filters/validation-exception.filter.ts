import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodError)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message = exception.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors: message,
      timestamp: new Date().toISOString(),
    });
  }
}
