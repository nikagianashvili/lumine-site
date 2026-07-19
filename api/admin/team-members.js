import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ teamMembers: data });
    return;
  }

  if (req.method === "PATCH") {
    // Editing a *teammate's* row (skills_tags, access_level) rather than
    // your own via /api/admin/profile - not access-level gated yet (see
    // Phase 7 note in lib/api.ts: enforcement is deferred, everyone is
    // "admin" for now), so any signed-in team member can currently edit
    // any other's row through this path. Fine while the whole team is
    // trusted-by-default; revisit once access_level is actually enforced.
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { data, error } = await supabase.from("team_members").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ teamMember: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
