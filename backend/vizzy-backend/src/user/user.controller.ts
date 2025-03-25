import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  Delete,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';
import { Listing } from 'dtos/user-listings.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Express } from 'express';

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
  @UseGuards(JwtAuthGuard)
  async deleteUSer(
    @Req() req: CustomRequest,
  ): Promise<{ message: string } | { error: string }> {
    const data = (req as any).user;

    return this.userService.deleteUser(data.sub as string);
  }

  /**
   * Uploads and processes a user's profile picture
   * @param req - The HTTP request object containing user authentication data
   * @param file - The uploaded image file (supported formats: JPEG, PNG, WebP)
   * @returns Promise containing the result of the profile picture upload
   * @throws {HttpException} When file is not provided or invalid
   * @throws {HttpException} When file type is not supported
   * @throws {HttpException} When image processing or upload fails
   */
  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new HttpException(
              'Invalid file type (Permiss: jpeg, png, webp)',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Passport populates req.user with the decoded JWT payload.
    const userData = (req as any).user;

    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.userService.processAndUploadProfilePicture(
        file,
        userData.sub as string,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to process image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
