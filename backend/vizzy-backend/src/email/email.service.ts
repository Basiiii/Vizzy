import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

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

  async sendWelcomeEmail(userEmail: string, username: string): Promise<void> {
    const subject = 'Welcome to Vizzy!';
    const html = `
      <h1>Welcome to Vizzy, ${username}!</h1>
      <p>We're excited to have you on board.</p>
      <p>Start exploring our platform and let us know if you need any help!</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<void> {
    const subject = 'Reset Your Vizzy Password';
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password/${resetToken}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>You've requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>Or enter this code on the reset page: ${resetToken}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }
}
