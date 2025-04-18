/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from '../contact.service';
import { RedisService } from '@/redis/redis.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ContactValidator } from '../helpers/contact-validator.helper';
import { ContactDatabaseHelper } from '../helpers/contact-database.helper';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { CONTACT_CACHE_KEYS } from '@/constants/cache/contact.cache-keys';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';

jest.mock('../helpers/contact-validator.helper');
jest.mock('../helpers/contact-database.helper');
jest.mock('@/common/helpers/global-cache.helper');

describe('ContactService', () => {
  let service: ContactService;
  let mockRedisService: any;
  let mockSupabaseService: any;
  let mockLogger: any;
  let mockRedisClient: any;
  let mockSupabaseClient: any;
  let mockAdminClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockAdminClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockRedisService = {
      getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    mockSupabaseService = {
      getPublicClient: jest.fn().mockReturnValue(mockSupabaseClient),
      getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContact', () => {
    const userId = 'user-123';
    const createContactDto: CreateContactDto = {
      name: 'John Doe',
      phone_number: '1234567890',
      description: 'Test contact',
    };
    const mockContact: ContactResponseDto = {
      id: 'contact-123',
      name: 'John Doe',
      phone_number: '1234567890',
      description: 'Test contact',
    };

    it('should create a contact successfully', async () => {
      // Setup mocks
      (ContactDatabaseHelper.insertContact as jest.Mock).mockResolvedValue(
        mockContact,
      );
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Execute
      const result = await service.createContact(userId, createContactDto);

      // Verify
      expect(ContactValidator.validateCreateContactInput).toHaveBeenCalledWith(
        userId,
        createContactDto,
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ContactDatabaseHelper.insertContact).toHaveBeenCalledWith(
        mockAdminClient,
        userId,
        createContactDto,
      );
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
      );
      expect(result).toEqual(mockContact);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('getContacts', () => {
    const userId = 'user-123';
    const mockContacts: ContactResponseDto[] = [
      {
        id: 'contact-123',
        name: 'John Doe',
        phone_number: '1234567890',
        description: 'Test contact',
      },
    ];

    it('should return contacts from cache when available', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockContacts,
      );

      // Execute
      const result = await service.getContacts(userId);

      // Verify
      expect(ContactValidator.validateUserId).toHaveBeenCalledWith(userId);
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
      );
      expect(mockSupabaseService.getPublicClient).not.toHaveBeenCalled();
      expect(ContactDatabaseHelper.getContacts).not.toHaveBeenCalled();
      expect(result).toEqual(mockContacts);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch contacts from database and cache them when not in cache', async () => {
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ContactDatabaseHelper.getContacts as jest.Mock).mockResolvedValue(
        mockContacts,
      );
      (GlobalCacheHelper.setCache as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await service.getContacts(userId);

      // Verify
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
        mockContacts,
        expect.any(Number),
      );
      expect(mockSupabaseService.getPublicClient).toHaveBeenCalled();
      expect(ContactDatabaseHelper.getContacts).toHaveBeenCalledWith(
        mockSupabaseClient,
        userId,
      );
      expect(result).toEqual(mockContacts);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('getContactById', () => {
    const contactId = 'contact-123';
    const mockContact: ContactResponseDto = {
      id: contactId,
      name: 'John Doe',
      phone_number: '1234567890',
      description: 'Test contact',
    };

    it('should return contact from cache when available', async () => {
      // Add async
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockContact,
      );

      // Execute
      const result = await service.getContactById(contactId); // Add Execute section

      // Verify
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.DETAIL(contactId),
      );
      expect(mockSupabaseService.getPublicClient).not.toHaveBeenCalled();
      expect(ContactDatabaseHelper.getContactById).not.toHaveBeenCalled();
      expect(result).toEqual(mockContact);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch contact from database and cache it when not in cache', async () => {
      // Add async
      // Setup mocks
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (ContactDatabaseHelper.getContactById as jest.Mock).mockResolvedValue(
        mockContact,
      );
      (GlobalCacheHelper.setCache as jest.Mock).mockResolvedValue(undefined);

      // Execute
      const result = await service.getContactById(contactId); // Add Execute section

      // Verify
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.DETAIL(contactId),
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.DETAIL(contactId),
        mockContact,
        expect.any(Number),
      );
      expect(mockSupabaseService.getPublicClient).toHaveBeenCalled();
      expect(ContactDatabaseHelper.getContactById).toHaveBeenCalledWith(
        mockSupabaseClient,
        contactId,
      );
      expect(result).toEqual(mockContact);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateContact', () => {
    const contactId = 'contact-123';
    const userId = 'user-123';
    const updateContactDto: UpdateContactDto = {
      name: 'Updated Name',
      description: 'Updated description',
    };
    const mockUpdatedContact: ContactResponseDto = {
      id: contactId,
      name: 'Updated Name',
      phone_number: '1234567890',
      description: 'Updated description',
    };

    it('should update a contact successfully and invalidate caches', async () => {
      // Add async
      // Setup mocks
      (ContactDatabaseHelper.updateContact as jest.Mock).mockResolvedValue(
        mockUpdatedContact,
      );
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Execute
      const result = await service.updateContact(
        contactId,
        userId,
        updateContactDto,
      ); // Add Execute section

      // Verify
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.DETAIL(contactId),
      );
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
      );
      expect(mockSupabaseService.getAdminClient).toHaveBeenCalled();
      expect(ContactDatabaseHelper.updateContact).toHaveBeenCalledWith(
        mockAdminClient,
        contactId,
        userId,
        updateContactDto,
      );
      expect(mockRedisService.getRedisClient).toHaveBeenCalled();

      // The other GlobalCacheHelper.invalidateCache calls are correct
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.DETAIL(contactId),
      );
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledWith(
        mockRedisClient,
        CONTACT_CACHE_KEYS.BY_USER(userId),
      );
      expect(result).toEqual(mockUpdatedContact);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });
});
