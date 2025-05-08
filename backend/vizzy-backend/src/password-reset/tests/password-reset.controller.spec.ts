import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetController } from '../password-reset.controller';
import { PasswordResetService } from '../password-reset.service';
import { ResetPasswordDto } from '@/dtos/reset-password/reset-password.dto';

describe('PasswordResetController', () => {
  let controller: PasswordResetController;

  const mockPasswordResetService = {
    initiatePasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordResetController],
      providers: [
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
      ],
    }).compile();

    controller = module.get<PasswordResetController>(PasswordResetController);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset and return success message', async () => {
      // Setup
      const email = 'test@example.com';
      mockPasswordResetService.initiatePasswordReset.mockResolvedValue(
        undefined,
      );

      // Execute
      const result = await controller.initiatePasswordReset(email);

      // Verify
      expect(result).toEqual({
        message: 'If the email exists, a reset link has been sent',
      });
      expect(
        mockPasswordResetService.initiatePasswordReset,
      ).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should reset password and return success message', async () => {
      // Setup
      const resetPasswordDto: ResetPasswordDto = {
        token: 'valid-token',
        newPassword: 'newSecurePassword123!',
      };
      mockPasswordResetService.resetPassword.mockResolvedValue(undefined);

      // Execute
      const result = await controller.resetPassword(resetPasswordDto);

      // Verify
      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });
  });
});
