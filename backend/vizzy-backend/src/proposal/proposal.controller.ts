import {
  Controller,
  Post,
  Body,
  Get,
  NotFoundException,
  UseGuards,
  Req,
  Query,
  Version,
} from '@nestjs/common';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { Proposal } from '@/dtos/proposal/proposal.dto';

@Controller('proposals')
export class ProposalController {
  constructor(private readonly ProposalService: ProposalService) {}

  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposals(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<Proposal[]> {
    console.log('sera que chego pelo menos aqui');
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };
    console.log(userId);
    const proposals = await this.ProposalService.getAllProposalsByUserId(
      userId,
      options,
    );

    console.log('Dados no controlador:', proposals);

    if (!proposals.length) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }

  /*   @Get('all-proposals')
  @UseGuards(JwtAuthGuard)
  @Version(API_VERSIONS.V1)
  async getUserProposals(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    console.log(userId);
    return this.ProposalService.getAllProposals(userId);
  } */
  /*    @Post('purchase-proposal')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async createPurchaseProposal(
    @Body() purchaseProposalDto: PurchaseProposalDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.proposalService.createPurchaseProposal(
      purchaseProposalDto,
      userId,
    );
  }

  @Post('swap-proposal')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async createSwapProposal(
    @Body() swapProposalDto: SwapProposalDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.proposalService.createSwapProposal(swapProposalDto, userId);
  }
  @Post('rental-proposal')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async createRentalProposal(
    @Body() rentalProposalDto: RentalProposalDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.proposalService.createRentalProposal(rentalProposalDto, userId);
  } */
}
