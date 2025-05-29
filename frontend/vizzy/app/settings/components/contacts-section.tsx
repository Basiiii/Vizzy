import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/common/button';
import { PlusCircle } from 'lucide-react';
import { ContactForm } from './contact-form';
import { ContactsList } from './contacts-list';
import { useContacts } from '../hooks/useContacts';
import { useTranslations } from 'next-intl';

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

  const t = useTranslations('accountSettings.profileTab.contacts');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowContactForm(!showContactForm)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('addContactButton')}</span>
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
