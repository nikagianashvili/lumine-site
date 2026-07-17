import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

const BUCKET = "agency-files";
const SIGNED_URL_TTL = 60 * 60;

// A lightweight team feed, distinct from Activity (Phase 9's unified
// client/project/task/conversation timeline) - this is social: manual
// posts + automated celebrations, now with real shared files (file_id,
// same signed-URL-per-request pattern as api/admin/files.js) alongside the
// legacy pasted-link field.
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
      .select("*, team_members(name), files(id, name, path, content_type, size_bytes), water_cooler_comments(id)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const withUrls = await Promise.all(
      data.map(async (post) => {
        const { water_cooler_comments, files, ...rest } = post;
        let file = null;
        if (files) {
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(files.path, SIGNED_URL_TTL);
          file = { ...files, url: signed?.signedUrl ?? null };
        }
        return { ...rest, file, comment_count: water_cooler_comments?.length ?? 0 };
      }),
    );
    res.status(200).json({ posts: withUrls });
    return;
  }

  if (req.method === "POST") {
    const { body, file_url, file_id } = req.body || {};
    if (!body?.trim() && !file_url && !file_id) {
      res.status(400).json({ error: "Post can't be empty" });
      return;
    }
    const { data, error } = await supabase
      .from("water_cooler_posts")
      .insert({
        author_id: auth.member.id,
        type: "manual",
        body: body?.trim() || "",
        file_url: file_url || null,
        file_id: file_id || null,
      })
      .select("*, team_members(name), files(id, name, path, content_type, size_bytes)")
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    let file = null;
    if (data.files) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(data.files.path, SIGNED_URL_TTL);
      file = { ...data.files, url: signed?.signedUrl ?? null };
    }
    const { files, ...rest } = data;
    res.status(201).json({ post: { ...rest, file, comment_count: 0 } });
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
      .select("*, team_members(name), files(id, name, path, content_type, size_bytes)")
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    let file = null;
    if (data.files) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(data.files.path, SIGNED_URL_TTL);
      file = { ...data.files, url: signed?.signedUrl ?? null };
    }
    const { files, ...rest } = data;
    res.status(200).json({ post: { ...rest, file } });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
