// Best-effort notification insert, shared by every /api handler that
// creates a notification-worthy event (task assigned, new lead, deliverable
// comment). Failing to notify must never fail the action that triggered it.
export async function notify(supabase, { recipientIds, type, title, body, target }) {
  const rows = [...new Set((recipientIds || []).filter(Boolean))].map((recipient_id) => ({
    recipient_id,
    type,
    title,
    body: body ?? null,
    target: target ?? null,
  }));
  if (rows.length === 0) return;
  try {
    await supabase.from("notifications").insert(rows);
  } catch {
    // non-critical side effect - swallow and move on
  }
}
