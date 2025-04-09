import { ContactValidationException } from '../exceptions/contact.exception';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import {
  UpdateContactDto,
  updateContactSchema,
} from '@/dtos/contact/update-contact.dto';

/**
 * Helper class for validating contact-related inputs
 * Provides methods to validate different aspects of contact operations
 */
export class ContactValidator {
  /**
   * Validates input for contact creation
   * @param userId - ID of the user creating the contact
   * @param dto - Data for creating the contact
   * @throws ContactValidationException if userId is empty or required fields are missing
   */
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

  /**
   * Validates a user ID
   * @param userId - ID of the user to validate
   * @throws ContactValidationException if userId is empty
   */
  static validateUserId(userId: string): void {
    if (!userId) {
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
  }

  /**
   * Validates a contact ID
   * @param contactId - ID of the contact to validate
   * @throws ContactValidationException if contactId is empty
   */
  static validateContactId(contactId: string): void {
    if (!contactId) {
      throw new ContactValidationException(
        'Invalid contactId: contactId is undefined or empty',
      );
    }
  }

  /**
   * Validates input for contact update
   * @param contactId - ID of the contact to update
   * @param userId - ID of the user who owns the contact
   * @param dto - Data for updating the contact
   * @throws ContactValidationException if any validation fails
   */
  static validateUpdateContactInput(
    contactId: string,
    userId: string,
    dto: UpdateContactDto,
  ): void {
    if (!contactId) {
      throw new ContactValidationException(
        'Invalid contactId: contactId is undefined or empty',
      );
    }
    if (!userId) {
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }

    // Check if the DTO is empty
    if (Object.keys(dto).length === 0) {
      throw new ContactValidationException(
        'Update data is empty, at least one field must be provided',
      );
    }

    // Validate using Zod schema
    try {
      updateContactSchema.parse(dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new ContactValidationException(
          `Invalid contact data: ${error.message}`,
        );
      }
      throw new ContactValidationException('Invalid contact data');
    }
  }

  /**
   * Validates input for contact deletion
   * @param contactId - ID of the contact to delete
   * @param userId - ID of the user who owns the contact
   * @throws ContactValidationException if contactId or userId is empty
   */
  static validateDeleteContactInput(contactId: string, userId: string): void {
    if (!contactId) {
      throw new ContactValidationException(
        'Invalid contactId: contactId is undefined or empty',
      );
    }
    if (!userId) {
      throw new ContactValidationException(
        'Invalid userId: userId is undefined or empty',
      );
    }
  }
}
