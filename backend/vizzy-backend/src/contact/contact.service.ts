import { CACHE_KEYS } from '@/constants/constants';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/create-contact.dto';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContactService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async addContact(
    userId: string,
    createContactDto: CreateContactDto,
  ): Promise<CreateContactDto> {
    if (!userId) {
      throw new Error('Invalid userId: userId is undefined or empty');
    }

    if (!createContactDto.name || !createContactDto.phone_number) {
      throw new Error('Name and phone number are required fields');
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: createContactDto.name,
        description: createContactDto.description,
        phone_number: createContactDto.phone_number,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding contact:', error);
      throw new Error(`Failed to add contact: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after contact creation');
    }

    // Transform the data to match Contact type
    const contact: CreateContactDto = {
      name: data.name,
      phone_number: data.phone_number,
      description: data.description,
    };

    // Invalidate the cache for this user's contacts
    const redisClient = this.redisService.getRedisClient();
    await redisClient.del(CACHE_KEYS.USER_CONTACTS(userId));

    return contact;
  }

  async getContacts(userId: string): Promise<ContactResponseDto[] | null> {
    // Validate userId
    if (!userId) {
      console.error('Invalid userId: userId is undefined or empty');
      return null;
    }

    const cacheKey = CACHE_KEYS.USER_CONTACTS(userId);
    const redisClient = this.redisService.getRedisClient();
    const cachedContacts = await redisClient.get(cacheKey);

    // If cached data exists, return it
    if (cachedContacts) {
      console.log('Cache hit for user contacts:', userId);
      return JSON.parse(cachedContacts) as ContactResponseDto[];
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('contacts')
      .select(`phone_number, description`)
      .eq('user_id', userId);

    const { data, error } = response as {
      data: ContactResponseDto[] | null;
      error: unknown;
    };

    if (error) {
      console.error('Error fetching contacts:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    console.log('Cache miss');
    // Cache the user contacts in Redis with an expiration time of 1 hour
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 3600 seconds = 1 hour

    return data;
  }
}
