import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

const BUCKET = "agency-files";
// The bucket has a 10MB Supabase-side limit; capped lower here so the
// base64-encoded body (~33% larger than the raw file) stays well under
// Vercel's default serverless body-size limit.
const MAX_BYTES = 6 * 1024 * 1024;
const SIGNED_URL_TTL = 60 * 60; // 1 hour - regenerated fresh on every GET

// Real file storage (Phase 9) - private bucket, everything routes through
// this service-role endpoint (upload, list, delete) rather than
// storage.objects RLS policies, which would need SQL this environment
// can't run. Same architecture as every other admin table: no direct
// client access, service role bypasses RLS, trust the /api layer.
export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { category, folder_id, engagement_id, client_id } = req.query || {};
    let query = supabase.from("files").select("*, team_members(name)").order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    if (folder_id) query = query.eq("folder_id", folder_id);
    if (engagement_id) query = query.eq("engagement_id", engagement_id);
    if (client_id) query = query.eq("client_id", client_id);

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const withUrls = await Promise.all(
      data.map(async (file) => {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(file.path, SIGNED_URL_TTL);
        return { ...file, url: signed?.signedUrl ?? null };
      }),
    );
    res.status(200).json({ files: withUrls });
    return;
  }

  if (req.method === "POST") {
    const { filename, contentType, dataBase64, category, folder_id, engagement_id, client_id, skills_tags } =
      req.body || {};
    if (!filename || !dataBase64) {
      res.status(400).json({ error: "Missing filename or file data" });
      return;
    }

    const buffer = Buffer.from(dataBase64, "base64");
    if (buffer.length > MAX_BYTES) {
      res.status(413).json({ error: `File too large - ${Math.round(MAX_BYTES / 1024 / 1024)}MB max for now` });
      return;
    }

    const path = `${category || "creative"}/${randomUUID()}-${filename}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: contentType || "application/octet-stream" });
    if (uploadError) {
      res.status(500).json({ error: uploadError.message });
      return;
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        name: filename,
        path,
        content_type: contentType || null,
        size_bytes: buffer.length,
        category: category || "creative",
        folder_id: folder_id || null,
        engagement_id: engagement_id || null,
        client_id: client_id || null,
        skills_tags: skills_tags || [],
        uploaded_by: auth.member.id,
      })
      .select("*, team_members(name)")
      .single();
    if (error) {
      // Row insert failed after the object was already uploaded - clean up
      // rather than leaving an orphaned blob with no database record.
      await supabase.storage.from(BUCKET).remove([path]);
      res.status(500).json({ error: error.message });
      return;
    }

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    res.status(201).json({ file: { ...data, url: signed?.signedUrl ?? null } });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { data: file } = await supabase.from("files").select("path").eq("id", id).single();
    if (file) await supabase.storage.from(BUCKET).remove([file.path]);
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
