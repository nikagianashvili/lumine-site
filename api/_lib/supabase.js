import { createClient } from "@supabase/supabase-js";

// Server-only client — uses the service role key, which bypasses row-level
// security. Only ever import this from files under /api, never from
// browser-facing js/*.js (the underscore prefix keeps this file itself from
// becoming a Vercel route: https://vercel.com/docs/functions#excluding-files).
let client;

export function getSupabaseServerClient() {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return client;
}
