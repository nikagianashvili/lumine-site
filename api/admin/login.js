// POST /api/admin/login — proxies Supabase's password sign-in server-side
// so the browser never needs its own Supabase keys baked into the Vite
// bundle. Returns the session tokens; the client stores them and sends
// them back as `Authorization: Bearer <access_token>` on admin API calls.
import { getSupabaseAnonClient } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }

  try {
    const supabase = getSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      res.status(401).json({ error: error?.message || "Invalid credentials" });
      return;
    }

    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err) {
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
}
