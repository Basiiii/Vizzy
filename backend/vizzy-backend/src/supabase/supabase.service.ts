import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private publicClient: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error('Supabase environment variables are not defined');
    }

    this.publicClient = createClient(supabaseUrl, anonKey);
    this.adminClient = createClient(supabaseUrl, serviceRoleKey);
  }

  getPublicClient(): SupabaseClient {
    return this.publicClient;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
