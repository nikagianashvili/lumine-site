// GET /api/portal/tasks — read-only progress view. Tasks belong to an
// engagement, not directly to a client, so scoping is a two-step: find
// this client's engagement ids, then tasks within them. Internal fields
// (assignee, priority, hat_tags) are left out - a client doesn't need to
// know which specific team member has an in-progress task, only its stage.
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

  const { data: engagements, error: engagementsError } = await supabase
    .from("engagements")
    .select("id")
    .eq("client_id", auth.member.client_id);

  if (engagementsError) {
    res.status(500).json({ error: engagementsError.message });
    return;
  }

  const engagementIds = engagements.map((e) => e.id);
  if (engagementIds.length === 0) {
    res.status(200).json({ tasks: [] });
    return;
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("id, engagement_id, title, status, stage, due_date, created_at")
    .in("engagement_id", engagementIds)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ tasks: data });
}
