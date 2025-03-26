import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, Contact } from './models/user.model';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';
import { Listing } from 'dtos/user-listings.dto';
import { Delete } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { UpdateProfileDto } from 'dtos/update-profile.dto';
import { CreateContactDto } from '@/dtos/create-contact.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';

interface CustomRequest extends Request {
  cookies: Record<string, string>;
}

interface CustomRequest extends Request {
  cookies: Record<string, string>;
}

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

  @Get('contacts/:id')
  async getContacts(@Param('id') id: string): Promise<Contact[] | null> {
    return this.userService.getContacts(id);
  }

  @Post('contacts')
  @UseGuards(JwtAuthGuard)
  async addContact(
    @Req() req: Request,
    @Body() createContactDto: CreateContactDto,
  ): Promise<Contact> {
    try {
      const userData = (req as any).user;
      if (!userData?.sub) {
        throw new HttpException(
          'User ID not found in request',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return await this.userService.addContact(userData.sub, createContactDto);
    } catch (error: unknown) {
      // Preserve existing HttpExceptions
      if (error instanceof HttpException) {
        throw error;
      }
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('required fields')) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
        if (error.message.includes('Invalid userId')) {
          throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
        if (error.message.includes('Failed to add contact')) {
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        // Default error case
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      // Fallback for unknown errors
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  @Post('update-profile-data')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    const userData = (req as any).user;
    console.log(userData);
    console.log(updateProfileDto);
    // Chama o serviço para atualizar o perfil
    return this.userService.updateProfile(
      userData.user_metadata.username as string,
      updateProfileDto,
      userData.user_id as string,
    );
  }
}
