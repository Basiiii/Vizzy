import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../lib/services/locale';

/**
 * This function is the default export for configuring the request in a Next.js application
 * using `next-intl`. It retrieves the user's locale and loads the appropriate language messages.
 *
 * It uses the `getRequestConfig` function from `next-intl/server` to define request-specific configurations
 * related to locale and messages.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - `locale` (string): The user's locale code.
 * - `messages` (Object): The set of localized messages loaded from a JSON file based on the user's locale.
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
