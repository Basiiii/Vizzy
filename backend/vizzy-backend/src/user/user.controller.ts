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
import { Listing } from 'dtos/user-listings.dto';

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

  @Get('listings')
  async getListings(
    @Query('userid') userid: string,
    @Query('page') page = '1', // default to page 1
    @Query('limit') limit = '8', // default to 8 items per page
  ): Promise<Listing[]> {
    const pageNumber: number = parseInt(page, 10);
    const limitNumber: number = parseInt(limit, 10);
    const offset: number = (pageNumber - 1) * limitNumber;

    const listings = await this.userService.getListingsByUserId(userid, {
      limit: limitNumber,
      offset,
    });

    if (!listings) {
      throw new NotFoundException('Listings not found');
    }
    return listings;
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

  @Delete('delete')
  async deleteUSer(
    @Req() req: CustomRequest,
  ): Promise<{ message: string } | { error: string }> {
    const supabase = this.supabaseService.getAdminClient();
    const jwtToken = req.cookies?.['auth-token'];

    const {
      data: { user },
    } = await supabase.auth.getUser(jwtToken);

    return this.userService.deleteUser(user.id);
  }
}
