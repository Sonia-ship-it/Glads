import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;
  private readonly fetchWithRetry: typeof fetch;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    const retryAttempts = Number(
      this.configService.get<string>('SUPABASE_FETCH_RETRY_ATTEMPTS') || '2',
    );
    const retryDelayMs = Number(
      this.configService.get<string>('SUPABASE_FETCH_RETRY_DELAY_MS') || '250',
    );

    this.fetchWithRetry = (async (input: RequestInfo | URL, init?: RequestInit) => {
      let attempt = 0;
      while (attempt < retryAttempts) {
        try {
          return await fetch(input, init);
        } catch (error: any) {
          attempt += 1;
          const isTimeout = this.isConnectTimeout(error);
          if (!isTimeout || attempt >= retryAttempts) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
      return fetch(input, init);
    }) as typeof fetch;

    // Client for user-level operations
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: this.fetchWithRetry,
      },
    });

    // Admin client for privileged operations
    this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        fetch: this.fetchWithRetry,
      },
    });
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
          fetch: this.fetchWithRetry,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );
  }

  private isConnectTimeout(error: any): boolean {
    const code = error?.code;
    const causeCode = error?.cause?.code;
    const message = String(error?.message || '').toLowerCase();
    return (
      code === 'UND_ERR_CONNECT_TIMEOUT' ||
      causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
      message.includes('connect timeout')
    );
  }
}
