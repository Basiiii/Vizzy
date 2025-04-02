import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ProfileService } from './profile.service';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @Version(API_VERSIONS.V1)
  async getProfile(@Query('username') username: string): Promise<Profile> {
    this.logger.info(
      `Controller getProfile() called with username: ${username}`,
    );
    const profile = await this.profileService.getProfileByUsername(username);
    if (!profile) {
      this.logger.error(
        `Profile not found for username: ${username}, throwing NotFoundException`,
      );
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Post('update')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    this.logger.info(
      `Controller updateProfile() called with username: ${req.user.user_metadata.username}`,
    );
    return this.profileService.updateProfile(
      req.user.user_metadata.username,
      req.user.sub,
      updateProfileDto,
    );
  }

  @Post('avatar')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 }, // 1MB
    }),
  )
  async uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.info(
      `Controller uploadAvatar() called with userId: ${req.user.sub}`,
    );
    if (!file) {
      this.logger.error('No file provided, throwing NotFoundException');
      throw new NotFoundException('File not provided');
    }

    return this.profileService.processAndUploadProfilePicture(
      file,
      req.user.sub,
    );
  }
}
