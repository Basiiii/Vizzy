import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { SessionService } from '@/lib/api/auth/session/session-service';

export default function RefreshingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const from = (router.query.from as string) || '/';

  // Use useCallback to memoize the navigation function
  const navigateTo = useCallback(
    async (path: string) => {
      await router.replace(path);
    },
    [router],
  );

  // Use useCallback to memoize the refresh function
  const performRefresh = useCallback(async () => {
    if (!router.isReady) return;

    try {
      setIsLoading(true);
      const response = await SessionService.refresh();

      if (response.ok) {
        await navigateTo(from);
      } else {
        console.error('Refresh failed with response:', response);
        await navigateTo('/login');
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      await navigateTo('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, from, navigateTo]);

  useEffect(() => {
    performRefresh();
  }, [performRefresh]);

  if (isLoading && router.isReady) {
    return <div>Refreshing your session...</div>;
  }

  return <div style={{ display: 'none' }}></div>;
}
