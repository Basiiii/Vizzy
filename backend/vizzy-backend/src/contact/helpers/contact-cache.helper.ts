import { Redis } from 'ioredis';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

/**
 * Helper class for managing contact-related caching operations
 * Provides methods for retrieving, storing, and invalidating contact data in Redis
 */
export class ContactCacheHelper {
  /**
   * Retrieves a single contact from the cache
   * @param redisClient - Redis client instance
   * @param contactId - ID of the contact to retrieve
   * @returns The cached contact or null if not found or parsing fails
   */
  static async getContactFromCache(
    redisClient: Redis,
    contactId: string,
  ): Promise<ContactResponseDto | null> {
    const cacheKey = CACHE_KEYS.CONTACT_DETAIL(contactId);
    const cachedContact = await redisClient.get(cacheKey);

    if (!cachedContact) {
      return null;
    }

    try {
      return JSON.parse(cachedContact) as ContactResponseDto;
    } catch (error) {
      console.error('Error parsing cached contact:', error);
      return null;
    }
  }

  /**
   * Retrieves all contacts for a user from the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose contacts to retrieve
   * @returns Array of cached contacts or null if not found or parsing fails
   */
  static async getContactsFromCache(
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

  /**
   * Stores a single contact in the cache
   * @param redisClient - Redis client instance
   * @param contactId - ID of the contact to cache
   * @param contact - Contact data to store in cache
   * @param expirationTime - Cache expiration time in seconds
   */
  static async cacheContact(
    redisClient: Redis,
    contactId: string,
    contact: ContactResponseDto,
    expirationTime: number,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.CONTACT_DETAIL(contactId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(contact),
      'EX',
      expirationTime,
    );
  }

  /**
   * Stores all contacts for a user in the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose contacts to cache
   * @param contacts - Array of contacts to store in cache
   * @param expirationTime - Cache expiration time in seconds
   */
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

  /**
   * Invalidates (removes) a specific contact from the cache
   * @param redisClient - Redis client instance
   * @param contactId - ID of the contact to remove from cache
   */
  static async invalidateContactCache(
    redisClient: Redis,
    contactId: string,
  ): Promise<void> {
    await redisClient.del(CACHE_KEYS.CONTACT_DETAIL(contactId));
  }

  /**
   * Invalidates (removes) all contacts for a user from the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose contacts to remove from cache
   */
  static async invalidateContactsCache(
    redisClient: Redis,
    userId: string,
  ): Promise<void> {
    await redisClient.del(CACHE_KEYS.USER_CONTACTS(userId));
  }
}
