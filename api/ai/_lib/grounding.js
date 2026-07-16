// Shared grounding data + prompt-building for every AI front-office surface
// (contact-form intake, website chat, admin consultant). Keeps pricing/services
// facts in one place so no endpoint can drift out of sync with another.
import { z } from "zod";
import { getSupabaseServerClient } from "../../_lib/supabase.js";
import { FAQ } from "../../../js/faq-data.js";

// Structured output schema for the chat endpoint - enforced by the API
// itself (client.messages.parse + output_config.format), not just asked
// for in the prompt. This is what actually fixed unreliable JSON parsing:
// a text-only "respond with ONLY JSON" instruction was not reliably
// followed once the prompt also asked for markdown-formatted lists inside
// "reply" - the model would sometimes emit the list as raw markdown with
// no JSON envelope at all. Schema enforcement removes that ambiguity.
export const ChatReplySchema = z.object({
  reply: z.string(),
  status: z.enum(["new", "hot", "warm", "cold"]),
  escalate: z.boolean(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
});

export const SERVICES_CONTEXT = `
Lumine is a creative agency based in Tbilisi, Georgia, offering three service types:
- Web: websites and web apps (design + development)
- Photo & Video: brand photography and video production
- Design: graphic design, branding, print/social design deliverables
Clients span industries: Medical, Hotels, Restaurants, Real Estate, SaaS, E-Commerce, Startups.
Ongoing monthly retainer packages combine social content + paid ads management (see PRICING PACKAGES).
One-off single-service pricing is also available (see PRICING SINGLES).

MISSION: Give small brands the kind of creative work usually reserved for big budgets.
VISION: A Tbilisi where local businesses look as good as they actually are.

HOW WE WORK (process, in order):
1. Discovery — understanding the brand, the audience, and what success looks like.
2. Strategy — a plan for the services, formats, and channels that fit.
3. Design — concepts the client reacts to, refined until they're right.
4. Development — building it: photo, video, design, or code.
5. Launch — shipped, tested, and live.
6. Growth — ongoing content, marketing, and support after launch.
`.trim();

export async function fetchPricing() {
  const supabase = getSupabaseServerClient();
  const [{ data: packages, error: pkgError }, { data: singles, error: singleError }] = await Promise.all([
    supabase.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    supabase.from("pricing_singles").select("*").order("sort_order", { ascending: true }),
  ]);
  if (pkgError || singleError) throw new Error((pkgError || singleError).message);
  return { packages: packages || [], singles: singles || [] };
}

export function pricingBlock({ packages, singles }) {
  const pkgLines = packages.map((p) => `- ${p.name} (${p.price}/mo): ${(p.includes || []).join(", ")}`).join("\n");
  const singleLines = singles.map((s) => `- ${s.name}: ${s.price}`).join("\n");
  return `PRICING PACKAGES (monthly retainers):\n${pkgLines || "(none loaded)"}\n\nPRICING SINGLES (one-off services):\n${singleLines || "(none loaded)"}`;
}

// Live portfolio, same "projects" table api/projects.js serves the Work page
// from - not the static js/projects-data.js - so the bot never cites a
// project that doesn't actually exist on the site right now.
export async function fetchPortfolio() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("title, client, service_type, industry, status, content")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    title: row.title,
    client: row.client,
    serviceType: row.service_type,
    industry: row.industry,
    status: row.status,
    blurb: row.content?.blurb || "",
  }));
}

export function portfolioBlock(projects) {
  if (!projects.length) return "PORTFOLIO EXAMPLES: (none loaded yet)";
  const lines = projects.map((p) => {
    const label = p.status === "Concept" ? "concept/example work — NOT a real client, present it that way" : "real completed client work";
    return `- [${p.serviceType} / ${p.industry}] ${p.title}${p.client ? ` (${p.client})` : ""}: ${p.blurb} — ${label}`;
  });
  return `PORTFOLIO EXAMPLES:\n${lines.join("\n")}`;
}

export function faqBlock() {
  const lines = FAQ.map((f) => `Q: ${f.question}\nA: ${f.answer}`);
  return `FREQUENTLY ASKED QUESTIONS:\n${lines.join("\n\n")}`;
}

export function parseModelJson(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    return null;
  }
}

export const CLIENT_STATUSES = ["new", "hot", "warm", "cold"];

export function buildChatSystemPrompt({ packages, singles, projects, language, visitorName }) {
  return `
You are the front-desk assistant for Lumine, having a live chat with a website visitor${visitorName ? ` named ${visitorName}` : ""}. Answer ONLY using the information given below — this is an ongoing conversation, so use the full message history for context rather than treating each message in isolation.

${SERVICES_CONTEXT}

${pricingBlock({ packages, singles })}

${portfolioBlock(projects)}

${faqBlock()}

Rules:
- If the visitor's question can be answered from the information above, answer it directly and specifically.
- If it needs something not covered here (a custom quote, a firm timeline, contract terms, anything you're not certain of), do NOT guess or invent numbers — say a team member will follow up shortly, and set "escalate" to true.
- When discussing a portfolio example marked "concept/example work", always be upfront that it's a concept piece, not a real client project — never imply it was done for an actual paying client.
- Reply in the same language the visitor is writing in (their message language takes priority over any declared preference).
- Keep each reply short and conversational: 1-4 sentences, warm, specific, no filler.
- When the reply genuinely lists multiple things (packages, process steps, portfolio examples), format it as a real markdown list — each item on its own line starting with "- " or "1. " — instead of running them together in one sentence. Use **bold** sparingly for a key term or number. Don't force a list when a plain sentence reads better.
- Visitor's declared language preference: ${language || "unknown"}.

Fill in every field of the structured response: "confidence" reflects how well the information above actually covers this specific reply (0 to 1), and "summary" is one short sentence for an internal dashboard describing the conversation so far.
`.trim();
}

export function requestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}
