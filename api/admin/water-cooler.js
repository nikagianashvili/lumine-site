import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// A lightweight team feed, distinct from Activity (Phase 9's unified
// client/project/task/conversation timeline) - this is social: manual
// posts + automated celebrations. Needs its own table (not just new
// columns on something existing), created by the same pending migration
// as everything else this build has needed - see project memory.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("water_cooler_posts")
      .select("*, team_members(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts: data });
    return;
  }

  if (req.method === "POST") {
    const { body, file_url } = req.body || {};
    if (!body || !body.trim()) {
      res.status(400).json({ error: "Post can't be empty" });
      return;
    }
    const { data, error } = await supabase
      .from("water_cooler_posts")
      .insert({ author_id: auth.member.id, type: "manual", body: body.trim(), file_url: file_url || null })
      .select("*, team_members(name)")
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ post: data });
    return;
  }

  if (req.method === "PATCH") {
    // Toggling a reaction is the only PATCH this endpoint supports - posts
    // aren't editable. Read-modify-write server-side (not a client-sent
    // merged object) so two people reacting at once can't clobber each
    // other's reaction.
    const { id, emoji } = req.body || {};
    if (!id || !emoji) {
      res.status(400).json({ error: "Missing id or emoji" });
      return;
    }
    const { data: existing, error: fetchError } = await supabase
      .from("water_cooler_posts")
      .select("reactions")
      .eq("id", id)
      .single();
    if (fetchError) {
      res.status(500).json({ error: fetchError.message });
      return;
    }
    const reactions = existing.reactions || {};
    const current = reactions[emoji] || [];
    const memberId = auth.member.id;
    reactions[emoji] = current.includes(memberId)
      ? current.filter((m) => m !== memberId)
      : [...current, memberId];
    if (reactions[emoji].length === 0) delete reactions[emoji];

    const { data, error } = await supabase
      .from("water_cooler_posts")
      .update({ reactions })
      .eq("id", id)
      .select("*, team_members(name)")
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ post: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
