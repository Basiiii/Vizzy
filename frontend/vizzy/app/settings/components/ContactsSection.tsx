import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/common/button';
import { PlusCircle } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { ContactsList } from './ContactsList';
import { useContacts } from '../hooks/useContacts';

export function ContactsSection() {
  const {
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
  } = useContacts();

  const handleContactChange = (field: string, value: string) => {
    setNewContact((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Manage your contacts list.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowContactForm(!showContactForm)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showContactForm && (
          <ContactForm
            newContact={newContact}
            onContactChange={handleContactChange}
            onCancel={() => setShowContactForm(false)}
            onSave={handleAddContact}
            isAddingContact={isAddingContact}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <ContactsList
            contacts={contacts}
            isDeletingContact={isDeletingContact}
            onDelete={handleDeleteContact}
          />
        )}
      </CardContent>
    </Card>
  );
}
