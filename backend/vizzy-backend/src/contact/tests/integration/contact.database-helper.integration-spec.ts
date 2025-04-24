import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ContactDatabaseHelper } from '../../helpers/contact-database.helper';
import { CreateContactDto } from '@/dtos/contact/create-contact.dto';
import { UpdateContactDto } from '@/dtos/contact/update-contact.dto';
import {
  ContactCreationException,
  ContactNotFoundException,
} from '../../exceptions/contact.exception';

describe('ContactDatabaseHelper Integration Tests', () => {
  let supabase: SupabaseClient;
  const testUser1Id = '11111111-1111-1111-1111-111111111111';
  const testUser2Id = '22222222-2222-2222-2222-222222222222';
  const nonExistentContactId = '999';

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('contacts').select('count').single();
    if (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data before each test
    await supabase.from('contacts').delete().eq('user_id', testUser1Id);
    await supabase.from('contacts').delete().eq('user_id', testUser2Id);

    const workContact: CreateContactDto = {
      name: 'Work Mobile',
      description: 'Primary work contact',
      phone_number: '+351999000111',
    };

    const user2Contact: CreateContactDto = {
      name: 'Test User 2 Contact',
      description: 'Contact for testing user 2 scenarios',
      phone_number: '+351999000333',
    };

    await ContactDatabaseHelper.insertContact(
      supabase,
      testUser1Id,
      workContact,
    );
    await ContactDatabaseHelper.insertContact(
      supabase,
      testUser2Id,
      user2Contact,
    );
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('contacts').delete().eq('user_id', testUser1Id);
    await supabase.from('contacts').delete().eq('user_id', testUser2Id);
  });

  describe('basic operations', () => {
    describe('insertContact', () => {
      it('should successfully create a new contact method for a user', async () => {
        const createContactDto: CreateContactDto = {
          name: 'Home Office',
          description: 'Available for remote work inquiries',
          phone_number: '+351999000111',
        };

        const result = await ContactDatabaseHelper.insertContact(
          supabase,
          testUser1Id,
          createContactDto,
        );

        expect(result).toBeDefined();
        expect(result.name).toBe(createContactDto.name);
        expect(result.phone_number).toBe(createContactDto.phone_number);
        expect(result.description).toBe(createContactDto.description);
      });
    });

    describe('getContacts', () => {
      it('should return all contact methods for a user', async () => {
        const contacts = await ContactDatabaseHelper.getContacts(
          supabase,
          testUser1Id,
        );

        expect(contacts).toBeDefined();
        expect(Array.isArray(contacts)).toBe(true);
        expect(contacts.length).toBeGreaterThan(0);
        expect(contacts[0]).toHaveProperty('id');
        expect(contacts[0]).toHaveProperty('name');
        expect(contacts[0]).toHaveProperty('phone_number');
        const workContact = contacts.find((c) => c.name === 'Work Mobile');
        expect(workContact).toBeDefined();
        expect(workContact.name).toBe('Work Mobile');
      });

      it('should return empty array for user with no contacts', async () => {
        const emptyUserId = '33333333-3333-3333-3333-333333333333';
        const contacts = await ContactDatabaseHelper.getContacts(
          supabase,
          emptyUserId,
        );

        expect(contacts).toBeDefined();
        expect(Array.isArray(contacts)).toBe(true);
        expect(contacts.length).toBe(0);
      });
    });

    describe('getContactById', () => {
      it('should return contact method by ID', async () => {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, name')
          .eq('user_id', testUser1Id)
          .eq('name', 'Work Mobile')
          .limit(1);

        const contact = contacts?.[0];
        expect(contact).toBeDefined();
        const contactId = contact?.id;

        const result = await ContactDatabaseHelper.getContactById(
          supabase,
          contactId.toString(),
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(contactId);
        expect(result.name).toBe('Work Mobile');
      });

      it('should throw ContactNotFoundException for non-existent contact', async () => {
        await expect(
          ContactDatabaseHelper.getContactById(supabase, nonExistentContactId),
        ).rejects.toThrow(ContactNotFoundException);
      });
    });

    describe('updateContact', () => {
      it('should successfully update a contact method', async () => {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', testUser1Id)
          .eq('name', 'Work Mobile')
          .limit(1);

        const contact = contacts?.[0];
        expect(contact).toBeDefined();
        const contactId = contact?.id?.toString() ?? '';

        const updateContactDto: UpdateContactDto = {
          name: 'Primary Work Mobile',
          description: 'Main business contact number',
          phone_number: '+351999888777',
        };

        const result = await ContactDatabaseHelper.updateContact(
          supabase,
          contactId,
          testUser1Id,
          updateContactDto,
        );

        expect(result).toBeDefined();
        expect(result.name).toBe(updateContactDto.name);
        expect(result.phone_number).toBe(updateContactDto.phone_number);
        expect(result.description).toBe(updateContactDto.description);
      });

      it('should throw ContactNotFoundException when updating non-existent contact', async () => {
        const updateContactDto: UpdateContactDto = {
          name: 'Invalid Contact',
          description: 'Will Fail',
        };

        await expect(
          ContactDatabaseHelper.updateContact(
            supabase,
            nonExistentContactId,
            testUser1Id,
            updateContactDto,
          ),
        ).rejects.toThrow(ContactNotFoundException);
      });

      it('should throw ContactNotFoundException when updating contact owned by different user', async () => {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', testUser2Id)
          .eq('name', 'Test User 2 Contact')
          .limit(1);

        const contact = contacts?.[0];
        expect(contact).toBeDefined();
        const contactId = contact?.id?.toString() ?? '';

        const updateContactDto: UpdateContactDto = {
          name: 'Unauthorized Update',
          description: 'Will Fail - Not my contact',
        };

        await expect(
          ContactDatabaseHelper.updateContact(
            supabase,
            contactId,
            testUser1Id,
            updateContactDto,
          ),
        ).rejects.toThrow(ContactNotFoundException);
      });
    });

    describe('deleteContact', () => {
      it('should successfully delete a contact method', async () => {
        const deleteTestContact: CreateContactDto = {
          name: 'Contact To Delete',
          description: 'This contact will be deleted',
          phone_number: '+351999000444',
        };

        const createdContact = await ContactDatabaseHelper.insertContact(
          supabase,
          testUser1Id,
          deleteTestContact,
        );

        expect(createdContact).toBeDefined();
        const contactId = createdContact.id.toString();

        await expect(
          ContactDatabaseHelper.deleteContact(supabase, contactId, testUser1Id),
        ).resolves.not.toThrow();

        await expect(
          ContactDatabaseHelper.getContactById(supabase, contactId),
        ).rejects.toThrow(ContactNotFoundException);
      });

      it('should throw ContactNotFoundException when deleting non-existent contact', async () => {
        await expect(
          ContactDatabaseHelper.deleteContact(
            supabase,
            nonExistentContactId,
            testUser1Id,
          ),
        ).rejects.toThrow(ContactNotFoundException);
      });

      it('should throw ContactNotFoundException when deleting contact owned by different user', async () => {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', testUser2Id)
          .eq('name', 'Test User 2 Contact')
          .limit(1);

        const contact = contacts?.[0];
        expect(contact).toBeDefined();
        const contactId = contact?.id?.toString() ?? '';

        await expect(
          ContactDatabaseHelper.deleteContact(supabase, contactId, testUser1Id),
        ).rejects.toThrow(ContactNotFoundException);
      });
    });
  });

  // Contact limit test to demonstrate limit behavior
  describe('contact limits', () => {
    it('should allow deletion even when contact limit is reached', async () => {
      for (let i = 0; i < 3; i++) {
        await ContactDatabaseHelper.insertContact(supabase, testUser1Id, {
          name: `Additional Phone ${i + 1}`,
          description: `Additional contact method ${i + 1}`,
          phone_number: `+35199900${i + 1}`,
        });
      }

      const lastContact = await ContactDatabaseHelper.insertContact(
        supabase,
        testUser1Id,
        {
          name: 'Fifth Contact',
          description: 'This is the fifth contact',
          phone_number: '+351999000555',
        },
      );

      const extraContact: CreateContactDto = {
        name: 'Extra Contact',
        description: 'Should fail - too many contacts',
        phone_number: '+351999000666',
      };

      // This should be the 6th contact (exceeding limit of 5)
      await expect(
        ContactDatabaseHelper.insertContact(
          supabase,
          testUser1Id,
          extraContact,
        ),
      ).rejects.toThrow(ContactCreationException);

      await expect(
        ContactDatabaseHelper.deleteContact(
          supabase,
          lastContact.id.toString(),
          testUser1Id,
        ),
      ).resolves.not.toThrow();

      await expect(
        ContactDatabaseHelper.insertContact(
          supabase,
          testUser1Id,
          extraContact,
        ),
      ).resolves.not.toThrow();
    });
  });
});
