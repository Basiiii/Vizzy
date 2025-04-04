import { SessionService } from './session-service';

/**
 * Client-side session verification with error differentiation.
 *
 * Verifies authentication token validity by checking against the backend API.
 * Designed to handle three distinct outcomes:
 * 1. Valid session (200 OK) -> returns `true`
 * 2. Explicit invalid/expired token (401 Unauthorized) -> returns `false`
 * 3. Technical failures (network issues, server errors) -> throws Error
 *
 * @param {string} authToken - JWT authentication token
 * @returns {Promise<boolean>}
 *   - `true`: Valid session (received 200 OK from API)
 *   - `false`: Explicit authentication failure (received 401 Unauthorized)
 * @throws {Error} Throws with descriptive messages for:
 *   - Network errors (failed API connection)
 *   - Server errors (500, 403, etc.)
 *   - Unexpected operational errors
 *
 * @remarks
 * - Requires backend API to return 401 specifically for invalid/expired tokens
 * - Non-401 HTTP errors are treated as system failures
 * - Network errors include DNS failures, CORS issues, and timeout
 * - Always wrap in try/catch for proper error handling
 */
export async function verifySession(authToken: string): Promise<boolean> {
  const result = await SessionService.verifySession(authToken);
  return result.valid === true;
}
