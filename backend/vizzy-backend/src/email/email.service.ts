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
}
