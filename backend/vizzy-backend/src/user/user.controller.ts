import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
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
//import { File } from 'multer';
import sharp from 'sharp';
import { Request } from 'express';

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
  /*
  @Delete('delete')
  async deleteUSer(
    @Req() req: CustomRequest,
  ): Promise<{ message: string } | { error: string }> {
    const supabase = this.supabaseService.getAdminClient();
    const jwtToken = req.cookies?.['auth-token'];
  }
*/
  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 },
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
  /**
   * Handles the upload and compression of an image before storing it.
   *
   * @param {Express.Multer.File} file - The uploaded image file.
   * @throws {HttpException} If the file is not provided, has an invalid format,
   *         exceeds the size limit, or an error occurs during processing.
   * @returns {Promise<{ data: any }>} The response containing the stored image data.
   */
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    // Allowed MIME types: JPEG, PNG, WEBP
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      let quality = 80; // Initial compression quality

      // Compress and resize the image while maintaining aspect ratio
      let compressedImage = await sharp(file.buffer)
        .resize({ width: 500, height: 500, fit: 'inside' })
        .jpeg({ quality })
        .toBuffer();

      let attempts = 0;
      const maxAttempts = 5;
      const maxSizeKB = 250;

      // Repeatedly compress until file size is below 250 KB or max attempts are reached
      while (
        compressedImage.byteLength > maxSizeKB * 1024 &&
        attempts < maxAttempts
      ) {
        quality -= 10; // Reduce quality progressively
        if (quality < 10) break; // Avoid extremely low quality

        compressedImage = await sharp(file.buffer)
          .resize({ width: 500, height: 500, fit: 'inside' })
          .jpeg({ quality })
          .toBuffer();

        attempts++;
      }

      // If compression fails to bring the size down, throw an error
      if (compressedImage.byteLength > maxSizeKB * 1024) {
        throw new HttpException(
          `Could not reduce the file size below ${maxSizeKB} KB after ${maxAttempts} attempts.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Obtain Supabase admin client
      const supabase = this.supabaseService.getAdminClient();
      const filePath = `profile-picture/${file.originalname}`; // Consider using a unique identifier

      // Upload the compressed image to Supabase storage
      const { data, error } = await supabase.storage
        .from('user')
        .update(filePath, compressedImage, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { data };
    } catch (error) {
      throw new HttpException(
        `Error processing image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
