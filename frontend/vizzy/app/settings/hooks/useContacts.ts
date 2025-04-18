import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Contact } from '@/types/contact';
import {
  addContact,
  deleteContact,
  fetchContacts,
} from '@/lib/api/contacts/contacts';
import { getClientUser } from '@/lib/utils/token/get-client-user';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    description: '',
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isDeletingContact, setIsDeletingContact] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function loadContacts() {
      const userData = getClientUser();
      if (!userData?.username) return;

      const result = await fetchContacts(userData.id);
      if (result.error) {
        console.error('Failed to load contacts:', result.error);
        toast('Failed to load contacts. Please try again later.');
      } else {
        setContacts(result.data ?? []);
      }
      setIsLoading(false);
    }

    loadContacts();
  }, []);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone_number || !newContact.description)
      return;

    setIsAddingContact(true);
    const result = await addContact(newContact);
    if (result.error) {
      console.error('Failed to add contact:', result.error);
      toast('Failed to add contact. Please try again later.');
    } else if (result.data) {
      setContacts([...contacts, result.data]);
      setNewContact({ name: '', phone_number: '', description: '' });
      setShowContactForm(false);
      toast('The contact has been added successfully.');
    }
    setIsAddingContact(false);
  };

  const handleDeleteContact = async (id: number) => {
    setIsDeletingContact(id);
    const result = await deleteContact(id);
    if (result.error) {
      console.error('Failed to delete contact:', result.error);
      toast('Failed to delete contact. Please try again later.');
    } else {
      setContacts(contacts.filter((contact) => contact.id !== id));
      toast('The contact has been deleted successfully.');
    }
    setIsDeletingContact(null);
  };

  return {
    contacts,
    isLoading,
    newContact,
    setNewContact,
    showContactForm,
    setShowContactForm,
    isAddingContact,
    isDeletingContact,
    handleAddContact,
    handleDeleteContact,
  };
}
