import { Button } from '@/components/ui/common/button';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/common/label';

interface ContactFormProps {
  newContact: {
    name: string;
    phone_number: string;
    description: string;
  };
  onContactChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  isAddingContact: boolean;
}

export function ContactForm({
  newContact,
  onContactChange,
  onCancel,
  onSave,
  isAddingContact,
}: ContactFormProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactName">Name</Label>
            <Input
              id="contactName"
              placeholder="Contact name"
              value={newContact.name}
              onChange={(e) => onContactChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone Number</Label>
            <Input
              id="contactPhone"
              placeholder="Phone number"
              value={newContact.phone_number}
              onChange={(e) => onContactChange('phone_number', e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="contactDescription">Description</Label>
            <Input
              id="contactDescription"
              placeholder="Description"
              value={newContact.description}
              onChange={(e) => onContactChange('description', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isAddingContact}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={
              !newContact.name ||
              !newContact.description ||
              !newContact.phone_number ||
              isAddingContact
            }
            className="cursor-pointer"
          >
            {isAddingContact ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
