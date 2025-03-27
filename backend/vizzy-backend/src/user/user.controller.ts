import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Body,
  UploadedFile,
  UseGuards,
  Delete,
  Req,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, Contact } from './models/user.model';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';
import { Listing } from 'dtos/user-listings.dto';
import { CreateContactDto } from '@/dtos/create-contact.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UpdateProfileDto } from 'dtos/update-profile.dto';
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
  @Delete('delete-contact/:contactId')
  @UseGuards(JwtAuthGuard)
  async deleteContact(
    @Req() req: CustomRequest,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<{ message: string } | { error: string }> {
    const data = (req as any).user;
    return this.userService.deleteContact(
      contactId,
      data.user_metadata.sub as string,
    );
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
  /**
   * Endpoint to update the user's profile data.
   *
   * This route is protected by `JwtAuthGuard`, ensuring only authenticated users can access it.
   * It extracts the user’s metadata from the request and calls the `updateProfile` service method
   * to update their profile information in the database.
   *
   * @param {CustomRequest} req - The incoming request containing the authenticated user data.
   * @param {UpdateProfileDto} updateProfileDto - The DTO containing the updated profile data.
   * @returns {Promise<string>} A success message upon profile update completion.
   *
   * @throws {UnauthorizedException} If the user is not authenticated.
   * @throws {Error} If the profile update fails.
   */
  @Post('update-profile-data')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    const userData = (req as any).user;
    // Chama o serviço para atualizar o perfil
    return this.userService.updateProfile(
      userData.user_metadata.username as string,
      userData.user_metadata.sub as string,
      updateProfileDto,
    );
  }
}
