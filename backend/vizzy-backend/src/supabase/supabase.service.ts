import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private publicClient: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    this.publicClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );
    this.adminClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  getPublicClient() {
    return this.publicClient;
  }

  getAdminClient() {
    return this.adminClient;
  }
}
