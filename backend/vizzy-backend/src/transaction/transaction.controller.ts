import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { API_VERSIONS } from '@/constants/api-versions';
import { Transaction } from '@/dtos/transaction/transaction.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';

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
  async getTransactionValue(@Query('userId') userId: string): Promise<number> {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    if (count === 0) {
      throw new NotFoundException('No transactions found for this user');
    }
    return count;
  }
}
