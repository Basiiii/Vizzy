import { Body, Controller, Post, Version } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { API_VERSIONS } from '@/constants/api-versions';
import { ResetPasswordDto } from '@/dtos/reset-password/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

/**
 * Controller for managing password reset operations
 */
@ApiTags('Password Reset')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  /**
   * Initiates the password reset process for a user
   * @param email Email address of the user requesting password reset
   * @returns Confirmation message that reset link has been sent (if email exists)
   */
  @Post('initiate')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Initiate password reset',
    description: 'Sends a password reset link to the provided email address',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'Email address of the user',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset initiated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'If the email exists, a reset link has been sent',
        },
      },
    },
  })
  async initiatePasswordReset(@Body('email') email: string) {
    await this.passwordResetService.initiatePasswordReset(email);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Resets a user's password using a valid reset token
   * @param resetPasswordDto Data containing the reset token and new password
   * @returns Confirmation message that password has been reset
   */
  @Post('reset')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using a valid reset token',
  })
  @ApiBody({ type: ResetPasswordDto, description: 'Password reset data' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password has been reset successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  @ApiResponse({
    status: 422,
    description: 'Password does not meet requirements',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password has been reset successfully' };
  }
}
