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
  Inject,
  Put,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ContactExceptionFilter } from './filters/contact.filter';
import { InvalidContactDataException } from './exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { DeleteContactResponseDto } from '@/dtos/contact/delete-contact-response.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Controller for managing contact operations
 */
@ApiTags('Contacts')
@Controller('contacts')
@UseFilters(ContactExceptionFilter)
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Creates a new contact for the authenticated user
   * @param req Request with authenticated user information
   * @param createContactDto Data for creating the contact
   * @returns The created contact information
   */
  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new contact',
    description: 'Creates a new contact for the authenticated user',
  })
  @ApiBody({ type: CreateContactDto, description: 'Contact creation data' })
  @ApiResponse({
    status: 201,
    description: 'Contact successfully created',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid contact data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async createContact(
    @Req() req: RequestWithUser,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    this.logger.info(
      `Using controller createContact for user ID: ${req.user?.sub}`,
    );
    if (!req.user?.sub) {
      this.logger.warn('User ID not found in request');
      throw new InvalidContactDataException('User ID not found in request');
    }
    return await this.contactService.createContact(
      req.user.sub,
      createContactDto,
    );
  }

  /**
   * Retrieves all contacts for a specific user
   * @param userId ID of the user whose contacts to retrieve
   * @returns Array of contacts belonging to the user
   */
  @Get('user/:userId')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get user contacts',
    description: 'Retrieves all contacts for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user whose contacts to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts successfully retrieved',
    type: [ContactResponseDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserContacts(
    @Param('userId') userId: string,
  ): Promise<ContactResponseDto[]> {
    this.logger.info(`Using controller getUserContacts for user ID: ${userId}`);
    return await this.contactService.getContacts(userId);
  }

  /**
   * Retrieves a specific contact by its ID
   * @param contactId ID of the contact to retrieve
   * @returns The requested contact information
   */
  @Get(':contactId')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get contact by ID',
    description: 'Retrieves a specific contact by its ID',
  })
  @ApiParam({ name: 'contactId', description: 'ID of the contact to retrieve' })
  @ApiResponse({
    status: 200,
    description: 'Contact successfully retrieved',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async getContactById(
    @Param('contactId') contactId: string,
  ): Promise<ContactResponseDto> {
    this.logger.info(
      `Using controller getContactById for contact ID: ${contactId}`,
    );
    return await this.contactService.getContactById(contactId);
  }

  /**
   * Updates an existing contact
   * @param contactId ID of the contact to update
   * @param updateContactDto Data for updating the contact
   * @param req Request with authenticated user information
   * @returns The updated contact information
   */
  @Put(':contactId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update contact',
    description: 'Updates an existing contact',
  })
  @ApiParam({ name: 'contactId', description: 'ID of the contact to update' })
  @ApiBody({ type: UpdateContactDto, description: 'Contact update data' })
  @ApiResponse({
    status: 200,
    description: 'Contact successfully updated',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid contact data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiBearerAuth()
  async updateContact(
    @Param('contactId') contactId: string,
    @Body() updateContactDto: UpdateContactDto,
    @Req() req: RequestWithUser,
  ): Promise<ContactResponseDto> {
    this.logger.info(
      `Using controller updateContact for contact ID: ${contactId}`,
    );
    if (!req.user?.sub) {
      this.logger.warn('User ID not found in request');
      throw new InvalidContactDataException('User ID not found in request');
    }

    return await this.contactService.updateContact(
      contactId,
      req.user.sub,
      updateContactDto,
    );
  }

  /**
   * Deletes a specific contact
   * @param contactId ID of the contact to delete
   * @param req Request with authenticated user information
   * @returns Confirmation of the deletion
   */
  @Delete(':contactId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete contact',
    description: 'Deletes a specific contact',
  })
  @ApiParam({ name: 'contactId', description: 'ID of the contact to delete' })
  @ApiResponse({
    status: 200,
    description: 'Contact successfully deleted',
    type: DeleteContactResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiBearerAuth()
  async deleteContact(
    @Param('contactId') contactId: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteContactResponseDto> {
    this.logger.info(
      `Using controller deleteContact for contact ID: ${contactId}`,
    );
    if (!req.user?.sub) {
      this.logger.warn('User ID not found in request');
      throw new InvalidContactDataException('User ID not found in request');
    }
    return await this.contactService.deleteContact(contactId, req.user.sub);
  }
}
