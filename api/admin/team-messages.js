import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();
  const me = auth.member.id;

  if (req.method === "GET") {
    // Every message the signed-in member sent or received - the client
    // groups these into per-teammate threads, cheaper than one query per
    // thread and this table stays small (1:1 chat, not a firehose).
    const { data, error } = await supabase
      .from("team_messages")
      .select("*")
      .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
      .order("created_at", { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // "Delivered" for this polling-based chat means the recipient's own
    // client has fetched it at least once - stamp any message addressed to
    // me that hasn't been yet, mirroring how read_at is stamped by the
    // recipient's own action rather than the sender's.
    const undelivered = data.filter((m) => m.recipient_id === me && !m.delivered_at);
    if (undelivered.length > 0) {
      const now = new Date().toISOString();
      await supabase
        .from("team_messages")
        .update({ delivered_at: now })
        .in("id", undelivered.map((m) => m.id));
      undelivered.forEach((m) => (m.delivered_at = now));
    }

    res.status(200).json({ messages: data });
    return;
  }

  if (req.method === "POST") {
    const { recipient_id, body, attachment } = req.body || {};
    if (!recipient_id || (!body?.trim() && !attachment)) {
      res.status(400).json({ error: "Missing recipient_id, and either a body or an attachment" });
      return;
    }
    const { data, error } = await supabase
      .from("team_messages")
      .insert({ sender_id: me, recipient_id, body: body?.trim() || "", attachment: attachment || null })
      .select()
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ message: data });
    return;
  }

  if (req.method === "PATCH") {
    // Marking read only ever applies to messages *sent to* the signed-in
    // member - the .eq("recipient_id", me) guard means a client can never
    // mark their own outgoing messages read.
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    const { data, error } = await supabase
      .from("team_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("recipient_id", me)
      .select()
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ message: data });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
