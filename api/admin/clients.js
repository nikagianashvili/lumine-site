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
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ clients: data });
    return;
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.from("clients").insert(req.body).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ client: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ client: data });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
