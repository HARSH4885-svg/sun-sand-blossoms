import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Is the backend configured? Lets the UI degrade gracefully instead of crashing. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Service-role client. SERVER ONLY: bypasses RLS. Used for public submission
 * inserts. Nothing in the public site reads submissions back.
 * The key has no NEXT_PUBLIC_ prefix so it is never bundled for the browser.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
