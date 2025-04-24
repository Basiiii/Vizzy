import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Service to interact with Supabase.
 * Provides public and admin clients for database operations.
 */
@Injectable()
export class SupabaseService {
  private publicClient: SupabaseClient;
  private adminClient: SupabaseClient;

  /**
   * Initializes Supabase clients using environment variables.
   * Throws an error if required environment variables are not defined.
   */
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

  /**
   * Gets the public Supabase client.
   * @returns {SupabaseClient} The public client instance.
   */
  getPublicClient(): SupabaseClient {
    return this.publicClient;
  }

  /**
   * Gets the admin Supabase client.
   * @returns {SupabaseClient} The admin client instance.
   */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
