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
import * as sharp from 'sharp'; // Biblioteca para processamento de imagens

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

  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        // Allow only JPEG and PNG images
        const allowedMimeTypes = ['image/jpeg', 'image/png']; //Ficheiros que são permitidos
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
  async uploadImage(@UploadedFile() file: File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // Redimensiona e comprime a imagem antes do upload
      const compressedImage = await sharp(file.buffer)
        .resize(500, 500, { fit: 'inside' }) // Mantém a proporção dentro de 500x500
        .jpeg({ quality: 80 }) // Define a qualidade da imagem em 80%
        .toBuffer();

      const supabase = this.supabaseService.getAdminClient(); // Obtém o cliente do Supabase
      const filePath = `profile-picture/teste`; // Caminho da imagem no Supabase

      // Verifica se já existe uma imagem no Supabase
      const { data: existingFile, error: existingError } =
        await supabase.storage.from('user').list('profile-picture');

      if (existingFile && existingFile.length > 0) {
        // Remove a imagem existente antes de inserir a nova
        await supabase.storage
          .from('user')
          .remove(existingFile.map((file) => `profile-picture/${file.name}`));
      }

      // Faz o upload da nova imagem para o Supabase
      const { data, error } = await supabase.storage
        .from('user')
        .upload(filePath, compressedImage, {
          contentType: 'image',
          upsert: true, // Substitui a imagem caso já exista
        });

      if (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { data }; // Retorna os dados da imagem armazenada
    } catch (error) {
      throw new HttpException(
        `Error processing image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
