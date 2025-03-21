/**
 * Retrieves the value of a specified cookie from the client-side document.
 * This function is intended to be used in browser environments and will return `null`
 * if executed in a non-browser context (e.g., server-side rendering).
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | null} - The decoded value of the cookie if found, or `null` if the cookie does not exist
 *                             or if the function is executed outside a browser environment.
 *
 * @example
 * // Assuming a cookie named "sessionId" exists with the value "abc123"
 * const sessionId = getClientCookie('sessionId');
 * console.log(sessionId); // Output: "abc123"
 *
 * @example
 * // If the cookie does not exist or the function is run server-side
 * const nonExistentCookie = getClientCookie('nonExistent');
 * console.log(nonExistentCookie); // Output: null
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Ensure it's running in the browser
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}
