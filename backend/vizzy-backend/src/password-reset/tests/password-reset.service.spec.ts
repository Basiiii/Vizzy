import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from '../password-reset.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { EmailService } from '@/email/email.service';
import { ConfigService } from '@nestjs/config';

jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    randomBytes: jest.fn().mockImplementation(() => ({
      toString: jest.fn().mockReturnValue('mock-token'),
    })),
  };
});

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let mockSupabaseService: any;
  let mockEmailService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    // Setup
    mockSupabaseService = {
      getAdminClient: jest.fn().mockReturnValue({}),
    };

    mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePasswordReset', () => {
    const email = 'test@example.com';
    const userId = 'user-123';

    it('should initiate password reset for existing user', async () => {
      // Setup
      const mockClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: userId },
                error: null,
              }),
            }),
          }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        }),
      };

      mockSupabaseService.getAdminClient.mockReturnValue(mockClient);

      // Execute
      await service.initiatePasswordReset(email);

      // Verify
      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.from).toHaveBeenCalledWith('password_reset_tokens');
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        'mock-token',
      );
    });

    it('should silently return if user does not exist', async () => {
      // Setup
      const mockClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'User not found' },
              }),
            }),
          }),
        }),
      };

      mockSupabaseService.getAdminClient.mockReturnValue(mockClient);

      // Execute
      await service.initiatePasswordReset(email);

      // Verify
      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const token = 'valid-token';
    const newPassword = 'newSecurePassword123!';
    const userId = 'user-123';

    it('should reset password with valid token', async () => {
      // Setup
      const now = new Date();
      const future = new Date(now);
      future.setHours(future.getHours() + 1);

      const mockClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  user_id: userId,
                  used: false,
                  expires_at: future.toISOString(),
                },
                error: null,
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
        auth: {
          admin: {
            updateUserById: jest.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          },
        },
      };

      mockSupabaseService.getAdminClient.mockReturnValue(mockClient);

      // Execute
      await service.resetPassword(token, newPassword);

      // Verify
      expect(mockClient.from).toHaveBeenCalledWith('password_reset_tokens');
      expect(mockClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        userId,
        { password: newPassword },
      );
    });
  });
});
