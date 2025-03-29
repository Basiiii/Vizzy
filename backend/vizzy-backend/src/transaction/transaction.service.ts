import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { TransactionOptionsDto } from '@/dtos/transaction/transaction-options.dto';
import { TransactionDatabaseHelper } from './helpers/transaction-database.helper';
import { Transaction } from '@/dtos/transaction/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}
  async getTransactionsByUserId(
    userId: string,
    options: TransactionOptionsDto,
  ): Promise<Transaction[]> {
    const supabase = this.supabaseService.getPublicClient();
    const transactions =
      await TransactionDatabaseHelper.getTransactionsByUserId(
        supabase,
        userId,
        options,
      );

    return transactions;
  }
}
