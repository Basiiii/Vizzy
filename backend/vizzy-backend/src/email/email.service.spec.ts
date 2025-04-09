import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

// Mock EmailTemplates
jest.mock('./templates', () => ({
  EmailTemplates: {
    welcome: 'Welcome {{username}}!',
    passwordReset: 'Reset your password: {{resetLink}}',
  },
}));

describe('EmailService', () => {
  let service: EmailService;

  // Mock data
  const mockSmtpUser = 'test@example.com';
  const mockSmtpPassword = 'password123';
  const mockFrontendUrl = 'https://vizzy.example.com';

  // Mock transporter
  const mockTransporter = {
    sendMail: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Mock createTransport to return our mock transporter
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SMTP_USER') return mockSmtpUser;
              if (key === 'SMTP_PASSWORD') return mockSmtpPassword;
              if (key === 'FRONTEND_URL') return mockFrontendUrl;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should create a nodemailer transporter with correct config', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: mockSmtpUser,
          pass: mockSmtpPassword,
        },
      });
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace template variables with provided values', () => {
      const template = 'Hello {{name}}, welcome to {{service}}!';
      const variables = { name: 'John', service: 'Vizzy' };

      // Use the private method through any type assertion
      const result = (service as any).replaceTemplateVariables(
        template,
        variables,
      );

      expect(result).toBe('Hello John, welcome to Vizzy!');
    });

    it('should handle multiple occurrences of the same variable', () => {
      const template = 'Hello {{name}}, {{name}} is a nice name!';
      const variables = { name: 'John' };

      const result = (service as any).replaceTemplateVariables(
        template,
        variables,
      );

      expect(result).toBe('Hello John, John is a nice name!');
    });
  });

  describe('sendEmail', () => {
    it('should call transporter.sendMail with correct options', async () => {
      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test Text',
        html: '<p>Test HTML</p>',
      };

      await service.sendEmail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockSmtpUser,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });
    });

    it('should throw an error when sendMail fails', async () => {
      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValueOnce(error);

      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
      };

      await expect(service.sendEmail(emailOptions)).rejects.toThrow(
        `Failed to send email: ${error.message}`,
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should call sendEmail with correct parameters', async () => {
      // Spy on sendEmail method
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const userEmail = 'user@example.com';
      const username = 'testuser';

      await service.sendWelcomeEmail(userEmail, username);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: userEmail,
        subject: 'Welcome to Vizzy!',
        html: 'Welcome testuser!',
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should call sendEmail with correct parameters', async () => {
      // Spy on sendEmail method
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const userEmail = 'user@example.com';
      const resetToken = 'abc123';
      const expectedResetLink = `${mockFrontendUrl}/auth/reset-password?token=${resetToken}`;

      await service.sendPasswordResetEmail(userEmail, resetToken);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: userEmail,
        subject: 'Reset Your Vizzy Password',
        html: `Reset your password: ${expectedResetLink}`,
      });
    });
  });
});
