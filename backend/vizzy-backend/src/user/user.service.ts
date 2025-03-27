import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { User, Contact } from './models/user.model';
import { RedisService } from '@/redis/redis.service';
import { CACHE_KEYS, VERIFICATION_THRESHOLD } from '@/constants/constants';
import { UsernameLookupResult } from 'dtos/username-lookup-result.dto';
import { Profile } from 'dtos/user-profile.dto';
import { Listing } from 'dtos/user-listings.dto';
import { UpdateProfileDto } from 'dtos/update-profile.dto';
import { CreateContactDto } from '@/dtos/create-contact.dto';
import { Console } from 'console';
import * as sharp from 'sharp';

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

  async getContacts(userId: string): Promise<Contact[] | null> {
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
      return JSON.parse(cachedContacts) as Contact[];
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('contacts')
      .select(`phone_number, description`)
      .eq('user_id', userId);

    const { data, error } = response as {
      data: Contact[] | null;
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

  async addContact(
    userId: string,
    createContactDto: CreateContactDto,
  ): Promise<Contact> {
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
    const contact: Contact = {
      phone_number: data.phone_number,
      description: data.description,
    };

    // Invalidate the cache for this user's contacts
    const redisClient = this.redisService.getRedisClient();
    await redisClient.del(CACHE_KEYS.USER_CONTACTS(userId));

    return contact;
  }

  async deleteUser(
    id: string,
  ): Promise<{ message: string } | { error: string }> {
    const supabase = this.supabaseService.getAdminClient();

    /*     const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.log('Erro na autenticação');
      console.log(authError);
      throw new HttpException(
        `Failed to delete user from auth: ${authError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
 */
    const { error: rpcError } = await supabase.rpc('soft_delete_user', {
      _user_id: id,
    });
    if (rpcError) {
      console.log('Erro no stored procedure.');
      console.log(rpcError);
      throw new HttpException(
        `Failed to exececute stored procedure: ${rpcError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    console.log('Correu bem');
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }
  /**
   * Updates the user's profile information in the database.
   *
   * This function validates the provided profile data, calls a Supabase RPC function (`update_user_data`)
   * to update both `auth.users` and `public.profiles` tables, and clears the related cache in Redis.
   *
   * @param {string} username - The username of the user whose profile is being updated.
   * @param {string} userId - The UUID of the user whose profile needs to be updated.
   * @param {UpdateProfileDto} updateProfileDto - The profile data to be updated (validated using Zod).
   * @returns {Promise<string>} A success message if the update is successful.
   *
   * @throws {Error} If the username is missing.
   * @throws {Error} If the profile data does not match the expected schema.
   */
  async updateProfile(
    username: string,
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    if (!username) {
      throw new Error('Profile data not found!');
    }
    try {
      UpdateProfileDto.parse(updateProfileDto);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Update data doesnt match the pattern:', error);
        throw new Error('Invalid data');
      }
      throw error;
    }
    console.log(userId);
    const supabaseClient = this.supabaseService.getAdminClient();
    const { data, error } = await supabaseClient.rpc('update_user_data', {
      user_id_text: userId,
      profile_data: updateProfileDto,
    });
    if (error) console.log('Erro:', error.message);

    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const redisClient = this.redisService.getRedisClient();
    await redisClient.del(cacheKey);

    console.log('Update response:', data);
    return 'Profile updated successfully';
  }

  /**
   * Processes and uploads a user's profile picture.
   * The image is validated, compressed, and resized before being uploaded to Supabase storage.
   *
   * @param file - The uploaded file from Express.Multer
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to an object containing the upload response data
   * @throws {HttpException} When file format is invalid
   * @throws {HttpException} When file size cannot be reduced to target size
   * @throws {HttpException} When storage upload fails
   * @throws {HttpException} When image processing fails
   */
  async processAndUploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ data: any }> {
    try {
      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ] as const;
      const mimetype = String(file.mimetype);
      if (
        !allowedMimeTypes.includes(
          mimetype as (typeof allowedMimeTypes)[number],
        )
      ) {
        throw new HttpException(
          'Invalid file format. Only JPEG, PNG, and WEBP are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Image processing configuration
      const config = {
        initialQuality: 80,
        maxAttempts: 5,
        maxSizeKB: 250,
        dimensions: { width: 500, height: 500 },
        minQuality: 10,
      };

      let quality = config.initialQuality;
      let compressedImage = await this.compressImage(
        file.buffer,
        quality,
        config.dimensions,
      );

      // Attempt to reduce file size if needed
      let attempts = 0;
      while (
        compressedImage.byteLength > config.maxSizeKB * 1024 &&
        attempts < config.maxAttempts &&
        quality > config.minQuality
      ) {
        quality -= 10;
        compressedImage = await this.compressImage(
          file.buffer,
          quality,
          config.dimensions,
        );
        attempts++;
      }

      // Check final file size
      if (compressedImage.byteLength > config.maxSizeKB * 1024) {
        throw new HttpException(
          `Could not reduce the file size below ${config.maxSizeKB} KB after ${config.maxAttempts} attempts.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const filePath = `profile-picture/${userId}`;

      // Upload to Supabase
      const supabase = this.supabaseService.getAdminClient();
      const { data, error } = await supabase.storage
        .from('user')
        .upload(filePath, compressedImage, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new HttpException(
          `Storage upload failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Image processing failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Compresses and resizes an image buffer using Sharp.
   *
   * @param buffer - The input image buffer to process
   * @param quality - The JPEG quality level (0-100)
   * @param dimensions - Object containing width and height dimensions
   * @param dimensions.width - Target width in pixels
   * @param dimensions.height - Target height in pixels
   * @returns Promise resolving to the compressed image buffer
   */
  private async compressImage(
    buffer: Buffer,
    quality: number,
    dimensions: { width: number; height: number },
  ): Promise<Buffer> {
    const result = await sharp(buffer)
      .resize({
        width: dimensions.width,
        height: dimensions.width,
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
      .toBuffer();

    return Buffer.from(result);
  }
}
