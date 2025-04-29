import {
  Controller,
  Post,
  Delete,
  Req,
  Body,
  UseGuards,
  Version,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { API_VERSIONS } from '@/constants/api-versions';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Req() req: RequestWithUser,
    @Body('adId') adId: string,
  ): Promise<{ success: boolean }> {
    console.log('adId from body:', adId);

    const userId = req.user?.sub;
    console.log('userID', userId);
    if (!userId || !adId) {
      throw new BadRequestException('User ID and ad ID are required');
    }

    await this.favoriteService.addFavorite(userId, adId);
    return { success: true };
  }

  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeFavorite(
    @Req() req: RequestWithUser,
    @Body('adId') adId: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user?.sub;

    if (!userId || !adId) {
      throw new BadRequestException('User ID and ad ID are required');
    }

    await this.favoriteService.removeFavorite(userId, adId);
    return { success: true };
  }

  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const userId = req.user.sub; // ou req['user']['id'] dependendo da estrutura
    console.log('userID', userId);
    await this.favoriteService.getUserFavoriteProducts(userId);
  }
}
