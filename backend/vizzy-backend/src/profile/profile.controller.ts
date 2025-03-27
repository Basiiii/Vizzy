import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Profile } from '@/dtos/user-profile.dto';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UpdateProfileDto } from '@/dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // Get user profile by username (using query parameter)
  @Get('profile')
  async getProfile(@Query('username') username: string): Promise<Profile> {
    const profile: Profile =
      await this.profileService.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
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
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    const userData = (req as any).user;
    // Chama o serviço para atualizar o perfil
    return this.profileService.updateProfile(
      userData.user_metadata.username as string,
      userData.user_metadata.sub as string,
      updateProfileDto,
    );
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
      const result = await this.profileService.processAndUploadProfilePicture(
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
