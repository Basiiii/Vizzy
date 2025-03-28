import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Contact } from '@/types/temp';
import { addContact, deleteContact, fetchContacts } from '@/lib/api/contacts';
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

      try {
        const contactsList = await fetchContacts(userData.id);
        setContacts(contactsList);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        toast('Failed to load contacts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadContacts();
  }, []);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone_number || !newContact.description)
      return;

    setIsAddingContact(true);
    try {
      const addedContact = await addContact(newContact);
      setContacts([...contacts, addedContact]);
      setNewContact({ name: '', phone_number: '', description: '' });
      setShowContactForm(false);
      toast('The contact has been added successfully.');
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast('Failed to add contact. Please try again later.');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    setIsDeletingContact(id);
    try {
      await deleteContact(id);
      setContacts(contacts.filter((contact) => contact.id !== id));
      toast('The contact has been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast('Failed to delete contact. Please try again later.');
    } finally {
      setIsDeletingContact(null);
    }
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
