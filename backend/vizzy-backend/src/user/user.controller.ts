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
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/dtos/user/user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserLocationDto } from '@/dtos/user/user-location.dto';

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

  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    this.logger.info(`Using controller deleteUser with ID: ${userId}`);
    return this.userService.deleteUser(userId);
  }

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
}
