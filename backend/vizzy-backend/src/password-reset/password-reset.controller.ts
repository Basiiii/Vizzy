import { Body, Controller, Post, Version } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { API_VERSIONS } from '@/constants/api-versions';
import { ResetPasswordDto } from '@/dtos/reset-password/reset-password.dto';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('initiate')
  @Version(API_VERSIONS.V1)
  async initiatePasswordReset(@Body('email') email: string) {
    await this.passwordResetService.initiatePasswordReset(email);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Post('reset')
  @Version(API_VERSIONS.V1)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password has been reset successfully' };
  }
}
