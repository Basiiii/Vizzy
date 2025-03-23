import { verifySession } from './verify-session';

export const handleSessionVerification = async (authToken: string | null) => {
  if (!authToken) return { valid: false, error: 'NO_TOKEN' };

  try {
    const isValid = await verifySession(authToken);
    return { valid: isValid, error: isValid ? null : 'INVALID_TOKEN' };
  } catch (error) {
    console.error('Middleware session error:', error);
    return {
      valid: 'UNKNOWN',
      error: error instanceof Error ? error.message : 'SERVER_ERROR',
    };
  }
};
