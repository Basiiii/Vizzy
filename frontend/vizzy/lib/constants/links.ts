/**
 * Type representing the available link keys in the application.
 * Currently supports 'GITHUB' as the only valid key.
 */
export type LinkKey = 'GITHUB';

/**
 * Object containing all external links used in the application.
 * Maps LinkKey to their corresponding URL strings.
 * @property {string} GITHUB - URL to the project's GitHub repository
 */
export const LINKS: Record<LinkKey, string> = {
  GITHUB: 'https://github.com/Basiiii/Vizzy',
};
