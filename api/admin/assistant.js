// GET/POST/DELETE /api/admin/assistant — one continuous private thread per
// team member with the in-admin AI assistant. Deliberately scoped: a
// general-purpose helper for drafting, brainstorming, and quick questions,
// not an agent wired into live clients/tasks/projects data. If that scope
// ever expands, say so explicitly in the system prompt - never let the
// assistant imply it knows something about the business it doesn't.
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServerClient } from "../_lib/supabase.js";
import { requireTeamMember } from "./_lib/auth.js";

const MODEL = "claude-sonnet-5";
const HISTORY_LIMIT = 30;

const SYSTEM_PROMPT = `
You are Lumine Assistant, a helpful AI built into the internal admin dashboard of Lumine, a creative agency in Tbilisi, Georgia (web development, photo/video production, graphic design/branding).

You're talking with a Lumine team member, not a client or visitor. Help with drafting copy (emails, captions, briefs), brainstorming ideas, summarizing or rephrasing text, answering general questions, and quick internal tasks.

You do NOT have access to Lumine's live clients, tasks, projects, or any other business data in this admin panel - if asked about a specific real account, lead, number, or record, say plainly that you don't have access to live data and point them to the relevant page (Manage, Projects, Program) instead of guessing.

Write in plain, warm, direct prose. No markdown formatting - no **bold**, no bullet dashes, no headers. If you're listing multiple things, write them as a short flowing paragraph or numbered inline ("first ... second ...") rather than a markdown list, since this renders as plain text and literal asterisks/dashes would show up as clutter.
`.trim();

export default async function handler(req, res) {
  const auth = await requireTeamMember(req);
  if (auth.error) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const supabase = getSupabaseServerClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("assistant_messages")
      .select("*")
      .eq("team_member_id", auth.member.id)
      .order("created_at", { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ messages: data });
    return;
  }

  if (req.method === "DELETE") {
    const { error } = await supabase.from("assistant_messages").delete().eq("team_member_id", auth.member.id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === "POST") {
    const { content } = req.body || {};
    if (!content?.trim()) {
      res.status(400).json({ error: "Missing message content" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: "The assistant isn't configured yet - missing ANTHROPIC_API_KEY." });
      return;
    }

    const { data: userMessage, error: insertError } = await supabase
      .from("assistant_messages")
      .insert({ team_member_id: auth.member.id, role: "user", content: content.trim() })
      .select()
      .single();
    if (insertError) {
      res.status(500).json({ error: insertError.message });
      return;
    }

    const { data: history, error: historyError } = await supabase
      .from("assistant_messages")
      .select("role, content")
      .eq("team_member_id", auth.member.id)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    if (historyError) {
      res.status(500).json({ error: historyError.message });
      return;
    }

    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [...history].reverse().map((m) => ({ role: m.role, content: m.content })),
      });
      const replyText = response.content?.find((b) => b.type === "text")?.text?.trim();
      if (!replyText) {
        res.status(500).json({ error: "The assistant returned an empty reply." });
        return;
      }

      const { data: assistantMessage, error: replyError } = await supabase
        .from("assistant_messages")
        .insert({ team_member_id: auth.member.id, role: "assistant", content: replyText })
        .select()
        .single();
      if (replyError) {
        res.status(500).json({ error: replyError.message });
        return;
      }

      res.status(201).json({ userMessage, assistantMessage });
    } catch (err) {
      res.status(500).json({ error: `Assistant request failed: ${err.message}` });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
