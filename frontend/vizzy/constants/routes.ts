// constants/routes.ts (internal routing for Next.js)
export type RouteKey =
  | 'HOME'
  | 'ABOUT'
  | 'CONTACT'
  | 'PRIVACY_POLICY'
  | 'TERMS_OF_SERVICE'
  | 'LOGIN'
  | 'SIGNUP'
  | 'RESET_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'PROFILE';

export const ROUTES: Record<RouteKey, string> = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: 'profile/',
};
