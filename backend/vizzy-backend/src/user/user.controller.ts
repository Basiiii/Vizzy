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
  Query,  // Add this import
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/dtos/user/user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { API_VERSIONS } from '@/constants/api-versions';
import { Post, Body} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston'; 

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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

  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    this.logger.info(`Using controller deleteUser with ID: ${userId}`);
    return this.userService.deleteUser(userId);
  }

  @Get('block-status')
  @UseGuards(JwtAuthGuard)
  async checkBlockStatus(
    @Req() req: Request,
    @Query('targetUserId') targetUserId: string
  ): Promise<{ isBlocked: boolean }> {
    const userData = (req as any).user;
    const userId = userData?.sub;

    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }

    const isBlocked = await this.userService.isUserBlocked(userId, targetUserId);
    return { isBlocked };
  }

  @Post('block-toggle')
  @UseGuards(JwtAuthGuard)
  async toggleBlockUser(
    @Req() req: Request,
    @Body('targetUserId') targetUserId: string
  ): Promise<{ message: string }> {
    const userData = (req as any).user;
    const userId = userData.sub;

    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }

    const isBlocked = await this.userService.toggleBlockUser(userId, targetUserId);
    const message = isBlocked
      ? `User ${targetUserId} has been blocked.`
      : `User ${targetUserId} has been unblocked.`;
    return { message };
  }
}