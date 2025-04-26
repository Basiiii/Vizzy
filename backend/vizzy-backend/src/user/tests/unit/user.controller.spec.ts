/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../user.controller';
import { UserService } from '../../user.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getUserIdByUsername: jest.fn(),
    deleteUser: jest.fn(),
    getUserLocation: jest.fn(),
    getUserById: jest.fn(),
    isUserBlocked: jest.fn(),
    toggleBlockUser: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIdFromUsername', () => {
    it('should return user lookup data when user exists', async () => {
      const mockUserLookup = { id: '123', username: 'testuser' };
      mockUserService.getUserIdByUsername.mockResolvedValue(mockUserLookup);

      const result = await controller.getIdFromUsername('testuser', 'false');
      expect(result).toEqual(mockUserLookup);
      expect(mockUserService.getUserIdByUsername).toHaveBeenCalledWith(
        'testuser',
        false,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.getUserIdByUsername.mockResolvedValue(null);

      await expect(
        controller.getIdFromUsername('nonexistent', 'false'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };
      const mockResponse = { message: 'User successfully deleted' };
      mockUserService.deleteUser.mockResolvedValue(mockResponse);

      const result = await controller.deleteUser(mockRequest as any);
      expect(result).toEqual(mockResponse);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user123');
    });
  });

  describe('getUserLocation', () => {
    it('should return user location when it exists', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };
      const mockLocation = {
        id: '1',
        full_address: 'Test Address',
        lat: 0,
        lon: 0,
        created_at: new Date(),
      };
      mockUserService.getUserLocation.mockResolvedValue(mockLocation);

      const result = await controller.getUserLocation(
        mockRequest as any,
        'false',
      );
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException when location does not exist', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };
      mockUserService.getUserLocation.mockResolvedValue(null);

      await expect(
        controller.getUserLocation(mockRequest as any, 'false'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user123', username: 'testuser' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUser('user123', 'false');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(controller.getUser('nonexistent', 'false')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkBlockStatus', () => {
    it('should return block status', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };
      mockUserService.isUserBlocked.mockResolvedValue(true);

      const result = await controller.checkBlockStatus(
        mockRequest as any,
        'target123',
        'false',
      );
      expect(result).toEqual({ isBlocked: true });
      expect(mockUserService.isUserBlocked).toHaveBeenCalledWith(
        'user123',
        'target123',
        false,
      );
    });

    it('should throw error when targetUserId is missing', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };

      await expect(
        controller.checkBlockStatus(mockRequest as any, '', 'false'),
      ).rejects.toThrow('targetUserId is required');
    });
  });

  describe('toggleBlockUser', () => {
    it('should toggle block status successfully', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };
      mockUserService.toggleBlockUser.mockResolvedValue(true);

      const result = await controller.toggleBlockUser(
        mockRequest as any,
        'target123',
      );
      expect(result).toEqual({
        message: 'User target123 has been blocked.',
      });
    });

    it('should throw error when targetUserId is missing', async () => {
      const mockRequest = {
        user: { sub: 'user123' },
      };

      await expect(
        controller.toggleBlockUser(mockRequest as any, ''),
      ).rejects.toThrow('targetUserId is required');
    });
  });
});
