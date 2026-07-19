import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

// Flat replies on a Water Cooler post - separate endpoint from
// water-cooler.js itself so the main feed query never has to pull every
// comment on every post just to render the list.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { post_id } = req.query || {};
    if (!post_id) {
      res.status(400).json({ error: "Missing post_id" });
      return;
    }
    const { data, error } = await supabase
      .from("water_cooler_comments")
      .select("*, team_members(name)")
      .eq("post_id", post_id)
      .order("created_at", { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ comments: data });
    return;
  }

  if (req.method === "POST") {
    const { post_id, body } = req.body || {};
    if (!post_id || !body?.trim()) {
      res.status(400).json({ error: "Missing post_id or body" });
      return;
    }
    const { data, error } = await supabase
      .from("water_cooler_comments")
      .insert({ post_id, author_id: auth.member.id, body: body.trim() })
      .select("*, team_members(name)")
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ comment: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
