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

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a listing to favorites' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        listingId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['listingId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Favorite added successfully' })
  @ApiResponse({ status: 400, description: 'User ID and ad ID are required' })
  async addFavorite(
    @Req() req: RequestWithUser,
    @Body('listingId') listingId: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user?.sub;
    console.log('userID', userId);
    if (!userId || !listingId) {
      throw new BadRequestException('User ID and ad ID are required');
    }

    await this.favoriteService.addFavorite(userId, listingId);
    return { success: true };
  }

  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a listing from favorites' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        listingId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['listingId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 400, description: 'User ID and ad ID are required' })
  async removeFavorite(
    @Req() req: RequestWithUser,
    @Body('listingId') listingId: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user?.sub;

    if (!userId || !listingId) {
      throw new BadRequestException('User ID and ad ID are required');
    }

    await this.favoriteService.removeFavorite(userId, listingId);
    return { success: true };
  }

  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all user favorite listings' })
  @ApiResponse({ status: 200, description: 'List of favorite listings' })
  @ApiResponse({ status: 400, description: 'User not authenticated' })
  async getUserFavorites(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const userId = req.user.sub;
    console.log('userID', userId);
    await this.favoriteService.getUserFavoriteProducts(userId);
  }
}
