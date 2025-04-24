import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';
import { Response } from 'express';

/**
 * Filter to handle Zod validation exceptions in NestJS applications.
 * Catches ZodError instances and transforms them into a standardized HTTP response.
 *
 * @implements {ExceptionFilter}
 */
@Catch(ZodError)
export class ValidationExceptionFilter implements ExceptionFilter {
  /**
   * Catches and processes ZodError exceptions.
   *
   * @param {ZodError} exception - The caught Zod validation error
   * @param {ArgumentsHost} host - The arguments host provided by NestJS
   * @returns {void}
   *
   * @example
   * // Returns a response in the format:
   * {
   *   statusCode: 400,
   *   message: 'Validation failed',
   *   errors: [{ field: 'fieldName', message: 'error message' }],
   *   timestamp: '2024-01-01T00:00:00.000Z'
   * }
   */
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
