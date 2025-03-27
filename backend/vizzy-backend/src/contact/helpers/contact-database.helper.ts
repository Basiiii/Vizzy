import { SupabaseClient } from '@supabase/supabase-js';
import { ContactResponseDto } from '@/dtos/contact/contact-response.dto';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { ContactCreationException } from '../exceptions/contact.exception';

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
      .select('id, name, phone_number, description, created_at')
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

    return {
      ...data,
      created_at: new Date(data.created_at as string),
    };
  }

  static async getContacts(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<ContactResponseDto[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, phone_number, description, created_at')
      .eq('user_id', userId);

    if (error) {
      throw new ContactCreationException(
        `Failed to fetch contacts: ${error.message}`,
      );
    }

    return (
      data?.map((contact) => ({
        ...contact,
        created_at: new Date(contact.created_at as string),
      })) ?? []
    );
  }
}
