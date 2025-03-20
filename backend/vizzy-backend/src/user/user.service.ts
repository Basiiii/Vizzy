import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { User } from './models/user.model';
import { RedisService } from '@/redis/redis.service';
import { CACHE_KEYS, VERIFICATION_THRESHOLD } from '@/constants/constants';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';
import { Listing } from 'dtos/user-listings.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getUserIdByUsername(username: string): Promise<UsernameLookupResult> {
    const cacheKey = CACHE_KEYS.USERNAME_LOOKUP(username);
    const redisClient = this.redisService.getRedisClient();

    // Try to get cached response from Redis
    try {
      const cachedLookup = await redisClient.get(cacheKey);

      if (cachedLookup) {
        console.log('Cache hit for user id from username lookup:', username);
        return JSON.parse(cachedLookup) as UsernameLookupResult;
      }
    } catch (error) {
      console.error(error);
    }

    // Fetch from database
    const supabase = this.supabaseService.getPublicClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();

    // Error handling
    if (error) {
      console.error(`Error fetching user: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    if (!data) {
      console.log(`User not found: ${username}`);
      return null;
    }

    // Cache and return valid user
    console.log(`Cache miss for username: ${username}`);
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    return { id: data.id, username: data.username };
  }

  async getUserById(userId: string): Promise<User | null> {
    const cacheKey = CACHE_KEYS.BASIC_USER_INFO(userId);
    const redisClient = this.redisService.getRedisClient();
    const cachedUser = await redisClient.get(cacheKey);

    // If cached data exists, return it
    if (cachedUser) {
      console.log('Cache hit for user:', userId);
      return JSON.parse(cachedUser) as User;
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('profiles')
      .select('id, username, name, email, is_deleted, deleted_at')
      .eq('id', userId)
      .single();

    const { data, error } = response as { data: User | null; error: unknown };

    // Error handling
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    console.log('Cache miss');
    // Cache the user data in Redis with an expiration time of 1 hour
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 3600 seconds = 1 hour

    return data;
  }

  async getProfileByUsername(username: string): Promise<Profile> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const redisClient = this.redisService.getRedisClient();

    // Try to get cached response from Redis
    try {
      const cachedLookup = await redisClient.get(cacheKey);

      if (cachedLookup) {
        console.log('Cache hit for profile of user:', username);
        return JSON.parse(cachedLookup) as Profile;
      }
    } catch (error) {
      console.error(error);
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();
    const { data, error } = await supabase.rpc('get_user_profile', {
      username,
    });

    // Error handling
    if (error) {
      console.error(
        `Error fetching user profile: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
    if (!data) {
      console.log(`User profile not found: ${username}`);
      return null;
    }

    // Cache and return valid user profile
    console.log(`Cache miss for profile of user: ${username}`);
    const profileData: Profile = {
      id: data.id,
      name: data.name,
      location: 'Not Yet Implemented',
      avatarUrl: '',
      isVerified: data.active_listings > VERIFICATION_THRESHOLD ? true : false,
      memberSince: data.created_year,
      activeListings: data.active_listings ?? 0,
      totalSales: data.totalSales ?? 0,
    };
    await redisClient.set(cacheKey, JSON.stringify(profileData), 'EX', 3600);

    return profileData;
  }

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

  async getMe(userId: string): Promise<User | null> {
    const cacheKey = CACHE_KEYS.USER_ACCOUNT_INFO(userId);
    const redisClient = this.redisService.getRedisClient();
    const cachedUser = await redisClient.get(cacheKey);

    // If cached data exists, return it
    if (cachedUser) {
      console.log('Cache hit for user:', userId);
      return JSON.parse(cachedUser) as User;
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('profiles')
      .select(
        'id, username, name, email, phone_number!inner(contacts), city!inner(locations), country!inner(location), is_deleted, deleted_at',
      )
      .eq('id', userId)
      .single();

    const { data, error } = response as { data: User | null; error: unknown };

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    console.log('Cache miss');
    // Cache the user data in Redis with an expiration time of 1 hour
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 3600 seconds = 1 hour

    return data;
  }

  /*async deleteUser(
   // token: string,
  ): Promise<{ message: string } | { error: string }> {
    const jwtSecret = `JWT_SECRET`;

    const supabase = this.supabaseService.getPublicClient();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwtSecret);

    //const id: string = user?.id;
    //const { data, error } = await supabase.auth.admin.deleteUser(id);
    //return { message: 'User deleted successfully' };
  }*/
}
