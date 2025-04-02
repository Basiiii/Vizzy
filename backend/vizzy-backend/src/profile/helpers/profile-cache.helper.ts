import { Redis } from 'ioredis';
import { Profile } from '@/dtos/profile/profile.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

export class ProfileCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getProfileFromCache(
    redisClient: Redis,
    username: string,
  ): Promise<Profile | null> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const cachedProfile = await redisClient.get(cacheKey);

    if (!cachedProfile) return null;

    try {
      return JSON.parse(cachedProfile) as Profile;
    } catch (error) {
      console.error('Error parsing cached profile:', error);
      return null;
    }
  }

  static async cacheProfile(
    redisClient: Redis,
    username: string,
    profile: Profile,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    await redisClient.set(
      cacheKey,
      JSON.stringify(profile),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  static async invalidateCache(
    redisClient: Redis,
    username: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    await redisClient.del(cacheKey);
  }
}
