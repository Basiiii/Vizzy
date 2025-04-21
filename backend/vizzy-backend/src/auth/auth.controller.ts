import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Version,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dtos/auth/signup.dto';
import { LoginDto } from '../dtos/auth/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { RequestWithUser } from './types/jwt-payload.type';
import { AuthErrorHelper } from './helpers/error.helper';
import { AuthResponseDto } from '@/dtos/auth/auth-response.dto';
import { User } from '@/dtos/user/user.dto';
import { RefreshTokenDto } from '@/dtos/auth/refresh-token.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Controller handling authentication operations including signup, login, token verification and refresh
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Creates a new user account
   * @param signUpDto - User registration data
   * @returns Authentication response with user details and tokens
   */
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: SignUpDto,
    description: 'User registration information',
    examples: {
      example1: {
        summary: 'Standard signup',
        description: 'Example of a standard user registration',
        value: {
          email: 'user@example.com',
          password: 'Password123!',
          name: 'John Doe',
          username: 'johndoe',
          address: '123 Main St, City',
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
      minimalExample: {
        summary: 'Minimal signup',
        description: 'Example with only required fields',
        value: {
          email: 'user@example.com',
          password: 'Password123!',
          name: 'John Doe',
          username: 'johndoe',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Username already registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Registration failed',
  })
  @Post('signup')
  @Version(API_VERSIONS.V1)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    this.logger.info(`Using controller signUp for email: ${signUpDto.email}`);
    try {
      const { user, session } = await this.authService.signUp(signUpDto);

      this.logger.info(
        `User signed up successfully for email: ${signUpDto.email}`,
      );

      const userDto: User = {
        id: user?.id || '',
        email: user?.email || '',
        name: user?.user_metadata?.name || '',
        username: user?.user_metadata?.username || '',
        is_deleted: false,
      };

      return {
        user: userDto,
        tokens: {
          accessToken: session?.access_token || '',
          refreshToken: session?.refresh_token || '',
        },
      };
    } catch (error) {
      this.logger.error(
        `Sign-up failed for email: ${signUpDto.email}, error: ${error.message}`,
      );
      AuthErrorHelper.handleAuthError(error);
    }
  }

  /**
   * Authenticates a user with email and password
   * @param loginDto - User login credentials
   * @returns Authentication response with user details and tokens
   */
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      standard: {
        summary: 'Standard login',
        description: 'Example of standard login credentials',
        value: {
          email: 'user@example.com',
          password: 'Password123!',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid credentials or login failed',
  })
  @Post('login')
  @Version(API_VERSIONS.V1)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.info(`Using controller login for email: ${loginDto.email}`);
    try {
      const { email, password } = loginDto;
      const { user, session } = await this.authService.login(email, password);

      this.logger.info(`User logged in successfully for email: ${email}`);

      const userDto: User = {
        id: user?.id || '',
        email: user?.email || '',
        name: user?.user_metadata?.name || '',
        username: user?.user_metadata?.username || '',
        is_deleted: false,
      };

      return {
        user: userDto,
        tokens: {
          accessToken: session?.access_token || '',
          refreshToken: session?.refresh_token || '',
        },
      };
    } catch (error) {
      this.logger.error(
        `Login failed for email: ${loginDto.email}, error: ${error.message}`,
      );
      AuthErrorHelper.handleAuthError(error);
    }
  }

  /**
   * Verifies a user's JWT token and returns user information
   * @param req - Request with authenticated user information
   * @returns User information extracted from the JWT token
   */
  @ApiOperation({ summary: 'Verify authentication token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  @ApiBearerAuth()
  @Post('verify')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  verify(@Req() req: RequestWithUser): User {
    this.logger.info(`Using controller verify for user ID: ${req.user.sub}`);

    return {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.user_metadata.name,
      username: req.user.user_metadata.username,
      is_deleted: false,
    };
  }

  /**
   * Refreshes an authentication session using a refresh token
   * @param refreshTokenDto - DTO containing the refresh token
   * @returns New authentication tokens and user information
   */
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token information',
    examples: {
      standard: {
        summary: 'Token refresh',
        description: 'Example of refresh token request',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid refresh token or refresh failed',
  })
  @Post('refresh')
  @Version(API_VERSIONS.V1)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    this.logger.info(`Using controller refresh for refresh token.`);
    try {
      const { refreshToken } = refreshTokenDto;
      const { user, session } =
        await this.authService.refreshSession(refreshToken);

      this.logger.info(`Token refreshed successfully.`);

      const userDto: User = {
        id: user?.id || '',
        email: user?.email || '',
        name: user?.user_metadata?.name || '',
        username: user?.user_metadata?.username || '',
        is_deleted: false,
      };

      return {
        user: userDto,
        tokens: {
          accessToken: session?.access_token || '',
          refreshToken: session?.refresh_token || '',
        },
      };
    } catch (error) {
      this.logger.error(`Token refresh failed, error: ${error.message}`);
      AuthErrorHelper.handleAuthError(error);
    }
  }
}
