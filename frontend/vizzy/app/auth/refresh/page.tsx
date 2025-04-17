'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SessionService } from '@/lib/api/auth/session/session-service';

export default function RefreshPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);

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
      const response = await SessionService.refresh();

      if (response.ok) {
        navigateTo(from);
      } else {
        console.error('Refresh failed with response:', response);
        navigateTo('/auth/login');
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      navigateTo('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [from, navigateTo]);

  useEffect(() => {
    performRefresh();
  }, [performRefresh]);

  if (isLoading) {
    return <div>Refreshing your session...</div>;
  }

  return <div style={{ display: 'none' }} />;
}
