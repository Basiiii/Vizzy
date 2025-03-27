import { Redis } from 'ioredis';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

export class ContactCacheHelper {
  static async invalidateCache(
    redisClient: Redis,
    userId: string,
  ): Promise<void> {
    await redisClient.del(CACHE_KEYS.USER_CONTACTS(userId));
  }

  static async getFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ContactResponseDto[] | null> {
    const cacheKey = CACHE_KEYS.USER_CONTACTS(userId);
    const cachedContacts = await redisClient.get(cacheKey);

    if (!cachedContacts) {
      return null;
    }

    try {
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
    const cacheKey = CACHE_KEYS.USER_CONTACTS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(contacts),
      'EX',
      expirationTime,
    );
  }
}
