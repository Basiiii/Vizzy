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
import { File } from 'multer';
import * as sharp from 'sharp';
import * as fs from 'fs';

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

  /** * Endpoint for uploading profile image.
   * - Checks if the file is JPEG or PNG.
   * - Compresses the image to a maximum of 500x500px and 80% quality.
   * - Removes the previous image before uploading the new one.
   */
  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        // Allow only JPEG and PNG images
        const allowedMimeTypes = ['image/jpeg', 'image/png']; //Files that are allowed
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async convertToWebPWithMaxSize(inputPath, outputPath, maxSizeKB = 250) {
    let quality = 80; // Qualidade inicial
    let imageBuffer = await sharp(inputPath)
      .resize({ width: 500, height: 500, fit: 'inside' }) // Redimensiona mantendo a proporção
      .webp({ quality })
      .toBuffer();

    let fileSizeKB = imageBuffer.length / 1024; // Converte bytes para KB

    while (fileSizeKB > maxSizeKB && quality > 10) {
      quality -= 5; // Reduz a qualidade gradualmente
      imageBuffer = await sharp(inputPath)
        .resize({ width: 500, height: 500, fit: 'inside' })
        .webp({ quality })
        .toBuffer();
      fileSizeKB = imageBuffer.length / 1024;
    }

    if (fileSizeKB <= maxSizeKB) {
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(
        `Imagem convertida e salva em ${outputPath} (${fileSizeKB.toFixed(2)} KB)`,
      );
    } else {
      console.error(
        'Não foi possível reduzir o tamanho do arquivo abaixo do limite especificado.',
      );
    }
  }

  async uploadImage(@UploadedFile() file: File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // Resize and compress the image before upload
      let compressedImage = await sharp(file.buffer)
        .resize(500, 500, { fit: 'inside' }) // Keep the aspect ratio within 500x500
        .jpeg({ quality: 80 }) // Set the image quality to 80%
        .toBuffer();

      // Garante que a imagem esteja abaixo de 1MB
      while (compressedImage.length > 1024 * 1024) {
        compressedImage = await sharp(compressedImage)
          .jpeg({
            quality: Math.max(10, (80 * 1024 * 1024) / compressedImage.length),
          })
          .toBuffer();
      }

      const supabase = this.supabaseService.getAdminClient(); // Get the Supabase client
      const filePath = `profile-picture/teste`; // Path to the image in Supabase

      // Check if an image already exists in Supabase
      const { data: existingFile, error: existingError } =
        await supabase.storage.from('user').list('profile-picture');

      if (existingFile && existingFile.length > 0) {
        // Remove the existing image before inserting the new one
        await supabase.storage;
        await supabase.storage
          .from('user')
          .remove(existingFile.map((file) => `profile-picture/${file.name}`));
      }

      const { data, error } = await supabase.storage
        .from('user')
        .upload(filePath, compressedImage, {
          contentType: 'image',
          upsert: true, // Replace the image if it already exists
        });

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { data }; // Returns the stored image data
    } catch (error) {
      throw new HttpException(
        `Error processing image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
