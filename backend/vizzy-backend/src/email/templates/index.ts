/**
 * Centralizes access to email templates used throughout the application.
 * This module exports all available email templates as a single object.
 */
import { welcomeTemplate } from './welcome.template';
import { passwordResetTemplate } from './password-reset.template';

/**
 * Collection of email templates used by the EmailService.
 */
export const EmailTemplates = {
  welcome: welcomeTemplate,
  passwordReset: passwordResetTemplate,
};
