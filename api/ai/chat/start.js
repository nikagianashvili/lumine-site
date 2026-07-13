// POST /api/ai/chat/start — begins a live chat session behind the website's
// chat widget. Requires name + email upfront (unlike the anonymous-until-
// volunteered contact form), so every conversation ties to a real lead from
// message one. Rate-limited per IP since this is a public, unauthenticated
// endpoint that spends real API credit per call.
import { getSupabaseServerClient } from "../../_lib/supabase.js";
import { requestIp } from "../_lib/grounding.js";

const MAX_STARTS_PER_IP_PER_HOUR = 10;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { name, email, phone, company, language } = req.body || {};

    if (!name || !email) {
      res.status(400).json({ error: "Missing required fields (name and email)" });
      return;
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ error: "AI chat isn't configured yet (missing env vars)" });
      return;
    }

    const supabase = getSupabaseServerClient();
    const ip = requestIp(req);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: rateError } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("source", "ai_chat")
      .eq("meta->>ip", ip)
      .gte("created_at", oneHourAgo);

    if (rateError) {
      res.status(500).json({ error: rateError.message });
      return;
    }

    if ((count || 0) >= MAX_STARTS_PER_IP_PER_HOUR) {
      res.status(429).json({ error: "Too many chat sessions started recently. Please try again later." });
      return;
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        source: "ai_chat",
        status: "new",
        meta: { ip, origin: "chat" },
      })
      .select()
      .single();

    if (clientError) {
      res.status(500).json({ error: clientError.message });
      return;
    }

    const { data: conversation, error: convoError } = await supabase
      .from("ai_conversations")
      .insert({
        channel: "chat",
        client_id: client.id,
        language: language === "ka" ? "ka" : "en",
        transcript: [],
        status: "open",
      })
      .select()
      .single();

    if (convoError) {
      res.status(500).json({ error: convoError.message });
      return;
    }

    res.status(200).json({ conversationId: conversation.id });
  } catch (err) {
    res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
}
