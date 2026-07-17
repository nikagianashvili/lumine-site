// GET/POST/PATCH /api/portal/comments — the proofing engine's feedback
// thread on one file. Every call re-derives whether file_id belongs to the
// caller's client_id (via files.client_id or files.engagement_id) before
// touching anything - a client must never be able to read or write
// comments on another client's deliverable by guessing a file id.
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireClientMember } from "./_lib/auth.js";
import { notify } from "../_lib/notify.js";

async function fileInScope(supabase, fileId, clientId) {
  const { data: file } = await supabase.from("files").select("id, client_id, engagement_id").eq("id", fileId).single();
  if (!file) return false;
  if (file.client_id === clientId) return true;
  if (!file.engagement_id) return false;
  const { data: engagement } = await supabase.from("engagements").select("client_id").eq("id", file.engagement_id).single();
  return engagement?.client_id === clientId;
}

export default async function handler(req, res) {
  const auth = await requireClientMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { file_id } = req.query || {};
    if (!file_id) {
      res.status(400).json({ error: "Missing file_id" });
      return;
    }
    if (!(await fileInScope(supabase, file_id, auth.member.client_id))) {
      res.status(403).json({ error: "Not your file" });
      return;
    }

    const { data, error } = await supabase
      .from("deliverable_comments")
      .select("*, client_users(name), team_members(name)")
      .eq("file_id", file_id)
      .order("created_at", { ascending: true });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ comments: data });
    return;
  }

  if (req.method === "POST") {
    const { file_id, body, x_pct, y_pct, timecode_seconds } = req.body || {};
    if (!file_id || !body?.trim()) {
      res.status(400).json({ error: "Missing file_id or comment text" });
      return;
    }
    if (!(await fileInScope(supabase, file_id, auth.member.client_id))) {
      res.status(403).json({ error: "Not your file" });
      return;
    }

    const { data, error } = await supabase
      .from("deliverable_comments")
      .insert({
        file_id,
        body: body.trim(),
        author_client_user_id: auth.member.id,
        x_pct: x_pct ?? null,
        y_pct: y_pct ?? null,
        timecode_seconds: timecode_seconds ?? null,
      })
      .select("*, client_users(name), team_members(name)")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // No admin-side "who owns this deliverable" field exists yet - the
    // uploader is the best available proxy for who should hear about client
    // feedback on it.
    const { data: file } = await supabase.from("files").select("uploaded_by, name").eq("id", file_id).single();
    if (file?.uploaded_by) {
      await notify(supabase, {
        recipientIds: [file.uploaded_by],
        type: "new_comment",
        title: `New comment on ${file.name}`,
        body: body.trim(),
      });
    }

    res.status(201).json({ comment: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, resolved } = req.body || {};
    if (!id || typeof resolved !== "boolean") {
      res.status(400).json({ error: "Missing id or resolved" });
      return;
    }

    const { data: comment } = await supabase.from("deliverable_comments").select("file_id").eq("id", id).single();
    if (!comment || !(await fileInScope(supabase, comment.file_id, auth.member.client_id))) {
      res.status(403).json({ error: "Not your comment" });
      return;
    }

    const { data, error } = await supabase
      .from("deliverable_comments")
      .update({ resolved })
      .eq("id", id)
      .select("*, client_users(name), team_members(name)")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ comment: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
