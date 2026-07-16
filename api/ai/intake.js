// POST /api/ai/intake — public endpoint behind the contact form. Answers the
// visitor's message grounded in real pricing/service data (never invents a
// price), classifies the lead, and writes both a `clients` row and an
// `ai_conversations` row so it's reviewable from /admin's AI Inbox.
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { SERVICES_CONTEXT, fetchPricing, pricingBlock, parseModelJson, CLIENT_STATUSES } from "./_lib/grounding.js";

const MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt({ packages, singles, language }) {
  return `
You are the front-desk assistant for Lumine, answering a message a visitor just submitted through the website's contact form. Answer ONLY using the information given below.

${SERVICES_CONTEXT}

${pricingBlock({ packages, singles })}

Rules:
- If the visitor's question can be answered from the information above, answer it directly and specifically.
- If it needs something not covered here (a custom quote, a firm timeline, contract terms, anything you're not certain of), do NOT guess or invent numbers — say a team member will follow up shortly, and set "escalate" to true.
- Reply in the same language the visitor wrote in (their message language takes priority over any language code given).
- Keep the reply short: 2-4 sentences, warm, specific, no filler.
- Visitor's declared language preference: ${language || "unknown"}.

Respond with ONLY a JSON object (no markdown, no other text) matching exactly this shape:
{"reply": string, "intent": string, "urgency": "low"|"medium"|"high", "status": "new"|"hot"|"warm"|"cold", "escalate": boolean, "confidence": number between 0 and 1, "summary": string (one short sentence for an internal dashboard)}
`.trim();
}

export default async function handler(req, res) {
  // Wrapped top-to-bottom: this endpoint takes arbitrary public input and
  // must never let an unexpected error (bad env config, a client library
  // throwing synchronously, etc.) crash the process instead of returning
  // a clean JSON error.
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { name, email, phone, company, message, services, budget, language } = req.body || {};

    if (!name || !message || (!email && !phone)) {
      res.status(400).json({ error: "Missing required fields (name, message, and email or phone)" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ error: "AI intake isn't configured yet (missing env vars)" });
      return;
    }

    const supabase = getSupabaseServerClient();

    let packages, singles;
    try {
      ({ packages, singles } = await fetchPricing());
    } catch (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const visitorLines = [
      `Name: ${name}`,
      company && `Company: ${company}`,
      services?.length && `Interested in: ${services.join(", ")}`,
      budget?.length && `Budget range mentioned: ${budget.join(", ")}`,
      `Message: ${message}`,
    ].filter(Boolean);

    let classification;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: buildSystemPrompt({ packages, singles, language }),
        messages: [{ role: "user", content: visitorLines.join("\n") }],
      });
      // A model can return a "thinking" block ahead of the "text" block
      // (extended thinking) - the reply is never reliably at index 0.
      const textBlock = response.content?.find((block) => block.type === "text");
      const rawText = textBlock?.text || "";
      classification = parseModelJson(rawText);
    } catch (err) {
      res.status(500).json({ error: `AI request failed: ${err.message}` });
      return;
    }

    if (!classification || typeof classification.reply !== "string") {
      res.status(500).json({ error: "AI returned an unreadable response" });
      return;
    }

    const status = CLIENT_STATUSES.includes(classification.status) ? classification.status : "new";
    const escalate = Boolean(classification.escalate);

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source: "contact_form",
        status,
        meta: {
          message,
          services: services || [],
          budget: budget || [],
          intent: classification.intent,
          urgency: classification.urgency,
          confidence: classification.confidence,
        },
      })
      .select()
      .single();

    if (clientError) {
      res.status(500).json({ error: clientError.message });
      return;
    }

    const { error: convoError } = await supabase.from("ai_conversations").insert({
      channel: "chat",
      client_id: client.id,
      language: language === "ka" ? "ka" : "en",
      transcript: [
        { role: "user", content: message, ts: new Date().toISOString() },
        { role: "assistant", content: classification.reply, ts: new Date().toISOString() },
      ],
      status: escalate ? "qualified" : "open",
      summary: classification.summary || null,
    });

    if (convoError) {
      res.status(500).json({ error: convoError.message });
      return;
    }

    res.status(200).json({ reply: classification.reply, escalate });
  } catch (err) {
    res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
}
