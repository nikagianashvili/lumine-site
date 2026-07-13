// POST /api/admin/ai-assistant — the "Ask Lumine AI" panel inside the admin
// dashboard. Read-only for V1: it can see and talk about live tasks/clients
// data, but cannot create or modify anything (no tool use yet). Stateless on
// the server — the browser holds conversation history in memory and resends
// it each call, so no schema migration was needed to ship this.
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

const MODEL = "claude-sonnet-5";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 20;

async function fetchSnapshot(supabase) {
  const [{ data: tasks }, { data: clients }] = await Promise.all([
    supabase
      .from("tasks")
      .select("title, status, priority, due_date, created_at")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(25),
    supabase
      .from("clients")
      .select("name, company, status, source, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  return { tasks: tasks || [], clients: clients || [] };
}

function snapshotBlock({ tasks, clients }) {
  const taskLines = tasks
    .map((t) => `- [${t.status}/${t.priority}] ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}`)
    .join("\n");
  const clientLines = clients
    .map((c) => `- ${c.name || "Unnamed"}${c.company ? ` (${c.company})` : ""} — ${c.status}, via ${c.source}`)
    .join("\n");
  return `CURRENT TASKS (up to 25, soonest due first):\n${taskLines || "(none)"}\n\nRECENT CLIENTS/LEADS (up to 25, newest first):\n${clientLines || "(none)"}`;
}

function buildSystemPrompt({ member, snapshot }) {
  return `
You are Lumine AI, an internal assistant inside the Lumine admin dashboard, talking with ${member.name || "a team member"} (role: ${member.role || "team member"}).

${snapshotBlock(snapshot)}

Rules:
- Use the data above to answer questions about current tasks and clients/leads (e.g. what's overdue, summarize new leads, what's in progress).
- You are READ-ONLY: you cannot create, edit, or delete tasks or clients. If asked to do one of those, say so plainly and suggest doing it directly in the dashboard — do not pretend to have done it.
- If something isn't covered by the data above, say you don't have that information rather than guessing.
- Keep replies concise and useful — this is a working tool, not a chat companion.
`.trim();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const auth = await requireTeamMember(req);
    if (auth.error) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }

    const { message, history } = req.body || {};
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedMessage) {
      res.status(400).json({ error: "Missing required field (message)" });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: "Message is too long" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: "AI assistant isn't configured yet (missing ANTHROPIC_API_KEY)" });
      return;
    }

    const supabase = getSupabaseServerClient();
    const snapshot = await fetchSnapshot(supabase);

    const priorMessages = Array.isArray(history)
      ? history
          .slice(-MAX_HISTORY_TURNS)
          .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    let reply;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 700,
        system: buildSystemPrompt({ member: auth.member, snapshot }),
        messages: [...priorMessages, { role: "user", content: trimmedMessage }],
      });
      reply = response.content?.[0]?.type === "text" ? response.content[0].text : "";
    } catch (err) {
      res.status(500).json({ error: `AI request failed: ${err.message}` });
      return;
    }

    if (!reply) {
      res.status(500).json({ error: "AI returned an empty response" });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
}
