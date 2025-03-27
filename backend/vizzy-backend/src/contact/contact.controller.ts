import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { CreateContactDto } from '@/dtos/create-contact.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ContactExceptionFilter } from '@/common/filters/contact-exception.filter';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('contacts')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ContactExceptionFilter)
  async addContact(
    @Req() req: RequestWithUser,
    @Body() createContactDto: CreateContactDto,
  ): Promise<CreateContactDto> {
    if (!req.user?.sub) {
      throw new HttpException(
        'User ID not found in request',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.contactService.addContact(req.user.sub, createContactDto);
  }

  @Get('contacts/:id')
  async getContacts(@Param('id') id: string): Promise<ContactResponseDto[]> {
    return this.contactService.getContacts(id);
  }
}
