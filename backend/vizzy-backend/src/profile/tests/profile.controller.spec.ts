import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '../profile.controller';
import { ProfileService } from '../profile.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotFoundException } from '@nestjs/common';
import { Profile } from '@/dtos/profile/profile.dto';
import { UpdateProfileDto } from '@/dtos/profile/update-profile.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockProfileService = {
    getProfileByUsername: jest.fn(),
    updateProfile: jest.fn(),
    processAndUploadProfilePicture: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return a profile when it exists', async () => {
      const username = 'testuser';
      const mockProfile: Profile = {
        id: 'user-123',
        name: 'Test User',
        location: 'Test Location',
        avatarUrl: 'https://example.com/avatar.jpg',
        isVerified: true,
        memberSince: 2023,
        activeListings: 5,
        totalSales: 10,
      };

      mockProfileService.getProfileByUsername.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(username);

      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfileByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      const username = 'nonexistentuser';

      mockProfileService.getProfileByUsername.mockResolvedValue(null);

      await expect(controller.getProfile(username)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProfileService.getProfileByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update a profile successfully', async () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
          user_metadata: { username: 'testuser' },
        },
      } as RequestWithUser;

      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        location: 'Updated Location',
      };

      mockProfileService.updateProfile.mockResolvedValue(
        'Profile updated successfully',
      );

      const result = await controller.updateProfile(
        mockRequest,
        updateProfileDto,
      );

      expect(result).toEqual('Profile updated successfully');
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        'testuser',
        'user-123',
        updateProfileDto,
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const mockResponse = { data: { path: 'avatars/user-123' } };

      mockProfileService.processAndUploadProfilePicture.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.uploadAvatar(mockRequest, mockFile);

      expect(result).toEqual(mockResponse);
      expect(
        mockProfileService.processAndUploadProfilePicture,
      ).toHaveBeenCalledWith(mockFile, 'user-123');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when file is not provided', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      } as RequestWithUser;

      await expect(controller.uploadAvatar(mockRequest, null)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(
        mockProfileService.processAndUploadProfilePicture,
      ).not.toHaveBeenCalled();
    });
  });
});
