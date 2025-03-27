import { Contact } from './contact.dto';

export class CreateContactDto implements Contact {
  name: string;
  description: string;
  phone_number: string;
}
