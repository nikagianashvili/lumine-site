import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// Admin-only write path for the `projects` table - the public /api/projects.js
// is read-only (anon client, public-read RLS policy). Writes always go
// through here with the service-role client, same as every other admin
// resource. This is what "Publish to Portfolio" (Archive) calls.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ projects: data });
    return;
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.from("projects").insert(req.body).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ project: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ project: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
