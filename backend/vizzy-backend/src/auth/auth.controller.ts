import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dtos/auth/signup.dto';
import { LoginDto } from '../dtos/auth/login.dto';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { RequestWithUser } from './types/jwt-payload.type';
import { CookieHelper } from './helpers/cookie.helper';
import { AuthErrorHelper } from './helpers/error.helper';
import { VerifyResponse } from '@/dtos/auth/user-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<Response> {
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

      return res
        .status(201)
        .json({ message: 'User created successfully', user: userData });
    } catch (error) {
      AuthErrorHelper.handleAuthError(error);
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { email, password } = loginDto;
      const userData = await this.authService.login(email, password);

      CookieHelper.setAuthCookies(
        res,
        userData.session?.access_token,
        userData.session?.refresh_token,
      );

      return res
        .status(200)
        .json({ message: 'User logged in successfully', user: userData });
    } catch (error) {
      AuthErrorHelper.handleAuthError(error);
    }
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verify(@Req() req: RequestWithUser): VerifyResponse {
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
}
