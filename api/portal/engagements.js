// GET /api/portal/engagements — read-only, always scoped to the caller's
// own client_id (never a client_id from the request). This is the client's
// project list: what's active, its stage, retainer quota if applicable.
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireClientMember } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = await requireClientMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("engagements")
    .select(
      "id, title, status, start_date, end_date, service_type, is_retainer, retainer_tier, posters_limit, posters_delivered, videos_limit, videos_delivered, created_at",
    )
    .eq("client_id", auth.member.client_id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ engagements: data });
}
