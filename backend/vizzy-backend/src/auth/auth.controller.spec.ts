/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dtos/auth/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
  };

  type ResponseMock = {
    cookie: jest.Mock;
    status: jest.Mock<ResponseMock>;
    json: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      username: 'testuser',
      name: 'Test User',
    };

    const mockResponse: ResponseMock = {
      cookie: jest.fn(),
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };

    it('should create user and set cookies on success', async () => {
      const mockUserData = {
        user: { id: '1', email: mockSignUpDto.email },
        session: {
          access_token: 'access_token',
          refresh_token: 'refresh_token',
        },
      };

      mockAuthService.signUp.mockResolvedValue(mockUserData);

      await controller.signUp(mockSignUpDto, mockResponse as any);

      // Verify service call
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        mockSignUpDto.email,
        mockSignUpDto.password,
        mockSignUpDto.username,
        mockSignUpDto.name,
      );

      // Verify cookie settings
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'auth-token',
        'access_token',
        {
          secure: false,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 3600000,
          path: '/',
        },
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh-token',
        'refresh_token',
        {
          secure: false,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 2592000000,
          path: '/',
        },
      );

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: mockUserData,
      });
    });

    it('should throw HttpException on failure', async () => {
      const errorMessage = 'Email already in use';
      mockAuthService.signUp.mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.signUp(mockSignUpDto, mockResponse as any),
      ).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
    });
  });
});
