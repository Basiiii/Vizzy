import { Contact } from '@/types/temp';

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
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a random ID (in a real app, this would be done by the server)
    const newContact: Contact = {
      id: Date.now(),
      ...contact,
    };

    return newContact;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw new Error('Failed to add contact');
  }
}

// Function to delete a contact
export async function deleteContact(id: number): Promise<void> {
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, we would handle the response from the server
    console.log(`Contact with ID ${id} deleted successfully`);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Failed to delete contact');
  }
}
