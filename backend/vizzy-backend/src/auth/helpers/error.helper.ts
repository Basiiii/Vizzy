import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthErrorHelper {
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
