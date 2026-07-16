// POST /api/portal/login — proxies Supabase's password sign-in, same shape
// as api/admin/login.js, but additionally confirms the signed-in user has
// a client_users row before handing back a session. Without this check, a
// team member's own credentials would sign into the portal too (a valid
// Supabase session for a person with no client_users row) and see nothing
// useful, or worse, a confusing 403 on the first real request instead of a
// clear "wrong login" at the door.
import { getSupabaseAnonClient, getSupabaseServerClient } from "../_lib/supabase.js";

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
    const anon = getSupabaseAnonClient();
    const { data, error } = await anon.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      res.status(401).json({ error: error?.message || "Invalid credentials" });
      return;
    }

    const service = getSupabaseServerClient();
    const { data: member } = await service
      .from("client_users")
      .select("id, name, clients(name, company)")
      .eq("id", data.user.id)
      .single();

    if (!member) {
      // Revokes the (otherwise-valid) session rather than handing it back -
      // a person with real Supabase credentials but no portal account
      // should see a clean "not a portal account" here, not a session
      // that then fails on every subsequent request.
      await service.auth.admin.signOut(data.session.access_token).catch(() => {});
      res.status(403).json({ error: "This account doesn't have portal access. Contact Lumine if this is unexpected." });
      return;
    }

    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: member.name || null,
        company: member.clients?.company || member.clients?.name || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
}
