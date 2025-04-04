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

@Injectable()
export class ContactService {
  private readonly CACHE_EXPIRATION = 3600;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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
    await ContactCacheHelper.invalidateCache(redisClient, userId);

    return contact;
  }

  async getContacts(userId: string): Promise<ContactResponseDto[]> {
    this.logger.info(`Using service getContacts for user ID: ${userId}`);
    ContactValidator.validateUserId(userId);

    const redisClient = this.redisService.getRedisClient();
    const cachedContacts = await ContactCacheHelper.getFromCache(
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
    this.logger.info(`Invalidating cache for user ID: ${userId}`);
    await ContactCacheHelper.invalidateCache(redisClient, userId);

    return { message: 'Contact deleted successfully' };
  }
}
