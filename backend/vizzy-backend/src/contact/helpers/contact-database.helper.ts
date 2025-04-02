import { SupabaseClient } from '@supabase/supabase-js';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { ContactCreationException } from '../exceptions/contact.exception';
import { ContactNotFoundException } from '../exceptions/contact.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class ContactDatabaseHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    ContactDatabaseHelper.logger = logger;
  }
  static async insertContact(
    supabase: SupabaseClient,
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    ContactDatabaseHelper.logger.info(
      `Helper insertContact called for userId: ${userId}`,
    );
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: dto.name,
        description: dto.description,
        phone_number: dto.phone_number,
        user_id: userId,
      })
      .select('id, name, phone_number, description')
      .single();

    if (error) {
      ContactDatabaseHelper.logger.error(
        `Error inserting contact for user ${userId}: ${error.message}`,
      );
      throw new ContactCreationException(
        `Failed to add contact: ${error.message}`,
      );
    }
    if (!data) {
      ContactDatabaseHelper.logger.error(
        `No data returned after inserting contact for user ${userId}`,
      );
      throw new ContactCreationException(
        'No data returned after contact creation',
      );
    }
    ContactDatabaseHelper.logger.info(
      `Contact for user ${userId} successfully created`,
    );

    return data;
  }

  static async getContacts(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<ContactResponseDto[]> {
    ContactDatabaseHelper.logger.info(
      `Helper getContacts called for userId: ${userId}`,
    );
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, phone_number, description')
      .eq('user_id', userId);

    if (error) {
      ContactDatabaseHelper.logger.error(
        `Error fetching contacts for user ${userId}: ${error.message}`,
      );
      throw new ContactCreationException(
        `Failed to fetch contacts: ${error.message}`,
      );
    }

    ContactDatabaseHelper.logger.info(`Contacts fetched for userId: ${userId}`);
    return data ?? [];
  }

  static async deleteContact(
    supabase: SupabaseClient,
    contactId: string,
    userId: string,
  ): Promise<void> {
    ContactDatabaseHelper.logger.info(
      `Helper deleteContact called for contactId: ${contactId}, userId: ${userId}`,
    );
    // First check if contact exists and belongs to user
    const { data: existingContact } = await supabase
      .from('contacts')
      .select()
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (!existingContact) {
      ContactDatabaseHelper.logger.error(
        `Contact with ID ${contactId} not found or doesn't belong to user ${userId}`,
      );
      throw new ContactNotFoundException(
        `Contact with ID ${contactId} not found or doesn't belong to user`,
      );
    }

    // If contact exists and belongs to user, proceed with deletion
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', userId);

    if (error) {
      ContactDatabaseHelper.logger.error(
        `Error deleting contact with ID ${contactId} for user ${userId}: ${error.message}`,
      );
      throw new ContactCreationException(
        `Failed to delete contact: ${error.message}`,
      );
    }
    ContactDatabaseHelper.logger.info(
      `Contact with ID ${contactId} successfully deleted for user ${userId}`,
    );
  }
}
