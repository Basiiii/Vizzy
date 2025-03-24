import { Contact } from '@/types/temp';

// Function to fetch the user's contacts
export async function fetchContacts(): Promise<Contact[]> {
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock contacts data
    return [
      {
        id: 1,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '555-1234',
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-5678',
      },
      {
        id: 3,
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '555-9012',
      },
      { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com' },
    ];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return []; // Return empty array in case of error
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
