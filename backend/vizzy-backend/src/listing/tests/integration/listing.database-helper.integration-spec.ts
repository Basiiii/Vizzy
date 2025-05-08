import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ListingDatabaseHelper } from '../../helpers/listing-database.helper';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException } from '@nestjs/common';

describe('ListingDatabaseHelper Integration Tests', () => {
  let supabase: SupabaseClient;
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const nonExistentListingId = 999999;

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('product_listings')
      .select('count')
      .single();
    if (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  });

  describe('basic operations', () => {
    describe('getListingsByUserId', () => {
      it('should successfully retrieve listings for a user', async () => {
        const options: ListingOptionsDto = {
          limit: 10,
          offset: 0,
        };

        const listings = await ListingDatabaseHelper.getListingsByUserId(
          supabase,
          testUserId,
          options,
        );
        expect(listings).toBeDefined();
        expect(Array.isArray(listings)).toBe(true);
        expect(listings.length).toBeGreaterThan(0);
        expect(listings[0]).toHaveProperty('id');
        expect(listings[0]).toHaveProperty('title');
        expect(listings[0]).toHaveProperty('type');
        expect(listings[0]).toHaveProperty('price');
      });

      it('should return empty array for user with no listings', async () => {
        const options: ListingOptionsDto = {
          limit: 10,
          offset: 0,
        };

        const listings = await ListingDatabaseHelper.getListingsByUserId(
          supabase,
          '00000000-0000-0000-0000-000000000002',
          options,
        );

        expect(listings).toBeDefined();
        expect(Array.isArray(listings)).toBe(true);
        expect(listings.length).toBe(0);
      });

      it('should successfully retrieve listings for test user with ID 00000000-0000-0000-0000-000000000001', async () => {
        const options: ListingOptionsDto = {
          limit: 10,
          offset: 0,
        };

        const listings = await ListingDatabaseHelper.getListingsByUserId(
          supabase,
          '00000000-0000-0000-0000-000000000001',
          options,
        );

        expect(listings).toBeDefined();
        expect(Array.isArray(listings)).toBe(true);
        expect(listings.length).toBeGreaterThan(0);

        // Verify each listing has the required basic properties
        listings.forEach((listing) => {
          expect(listing).toHaveProperty('id');
          expect(listing).toHaveProperty('title');
          expect(listing).toHaveProperty('type');
          expect(listing).toHaveProperty('image_url');
        });
      });
    });

    describe('getListingById', () => {
      it('should successfully retrieve a listing by ID', async () => {
        const listing = await ListingDatabaseHelper.getListingById(supabase, 1);

        expect(listing).toBeDefined();
        expect(listing.id).toBe(1);
        expect(listing.title).toBeDefined();
        expect(listing.description).toBeDefined();
      });

      it('should return null for non-existent listing', async () => {
        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          nonExistentListingId,
        );
        expect(listing).toBeNull();
      });
    });

    describe('createListing', () => {
      it('should successfully create a new listing', async () => {
        const createListingDto: CreateListingDto = {
          title: 'New Test Listing',
          description: 'New Test Description',
          category: 'Electronics',
          listing_type: 'sale',
          product_condition: 'New',
          price: 200,
          is_negotiable: true,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: null,
          recipient_requirements: null,
        };

        const listingId = await ListingDatabaseHelper.createListing(
          supabase,
          createListingDto,
          testUserId,
        );

        expect(listingId).toBeDefined();
        expect(typeof listingId).toBe('number');

        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          listingId,
        );

        expect(listing).toBeDefined();
        expect(listing.title).toBe(createListingDto.title);
        expect(listing.description).toBe(createListingDto.description);
      });

      it('should throw HttpException when creating listing with invalid data', async () => {
        const invalidListingDto: CreateListingDto = {
          title: 'Teste title',
          description: 'Test Description',
          category: '',
          listing_type: 'sale',
          product_condition: 'New',
          price: 200,
          is_negotiable: true,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: null,
          recipient_requirements: null,
        };

        await expect(
          ListingDatabaseHelper.createListing(
            supabase,
            invalidListingDto,
            testUserId,
          ),
        ).rejects.toThrow(HttpException);
      });
    });

    describe('getProductCategories', () => {
      it('should successfully retrieve product categories', async () => {
        const categories =
          await ListingDatabaseHelper.getProductCategories(supabase);

        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories[0]).toBeDefined();
        expect(typeof categories[0]).toBe('string');
      });
    });

    describe('getHomeListings', () => {
      it('should successfully retrieve home listings with default options', async () => {
        const result = await ListingDatabaseHelper.getHomeListings(supabase, {
          limit: 10,
          offset: 0,
          page: 1,
        });

        expect(result).toBeDefined();
        expect(result.listings).toBeDefined();
        expect(Array.isArray(result.listings)).toBe(true);
        expect(result.listings.length).toBeGreaterThan(0);
        expect(result.totalPages).toBeGreaterThan(0);
        expect(result.listings[0]).toHaveProperty('id');
        expect(result.listings[0]).toHaveProperty('title');
        expect(result.listings[0]).toHaveProperty('type');
        expect(result.listings[0]).toHaveProperty('price');
      });

      it('should filter listings by type', async () => {
        const result = await ListingDatabaseHelper.getHomeListings(supabase, {
          limit: 10,
          offset: 0,
          page: 1,
          listingType: 'sale',
        });

        expect(result).toBeDefined();
        expect(result.listings).toBeDefined();
        expect(Array.isArray(result.listings)).toBe(true);
        expect(result.listings.length).toBeGreaterThan(0);
        expect(
          result.listings.every((listing) => listing.type === 'sale'),
        ).toBe(true);
      });

      it('should search listings by title', async () => {
        const result = await ListingDatabaseHelper.getHomeListings(supabase, {
          limit: 10,
          offset: 0,
          page: 1,
          search: 'iPhone',
        });

        expect(result).toBeDefined();
        expect(result.listings).toBeDefined();
        expect(Array.isArray(result.listings)).toBe(true);
        expect(result.listings.length).toBeGreaterThan(0);
        expect(
          result.listings.some((listing) =>
            listing.title.toLowerCase().includes('iphone'),
          ),
        ).toBe(true);
      });

      it('should return empty results for non-existent search', async () => {
        const result = await ListingDatabaseHelper.getHomeListings(supabase, {
          limit: 10,
          offset: 0,
          page: 1,
          search: 'nonexistentitem123',
        });

        expect(result).toBeDefined();
        expect(result.listings).toBeDefined();
        expect(Array.isArray(result.listings)).toBe(true);
        expect(result.listings.length).toBe(0);
      });
    });
  });

  describe('listing types', () => {
    describe('sale listing', () => {
      it('should successfully create a sale listing with all required fields', async () => {
        const saleListingDto: CreateListingDto = {
          title: 'iPhone 12 Pro Max',
          description: 'Brand new iPhone 12 Pro Max, 256GB, Pacific Blue',
          category: 'Electronics',
          listing_type: 'sale',
          product_condition: 'New',
          price: 999.99,
          is_negotiable: true,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: null,
          recipient_requirements: null,
        };

        const listingId = await ListingDatabaseHelper.createListing(
          supabase,
          saleListingDto,
          testUserId,
        );

        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          listingId,
        );

        expect(listing).toBeDefined();
        expect(listing.listing_type).toBe('sale');
        expect(listing).toMatchObject({
          title: saleListingDto.title,
          description: saleListingDto.description,
          listing_type: 'sale',
          price: saleListingDto.price,
          is_negotiable: saleListingDto.is_negotiable,
        });
      });
    });

    describe('rental listing', () => {
      it('should successfully create a rental listing with all required fields', async () => {
        const rentalListingDto: CreateListingDto = {
          title: 'Professional Camera Equipment',
          description: 'High-end camera equipment for rent',
          category: 'Electronics',
          listing_type: 'rental',
          product_condition: 'Very Good',
          price: null,
          is_negotiable: false,
          deposit_required: true,
          deposit_value: 500,
          cost_per_day: 50,
          auto_close_date: new Date('2025-12-31'),
          rental_duration_limit: 30,
          late_fee: 25,
          desired_item: null,
          recipient_requirements: null,
        };

        const listingId = await ListingDatabaseHelper.createListing(
          supabase,
          rentalListingDto,
          testUserId,
        );

        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          listingId,
        );

        expect(listing).toBeDefined();
        expect(listing.listing_type).toBe('rental');
        expect(listing).toMatchObject({
          title: rentalListingDto.title,
          description: rentalListingDto.description,
          listing_type: 'rental',
          deposit_required: rentalListingDto.deposit_required,
          cost_per_day: rentalListingDto.cost_per_day,
          rental_duration_limit: rentalListingDto.rental_duration_limit,
          late_fee: rentalListingDto.late_fee,
        });
      });
    });

    describe('giveaway listing', () => {
      it('should successfully create a giveaway listing with all required fields', async () => {
        const giveawayListingDto: CreateListingDto = {
          title: 'Free Books Collection',
          description: 'Collection of classic novels in good condition',
          category: 'Books',
          listing_type: 'giveaway',
          product_condition: 'Good',
          price: null,
          is_negotiable: false,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: null,
          recipient_requirements: 'Must be a student',
        };

        const listingId = await ListingDatabaseHelper.createListing(
          supabase,
          giveawayListingDto,
          testUserId,
        );

        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          listingId,
        );

        expect(listing).toBeDefined();
        expect(listing.listing_type).toBe('giveaway');
        expect(listing).toMatchObject({
          title: giveawayListingDto.title,
          description: giveawayListingDto.description,
          listing_type: 'giveaway',
          recipient_requirements: giveawayListingDto.recipient_requirements,
        });
      });
    });

    describe('swap listing', () => {
      it('should successfully create a swap listing with all required fields', async () => {
        const swapListingDto: CreateListingDto = {
          title: 'Gaming Console',
          description: 'Looking to swap my gaming console',
          category: 'Electronics',
          listing_type: 'swap',
          product_condition: 'Like New',
          price: null,
          is_negotiable: false,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: 'High-end gaming PC',
          recipient_requirements: null,
        };

        const listingId = await ListingDatabaseHelper.createListing(
          supabase,
          swapListingDto,
          testUserId,
        );

        const listing = await ListingDatabaseHelper.getListingById(
          supabase,
          listingId,
        );

        expect(listing).toBeDefined();
        expect(listing.listing_type).toBe('swap');
        expect(listing).toMatchObject({
          title: swapListingDto.title,
          description: swapListingDto.description,
          listing_type: 'swap',
          desired_item: swapListingDto.desired_item,
        });
      });
    });

    describe('listing type validation', () => {
      it('should throw HttpException when creating listing with invalid listing type', async () => {
        const invalidListingDto: CreateListingDto = {
          title: 'Invalid Listing',
          description: 'This listing has an invalid type',
          category: '',
          listing_type: 'sale',
          product_condition: 'New',
          price: 100,
          is_negotiable: true,
          deposit_required: false,
          deposit_value: null,
          cost_per_day: null,
          auto_close_date: null,
          rental_duration_limit: null,
          late_fee: null,
          desired_item: null,
          recipient_requirements: null,
        };

        await expect(
          ListingDatabaseHelper.createListing(
            supabase,
            invalidListingDto,
            testUserId,
          ),
        ).rejects.toThrow(HttpException);
      });
    });
  });
});
