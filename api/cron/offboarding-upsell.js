import { getSupabaseServerClient } from "../_lib/supabase.js";

// Vercel Cron (see vercel.json) - runs on a schedule, not behind a logged-in
// session, so it's gated by CRON_SECRET instead of requireTeamMember. Set
// CRON_SECRET in the Vercel project env vars; Vercel automatically sends it
// as `Authorization: Bearer <CRON_SECRET>` when it invokes a cron route. If
// CRON_SECRET isn't set, the check is skipped (matches Vercel's own docs -
// still callable, just unsecured until it's configured).
//
// The rule (Phase 5): a Solo Service (non-retainer) engagement that's been
// `completed` for 7+ days gets a one-time high-priority task for Tamuna
// pitching the client on a retainer. upsell_task_created guards against
// creating it twice on repeated daily runs.
export default async function handler(req, res) {
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const supabase = getSupabaseServerClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from("engagements")
    .select("id, title, client_id, completed_at")
    .eq("is_retainer", false)
    .eq("status", "completed")
    .eq("upsell_task_created", false)
    .lte("completed_at", sevenDaysAgo);

  if (error) {
    // Most likely cause: the Phase 5 migration hasn't run yet (is_retainer /
    // completed_at / upsell_task_created don't exist) - report it plainly
    // rather than silently doing nothing, since no one's watching this run.
    res.status(500).json({ error: error.message });
    return;
  }

  // No stable role-based lookup exists yet (that's Phase 7's skills_tags) -
  // matching by name is the best available mechanism today.
  const { data: tamuna } = await supabase
    .from("team_members")
    .select("id")
    .ilike("name", "Tamuna")
    .maybeSingle();

  let created = 0;
  for (const engagement of candidates ?? []) {
    const { data: client } = await supabase
      .from("clients")
      .select("name, email")
      .eq("id", engagement.client_id)
      .maybeSingle();
    const clientLabel = client?.name || client?.email || "this client";

    const { error: taskError } = await supabase.from("tasks").insert({
      title: `Pitch ${clientLabel} the Growth Retainer Package`,
      description: `"${engagement.title}" wrapped up as a one-off over a week ago - worth a follow-up pitch for an ongoing retainer.`,
      status: "todo",
      priority: "high",
      assignee: tamuna?.id ?? null,
      engagement_id: null,
    });
    if (taskError) continue;

    await supabase.from("engagements").update({ upsell_task_created: true }).eq("id", engagement.id);
    created += 1;
  }

  res.status(200).json({ checked: candidates?.length ?? 0, created });
}
