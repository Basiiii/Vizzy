import { Button } from '@/components/ui/common/button';
import { User, Trash2 } from 'lucide-react';
import type { Contact } from '@/types/contact';
import { useTranslations } from 'next-intl';

interface ContactsListProps {
  contacts: Contact[];
  isDeletingContact: number | null;
  onDelete: (id: number) => void;
}

export function ContactsList({
  contacts,
  isDeletingContact,
  onDelete,
}: ContactsListProps) {
  const t = useTranslations('accountSettings.profileTab.contacts');
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">{t('noContacts')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('noContactsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <div className="font-medium">{contact.name}</div>
            <div className="text-sm text-muted-foreground">
              {contact.phone_number}
            </div>
            {contact.description && (
              <div className="text-sm text-muted-foreground">
                {contact.description}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(contact.id)}
            disabled={isDeletingContact === contact.id}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer"
          >
            {isDeletingContact === contact.id ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">{t('deleteContact')}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
