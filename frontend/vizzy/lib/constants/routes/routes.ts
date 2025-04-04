/**
 * Defines all available route keys in the application.
 * These keys are used to maintain consistent routing throughout the app.
 */
export type RouteKey =
  | 'HOME'
  | 'ABOUT'
  | 'CONTACT'
  | 'PRIVACY_POLICY'
  | 'TERMS_OF_SERVICE'
  | 'LOGIN'
  | 'SIGNUP'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD'
  | 'PROFILE'
  | 'SETTINGS';

/**
 * Maps route keys to their corresponding URL paths.
 * This constant object provides a centralized way to manage all application routes.
 *
 * @example
 * ```typescript
 * // Usage
 * const homeUrl = ROUTES.HOME; // Returns '/'
 * const loginUrl = ROUTES.LOGIN; // Returns '/auth/login'
 * ```
 */
export const ROUTES: Record<RouteKey, string> = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/profile/',
  SETTINGS: '/settings',
};
