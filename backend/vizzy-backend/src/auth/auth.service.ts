import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from '@/supabase/supabase.service';

@Injectable()
export class AuthService {
  /**
   * Service Constructor
   * @param supabaseService - Injected Supabase service instance for database access
   */
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * User Sign-Up Service Function
   *
   * @param {string} email - User's email address (validated as a proper email format)
   * @param {string} password - User's password (validated for complexity: min 10 chars, uppercase, lowercase, number, and special character)
   * @param {string} username - User's unique username (min 3 chars)
   * @param {string} name - User's display name (min 3 chars)
   * @returns {Promise<{ user: User | null; session: Session | null }>} Object containing:
   *   - user: The created user object (or null if creation fails)
   *   - session: The authentication session (or null if creation fails)
   *
   * @throws {HttpException}
   *   - CONFLICT (409) if the email is already registered
   *   - UNPROCESSABLE_ENTITY (422) if the username is already registered
   *   - BAD_REQUEST (400) for other registration failures (e.g., Supabase errors, invalid input)
   *
   * This function handles user registration using Supabase authentication:
   * - Creates a new user account in Supabase
   * - Attaches additional user metadata (username, name, email) to the user profile
   * - Throws specific HTTP exceptions for known error cases:
   *   - 409 Conflict: Indicates that the email is already registered.
   *   - 422 Unprocessable Entity: Indicates that the username is already registered.
   *   - 400 Bad Request: For all other errors, such as invalid input or Supabase authentication failures.
   */
  async signUp(
    email: string,
    password: string,
    username: string,
    name: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name, email },
      },
    });

    if (error) {
      // Determine appropriate HTTP status code and error message
      let statusCode = HttpStatus.BAD_REQUEST;
      let errorMessage = 'Registration failed. Please try again.';

      if (
        error.message.includes('User already registered') &&
        error.status == 422
      ) {
        statusCode = HttpStatus.CONFLICT;
        errorMessage =
          'This email is already registered. Please use a different email.';
      } else if (
        error.message.includes('Database error saving new user') &&
        error.status == 500
      ) {
        statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
        errorMessage =
          'This username is already registered. Please use a different username.';
      }

      throw new HttpException(errorMessage, statusCode);
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }

  /**
   * User Login Service
   *
   * @param email - User's email address (must be unique)
   * @param password - User's password (min 6 characters)
   * @returns Promise containing user object and session data
   * @throws HttpException BAD_REQUEST (400) for registration failures
   *
   * Logs in user with Supabase auth system. Returns the user and active session.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    // Get authenticated Supabase client instance
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    // Execute Supabase signIn with email/password auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // Handle authentication errors
    if (error) {
      let statusCode = HttpStatus.BAD_REQUEST;
      let errorMessage = 'Login failed. Please try again.';
      if (
        error.message.includes('Invalid login credentials') &&
        error.code == '400'
      ) {
        statusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'The credentials are incorrect. Insert new credentials.';
      }
      throw new HttpException(errorMessage, statusCode);
    }

    // Return normalized response with null safety
    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }
}
