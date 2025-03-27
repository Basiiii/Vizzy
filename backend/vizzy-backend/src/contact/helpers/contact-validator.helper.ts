import { ContactValidationException } from '../exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';

export class ContactValidator {
  static validateCreateContactInput(
    userId: string,
    dto: CreateContactDto,
  ): void {
    if (!userId) {
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
    if (!dto.name || !dto.phone_number) {
      throw new ContactValidationException(
        'Name and phone number are required fields',
      );
    }
  }

  static validateUserId(userId: string): void {
    if (!userId) {
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
  }
}
