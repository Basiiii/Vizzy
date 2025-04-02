import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
      this.handleSignUpError(error);
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.handleLoginError(error);
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }

  private handleSignUpError(error: any): never {
    const isEmailTaken =
      error.message.includes('User already registered') && error.status === 422;
    const isUsernameTaken =
      error.message.includes('Database error saving new user') &&
      error.status === 500;

    if (isEmailTaken) {
      throw new HttpException(
        'This email is already registered. Please use a different email.',
        HttpStatus.CONFLICT,
      );
    }

    if (isUsernameTaken) {
      throw new HttpException(
        'This username is already registered. Please use a different username.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    throw new HttpException(
      'Registration failed. Please try again.',
      HttpStatus.BAD_REQUEST,
    );
  }

  private handleLoginError(error: any): never {
    const isInvalidCredentials =
      error.message.includes('Invalid login credentials') &&
      error.code === '400';

    if (isInvalidCredentials) {
      throw new HttpException(
        'The credentials are incorrect. Insert new credentials.',
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      'Login failed. Please try again.',
      HttpStatus.BAD_REQUEST,
    );
  }

  async refreshSession(refreshToken: string) {
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      throw new HttpException(
        'The token was not refreshed properly.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }
}
