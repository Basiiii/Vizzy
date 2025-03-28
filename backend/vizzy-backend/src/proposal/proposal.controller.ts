import {
  Controller,
  Post,
  Body,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Req,
  Version,
} from '@nestjs/common';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { PurchaseProposalDto } from '@/dtos/proposal/purchase-proposal.dto';

@Controller('proposal')
export class ProposalController {
  constructor(private readonly ProposalService: ProposalService) {}
  @Post('purchase-proposal')
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
  }
}
