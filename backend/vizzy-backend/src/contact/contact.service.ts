import { Injectable, Inject } from '@nestjs/common';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { ContactValidator } from './helpers/contact-validator.helper';
import { ContactDatabaseHelper } from './helpers/contact-database.helper';
import { ContactCacheHelper } from './helpers/contact-cache.helper';
import { DeleteContactResponseDto } from '@/dtos/contact/delete-contact-response.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';

/**
 * Service responsible for managing contact operations
 * Handles CRUD operations for contacts with caching support
 */
@Injectable()
export class ContactService {
  /** Cache expiration time in seconds */
  private readonly CACHE_EXPIRATION = 3600;

  /**
   * Creates an instance of ContactService
   * @param supabaseService - Service for Supabase database operations
   * @param redisService - Service for Redis caching operations
   * @param logger - Winston logger instance
   */
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Creates a new contact for a user
   * @param userId - ID of the user creating the contact
   * @param createContactDto - Data for creating the contact
   * @returns The newly created contact
   */
  async createContact(
    userId: string,
    createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    this.logger.info(`Using service createContact for user ID: ${userId}`);
    ContactValidator.validateCreateContactInput(userId, createContactDto);

    const supabase = this.supabaseService.getAdminClient();
    const contact = await ContactDatabaseHelper.insertContact(
      supabase,
      userId,
      createContactDto,
    );
    this.logger.info(`Contact created successfully for user ID: ${userId}`);

    const redisClient = this.redisService.getRedisClient();
    this.logger.info(`Invalidating cache for user ID: ${userId}`);
    await ContactCacheHelper.invalidateContactsCache(redisClient, userId);

    return contact;
  }

  /**
   * Retrieves all contacts for a specific user
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param userId - ID of the user whose contacts to retrieve
   * @returns Array of contacts belonging to the user
   */
  async getContacts(userId: string): Promise<ContactResponseDto[]> {
    this.logger.info(`Using service getContacts for user ID: ${userId}`);
    ContactValidator.validateUserId(userId);

    const redisClient = this.redisService.getRedisClient();
    const cachedContacts = await ContactCacheHelper.getContactsFromCache(
      redisClient,
      userId,
    );
    if (cachedContacts) {
      this.logger.info(`Cache hit for contacts of user ID: ${userId}`);
      return cachedContacts;
    }

    this.logger.info(
      `Cache miss for contacts of user ID: ${userId}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const contacts = await ContactDatabaseHelper.getContacts(supabase, userId);

    this.logger.info(`Caching contacts for user ID: ${userId}`);
    await ContactCacheHelper.cacheContacts(
      redisClient,
      userId,
      contacts,
      this.CACHE_EXPIRATION,
    );

    return contacts;
  }

  /**
   * Retrieves a specific contact by its ID
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param contactId - ID of the contact to retrieve
   * @returns The requested contact information
   */
  async getContactById(contactId: string): Promise<ContactResponseDto> {
    this.logger.info(
      `Using service getContactById for contact ID: ${contactId}`,
    );

    ContactValidator.validateContactId(contactId);

    const redisClient = this.redisService.getRedisClient();
    const cachedContact = await ContactCacheHelper.getContactFromCache(
      redisClient,
      contactId,
    );

    if (cachedContact) {
      this.logger.info(`Cache hit for contact ID: ${contactId}`);
      return cachedContact;
    }

    this.logger.info(
      `Cache miss for contact ID: ${contactId}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const contact = await ContactDatabaseHelper.getContactById(
      supabase,
      contactId,
    );

    this.logger.info(`Caching contact data for ID: ${contactId}`);
    await ContactCacheHelper.cacheContact(
      redisClient,
      contactId,
      contact,
      this.CACHE_EXPIRATION,
    );

    return contact;
  }

  /**
   * Updates an existing contact
   * Validates ownership before updating and invalidates relevant caches after update
   * @param contactId - ID of the contact to update
   * @param userId - ID of the user who owns the contact
   * @param updateContactDto - Data for updating the contact
   * @returns The updated contact information
   */
  async updateContact(
    contactId: string,
    userId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    this.logger.info(
      `Using service updateContact for contact ID: ${contactId} and user ID: ${userId}`,
    );
    ContactValidator.validateUpdateContactInput(
      contactId,
      userId,
      updateContactDto,
    );

    const supabase = this.supabaseService.getAdminClient();
    const updatedContact = await ContactDatabaseHelper.updateContact(
      supabase,
      contactId,
      userId,
      updateContactDto,
    );
    this.logger.info(
      `Contact updated successfully for contact ID: ${contactId}`,
    );

    const redisClient = this.redisService.getRedisClient();
    this.logger.info(
      `Invalidating cache for contact ID: ${contactId} and user ID: ${userId}`,
    );

    await ContactCacheHelper.invalidateContactCache(redisClient, contactId);
    await ContactCacheHelper.invalidateContactsCache(redisClient, userId);

    return updatedContact;
  }

  /**
   * Deletes a specific contact
   * Validates ownership before deletion and invalidates relevant caches after deletion
   * @param contactId - ID of the contact to delete
   * @param userId - ID of the user who owns the contact
   * @returns Confirmation message of successful deletion
   */
  async deleteContact(
    contactId: string,
    userId: string,
  ): Promise<DeleteContactResponseDto> {
    this.logger.info(
      `Using service deleteContact for contact ID: ${contactId} and user ID: ${userId}`,
    );
    ContactValidator.validateDeleteContactInput(contactId, userId);

    const supabase = this.supabaseService.getAdminClient();
    await ContactDatabaseHelper.deleteContact(supabase, contactId, userId);
    this.logger.info(
      `Contact deleted successfully for contact ID: ${contactId}`,
    );

    const redisClient = this.redisService.getRedisClient();
    this.logger.info(
      `Invalidating cache for contact ID: ${contactId} and user ID: ${userId}`,
    );

    await ContactCacheHelper.invalidateContactCache(redisClient, contactId);
    await ContactCacheHelper.invalidateContactsCache(redisClient, userId);

    return { message: 'Contact deleted successfully' };
  }
}
