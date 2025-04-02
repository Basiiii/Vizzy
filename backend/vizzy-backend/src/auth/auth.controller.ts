import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dtos/auth/signup.dto';
import { LoginDto } from '../dtos/auth/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { RequestWithUser } from './types/jwt-payload.type';
import { CookieHelper } from './helpers/cookie.helper';
import { AuthErrorHelper } from './helpers/error.helper';
import { VerifyResponse } from '@/dtos/auth/user-verification.dto';
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
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.logger.info(`Using controller signUp for email: ${signUpDto.email}`);
    try {
      const { email, password, username, name } = signUpDto;
      const userData = await this.authService.signUp(
        email,
        password,
        username,
        name,
      );

      CookieHelper.setAuthCookies(
        res,
        userData.session?.access_token,
        userData.session?.refresh_token,
      );

      this.logger.info(`User signed up successfully for email: ${email}`);
      return res
        .status(201)
        .json({ message: 'User created successfully', user: userData });
    } catch (error) {
      this.logger.error(
        `Sign-up failed for email: ${signUpDto.email}, error: ${error.message}`,
      );
      AuthErrorHelper.handleAuthError(error);
    }
  }

  @Post('login')
  @Version(API_VERSIONS.V1)
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.logger.info(`Using controller login for email: ${loginDto.email}`);
    try {
      const { email, password } = loginDto;
      const userData = await this.authService.login(email, password);

      CookieHelper.setAuthCookies(
        res,
        userData.session?.access_token,
        userData.session?.refresh_token,
      );

      this.logger.info(`User logged in successfully for email: ${email}`);
      return res
        .status(200)
        .json({ message: 'User logged in successfully', user: userData });
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
  verify(@Req() req: RequestWithUser): VerifyResponse {
    this.logger.info(`Using controller verify for user ID: ${req.user.sub}`);
    return {
      ok: true,
      user: {
        id: req.user.sub,
        email: req.user.email,
        name: req.user.user_metadata.name,
        username: req.user.user_metadata.username,
      },
    };
  }

  @Post('refresh')
  @Version(API_VERSIONS.V1)
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    this.logger.info(`Using controller refresh for refresh token.`);
    try {
      const userData = await this.authService.refreshSession(refreshToken);

      CookieHelper.setAuthCookies(
        res,
        userData.session.access_token,
        userData.session.refresh_token,
      );

      this.logger.info(`Token refreshed successfully.`);
      return res
        .status(200)
        .json({ message: 'Token refreshed successfully', user: userData });
    } catch (error) {
      this.logger.error(`Token refresh failed, error: ${error.message}`);
      AuthErrorHelper.handleAuthError(error);
    }
  }
}
