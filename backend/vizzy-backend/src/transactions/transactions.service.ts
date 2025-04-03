import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { create } from 'domain';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getUserTransactions(userId: string) {
    this.logger.info(`Procurando transações para o usuário ${userId}`);

    const supabase = this.supabaseService.getPublicClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      this.logger.error(
        `Erro ao procurar transações para o usuário ${userId}: ${error.message}`,
      );
      throw new Error('Erro ao buscar transações');
    }

    this.logger.info(
      `Encontradas ${data.length} transações para o usuário ${userId}`,
    );
    return data;
  }

  async getUserTransactionById(userId: string, transactionId: string) {
    this.logger.info(
      `Procurando transação ${transactionId} para o usuário ${userId}`,
    );

    const supabase = this.supabaseService.getPublicClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', transactionId)
      .single();

    if (error) {
      this.logger.error(
        `Erro ao procurar transação ${transactionId} para o usuário ${userId}: ${error.message}`,
      );
      throw new Error('Erro ao buscar transação');
    }

    this.logger.info(
      `Transação ${transactionId} encontrada para o usuário ${userId}`,
    );
    return data;
  }
}
