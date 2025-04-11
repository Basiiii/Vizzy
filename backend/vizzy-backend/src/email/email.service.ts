import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailTemplates } from './templates';

/**
 * Service responsible for sending emails throughout the application.
 * Uses nodemailer with Gmail as the transport service.
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  /**
   * Creates an instance of EmailService.
   * Initializes the nodemailer transporter with Gmail configuration.
   *
   * @param configService - The NestJS config service for accessing environment variables
   */
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Replaces template variables in the format {{variableName}} with their corresponding values.
   *
   * @param template - The email template string containing variables in {{variableName}} format
   * @param variables - An object mapping variable names to their values
   * @returns The template with all variables replaced with their values
   */
  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Sends an email using the configured transporter.
   *
   * @param options - Email sending options
   * @param options.to - Recipient email address
   * @param options.subject - Email subject
   * @param options.text - Plain text email content (optional)
   * @param options.html - HTML email content (optional)
   * @throws Error if email sending fails
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Sends a welcome email to a newly registered user.
   *
   * @param userEmail - The recipient's email address
   * @param username - The recipient's username to personalize the email
   * @throws Error if email sending fails
   */
  async sendWelcomeEmail(userEmail: string, username: string): Promise<void> {
    const subject = 'Welcome to Vizzy!';
    const html = this.replaceTemplateVariables(EmailTemplates.welcome, {
      username,
    });

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  /**
   * Sends a password reset email containing a reset link with token.
   *
   * @param userEmail - The recipient's email address
   * @param resetToken - The password reset token to include in the reset link
   * @throws Error if email sending fails
   */
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<void> {
    const subject = 'Reset Your Vizzy Password';
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;

    const html = this.replaceTemplateVariables(EmailTemplates.passwordReset, {
      resetLink,
    });

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }
}
