'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { refreshTokenAction } from '@/lib/actions/auth/refresh-action';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { useTranslations } from 'next-intl';

export default function RefreshPage() {
  const t = useTranslations('auth.refresh');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get('from') || '/';

  const navigateTo = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router],
  );

  const performRefresh = useCallback(async () => {
    try {
      setIsLoading(true);

      const { refreshToken } = await getAuthTokensAction();

      if (!refreshToken) {
        setError(t('errors.noRefreshToken'));
        navigateTo('/auth/login');
        return;
      }

      const result = await refreshTokenAction(refreshToken);

      if (result.success) {
        navigateTo(from);
      } else {
        setError(result.error || t('errors.failedRefresh'));
        navigateTo('/auth/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
      navigateTo('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [from, navigateTo, t]);

  useEffect(() => {
    performRefresh();
  }, [performRefresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>{t('errors.prefix')}: {error}</p>
          <button
            onClick={() => navigateTo('/auth/login')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            {t('actions.goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return <div style={{ display: 'none' }} />;
}
