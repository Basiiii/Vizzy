import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  HttpCode,
  Version,
  Inject,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { API_VERSIONS } from '@/constants/api-versions';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Get all favorites for the logged-in user
   * @param req - The request object with user information
   * @param limit - Number of items to return
   * @param offset - Number of items to skip
   * @returns Promise<ListingBasic[]>
   */
  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all favorites for the logged-in user' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'List of favorites',
    type: [ListingBasic],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<ListingBasic[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.logger.info(
      `Controller: Fetching favorites for user ${userId} with limit ${limit} and offset ${offset}`,
    );
    return this.favoritesService.findAll(userId, limit, offset);
  }

  /**
   * Add a new favorite
   * @param req - The request object with user information
   * @param listingId - ID of the listing to favorite
   * @returns Promise<void>
   */
  @Post(':listingId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new favorite' })
  @ApiParam({
    name: 'listingId',
    type: Number,
    description: 'ID of the listing to favorite',
  })
  @ApiResponse({ status: 201, description: 'Favorite added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addFavorite(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.logger.info(
      `Controller: Adding favorite for user ${userId} and listing ${listingId}`,
    );
    await this.favoritesService.addFavorite(userId, listingId);
  }

  /**
   * Remove a favorite
   * @param req - The request object with user information
   * @param listingId - ID of the listing favorite to remove
   * @returns Promise<void>
   */
  @Delete(':listingId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a favorite' })
  @ApiParam({
    name: 'listingId',
    type: Number,
    description: 'ID of the listing favorite to remove',
  })
  @ApiResponse({ status: 204, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.logger.info(
      `Controller: Removing favorite ${listingId} for user ${userId}`,
    );
    await this.favoritesService.removeFavorite(userId, listingId);
  }

  /**
   * Check if a listing is favorited by the logged-in user
   * @param req - The request object with user information
   * @param listingId - ID of the listing to check
   * @returns Promise<boolean>
   */
  @Get(':listingId/status')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if a listing is favorited by the logged-in user',
  })
  @ApiParam({
    name: 'listingId',
    type: Number,
    description: 'ID of the listing to check',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status',
    schema: {
      type: 'object',
      properties: {
        isFavorited: {
          type: 'boolean',
          description: 'Whether the listing is favorited by the user',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkFavoriteStatus(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<{ isFavorited: boolean }> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.logger.info(
      `Controller: Checking favorite status for listing ${listingId} and user ${userId}`,
    );
    const isFavorited = await this.favoritesService.isListingFavorited(
      userId,
      listingId,
    );
    return { isFavorited };
  }
}
