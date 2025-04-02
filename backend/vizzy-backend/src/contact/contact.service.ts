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
    this.logger.info(`Service createContact() called with userId: ${userId}}`);
    ContactValidator.validateCreateContactInput(userId, createContactDto);

    const supabase = this.supabaseService.getAdminClient();
    const contact = await ContactDatabaseHelper.insertContact(
      supabase,
      userId,
      createContactDto,
    );

    const redisClient = this.redisService.getRedisClient();
    await ContactCacheHelper.invalidateCache(redisClient, userId);
    return contact;
  }

  async getContacts(userId: string): Promise<ContactResponseDto[]> {
    this.logger.info(`Service getContacts() called with userId: ${userId}}`);
    ContactValidator.validateUserId(userId);

    const redisClient = this.redisService.getRedisClient();
    const cachedContacts = await ContactCacheHelper.getFromCache(
      redisClient,
      userId,
    );
    if (cachedContacts) {
      this.logger.info(`Cache hit for userId: ${userId}`);
      return cachedContacts;
    }

    const supabase = this.supabaseService.getPublicClient();
    const contacts = await ContactDatabaseHelper.getContacts(supabase, userId);
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
      `Service deleteContact() called with contactId: ${contactId}, userId: ${userId}`,
    );
    ContactValidator.validateDeleteContactInput(contactId, userId);

    const supabase = this.supabaseService.getAdminClient();
    await ContactDatabaseHelper.deleteContact(supabase, contactId, userId);

    const redisClient = this.redisService.getRedisClient();
    await ContactCacheHelper.invalidateCache(redisClient, userId);

    return { message: 'Contact deleted successfully' };
  }
}
