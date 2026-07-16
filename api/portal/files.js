// GET/PATCH /api/portal/files — the client's deliverables + documents.
// Read-only except for approval_status, which the client is allowed to set
// on their own files (approve / request changes) - every other column on
// `files` stays server-controlled. No upload endpoint here on purpose for
// this first release: clients can review and respond, not add new binary
// content to the agency's storage bucket - a deliberate scope cut, not an
// oversight (see supabase/schema.sql's files.approval_status comment).
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireClientMember } from "./_lib/auth.js";

const BUCKET = "agency-files";
const SIGNED_URL_TTL = 60 * 60;

async function scopedEngagementIds(supabase, clientId) {
  const { data } = await supabase.from("engagements").select("id").eq("client_id", clientId);
  return (data ?? []).map((e) => e.id);
}

export default async function handler(req, res) {
  const auth = await requireClientMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { category } = req.query || {};
    const engagementIds = await scopedEngagementIds(supabase, auth.member.client_id);

    let query = supabase
      .from("files")
      .select("*, team_members(name)")
      .order("created_at", { ascending: false });

    query =
      engagementIds.length > 0
        ? query.or(`client_id.eq.${auth.member.client_id},engagement_id.in.(${engagementIds.join(",")})`)
        : query.eq("client_id", auth.member.client_id);

    if (category) query = query.eq("category", category);

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

  if (req.method === "PATCH") {
    const { id, approval_status } = req.body || {};
    if (!id || !["approved", "changes_requested"].includes(approval_status)) {
      res.status(400).json({ error: "Missing id or invalid approval_status" });
      return;
    }

    const engagementIds = await scopedEngagementIds(supabase, auth.member.client_id);
    const { data: file, error: fetchError } = await supabase.from("files").select("id, client_id, engagement_id").eq("id", id).single();
    if (fetchError || !file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    const inScope = file.client_id === auth.member.client_id || engagementIds.includes(file.engagement_id);
    if (!inScope) {
      res.status(403).json({ error: "Not your file" });
      return;
    }

    const { data, error } = await supabase
      .from("files")
      .update({ approval_status })
      .eq("id", id)
      .select("*, team_members(name)")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ file: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
