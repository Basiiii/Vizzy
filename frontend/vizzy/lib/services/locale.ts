'use server';

import { defaultLocale, Locale } from '@/i18n/config';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Retrieves the user's locale from the cookies.
 * If the locale is not set in the cookies, it returns the default locale.
 *
 * @returns {Promise<string>} A promise that resolves to the user's locale code.
 * If the locale is not found in the cookies, the default locale is returned.
 */
export async function getUserLocale(): Promise<string> {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

/**
 * Sets the user's locale in the cookies.
 * This function stores the specified locale in the cookies with the name `NEXT_LOCALE`.
 *
 * @param {Locale} locale - The locale code to be set in the cookies (e.g., 'en', 'pt').
 *
 * @returns {Promise<void>} A promise that resolves when the locale is successfully set.
 */
export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE_NAME, locale);
}
