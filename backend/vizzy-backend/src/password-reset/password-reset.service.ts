import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { EmailService } from '@/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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

    const expiresAt = String(resetToken.expires_at);
    if (new Date(expiresAt) < new Date()) {
      throw new HttpException('Token has expired', HttpStatus.BAD_REQUEST);
    }

    const userId = String(resetToken.user_id);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
      },
    );

    if (updateError) {
      console.error('Password update error:', updateError);

      if ('code' in updateError && updateError.status === 422) {
        if (updateError.code === 'weak_password') {
          throw new HttpException(
            'Password is too weak. It must be at least 10 characters long and contain uppercase, lowercase, numbers, and special characters.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      throw new HttpException(
        'Failed to update password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Mark token as used
    const { error: tokenUpdateError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (tokenUpdateError) {
      console.error('Token update error:', tokenUpdateError);
    }
  }
}
