import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Delete,
  Req,
  Version,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/dtos/user/user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { API_VERSIONS } from '@/constants/api-versions';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('lookup/:username')
  @Version(API_VERSIONS.V1)
  async getIdFromUsername(@Param('username') username: string) {
    const userLookup = await this.userService.getUserIdByUsername(username);
    if (!userLookup) {
      throw new NotFoundException('User not found');
    }
    return userLookup;
  }

  @Get(':id')
  @Version(API_VERSIONS.V1)
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.userService.deleteUser(userId);
  }
}
