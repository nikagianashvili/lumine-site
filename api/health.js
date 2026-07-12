// Smoke-test endpoint: confirms env vars are wired and the Supabase client
// can connect, before any real feature is built on top of it.
// Visit /api/health (via `vercel dev` or a deployed preview) once
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are set.
import { getSupabaseServerClient } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const hasEnv = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (!hasEnv) {
    res.status(500).json({ ok: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars" });
    return;
  }

  try {
    const supabase = getSupabaseServerClient();
    // auth.getSession() just confirms the client + keys are valid, no table required
    await supabase.auth.getSession();
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
