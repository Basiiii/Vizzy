import { CACHE_KEYS } from '@/constants/constants';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { Injectable } from '@nestjs/common';
import { Listing } from '@/dtos/user-listings.dto';

@Injectable()
export class ListingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getListingsByUserId(
    userid: string,
    options: { limit: number; offset: number },
  ): Promise<Listing[]> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userid);
    const redisClient = this.redisService.getRedisClient();

    // Try to get cached response from Redis
    try {
      const cachedLookup = await redisClient.get(cacheKey);

      if (cachedLookup) {
        console.log(`Cache hit for user profile listings with ID:${userid}'`);
        return JSON.parse(cachedLookup) as Listing[];
      }
    } catch (error) {
      console.error(error);
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.rpc('fetch_listings', {
      _owner_id: userid,
      _limit: options.limit,
      _offset: options.offset,
    });

    if (error) {
      console.error(
        `Error fetching user listings: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to fetch user listings: ${error.message}`);
    }

    if (!data) {
      console.log(`Listings for user ${userid} not found`);
      return null;
    }

    // Transform data into a Listing[]
    const listings: Listing[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      price: item.price,
      pricePerDay: item.priceperday,
      imageUrl:
        'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    })); // TODO: replace this placeholder with the actual image

    // Cache and return valid user profile
    console.log(`Cache miss for listings of user with ID: ${userid}`);
    await redisClient.set(cacheKey, JSON.stringify(listings), 'EX', 3600); // 3600 seconds = 1 hour
    return listings;
  }
}
