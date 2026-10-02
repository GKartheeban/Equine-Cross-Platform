import { createBrowserClient } from "@supabase/ssr";

// Supabase client for code that runs in the visitor's browser.
// Uses the public URL and anon key from .env.local (safe to expose).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
