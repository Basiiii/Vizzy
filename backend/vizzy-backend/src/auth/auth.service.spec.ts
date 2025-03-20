import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AuthService', () => {
  let authService: AuthService;
  let supabaseMock: {
    auth: {
      signUp: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Mock SupabaseClient's auth.signUp method
    supabaseMock = {
      auth: {
        signUp: jest.fn(),
      },
    };

    // Mock SupabaseService to return our mocked client
    const mockSupabaseService = {
      getPublicClient: jest.fn(() => supabaseMock as unknown as SupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const mockUser: User = {
      id: '1',
      app_metadata: {},
      user_metadata: {},
      aud: '',
      created_at: '',
    } as User;
    const mockSession: Session = { access_token: 'mock_token' } as Session;

    it('should successfully register a user', async () => {
      // Mock successful response
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signUp(
        'test@example.com',
        'password',
        'testuser',
        'Test User',
      );

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      });
    });

    it('should throw HttpException when registration fails', async () => {
      const errorMessage = 'Email already exists';
      // Mock error response
      supabaseMock.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      await expect(
        authService.signUp(
          'test@example.com',
          'password',
          'testuser',
          'Test User',
        ),
      ).rejects.toThrow(
        new HttpException(
          'Registration failed. Please try again.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
