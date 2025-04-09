/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { InvalidContactDataException } from './exceptions/contact.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';

describe('ContactController', () => {
  let controller: ContactController;

  const mockContactService = {
    createContact: jest.fn(),
    getContacts: jest.fn(),
    getContactById: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContact', () => {
    const mockCreateContactDto: CreateContactDto = {
      name: 'John Doe',
      phone_number: '1234567890',
      description: 'Test contact',
    };

    it('should create a contact successfully', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };

      const mockResponse: ContactResponseDto = {
        id: 'contact-123',
        name: 'John Doe',
        description: mockCreateContactDto.description,
        phone_number: mockCreateContactDto.phone_number,
      };

      mockContactService.createContact.mockResolvedValue(mockResponse);

      const result = await controller.createContact(
        mockRequest as any,
        mockCreateContactDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockContactService.createContact).toHaveBeenCalledWith(
        'user-123',
        mockCreateContactDto,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(
        controller.createContact(mockRequest as any, mockCreateContactDto),
      ).rejects.toThrow(InvalidContactDataException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getUserContacts', () => {
    it('should return an array of contacts', async () => {
      const mockContacts: ContactResponseDto[] = [
        {
          id: '1',
          name: 'Test Contact',
          phone_number: '123456789',
          description: 'Test Description',
        },
      ];
      mockContactService.getContacts.mockResolvedValue(mockContacts);

      const result = await controller.getUserContacts('user-123');

      expect(result).toEqual(mockContacts);
      expect(mockContactService.getContacts).toHaveBeenCalledWith('user-123');
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('getContactById', () => {
    it('should return a contact by ID', async () => {
      const mockContact: ContactResponseDto = {
        id: 'contact-123',
        name: 'Test Contact',
        phone_number: '123456789',
        description: 'Test Description',
      };

      mockContactService.getContactById.mockResolvedValue(mockContact);

      const result = await controller.getContactById('contact-123');

      expect(result).toEqual(mockContact);
      expect(mockContactService.getContactById).toHaveBeenCalledWith(
        'contact-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    const mockUpdateContactDto: UpdateContactDto = {
      name: 'Updated Name',
      description: 'Updated description',
    };

    it('should update a contact successfully', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };

      const mockUpdatedContact: ContactResponseDto = {
        id: 'contact-123',
        name: 'Updated Name',
        phone_number: '123456789',
        description: 'Updated description',
      };

      mockContactService.updateContact.mockResolvedValue(mockUpdatedContact);

      const result = await controller.updateContact(
        'contact-123',
        mockUpdateContactDto,
        mockRequest as any,
      );

      expect(result).toEqual(mockUpdatedContact);
      expect(mockContactService.updateContact).toHaveBeenCalledWith(
        'contact-123',
        'user-123',
        mockUpdateContactDto,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(
        controller.updateContact(
          'contact-123',
          mockUpdateContactDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(InvalidContactDataException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };

      mockContactService.deleteContact.mockResolvedValue({
        message: 'Contact deleted successfully',
      });

      const result = await controller.deleteContact(
        'contact-123',
        mockRequest as any,
      );

      expect(result).toHaveProperty('message');
      expect(mockContactService.deleteContact).toHaveBeenCalledWith(
        'contact-123',
        'user-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(
        controller.deleteContact('contact-123', mockRequest as any),
      ).rejects.toThrow(InvalidContactDataException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
