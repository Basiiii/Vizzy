import type { Contact } from '@/types/contact';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

/**
 * Fetches the contacts for a specific user.
 * @param {string} userId - The ID of the user whose contacts to fetch.
 * @returns {Promise<Result<Contact[]>>} A Result containing the user's contacts or an error.
 */
export async function fetchContacts(
  userId: string,
): Promise<Result<Contact[]>> {
  return tryCatch(
    (async () => {
      const response = await fetch(getApiUrl(`contacts/user/${userId}`));
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json() as Promise<Contact[]>;
    })(),
  );
}

/**
 * Adds a new contact for the authenticated user.
 * @param {Omit<Contact, 'id'>} contact - The contact data to add (without an ID).
 * @returns {Promise<Result<Contact>>} A Result containing the created contact or an error.
 */
export async function addContact(
  contact: Omit<Contact, 'id'>,
): Promise<Result<Contact>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(getApiUrl('contacts'), {
        method: 'POST',
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(contact),
      });

      if (!response.ok) throw new Error('Failed to add contact');
      return response.json() as Promise<Contact>;
    })(),
  );
}

/**
 * Deletes a contact by its ID for the authenticated user.
 * @param {number} id - The ID of the contact to delete.
 * @returns {Promise<Result<void>>} A Result indicating success or an error.
 */
export async function deleteContact(id: number): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(getApiUrl(`contacts/${id}`), {
        method: 'DELETE',
        headers: createAuthHeaders(accessToken),
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      return undefined;
    })(),
  );
}
