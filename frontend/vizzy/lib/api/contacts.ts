import { Contact } from '@/types/contact';
import { getClientCookie } from '../utils/cookies/get-client-cookie';
import { AUTH } from '../constants/auth';

export async function fetchContacts(userId: string): Promise<Contact[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const response = await fetch(
      `${API_URL}/${API_VERSION}/contacts/user/${userId}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Failed to fetch contacts');
  }
}

// Function to add a new contact
export async function addContact(
  contact: Omit<Contact, 'id'>,
): Promise<Contact> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const token = getClientCookie(AUTH.AUTH_TOKEN);
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error('Failed to add contact');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding contact:', error);
    throw new Error('Failed to add contact');
  }
}

// Function to delete a contact
export async function deleteContact(id: number): Promise<void> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const token = getClientCookie(AUTH.AUTH_TOKEN);
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Failed to delete contact');
  }
}
