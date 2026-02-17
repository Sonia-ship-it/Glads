import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    // Client for user-level operations
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for privileged operations
    this.adminClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Get client for regular operations (respects RLS)
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Get admin client (bypasses RLS)
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  // Helper method to set auth token for RLS
  setAuthToken(token: string) {
    return createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_ANON_KEY'),
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );
  }
}
