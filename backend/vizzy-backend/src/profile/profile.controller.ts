import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Profile } from '@/dtos/profile/profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { API_VERSIONS } from '@/constants/api-versions';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Controller for managing user profile operations
 */
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Retrieves a user profile by username
   * @param username - The username to look up
   * @returns The user profile if found
   * @throws NotFoundException if profile doesn't exist
   */
  @Get()
  @Version(API_VERSIONS.V1)
  @ApiOperation({ summary: 'Get user profile by username' })
  @ApiQuery({
    name: 'username',
    type: String,
    description: 'Username to look up',
  })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Query('username') username: string): Promise<Profile> {
    this.logger.info(`Using controller getProfile for username: ${username}`);
    const profile = await this.profileService.getProfileByUsername(username);
    if (!profile) {
      this.logger.warn(`Profile not found for username: ${username}`);
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  /**
   * Updates a user profile
   * @param req - Request with authenticated user information
   * @param updateProfileDto - Data for updating the profile
   * @returns Success message
   */
  @Post('update')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto, description: 'Profile data to update' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    this.logger.info(
      `Using controller updateProfile for user ID: ${req.user.sub}`,
    );
    return this.profileService.updateProfile(
      req.user.user_metadata.username,
      req.user.sub,
      updateProfileDto,
    );
  }

  /**
   * Uploads a profile avatar image
   * @param req - Request with authenticated user information
   * @param file - The image file to upload
   * @returns Upload response with path information
   * @throws NotFoundException if file is not provided
   */
  @Post('avatar')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 }, // 1MB
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (JPEG, PNG, or WEBP)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not provided' })
  async uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.info(
      `Using controller uploadAvatar for user ID: ${req.user.sub}`,
    );
    if (!file) {
      this.logger.warn('No file provided for avatar upload');
      throw new NotFoundException('No file provided');
    }
    return this.profileService.processAndUploadProfilePicture(
      file,
      req.user.sub,
    );
  }
}
