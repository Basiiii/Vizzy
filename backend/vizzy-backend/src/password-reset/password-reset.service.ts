import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { EmailService } from '@/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for handling password reset functionality
 * Manages token generation, validation, and password updates
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a secure random token for password reset
   * @returns A hexadecimal string token
   * @private
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Initiates the password reset process for a user
   * Generates a reset token, stores it in the database, and sends an email
   * @param email Email address of the user requesting password reset
   * @throws HttpException if token creation fails
   */
  async initiatePasswordReset(email: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Return success even if user not found (security best practice)
      return;
    }

    const token = this.generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    const { error } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      throw new HttpException(
        'Failed to initiate password reset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.emailService.sendPasswordResetEmail(email, token);
  }
  /**
   * Resets a user's password using a valid reset token
   * Validates the token, updates the password, and marks the token as used
   * @param token The reset token to validate
   * @param newPassword The new password to set
   * @throws HttpException if token is invalid, expired, or already used
   * @throws HttpException if password update fails
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const resetToken = await this.validateResetToken(supabase, token);
    await this.updateUserPassword(
      supabase,
      resetToken.user_id as string,
      newPassword,
    );
    await this.markTokenAsUsed(supabase, token);
  }

  /**
   * Validates a password reset token
   * @param supabase The Supabase client instance
   * @param token The reset token to validate
   * @returns The reset token data if valid
   * @throws HttpException if token is invalid, expired, or already used
   */
  private async validateResetToken(supabase: SupabaseClient, token: string) {
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('user_id, used, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      throw new HttpException('Invalid reset token', HttpStatus.BAD_REQUEST);
    }

    if (resetToken.used) {
      throw new HttpException('Token already used', HttpStatus.BAD_REQUEST);
    }

    if (new Date(String(resetToken.expires_at)) < new Date()) {
      throw new HttpException('Token has expired', HttpStatus.BAD_REQUEST);
    }

    return resetToken;
  }

  /**
   * Updates a user's password in Supabase
   * @param supabase The Supabase client instance
   * @param userId The ID of the user whose password is being updated
   * @param newPassword The new password to set
   * @throws HttpException if password is too weak or update fails
   */
  private async updateUserPassword(
    supabase: SupabaseClient,
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      String(userId),
      { password: newPassword },
    );

    if (!updateError) return;

    console.error('Password update error:', updateError);

    if (
      'code' in updateError &&
      updateError.status === 422 &&
      updateError.code === 'weak_password'
    ) {
      throw new HttpException(
        'Password is too weak. It must be at least 10 characters long and contain uppercase, lowercase, numbers, and special characters.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    throw new HttpException(
      'Failed to update password',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Marks a password reset token as used
   * @param supabase The Supabase client instance
   * @param token The token to mark as used
   * @returns Promise that resolves when token is marked as used
   */
  private async markTokenAsUsed(
    supabase: SupabaseClient,
    token: string,
  ): Promise<void> {
    const { error: tokenUpdateError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (tokenUpdateError) {
      console.error('Token update error:', tokenUpdateError);
    }
  }
}
