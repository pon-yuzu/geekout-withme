/// <reference path="../.astro/types.d.ts" />

declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly CLAUDE_API_KEY?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly STRIPE_PRICE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Cloudflare Workers AI binding
interface Ai {
  run(model: string, inputs: Record<string, unknown>): Promise<{ response: string }>;
}

declare namespace App {
  interface Locals {
    user: import('@supabase/supabase-js').User | null;
    supabase: import('@supabase/supabase-js').SupabaseClient | null;
    lang: import('./i18n/index').Lang;
    runtime: {
      env: ImportMetaEnv & {
        AI?: Ai;
        VOICE_ROOM?: DurableObjectNamespace;
      };
    };
  }
}
