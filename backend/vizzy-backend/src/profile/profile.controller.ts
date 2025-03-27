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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ProfileService } from './profile.service';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Query('username') username: string): Promise<Profile> {
    const profile = await this.profileService.getProfileByUsername(username);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    return this.profileService.updateProfile(
      req.user.user_metadata.username,
      req.user.sub,
      updateProfileDto,
    );
  }

  @Post('picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 }, // 1MB
    }),
  )
  async uploadImage(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('File not provided');
    }

    return this.profileService.processAndUploadProfilePicture(
      file,
      req.user.sub,
    );
  }
}
