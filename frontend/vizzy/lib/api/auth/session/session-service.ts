import { getApiUrl, createAuthHeaders } from '../../core/client';

export type SessionVerificationResult = {
  valid: boolean | 'UNKNOWN';
  error: string | null;
};

export class SessionService {
  static async verifySession(
    authToken: string | null,
  ): Promise<SessionVerificationResult> {
    if (!authToken) {
      return { valid: false, error: 'NO_TOKEN' };
    }

    try {
      const response = await fetch(getApiUrl('auth/verify'), {
        method: 'POST',
        headers: createAuthHeaders(authToken),
      });

      if (response.status === 401) {
        return { valid: false, error: 'INVALID_TOKEN' };
      }

      if (!response.ok) {
        throw new Error(
          `Session verification failed with status: ${response.status}`,
        );
      }

      return { valid: true, error: null };
    } catch (error) {
      console.error('Session verification error:', error);
      return {
        valid: 'UNKNOWN',
        error: error instanceof Error ? error.message : 'SERVER_ERROR',
      };
    }
  }

  static async refresh(): Promise<Response> {
    return fetch(getApiUrl('auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }
}
