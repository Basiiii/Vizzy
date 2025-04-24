import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP exception filter that handles all unhandled exceptions in the application
 * @implements {ExceptionFilter}
 */
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  /**
   * Catches and processes all exceptions thrown in the application
   * @param {unknown} exception - The exception object that was thrown
   * @param {ArgumentsHost} host - The arguments host object containing the execution context
   * @returns {void}
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    /**
     * Determine the HTTP status code
     * Use the exception's status if it's an HttpException, otherwise use 500
     */
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    /**
     * Extract the error message from the exception
     * Use the exception's response if it's an HttpException
     * Use the error message if it's an Error instance
     * Default to 'Internal server error' for unknown error types
     */
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    /**
     * Construct the error response object
     * Include stack trace in non-production environments
     */
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(errorResponse);
    }

    response.status(status).json(errorResponse);
  }
}
