import { verifySession } from './verify-session';

/**
 * Verifies the validity of a session using the provided authentication token.
 *
 * @param {string | null} authToken - The authentication token to verify. Can be null.
 * @returns {Promise<{valid: boolean | 'UNKNOWN', error: string | null}>} An object containing:
 *   - valid: boolean indicating if the session is valid, or 'UNKNOWN' in case of server errors
 *   - error: Error message if validation fails, or null if successful
 *   Possible error values:
 *   - 'NO_TOKEN': No authentication token provided
 *   - 'INVALID_TOKEN': Token validation failed
 *   - 'SERVER_ERROR': Generic server error
 *   - Custom error message from caught exception
 * @throws {Error} If there's an issue during session verification
 */
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
