import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ContactExceptionFilter } from './filters/contact.filter';
import { InvalidContactDataException } from './exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';

@Controller('contacts')
@UseFilters(ContactExceptionFilter)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createContact(
    @Req() req: RequestWithUser,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    if (!req.user?.sub) {
      throw new InvalidContactDataException('User ID not found in request');
    }
    return await this.contactService.createContact(
      req.user.sub,
      createContactDto,
    );
  }

  @Get('user/:userId')
  async getUserContacts(
    @Param('userId') userId: string,
  ): Promise<ContactResponseDto[]> {
    return await this.contactService.getContacts(userId);
  }
}
