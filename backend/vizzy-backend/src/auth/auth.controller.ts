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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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
