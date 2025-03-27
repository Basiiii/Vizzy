import { Contact } from './contact.dto';

export class CreateContactDto implements Contact {
  description: string;
  phone_number: string;
}
