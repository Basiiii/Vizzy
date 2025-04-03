import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async signUp(
    email: string,
    password: string,
    username: string,
    name: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    this.logger.info(`Using service signUp for email: ${email}`);
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name, email },
      },
    });

    if (error) {
      this.logger.error(
        `Sign-up failed for email: ${email}, error: ${error.message}`,
      );
      this.handleSignUpError(error);
    }

    this.logger.info(`Sign-up successful for email: ${email}`);
    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    this.logger.info(`Using service login for email: ${email}`);
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error(
        `Login failed for email: ${email}, error: ${error.message}`,
      );
      this.handleLoginError(error);
    }

    this.logger.info(`Login successful for email: ${email}`);
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
    this.logger.info(`Using service refreshSession with refresh token.`);
    const supabase: SupabaseClient = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) {
      this.logger.error(`Refresh session failed, error: ${error.message}`);
      throw new HttpException(
        'The token was not refreshed properly.',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.info('Session refreshed successfully.');
    return {
      user: data?.user || null,
      session: data?.session || null,
    };
  }
}
