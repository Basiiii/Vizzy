import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Delete,
  Req,
  Version,
  Inject,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/dtos/user/user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { API_VERSIONS } from '@/constants/api-versions';
import { Post, Body } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserLocationDto } from '@/dtos/user/user-location.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Controller for managing user operations
 */
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Get user ID from username
   * @param username Username to lookup
   * @returns User lookup information
   */
  @ApiOperation({ summary: 'Get user ID from username' })
  @ApiParam({ name: 'username', description: 'Username to lookup' })
  @ApiResponse({
    status: 200,
    description: 'User lookup information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('lookup/:username')
  @Version(API_VERSIONS.V1)
  async getIdFromUsername(@Param('username') username: string) {
    this.logger.info(
      `Using controller getIdFromUsername() for username: ${username}`,
    );
    const userLookup = await this.userService.getUserIdByUsername(username);
    if (!userLookup) {
      this.logger.warn(`User not found for username: ${username}`);
      throw new NotFoundException('User not found');
    }
    return userLookup;
  }

  /**
   * Delete current user's account
   * @param req Request with authenticated user information
   * @returns Deletion confirmation
   */
  @ApiOperation({ summary: 'Delete current user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    this.logger.info(`Using controller deleteUser with ID: ${userId}`);
    return this.userService.deleteUser(userId);
  }

  /**
   * Get user's location information
   * @param req Request with authenticated user information
   * @returns User location data
   */
  @ApiOperation({ summary: 'Get user location' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User location retrieved successfully',
    type: UserLocationDto,
  })
  @ApiResponse({ status: 404, description: 'User location not found' })
  @Get('location')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getUserLocation(@Req() req: RequestWithUser): Promise<UserLocationDto> {
    const userId = req.user.sub;
    this.logger.info(`Using controller getUserLocation for user ID: ${userId}`);

    const location = await this.userService.getUserLocation(userId);

    if (!location) {
      this.logger.warn(`No location found for user ID: ${userId}`);
      throw new NotFoundException('User location not found');
    }

    return location;
  }

  /**
   * Get user by their ID
   * @param id User ID to lookup
   * @returns User information
   */
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  @Version(API_VERSIONS.V1)
  async getUser(@Param('id') id: string): Promise<User> {
    this.logger.info(`Using controller getUser for ID: ${id}`);
    const user = await this.userService.getUserById(id);
    if (!user) {
      this.logger.warn(`User not found for ID: ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Check if a user is blocked
   * @param req Request with authenticated user information
   * @param targetUserId ID of the user to check block status
   * @returns Block status information
   */
  @ApiOperation({ summary: 'Check if user is blocked' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Block status retrieved successfully',
    type: Boolean,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing targetUserId',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('block-status')
  @UseGuards(JwtAuthGuard)
  async checkBlockStatus(
    @Req() req: RequestWithUser,
    @Query('targetUserId') targetUserId: string,
  ): Promise<{ isBlocked: boolean }> {
    const userId = req.user.sub;

    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }

    const isBlocked = await this.userService.isUserBlocked(
      userId,
      targetUserId,
    );
    return { isBlocked };
  }

  /**
   * Toggle block status for a user
   * @param req Request with authenticated user information
   * @param targetUserId ID of the user to toggle block status
   * @returns Updated block status message
   */
  @ApiOperation({ summary: 'Toggle block status for a user' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Target user ID to toggle block status',
    schema: { properties: { targetUserId: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Block status toggled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing targetUserId',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('block-toggle')
  @UseGuards(JwtAuthGuard)
  async toggleBlockUser(
    @Req() req: RequestWithUser,
    @Body('targetUserId') targetUserId: string,
  ): Promise<{ message: string }> {
    const userId = req.user.sub;

    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }

    const isBlocked = await this.userService.toggleBlockUser(
      userId,
      targetUserId,
    );
    const message = isBlocked
      ? `User ${targetUserId} has been blocked.`
      : `User ${targetUserId} has been unblocked.`;
    return { message };
  }

  /**
   * Update user's location information
   * @param req Request with authenticated user information
   * @param body Request body containing location data
   * @returns Confirmation message
   */
  @ApiOperation({ summary: 'Update user location' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'User location data',
    schema: {
      properties: {
        address: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('location/update')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async updateUserLocation(
    @Req() req: RequestWithUser,
    @Body() body: { address: string; latitude: number; longitude: number },
  ): Promise<{ message: string }> {
    const userId = req.user.sub;
    this.logger.info(
      `Using controller updateUserLocation for user ID: ${userId}`,
    );

    return this.userService.updateUserLocation(
      userId,
      body.address,
      body.latitude,
      body.longitude,
    );
  }
}
