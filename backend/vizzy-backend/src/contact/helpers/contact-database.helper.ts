import { SupabaseClient } from '@supabase/supabase-js';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { ContactCreationException } from '../exceptions/contact.exception';
import { ContactNotFoundException } from '../exceptions/contact.exception';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';

/**
 * Helper class for database operations related to contacts
 * Provides methods for CRUD operations on contact data in Supabase
 */
export class ContactDatabaseHelper {
  /**
   * Creates a new contact in the database
   * @param supabase - Supabase client instance
   * @param userId - ID of the user creating the contact
   * @param dto - Data for creating the contact
   * @returns The newly created contact
   * @throws ContactCreationException if creation fails or contact limit is reached
   */
  static async insertContact(
    supabase: SupabaseClient,
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    try {
      const { data, error } = await supabase
        .rpc('insert_contact', {
          user_id: userId,
          name: dto.name,
          description: dto.description,
          phone_number: dto.phone_number,
        })
        .single();

      if (error) {
        this.handleInsertError(error);
      }

      return this.transformContactData(data);
    } catch (error) {
      if (error instanceof ContactCreationException) throw error;
      throw new ContactCreationException(
        `Failed to add contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private static handleInsertError(error: any): never {
    if (error.message.includes('Contact limit reached')) {
      throw new ContactCreationException(
        'You have reached the maximum limit of 5 contacts',
      );
    }
    throw new ContactCreationException(
      `Failed to add contact: ${error.message}`,
    );
  }

  private static transformContactData(data: any): ContactResponseDto {
    const typedData = data as {
      contact_id: string;
      contact_name: string;
      contact_phone_number: string;
      contact_description: string;
    };

    if (!typedData?.contact_id || !typedData?.contact_phone_number) {
      throw new ContactCreationException(
        'No data returned after contact creation or missing required fields',
      );
    }

    return {
      id: typedData.contact_id,
      name: typedData.contact_name,
      phone_number: typedData.contact_phone_number,
      description: typedData.contact_description,
    };
  }

  /**
   * Retrieves all contacts for a specific user
   * @param supabase - Supabase client instance
   * @param userId - ID of the user whose contacts to retrieve
   * @returns Array of contacts belonging to the user
   * @throws ContactCreationException if fetching fails
   */
  static async getContacts(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<ContactResponseDto[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, phone_number, description')
      .eq('user_id', userId);

    if (error) {
      throw new ContactCreationException(
        `Failed to fetch contacts: ${error.message}`,
      );
    }

    return data ?? [];
  }

  /**
   * Retrieves a specific contact by its ID
   * @param supabase - Supabase client instance
   * @param contactId - ID of the contact to retrieve
   * @returns The requested contact information
   * @throws ContactNotFoundException if contact is not found
   */
  static async getContactById(
    supabase: SupabaseClient,
    contactId: string,
  ): Promise<ContactResponseDto> {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, phone_number, description')
      .eq('id', contactId)
      .single();

    if (error) {
      throw new ContactNotFoundException(
        `Contact with ID ${contactId} not found`,
      );
    }

    if (!data) {
      throw new ContactNotFoundException(
        `Contact with ID ${contactId} not found`,
      );
    }

    return data;
  }

  /**
   * Updates an existing contact
   * Verifies ownership before updating
   * @param supabase - Supabase client instance
   * @param contactId - ID of the contact to update
   * @param userId - ID of the user who owns the contact
   * @param dto - Data for updating the contact
   * @returns The updated contact information
   * @throws ContactNotFoundException if contact is not found or doesn't belong to user
   * @throws ContactCreationException if update fails
   */
  static async updateContact(
    supabase: SupabaseClient,
    contactId: string,
    userId: string,
    dto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    // First check if contact exists and belongs to user
    const { data: existingContact } = await supabase
      .from('contacts')
      .select()
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (!existingContact) {
      throw new ContactNotFoundException(
        `Contact with ID ${contactId} not found or doesn't belong to user`,
      );
    }

    // If contact exists and belongs to user, proceed with update
    const { data, error } = await supabase
      .from('contacts')
      .update({
        name: dto.name !== undefined ? dto.name : existingContact.name,
        description:
          dto.description !== undefined
            ? dto.description
            : existingContact.description,
        phone_number:
          dto.phone_number !== undefined
            ? dto.phone_number
            : existingContact.phone_number,
      })
      .eq('id', contactId)
      .eq('user_id', userId)
      .select('id, name, phone_number, description')
      .single();

    if (error) {
      throw new ContactCreationException(
        `Failed to update contact: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Deletes a specific contact
   * Verifies ownership before deletion
   * @param supabase - Supabase client instance
   * @param contactId - ID of the contact to delete
   * @param userId - ID of the user who owns the contact
   * @throws ContactNotFoundException if contact is not found or doesn't belong to user
   * @throws ContactCreationException if deletion fails
   */
  static async deleteContact(
    supabase: SupabaseClient,
    contactId: string,
    userId: string,
  ): Promise<void> {
    // First check if contact exists and belongs to user
    const { data: existingContact } = await supabase
      .from('contacts')
      .select()
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (!existingContact) {
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
      throw new ContactCreationException(
        `Failed to delete contact: ${error.message}`,
      );
    }
  }
}
