import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";
import { notify } from "../_lib/notify.js";

export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ tasks: data });
    return;
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.from("tasks").insert(req.body).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (data.assignee && data.assignee !== auth.member.id) {
      await notify(supabase, {
        recipientIds: [data.assignee],
        type: "task_assigned",
        title: `New task: ${data.title}`,
        target: { page: "program", taskQuery: data.title },
      });
    }
    res.status(201).json({ task: data });
    return;
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    // Only reassignment (not every field edit routed through this generic
    // PATCH) should notify - fetch the prior assignee first to tell the two
    // apart.
    let previousAssignee = null;
    if (Object.prototype.hasOwnProperty.call(updates, "assignee")) {
      const { data: prior } = await supabase.from("tasks").select("assignee").eq("id", id).single();
      previousAssignee = prior?.assignee ?? null;
    }

    const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (data.assignee && data.assignee !== previousAssignee && data.assignee !== auth.member.id) {
      await notify(supabase, {
        recipientIds: [data.assignee],
        type: "task_assigned",
        title: `New task: ${data.title}`,
        target: { page: "program", taskQuery: data.title },
      });
    }
    res.status(200).json({ task: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
