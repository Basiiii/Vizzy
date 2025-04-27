import { Test, TestingModule } from '@nestjs/testing';
import { ProposalService } from '../../proposal.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ProposalResponseDto,
  ProposalsWithCountDto,
} from '@/dtos/proposal/proposal-response.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalStatus } from '@/constants/proposal-status.enum';
import { FetchProposalsOptions } from '../../helpers/proposal-database.types';
import {
  HttpException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProposalDatabaseHelper } from '../../helpers/proposal-database.helper';
import { ProposalImageHelper } from '../../helpers/proposal-image.helper';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { PROPOSAL_CACHE_KEYS } from '@/constants/cache/proposal.cache-keys';
import { ProposalType } from '@/constants/proposal-types.enum';

jest.mock('../../helpers/proposal-database.helper');
jest.mock('../../helpers/proposal-image.helper');
jest.mock('@/common/helpers/global-cache.helper');

describe('ProposalService', () => {
  let service: ProposalService;
  let mockSupabaseService: any;
  let mockRedisService: any;
  let mockLogger: any;
  let mockRedisClient: any;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      storage: {
        from: jest.fn().mockReturnValue({
          list: jest.fn(),
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
        }),
      },
    };

    mockRedisService = {
      getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    mockSupabaseService = {
      getAdminClient: jest.fn().mockReturnValue(mockSupabaseClient),
      getPublicClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ProposalService>(ProposalService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  /* eslint-disable @typescript-eslint/unbound-method */

  describe('findAll', () => {
    const userId = 'user-123';
    const options: FetchProposalsOptions = { page: 1, limit: 10 };
    const mockProposals: ProposalsWithCountDto = {
      proposals: [
        {
          id: 1,
          title: 'Test Proposal',
          description: 'Test description',
          sender_id: 'user-123',
          receiver_id: 'user-456',
          proposal_status: ProposalStatus.PENDING,
          created_at: new Date('2023-01-01T00:00:00Z'),
          listing_id: 123,
          listing_title: 'Test Listing',
          proposal_type: ProposalType.SALE,
          sender_name: 'Test Sender',
          receiver_name: 'Test Receiver',
        },
      ],
      totalProposals: 1,
    };

    it('should return proposals from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockProposals,
      );

      const result = await service.findAll(userId, options);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(
        ProposalDatabaseHelper.fetchBasicProposalsByFilters,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(mockProposals);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch proposals from database and cache them when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ProposalDatabaseHelper.fetchBasicProposalsByFilters as jest.Mock
      ).mockResolvedValue(mockProposals);

      const result = await service.findAll(userId, options);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(
        ProposalDatabaseHelper.fetchBasicProposalsByFilters,
      ).toHaveBeenCalledWith(mockSupabaseClient, userId, options);
      expect(GlobalCacheHelper.setCache).toHaveBeenCalled();
      expect(result).toEqual(mockProposals);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOne', () => {
    const proposalId = 1;
    const mockProposal: ProposalResponseDto = {
      id: 1,
      title: 'Test Proposal',
      description: 'Test description',
      sender_id: 'user-123',
      receiver_id: 'user-456',
      proposal_status: ProposalStatus.PENDING,
      created_at: new Date('2023-01-01T00:00:00Z'),
      listing_id: 123,
      listing_title: 'Test Listing',
      proposal_type: ProposalType.SALE,
      sender_name: 'Test Sender',
      receiver_name: 'Test Receiver',
    };

    it('should return proposal from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockProposal,
      );

      const result = await service.findOne(proposalId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        PROPOSAL_CACHE_KEYS.DETAIL(proposalId.toString()),
      );
      expect(ProposalDatabaseHelper.getProposalDataById).not.toHaveBeenCalled();
      expect(result).toEqual(mockProposal);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch proposal from database and cache it when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ProposalDatabaseHelper.getProposalDataById as jest.Mock
      ).mockResolvedValue(mockProposal);

      const result = await service.findOne(proposalId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(ProposalDatabaseHelper.getProposalDataById).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalled();
      expect(result).toEqual(mockProposal);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return null when proposal not found', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ProposalDatabaseHelper.getProposalDataById as jest.Mock
      ).mockResolvedValue(null);

      const result = await service.findOne(proposalId);

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(GlobalCacheHelper.setCache).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const senderId = 'user-123';
    const createProposalDto: CreateProposalDto = {
      receiver_id: 'user-456',
      listing_id: 1,
      message: 'Test message',
      title: 'Test Proposal',
      description: 'Test description',
      proposal_type: ProposalType.SALE,
    };
    const mockProposalId = 1;
    const mockProposal: ProposalResponseDto = {
      id: mockProposalId,
      title: 'Test Proposal',
      description: 'Test description',
      sender_id: senderId,
      receiver_id: 'user-456',
      proposal_status: ProposalStatus.PENDING,
      created_at: new Date('2023-01-01T00:00:00Z'),
      listing_id: 1,
      listing_title: 'Test Listing',
      proposal_type: ProposalType.SALE,
      sender_name: 'Test Sender',
      receiver_name: 'Test Receiver',
    };

    it('should create a proposal successfully', async () => {
      (ProposalDatabaseHelper.insertProposal as jest.Mock).mockResolvedValue({
        id: mockProposalId,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProposal);
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.create(createProposalDto, senderId);

      expect(ProposalDatabaseHelper.insertProposal).toHaveBeenCalledWith(
        mockSupabaseClient,
        createProposalDto,
        senderId,
      );
      expect(service.findOne).toHaveBeenCalledWith(mockProposalId);
      expect(result).toEqual(mockProposal);
      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });

    it('should throw error when database returns invalid proposal ID', async () => {
      (ProposalDatabaseHelper.insertProposal as jest.Mock).mockResolvedValue(
        {},
      );

      await expect(service.create(createProposalDto, senderId)).rejects.toThrow(
        'Failed to create proposal due to a server error.',
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw HttpException when findOne returns null', async () => {
      (ProposalDatabaseHelper.insertProposal as jest.Mock).mockResolvedValue({
        id: mockProposalId,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.create(createProposalDto, senderId)).rejects.toThrow(
        HttpException,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    const proposalId = 1;
    const userId = 'user-123';
    const status = ProposalStatus.ACCEPTED;
    const mockProposalMeta = {
      sender_id: 'user-456',
      receiver_id: userId,
    };

    it('should update proposal status successfully', async () => {
      jest.spyOn(service, 'verifyProposalAccess').mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.updateProposalStatus as jest.Mock
      ).mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue(mockProposalMeta);
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.updateStatus(proposalId, status, userId);

      expect(service.verifyProposalAccess).toHaveBeenCalledWith(
        proposalId,
        userId,
        true,
      );
      expect(ProposalDatabaseHelper.updateProposalStatus).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
        status,
        userId,
      );
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should handle cancel status by verifying sender', async () => {
      jest.spyOn(service, 'verifyProposalSender').mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.updateProposalStatus as jest.Mock
      ).mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue(mockProposalMeta);
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.updateStatus(proposalId, ProposalStatus.CANCELLED, userId);

      expect(service.verifyProposalSender).toHaveBeenCalledWith(
        proposalId,
        userId,
        true,
      );
      expect(ProposalDatabaseHelper.updateProposalStatus).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
        ProposalStatus.CANCELLED,
        userId,
      );
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(service, 'verifyProposalAccess').mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.updateProposalStatus as jest.Mock
      ).mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateStatus(proposalId, status, userId),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('verifyProposalAccess', () => {
    const proposalId = 1;
    const userId = 'user-123';

    it('should verify access when user is sender', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: userId,
        receiver_id: 'user-456',
      });

      await service.verifyProposalAccess(proposalId, userId);

      expect(ProposalDatabaseHelper.getProposalMetadata).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
      );
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should verify access when user is receiver', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: 'user-456',
        receiver_id: userId,
      });

      await service.verifyProposalAccess(proposalId, userId);

      expect(ProposalDatabaseHelper.getProposalMetadata).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
      );
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when proposal not found', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.verifyProposalAccess(proposalId, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user has no access', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: 'user-789',
        receiver_id: 'user-456',
      });

      await expect(
        service.verifyProposalAccess(proposalId, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when checking receiver only and user is not receiver', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: userId,
        receiver_id: 'user-456',
      });

      await expect(
        service.verifyProposalAccess(proposalId, userId, true),
      ).rejects.toThrow(ForbiddenException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getProposalImages', () => {
    const proposalId = 1;
    const mockImages = {
      images: [
        {
          path: 'proposals/1/image1.jpg',
          url: 'https://example.com/proposals/1/image1.jpg',
        },
      ],
    };

    it('should return images from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockImages,
      );

      const result = await service.getProposalImages(proposalId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        PROPOSAL_CACHE_KEYS.IMAGES(proposalId),
      );
      expect(ProposalImageHelper.fetchProposalImageUrls).not.toHaveBeenCalled();
      expect(result).toEqual(mockImages);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch images from database and cache them when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ProposalImageHelper.fetchProposalImageUrls as jest.Mock
      ).mockResolvedValue(mockImages.images);

      const result = await service.getProposalImages(proposalId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(ProposalImageHelper.fetchProposalImageUrls).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
        mockLogger,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalled();
      expect(result).toEqual(mockImages);
    });
  });

  describe('processAndUploadProposalImages', () => {
    const proposalId = 1;
    const userId = 'user-123';
    const files = [
      {
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      },
    ] as Express.Multer.File[];
    const mockUploadResult = {
      data: {
        path: 'proposals/1/test.jpg',
        url: 'https://example.com/proposals/1/test.jpg',
      },
    };

    it('should process and upload images successfully', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: userId,
        receiver_id: 'user-456',
      });
      (ProposalImageHelper.validateImageType as jest.Mock).mockReturnValue(
        undefined,
      );
      (ProposalImageHelper.processImage as jest.Mock).mockResolvedValue(
        Buffer.from('processed'),
      );
      (ProposalImageHelper.uploadImage as jest.Mock).mockResolvedValue(
        mockUploadResult,
      );
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.processAndUploadProposalImages(
        files,
        proposalId,
        userId,
      );

      expect(ProposalDatabaseHelper.getProposalMetadata).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
      );
      expect(ProposalImageHelper.validateImageType).toHaveBeenCalled();
      expect(ProposalImageHelper.processImage).toHaveBeenCalled();
      expect(ProposalImageHelper.uploadImage).toHaveBeenCalled();
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ images: [mockUploadResult.data] });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when proposal not found', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.processAndUploadProposalImages(files, proposalId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not sender', async () => {
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue({
        sender_id: 'user-456',
        receiver_id: userId,
      });

      await expect(
        service.processAndUploadProposalImages(files, proposalId, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getProposalBalanceByUserId', () => {
    const userId = 'user-123';
    const mockBalance = 5;

    it('should return balance from cache when available', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(
        mockBalance,
      );

      const result = await service.getProposalBalanceByUserId(userId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalledWith(
        mockRedisClient,
        PROPOSAL_CACHE_KEYS.BALANCE(userId),
      );
      expect(ProposalDatabaseHelper.getProposalBalance).not.toHaveBeenCalled();
      expect(result).toEqual(mockBalance);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should fetch balance from database and cache it when not in cache', async () => {
      (GlobalCacheHelper.getFromCache as jest.Mock).mockResolvedValue(null);
      (
        ProposalDatabaseHelper.getProposalBalance as jest.Mock
      ).mockResolvedValue(mockBalance);

      const result = await service.getProposalBalanceByUserId(userId);

      expect(mockRedisService.getRedisClient).toHaveBeenCalled();
      expect(GlobalCacheHelper.getFromCache).toHaveBeenCalled();
      expect(ProposalDatabaseHelper.getProposalBalance).toHaveBeenCalledWith(
        mockSupabaseClient,
        userId,
      );
      expect(GlobalCacheHelper.setCache).toHaveBeenCalled();
      expect(result).toEqual(mockBalance);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });
  describe('cancelProposal', () => {
    const proposalId = 1;
    const userId = 'user-123';
    const mockProposalMeta = {
      sender_id: userId,
      receiver_id: 'user-456',
    };

    it('should cancel proposal successfully', async () => {
      jest.spyOn(service, 'verifyProposalSender').mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.updateProposalStatus as jest.Mock
      ).mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.getProposalMetadata as jest.Mock
      ).mockResolvedValue(mockProposalMeta);
      (GlobalCacheHelper.invalidateCache as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.updateStatus(proposalId, ProposalStatus.CANCELLED, userId);

      expect(service.verifyProposalSender).toHaveBeenCalledWith(
        proposalId,
        userId,
        true,
      );
      expect(ProposalDatabaseHelper.updateProposalStatus).toHaveBeenCalledWith(
        mockSupabaseClient,
        proposalId,
        ProposalStatus.CANCELLED,
        userId,
      );
      expect(GlobalCacheHelper.invalidateCache).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw error when cancel fails', async () => {
      jest.spyOn(service, 'verifyProposalSender').mockResolvedValue(undefined);
      (
        ProposalDatabaseHelper.updateProposalStatus as jest.Mock
      ).mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateStatus(proposalId, ProposalStatus.CANCELLED, userId),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not sender', async () => {
      jest
        .spyOn(service, 'verifyProposalSender')
        .mockRejectedValue(
          new ForbiddenException('Access denied to this proposal.'),
        );

      await expect(
        service.updateStatus(proposalId, ProposalStatus.CANCELLED, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
