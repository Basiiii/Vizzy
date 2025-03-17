import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  /**
   * Service Constructor
   * @param supabaseService - Injected Supabase service instance for database access
   */
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * User Registration Service
   *
   * @param email - User's email address (must be unique)
   * @param password - User's password (min 6 characters)
   * @param username - Username identifier
   * @param name - User's display name
   * @returns Promise containing user object and session data
   * @throws HttpException BAD_REQUEST (400) for registration failures
   *
   * Creates a new user account with Supabase auth system and stores additional
   * user metadata (username, name). Returns the created user and active session.
   *
   * Security Note:
   * - Passwords are securely hashed by Supabase before storage
   * - User metadata is stored in Supabase's auth.users table
   */
  async signUp(
    email: string,
    password: string,
    username: string,
    name: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    // Get authenticated Supabase client instance
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    // Execute Supabase signup with email/password auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store additional user metadata
        data: { username, name, email },
      },
    });

    // Handle authentication errors
    if (error) {
      throw new HttpException(
        `Registration failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Return normalized response with null safety
    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }
}
