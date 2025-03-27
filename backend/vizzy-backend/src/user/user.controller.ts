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
import { User } from './models/user.model';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsernameLookupResult } from '@/dtos/username-lookup-result.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // GET /users/lookup/{username} - Returns just id and username
  @Get('lookup/:username')
  async getIdFromUsername(
    @Param('username') username: string,
  ): Promise<UsernameLookupResult> {
    const usernameLookup = await this.userService.getUserIdByUsername(username);
    if (!usernameLookup) {
      throw new NotFoundException('User not found');
    }
    return usernameLookup;
  }

  // GET /users/{id} - Returns full user object
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // DELETE /users/me - Delete authenticated user's account
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Req() req: Request,
  ): Promise<{ message: string } | { error: string }> {
    const userData = (req as any).user;
    return this.userService.deleteUser(userData.sub as string);
  }
}
