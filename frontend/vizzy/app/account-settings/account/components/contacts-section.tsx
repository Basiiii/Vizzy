'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Contact } from '@/types/user';

interface ContactsSectionProps {
  initialContacts?: Contact[];
}

export function ContactsSection({
  initialContacts = [],
}: ContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>(
    initialContacts.length > 0
      ? initialContacts
      : [{ id: crypto.randomUUID(), description: '', phone_number: '' }],
  );

  const addContact = () => {
    setContacts([
      ...contacts,
      { id: crypto.randomUUID(), description: '', phone_number: '' },
    ]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
  };

  const updateContact = (
    id: string,
    field: 'description' | 'phone_number',
    value: string,
  ) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Contactos</Label>
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="relative group flex items-center gap-2"
          >
            <Input
              value={contact.description}
              onChange={(e) =>
                updateContact(contact.id, 'description', e.target.value)
              }
              placeholder="Description (e.g. Home, Work)"
              className="flex-1"
            />
            <Input
              value={contact.phone_number}
              onChange={(e) =>
                updateContact(contact.id, 'phone_number', e.target.value)
              }
              placeholder="+351 999 999 999"
              className="flex-1 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeContact(contact.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Remove contact</span>
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addContact}
        className="flex items-center gap-1 rounded-full hover:bg-primary/10 transition-colors"
      >
        <PlusCircle className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">Add Contact</span>
      </Button>

      <p className="text-sm text-muted-foreground">These are your contacts.</p>
    </div>
  );
}
