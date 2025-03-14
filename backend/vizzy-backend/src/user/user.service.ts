import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserById(userId: string): Promise<User | null> {
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('profiles')
      .select('id, username, name, email, is_deleted, deleted_at')
      .eq('id', userId)
      .single();

    const { data, error } = response as { data: User | null; error: unknown };

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data;
  }
}
