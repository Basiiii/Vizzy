import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TransactionOptionsDto } from '@/dtos/transaction/transaction-options.dto';
import { TransactionDatabaseHelper } from './helpers/transaction-database.helper';
import { Transaction } from '@/dtos/transaction/transaction.dto';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { CACHE_KEYS } from '@/constants/cache.constants';

@Injectable()
export class TransactionService {
  private readonly CACHE_EXPIRATION = 3600; // 1 hour

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getTransactionsByUserId(
    userId: string,
    options: TransactionOptionsDto,
  ): Promise<Transaction[]> {
    this.logger.info(
      `Using service getTransactionsByUserId for user ID: ${userId}`,
    );
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = CACHE_KEYS.USER_TRANSACTIONS(
      userId,
      options.limit,
      options.offset,
    );

    const cachedTransactions = await GlobalCacheHelper.getFromCache<
      Transaction[]
    >(redisClient, cacheKey);

    if (cachedTransactions) {
      this.logger.info(`Cache hit for transactions, user ID: ${userId}`);
      return cachedTransactions;
    }

    this.logger.info(
      `Cache miss for transactions, user ID: ${userId}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const transactions =
      await TransactionDatabaseHelper.getTransactionsByUserId(
        supabase,
        userId,
        options,
      );

    if (transactions.length > 0) {
      this.logger.info(
        `Caching ${transactions.length} transactions for user ID: ${userId}`,
      );
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        transactions,
        this.CACHE_EXPIRATION,
      );
    }

    return transactions;
  }

  // TODO: rename this because I don't know what it is
  async getTransactionValueByUserId(userId: string): Promise<number> {
    this.logger.info(
      `Using service getTransactionValueByUserId for user ID: ${userId}`,
    );
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = CACHE_KEYS.TRANSACTION_VALUE(userId);

    const cachedValue = await GlobalCacheHelper.getFromCache<number>(
      redisClient,
      cacheKey,
    );

    if (cachedValue !== null) {
      this.logger.info(`Cache hit for transaction value, user ID: ${userId}`);
      return cachedValue;
    }

    this.logger.info(
      `Cache miss for transaction value, user ID: ${userId}, calculating`,
    );
    const supabase = this.supabaseService.getAdminClient();
    const value = await TransactionDatabaseHelper.getTransactionsTotalValue(
      supabase,
      userId,
    );

    if (value !== null) {
      this.logger.info(`Caching transaction value for user ID: ${userId}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        value,
        this.CACHE_EXPIRATION,
      );
    }

    if (!value) {
      this.logger.warn(`No transactions found for user ID: ${userId}`);
      throw new Error('No transactions found for this user');
    }

    return value;
  }
}
