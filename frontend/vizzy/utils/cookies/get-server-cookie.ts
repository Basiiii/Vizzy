import { cookies } from 'next/headers';

/**
 * Retrieves the value of a specified cookie on the server side using Next.js cookies API.
 * This function is intended to be used in server-side environments (e.g., Next.js API routes or server components).
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {Promise<string | null>} - A promise that resolves to the value of the cookie if found, or `null` if the cookie does not exist.
 *
 * @example
 * // In a Next.js server component or API route
 * const sessionId = await getServerCookie('sessionId');
 * console.log(sessionId); // Output: "abc123" (if the cookie exists)
 *
 * @example
 * // If the cookie does not exist
 * const nonExistentCookie = await getServerCookie('nonExistent');
 * console.log(nonExistentCookie); // Output: null
 */
export async function getServerCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value || null;
}
