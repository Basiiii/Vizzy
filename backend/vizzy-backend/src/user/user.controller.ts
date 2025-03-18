import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';

import { Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Req, Res } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file) {
    console.log(file);
  }

  @Post('upload-profile-image')
  async uploadProfileImage(@Req() req: Request, @Res() res: Response) {
    try {
      const chunks: Buffer[] = [];

      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        const fileBuffer = Buffer.concat(chunks);

        // Garantindo que sempre seja string
        const mimetype = Array.isArray(req.headers['content-type'])
          ? req.headers['content-type'][0]
          : req.headers['content-type'] || 'application/octet-stream';

        const originalname = Array.isArray(req.headers['x-filename'])
          ? req.headers['x-filename'][0]
          : req.headers['x-filename'] || 'file';

        if (!fileBuffer.length) {
          return res.status(400).json({ error: 'Imagem obrigatória!' });
        }

        const result = await this.userService.uploadImage(
          fileBuffer,
          mimetype,
          originalname,
        );
        return res.json(result);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
