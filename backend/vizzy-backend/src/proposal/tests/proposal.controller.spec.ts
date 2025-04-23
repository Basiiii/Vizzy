import { Test, TestingModule } from '@nestjs/testing';
import { ProposalController } from '../proposal.controller';
import { ProposalService } from '../proposal.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { HttpException, NotFoundException } from '@nestjs/common';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { ProposalType } from '@/constants/proposal-types.enum';

describe('ProposalController', () => {
  let controller: ProposalController;
  let originalConsoleLog: any;

  const mockProposalService = {
    findAll: jest.fn(),
    getProposalBalanceByUserId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    verifyProposalAccess: jest.fn(),
    getProposalImages: jest.fn(),
    processAndUploadProposalImages: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    originalConsoleLog = console.log;
    console.log = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalController],
      providers: [
        {
          provide: ProposalService,
          useValue: mockProposalService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<ProposalController>(ProposalController);
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should return proposals successfully', async () => {
      const mockResponse = {
        proposals: [{ id: 1, title: 'Test Proposal' }],
        totalProposals: 1,
      };
      mockProposalService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockRequest, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockProposalService.findAll).toHaveBeenCalledWith('user-123', {
        page: 1,
        limit: 10,
      });
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.findAll(invalidRequest, { page: 1, limit: 10 }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getProposalBalance', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should return balance successfully', async () => {
      mockProposalService.getProposalBalanceByUserId.mockResolvedValue(5);

      const result = await controller.getProposalBalance(mockRequest);

      expect(result).toEqual({ balance: 5 });
      expect(
        mockProposalService.getProposalBalanceByUserId,
      ).toHaveBeenCalledWith('user-123');
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.getProposalBalance(invalidRequest),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should return proposal successfully', async () => {
      const mockProposal = { id: 1, title: 'Test Proposal' };
      mockProposalService.verifyProposalAccess.mockResolvedValue(undefined);
      mockProposalService.findOne.mockResolvedValue(mockProposal);

      const result = await controller.findOne(mockRequest, 1);

      expect(result).toEqual(mockProposal);
      expect(mockProposalService.verifyProposalAccess).toHaveBeenCalledWith(
        1,
        'user-123',
      );
    });

    it('should throw NotFoundException when proposal not found', async () => {
      mockProposalService.verifyProposalAccess.mockResolvedValue(undefined);
      mockProposalService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(mockRequest, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    const mockCreateProposalDto = {
      receiver_id: 'user-456',
      listing_id: 1,
      message: 'Test proposal',
      title: 'Test Proposal Title',
      description: 'Test proposal description',
      proposal_type: ProposalType.SALE,
    };

    it('should create proposal successfully', async () => {
      const mockResponse = { id: 1, ...mockCreateProposalDto };
      mockProposalService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        mockRequest,
        mockCreateProposalDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockProposalService.create).toHaveBeenCalledWith(
        mockCreateProposalDto,
        'user-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.create(invalidRequest, mockCreateProposalDto),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when service fails', async () => {
      mockProposalService.create.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.create(mockRequest, mockCreateProposalDto),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should update status successfully', async () => {
      mockProposalService.updateStatus.mockResolvedValue(undefined);

      await controller.updateStatus(mockRequest, 1, { status: 'accepted' });

      expect(mockProposalService.updateStatus).toHaveBeenCalledWith(
        1,
        'accepted',
        'user-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.updateStatus(invalidRequest, 1, { status: 'accepted' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when invalid status', async () => {
      await expect(
        controller.updateStatus(mockRequest, 1, { status: 'INVALID' }),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('cancelProposal', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should cancel proposal successfully', async () => {
      mockProposalService.updateStatus.mockResolvedValue(undefined);

      await controller.cancelProposal(mockRequest, 1);

      expect(mockProposalService.updateStatus).toHaveBeenCalledWith(
        1,
        'cancelled',
        'user-123',
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.cancelProposal(invalidRequest, 1),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getProposalImages', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    it('should return images successfully', async () => {
      const mockImages = {
        images: [{ path: 'test.jpg', url: 'http://test.com/test.jpg' }],
      };
      mockProposalService.verifyProposalAccess.mockResolvedValue(undefined);
      mockProposalService.getProposalImages.mockResolvedValue(mockImages);

      const result = await controller.getProposalImages(mockRequest, 1);

      expect(result).toEqual(mockImages);
      expect(mockProposalService.verifyProposalAccess).toHaveBeenCalledWith(
        1,
        'user-123',
      );
      expect(mockProposalService.getProposalImages).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.getProposalImages(invalidRequest, 1),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('uploadProposalImages', () => {
    const mockRequest: RequestWithUser = {
      user: { sub: 'user-123' },
    } as RequestWithUser;

    const mockFiles = [
      { buffer: Buffer.from('test') },
    ] as Express.Multer.File[];

    it('should upload images successfully', async () => {
      const mockResponse = {
        images: [{ path: 'test.jpg', url: 'http://test.com/test.jpg' }],
      };
      mockProposalService.processAndUploadProposalImages.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.uploadProposalImages(
        mockRequest,
        mockFiles,
        1,
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockProposalService.processAndUploadProposalImages,
      ).toHaveBeenCalledWith(mockFiles, 1, 'user-123');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw HttpException when no files provided', async () => {
      await expect(
        controller.uploadProposalImages(mockRequest, [], 1),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when no user ID', async () => {
      const invalidRequest = { user: {} } as RequestWithUser;

      await expect(
        controller.uploadProposalImages(invalidRequest, mockFiles, 1),
      ).rejects.toThrow(HttpException);
    });
  });
});
