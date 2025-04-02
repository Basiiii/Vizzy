import { ContactValidationException } from '../exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class ContactValidator {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    ContactValidator.logger = logger;
  }
  static validateCreateContactInput(
    userId: string,
    dto: CreateContactDto,
  ): void {
    ContactValidator.logger.info(
      `Validating create contact input for userId: ${userId}`,
    );
    if (!userId) {
      ContactValidator.logger.error(
        'Invalid userId: userId is undefined or empty',
      );
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
    if (!dto.name || !dto.phone_number) {
      ContactValidator.logger.error(
        'Name and phone number are required fields',
      );
      throw new ContactValidationException(
        'Name and phone number are required fields',
      );
    }
  }

  static validateUserId(userId: string): void {
    ContactValidator.logger.info(`Validating userId: ${userId}`);
    if (!userId) {
      ContactValidator.logger.error(
        'Invalid userId: userId is undefined or empty',
      );
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
  }

  static validateDeleteContactInput(contactId: string, userId: string): void {
    ContactValidator.logger.info(
      `Validating delete contact input for contactId: ${contactId}, userId: ${userId}`,
    );
    if (!contactId) {
      ContactValidator.logger.error(
        'Invalid contactId: contactId is undefined or empty',
      );
      throw new ContactValidationException(
        'Invalid contactId: contactId is undefined or empty',
      );
    }
    if (!userId) {
      ContactValidator.logger.error(
        'Invalid userId: userId is undefined or empty',
      );
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
  }
}
