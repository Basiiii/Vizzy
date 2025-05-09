'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { useEffect, useState } from 'react';
import { fetchUserBalance } from '@/lib/api/proposals/fetch-user-balance';

export function UserBalance() {
  const t = useTranslations('userBalance');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserBalance();
  }, []);

  const getUserBalance = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserBalance();
      setBalance(data.data?.balance || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
          ) : error ? (
            <div className="text-sm text-red-500">{t('error')}</div>
          ) : (
            formatCurrency(balance)
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('description')}</p>
      </CardContent>
    </Card>
  );
}
