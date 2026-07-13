import { getSupabaseServerClient, getSupabaseAnonClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// PATCH /api/admin/profile — lets a signed-in team member update their own
// team_members row (name, role) and/or their password. Password change
// verifies the CURRENT password first (a real sign-in attempt with the anon
// client) before the service-role client sets the new one — the service
// role could skip that check, but then any hijacked session token could
// silently take over the account.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  if (req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, role, currentPassword, newPassword } = req.body || {};
  const supabase = getSupabaseServerClient();

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password is required" });
      return;
    }
    const anon = getSupabaseAnonClient();
    const { error: verifyError } = await anon.auth.signInWithPassword({
      email: auth.user.email,
      password: currentPassword,
    });
    if (verifyError) {
      // 400, not 401 — the client treats 401 as an expired session and
      // redirects to login, which would log the user out for a typo here
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    const { error: pwError } = await supabase.auth.admin.updateUserById(auth.user.id, {
      password: newPassword,
    });
    if (pwError) {
      res.status(500).json({ error: pwError.message });
      return;
    }
  }

  if (name !== undefined || role !== undefined) {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    const { error: memberError } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", auth.user.id);
    if (memberError) {
      res.status(500).json({ error: memberError.message });
      return;
    }
  }

  res.status(200).json({ ok: true });
}
