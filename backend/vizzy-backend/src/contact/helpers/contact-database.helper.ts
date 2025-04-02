import { SupabaseClient } from '@supabase/supabase-js';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { ContactCreationException } from '../exceptions/contact.exception';
import { ContactNotFoundException } from '../exceptions/contact.exception';

export class ContactDatabaseHelper {
  static async insertContact(
    supabase: SupabaseClient,
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
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
      throw new ContactCreationException(
        `Failed to add contact: ${error.message}`,
      );
    }
    if (!data) {
      throw new ContactCreationException(
        'No data returned after contact creation',
      );
    }

    return data;
  }

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
