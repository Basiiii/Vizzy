/**
 * Type representing the valid locales available in the application.
 * It is derived from the `locales` constant array.
 *
 * @typedef {('en' | 'pt')} Locale
 */
export type Locale = (typeof locales)[number];

/**
 * Type representing the language object, which includes:
 * - code: A string representing the language code (e.g., 'en', 'pt').
 * - name: The full name of the language (e.g., 'English', 'Português').
 * - flag: A string representing the emoji of the country's flag.
 *
 * @typedef {Object} Language
 * @property {string} code - The language code.
 * @property {string} name - The full name of the language.
 * @property {string} flag - The emoji representing the country's flag.
 */
export type Language = {
  code: string;
  name: string;
  flag: string;
};

/**
 * An array of available locales that the application supports.
 *
 * @constant {ReadonlyArray<'en' | 'pt'>} locales
 */
export const locales = ['en', 'pt'] as const;

/**
 * The default locale of the application.
 * This is used to set the initial language.
 *
 * @constant {Locale} defaultLocale - The default language code, which is 'en'.
 */
export const defaultLocale: Locale = 'en';

/**
 * An array of language objects representing the available languages.
 * Each language object contains a code, name, and flag emoji.
 *
 * @constant {Language[]} languages
 */
export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'pt',
    name: 'Português',
    flag: '🇵🇹',
  },
];
