import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// SOP wiki (Phase 9) - real structured docs (title + body text, searchable),
// not just uploaded files. Distinct from Folders/files.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("playbook_entries")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ entries: data });
    return;
  }

  if (req.method === "POST") {
    const { title, body, tags } = req.body || {};
    if (!title || !title.trim()) {
      res.status(400).json({ error: "Needs a title" });
      return;
    }
    const { data, error } = await supabase
      .from("playbook_entries")
      .insert({ title: title.trim(), body: body || "", tags: tags || [] })
      .select()
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ entry: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from("playbook_entries").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ entry: data });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { error } = await supabase.from("playbook_entries").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
