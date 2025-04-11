'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/common/button';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { toast } from 'sonner';
import { AUTH } from '@/lib/constants/auth';

interface BlockButtonProps {
  targetUserId: string;
}

export default function BlockButton({ targetUserId }: BlockButtonProps) {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchBlockStatus = useCallback(async () => {
    try {
      const token = getClientCookie(AUTH.AUTH_TOKEN);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/block-status?targetUserId=${targetUserId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch block status');
      }

      const data = await response.json();
      setBlocked(data.isBlocked);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to fetch block status: ${errorMessage}`);
    }
  }, [targetUserId]);

  const toggleBlockStatus = async () => {
    setLoading(true);
    try {
      const token = getClientCookie(AUTH.AUTH_TOKEN);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/block-toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to toggle block status');
      }

      const data = await response.json();
      setBlocked((prev) => !prev);
      toast.success(data.message);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to toggle block status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockStatus();
  }, [fetchBlockStatus]);

  return (
    <Button
      variant="outline"
      onClick={toggleBlockStatus}
      disabled={loading}
      className="w-full md:w-auto"
    >
      {loading ? 'Processing...' : blocked ? 'Unblock User' : 'Block User'}
    </Button>
  );
}
