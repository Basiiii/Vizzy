/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { InvalidContactDataException } from './exceptions/contact.exception';

describe('ContactController', () => {
  let controller: ContactController;

  const mockContactService = {
    createContact: jest.fn(),
    getContacts: jest.fn(),
    deleteContact: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
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

      const mockResponse = {
        id: 'contact-123',
        description: mockCreateContactDto.description,
        phone_number: mockCreateContactDto.phone_number,
      };

      mockContactService.createContact.mockResolvedValue(mockResponse);

      const result = await controller.createContact(
        mockRequest as any,
        mockCreateContactDto,
      );

      expect(result).toHaveProperty('id');
      expect(result.phone_number).toBe(mockCreateContactDto.phone_number);
      expect(mockContactService.createContact).toHaveBeenCalledWith(
        'user-123',
        mockCreateContactDto,
      );
    });

    it('should throw error when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(
        controller.createContact(mockRequest as any, mockCreateContactDto),
      ).rejects.toThrow(InvalidContactDataException);
    });
  });

  describe('getUserContacts', () => {
    it('should return an array of contacts', async () => {
      const mockContacts = [
        { id: '1', phone_number: '123', description: 'Test' },
      ];
      mockContactService.getContacts.mockResolvedValue(mockContacts);

      const result = await controller.getUserContacts('user-123');

      expect(Array.isArray(result)).toBe(true);
      expect(mockContactService.getContacts).toHaveBeenCalledWith('user-123');
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
    });

    it('should throw error when user is not authenticated', async () => {
      const mockRequest = {
        user: null,
      };

      await expect(
        controller.deleteContact('contact-123', mockRequest as any),
      ).rejects.toThrow(InvalidContactDataException);
    });
  });
});
