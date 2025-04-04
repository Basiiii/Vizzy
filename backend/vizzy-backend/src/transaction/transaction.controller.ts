import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
  Version,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { API_VERSIONS } from '@/constants/api-versions';
import { Transaction } from '@/dtos/transaction/transaction.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @Version(API_VERSIONS.V1)
  async getTransactions(
    @Query('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<Transaction[]> {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const transactions = await this.transactionService.getTransactionsByUserId(
      userId,
      options,
    );

    if (!transactions.length) {
      throw new NotFoundException('No transactions found for this user');
    }
    return transactions;
  }

  @Get('value')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getTransactionValue(@Req() req: RequestWithUser): Promise<number> {
    const userId = req.user?.sub;
    const value =
      await this.transactionService.getTransactionValueByUserId(userId);
    return value;
  }
}
