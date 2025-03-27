import { Contact } from './contact.dto';

export interface ContactResponseDto extends Contact {
  id: string;
  created_at: Date;
}
