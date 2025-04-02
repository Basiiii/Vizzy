import { Redis } from 'ioredis';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class ContactCacheHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    ContactCacheHelper.logger = logger;
  }
  static async invalidateCache(
    redisClient: Redis,
    userId: string,
  ): Promise<void> {
    ContactCacheHelper.logger.info(`Invalidating cache for userId: ${userId}`);
    await redisClient.del(CACHE_KEYS.USER_CONTACTS(userId));
  }

  static async getFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ContactResponseDto[] | null> {
    ContactCacheHelper.logger.info(
      `Getting contacts from cache for userId: ${userId}`,
    );
    const cacheKey = CACHE_KEYS.USER_CONTACTS(userId);
    const cachedContacts = await redisClient.get(cacheKey);

    if (!cachedContacts) {
      ContactCacheHelper.logger.info(
        `No cached contacts found for userId: ${userId}`,
      );
      return null;
    }

    try {
      ContactCacheHelper.logger.info(
        `Cached contacts found for userId: ${userId}`,
      );
      return JSON.parse(cachedContacts) as ContactResponseDto[];
    } catch (error) {
      console.error('Error parsing cached contacts:', error);
      return null;
    }
  }

  static async cacheContacts(
    redisClient: Redis,
    userId: string,
    contacts: ContactResponseDto[],
    expirationTime: number,
  ): Promise<void> {
    ContactCacheHelper.logger.info(
      `Caching contacts for userId: ${userId} with expiration time: ${expirationTime}`,
    );
    const cacheKey = CACHE_KEYS.USER_CONTACTS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(contacts),
      'EX',
      expirationTime,
    );
  }
}
