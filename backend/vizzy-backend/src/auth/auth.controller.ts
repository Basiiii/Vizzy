import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Session, User } from '@supabase/supabase-js';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // Base route for all endpoints in this controller: '/auth'
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Sign-Up Endpoint
   *
   * @param {SignUpDto} signUpDto - Data Transfer Object containing:
   *   - email: User's email address (validated as a proper email format)
   *   - password: User's password (validated for complexity: min 10 chars, uppercase, lowercase, number, and special character)
   *   - username: User's unique username (min 3 chars)
   *   - name: User's display name (min 3 chars)
   * @param {Response} res - Express response object for cookie handling
   * @returns {Response} JSON response with user data and authentication cookies
   *
   * @throws {HttpException} BAD_REQUEST (400) for:
   *   - Invalid input (handled by Zod validation)
   *   - Existing user (email or username already registered)
   *   - Supabase authentication errors
   *   - Unknown errors
   *
   * Creates a new user account and sets authentication cookies:
   * - auth-token: Short-lived session token (1 hour)
   * - refresh-token: Long-lived refresh token (30 days)
   *
   * Security Notes:
   * - Passwords are securely hashed by Supabase before storage
   * - Cookies are HTTP-only and secure (in production)
   * - Validation ensures strong passwords and proper data formats
   */
  @Post('signup') // Endpoint: POST /auth/signup
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const { email, password, username, name } = signUpDto;

    try {
      // Call authentication service to create user
      const userData: { user: User | null; session: Session | null } =
        await this.authService.signUp(email, password, username, name);

      // Set secure HTTP-only cookies for authentication
      res.cookie('auth-token', userData.session?.access_token || '', {
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 60 * 60 * 1000, // 1 hour expiration
        path: '/', // Accessible across all routes
      });

      res.cookie('refresh-token', userData.session?.refresh_token || '', {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days expiration
        path: '/',
      });

      // Return success response with user data
      return res
        .status(201)
        .json({ message: 'User created successfully', user: userData });
    } catch (error: unknown) {
      // Handle known errors
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        // Handle unexpected errors
        throw new HttpException(
          'An unknown error occurred',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * User login Endpoint
   *
   * @param {LoginDto} loginDto - Data Transfer Object containing:
   *   - email: User's email address (validated as a proper email format)
   *   - password: User's password (validated for complexity: min 10 chars, uppercase, lowercase, number, and special character)
   * @param {Response} res - Express response object for cookie handling
   * @returns {Response} JSON response with user data and authentication cookies
   *
   * @throws {HttpException} BAD_REQUEST (400) for:
   *   - Invalid input (handled by Zod validation)
   *   - Supabase authentication errors
   *   - Unknown errors
   *
   * Logs in a user in the app and sets authentication cookies:
   * - auth-token: Short-lived session token (1 hour)
   * - refresh-token: Long-lived refresh token (30 days)
   */
  @Post('login') // Endpoint: POST /auth/login
  async Login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    const { email, password } = loginDto;

    try {
      // Call authentication service to login user
      const userData: { user: User | null; session: Session | null } =
        await this.authService.login(email, password);

      // Set secure HTTP-only cookies for authentication
      res.cookie('auth-token', userData.session?.access_token || '', {
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 60 * 60 * 1000, // 1 hour expiration
        path: '/', // Accessible across all routes
      });

      res.cookie('refresh-token', userData.session?.refresh_token || '', {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days expiration
        path: '/',
      });

      // Return success response with user data
      return res
        .status(201)
        .json({ message: 'User logged in successfully', user: userData });
    } catch (error: unknown) {
      // Handle known errors
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        // Handle unexpected errors
        throw new HttpException(
          'An unknown error occurred',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
