import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ContactExceptionFilter } from './filters/contact.filter';
import { InvalidContactDataException } from './exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { DeleteContactResponseDto } from '@/dtos/contact/delete-contact-response.dto';

@Controller('contacts')
@UseFilters(ContactExceptionFilter)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Version(API_VERSIONS.V1)
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
  @Version(API_VERSIONS.V1)
  async getUserContacts(
    @Param('userId') userId: string,
  ): Promise<ContactResponseDto[]> {
    return await this.contactService.getContacts(userId);
  }

  @Delete(':contactId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async deleteContact(
    @Param('contactId') contactId: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteContactResponseDto> {
    if (!req.user?.sub) {
      throw new InvalidContactDataException('User ID not found in request');
    }
    return await this.contactService.deleteContact(contactId, req.user.sub);
  }
}
