import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@/dtos/user/user.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('lookup/:username')
  async getIdFromUsername(@Param('username') username: string) {
    const userLookup = await this.userService.getUserIdByUsername(username);
    if (!userLookup) {
      throw new NotFoundException('User not found');
    }
    return userLookup;
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.userService.deleteUser(userId);
  }
}
