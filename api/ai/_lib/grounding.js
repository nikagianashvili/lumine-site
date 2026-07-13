// Shared grounding data + prompt-building for every AI front-office surface
// (contact-form intake, website chat, admin consultant). Keeps pricing/services
// facts in one place so no endpoint can drift out of sync with another.
import { getSupabaseServerClient } from "../../_lib/supabase.js";

export const SERVICES_CONTEXT = `
Lumine is a creative agency based in Tbilisi, Georgia, offering three service types:
- Web: websites and web apps (design + development)
- Photo & Video: brand photography and video production
- Design: graphic design, branding, print/social design deliverables
Clients span industries: Medical, Hotels, Restaurants, Real Estate, SaaS, E-Commerce, Startups.
Ongoing monthly retainer packages combine social content + paid ads management (see PRICING PACKAGES).
One-off single-service pricing is also available (see PRICING SINGLES).
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

export function buildChatSystemPrompt({ packages, singles, language, visitorName }) {
  return `
You are the front-desk assistant for Lumine, having a live chat with a website visitor${visitorName ? ` named ${visitorName}` : ""}. Answer ONLY using the information given below — this is an ongoing conversation, so use the full message history for context rather than treating each message in isolation.

${SERVICES_CONTEXT}

${pricingBlock({ packages, singles })}

Rules:
- If the visitor's question can be answered from the information above, answer it directly and specifically.
- If it needs something not covered here (a custom quote, a firm timeline, contract terms, anything you're not certain of), do NOT guess or invent numbers — say a team member will follow up shortly, and set "escalate" to true.
- Reply in the same language the visitor is writing in (their message language takes priority over any declared preference).
- Keep each reply short and conversational: 1-4 sentences, warm, specific, no filler.
- Visitor's declared language preference: ${language || "unknown"}.

Respond with ONLY a JSON object (no markdown, no other text) matching exactly this shape:
{"reply": string, "status": "new"|"hot"|"warm"|"cold", "escalate": boolean, "summary": string (one short sentence for an internal dashboard, describing the conversation so far)}
`.trim();
}

export function requestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}
