export type LinkKey =
  | 'HOME'
  | 'ABOUT'
  | 'CONTACT'
  | 'PRIVACY_POLICY'
  | 'TERMS_OF_SERVICE'
  | 'LOGIN'
  | 'SIGNUP'
  | 'RESET_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'GITHUB';

export const LINKS: Record<LinkKey, string> = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: 'auth/change-password',
  GITHUB: 'https://github.com/Basiiii/Vizzy',
};
