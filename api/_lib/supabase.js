import { createClient } from "@supabase/supabase-js";

// Server-only client — uses the service role key, which bypasses row-level
// security. Only ever import this from files under /api, never from
// browser-facing js/*.js (the underscore prefix keeps this file itself from
// becoming a Vercel route: https://vercel.com/docs/functions#excluding-files).
let serviceClient;

export function getSupabaseServerClient() {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return serviceClient;
}

// Anon-key client for endpoints that only ever read public, RLS-readable
// tables (projects, pricing, journal_posts) — no different in privilege
// from a browser calling Supabase directly, just proxied through our API
// so the frontend has one consistent fetch surface.
let anonClient;

export function getSupabaseAnonClient() {
  if (!anonClient) {
    anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }
  return anonClient;
}
