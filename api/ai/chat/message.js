// POST /api/ai/chat/message — sends one visitor message in an existing live
// chat session (see start.js) and returns Claude's reply, grounded the same
// way as the contact-form intake. Multi-turn: the full prior transcript is
// replayed as conversation history on every call.
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "../../_lib/supabase.js";
import { fetchPricing, buildChatSystemPrompt, parseModelJson, CLIENT_STATUSES } from "../_lib/grounding.js";

const MODEL = "claude-sonnet-5";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TRANSCRIPT_ENTRIES = 60; // ~30 exchanges — natural place to hand off to a human
const MIN_MS_BETWEEN_MESSAGES = 1200;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { conversationId, message } = req.body || {};
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!conversationId || !trimmedMessage) {
      res.status(400).json({ error: "Missing required fields (conversationId and message)" });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: "Message is too long" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ error: "AI chat isn't configured yet (missing env vars)" });
      return;
    }

    const supabase = getSupabaseServerClient();

    const { data: conversation, error: fetchError } = await supabase
      .from("ai_conversations")
      .select("*, clients(name, status)")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (conversation.status === "closed") {
      res.status(400).json({ error: "This conversation has been closed. Please start a new one or email hello@lumine.ge." });
      return;
    }

    const transcript = Array.isArray(conversation.transcript) ? conversation.transcript : [];

    const lastEntry = transcript[transcript.length - 1];
    if (lastEntry?.ts && Date.now() - new Date(lastEntry.ts).getTime() < MIN_MS_BETWEEN_MESSAGES) {
      res.status(429).json({ error: "Sending too fast — please wait a moment." });
      return;
    }

    if (transcript.length >= MAX_TRANSCRIPT_ENTRIES) {
      const cappedReply = "We've covered a lot here — a team member will pick this up from here. Thanks for chatting!";
      const nextTranscript = [
        ...transcript,
        { role: "user", content: trimmedMessage, ts: new Date().toISOString() },
        { role: "assistant", content: cappedReply, ts: new Date().toISOString() },
      ];
      await supabase.from("ai_conversations").update({ transcript: nextTranscript, status: "qualified" }).eq("id", conversationId);
      res.status(200).json({ reply: cappedReply, escalate: true });
      return;
    }

    let packages, singles;
    try {
      ({ packages, singles } = await fetchPricing());
    } catch (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const priorMessages = transcript.map((entry) => ({
      role: entry.role === "user" ? "user" : "assistant",
      content: entry.content,
    }));

    let classification;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: buildChatSystemPrompt({
          packages,
          singles,
          language: conversation.language,
          visitorName: conversation.clients?.name,
        }),
        messages: [...priorMessages, { role: "user", content: trimmedMessage }],
      });
      const rawText = response.content?.[0]?.type === "text" ? response.content[0].text : "";
      classification = parseModelJson(rawText);
    } catch (err) {
      res.status(500).json({ error: `AI request failed: ${err.message}` });
      return;
    }

    if (!classification || typeof classification.reply !== "string") {
      res.status(500).json({ error: "AI returned an unreadable response" });
      return;
    }

    const escalate = Boolean(classification.escalate);
    const nextTranscript = [
      ...transcript,
      { role: "user", content: trimmedMessage, ts: new Date().toISOString() },
      { role: "assistant", content: classification.reply, ts: new Date().toISOString() },
    ];

    const { error: updateError } = await supabase
      .from("ai_conversations")
      .update({
        transcript: nextTranscript,
        status: escalate ? "qualified" : conversation.status,
        summary: classification.summary || conversation.summary,
      })
      .eq("id", conversationId);

    if (updateError) {
      res.status(500).json({ error: updateError.message });
      return;
    }

    if (escalate && CLIENT_STATUSES.includes(classification.status) && conversation.client_id) {
      await supabase.from("clients").update({ status: classification.status }).eq("id", conversation.client_id);
    }

    res.status(200).json({ reply: classification.reply, escalate });
  } catch (err) {
    res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
}
