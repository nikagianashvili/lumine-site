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
      .from("engagements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ engagements: data });
    return;
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.from("engagements").insert(req.body).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ engagement: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    // Every status change through "completed" gets its own fresh
    // completed_at + a reset upsell flag - the offboarding-upsell cron
    // (Phase 5) counts 7 days from here. Stamped server-side so it can't
    // drift from client clocks and can't be spoofed by the request body.
    if (updates.status !== undefined) {
      updates.completed_at = updates.status === "completed" ? new Date().toISOString() : null;
      if (updates.status === "completed") updates.upsell_task_created = false;
    }

    let { data, error } = await supabase.from("engagements").update(updates).eq("id", id).select().single();
    if (error && /column .*(completed_at|upsell_task_created)/.test(error.message || "")) {
      // Migration for these two columns hasn't run yet - retry without
      // them rather than blocking every status change until it does.
      delete updates.completed_at;
      delete updates.upsell_task_created;
      ({ data, error } = await supabase.from("engagements").update(updates).eq("id", id).select().single());
    }
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ engagement: data });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { error } = await supabase.from("engagements").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
