import { SupabaseClient } from '@supabase/supabase-js';
import { Transaction } from '@/dtos/transaction/transaction.dto';
import { TransactionOptionsDto } from '@/dtos/transaction/transaction-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class TransactionDatabaseHelper {
  static async getTransactionsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: TransactionOptionsDto,
  ): Promise<Transaction[]> {
    const { data, error } = await supabase.rpc('fetch_transactions', {
      _owner_id: userId,
      _limit: options.limit,
      _offset: options.offset,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user transactions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!data) {
      return [];
    }

    return (data as Transaction[]).map((item) => ({
      id: item.id,
    }));
  }

  static async getTransactionsTotalValue(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_user_balance', {
      _owner_id: userId,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user transactions value: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data as number;
  }
}
