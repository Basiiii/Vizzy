import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Helper class for handling authentication errors
 */
export class AuthErrorHelper {
  /**
   * Handles authentication errors by throwing appropriate HTTP exceptions
   * @param error - The error to handle
   * @throws HttpException with appropriate status code and message
   */
  static handleAuthError(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof Error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      'An unknown error occurred',
      HttpStatus.BAD_REQUEST,
    );
  }
}
