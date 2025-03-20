import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Lookup user ID by username
  @Get('lookup')
  async getIdFromUsername(
    @Query('username') username: string,
  ): Promise<UsernameLookupResult> {
    const usernameLookup = await this.userService.getUserIdByUsername(username);
    if (!usernameLookup) {
      throw new NotFoundException('User not found');
    }
    return usernameLookup;
  }

  // Get user profile by username (using query parameter)
  @Get('profile')
  async getProfile(@Query('username') username: string): Promise<Profile> {
    const profile: Profile =
      await this.userService.getProfileByUsername(username);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  // Get user by ID
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }
}
