import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// Account-level folders only (Phase 9) - non-project material like "Brand
// Assets" or "Templates". Project files don't need a folder row at all;
// they're just files with engagement_id set, shown on the project's own
// page (see api/admin/files.js).
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase.from("folders").select("*").order("name", { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ folders: data });
    return;
  }

  if (req.method === "POST") {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      res.status(400).json({ error: "Folder needs a name" });
      return;
    }
    const { data, error } = await supabase.from("folders").insert({ name: name.trim() }).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ folder: data });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
