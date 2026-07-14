// Typed wrappers around the existing api/admin/* endpoints — the contract
// (routes, payload shapes) is unchanged from the vanilla admin; this file
// only adds TypeScript types on top for the React rebuild.
import { adminFetch } from "./session";

export type ClientStatus = "new" | "hot" | "warm" | "cold" | "client" | "lost";
export type ClientSource = "contact_form" | "ai_consultant" | "ai_chat" | "manual";

export interface Client {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: ClientSource;
  status: ClientStatus;
  value_estimate: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  meta: Record<string, unknown>;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  engagement_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
  service_type?: string | null;
}

export type EngagementStatus = "active" | "on_hold" | "completed" | "cancelled";

export interface Engagement {
  id: string;
  client_id: string | null;
  title: string;
  status: EngagementStatus;
  start_date: string | null;
  end_date: string | null;
  budget: string | null;
  notes: string | null;
  created_at: string;
  service_type?: string | null;
  cover_image_url?: string | null;
}

export interface TeamMember {
  id: string;
  name: string | null;
  // Free text - a specialty label (Founder, Orchestrator, Media, Design, …),
  // not an access tier. No permissions are derived from this value.
  role: string;
}

export type ConversationStatus = "open" | "qualified" | "closed";

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

// Written by api/ai/intake.js's classification step into clients.meta -
// not a fixed schema field, so treat every field as possibly absent.
export interface AiClassification {
  intent?: string;
  urgency?: "low" | "medium" | "high";
  confidence?: number;
}

export interface Conversation {
  id: string;
  created_at: string;
  channel: "chat" | "consultant";
  client_id: string | null;
  language: "en" | "ka";
  transcript: TranscriptMessage[];
  status: ConversationStatus;
  summary: string | null;
  clients:
    | {
        name: string | null;
        email: string | null;
        phone: string | null;
        company: string | null;
        status: ClientStatus;
        meta: AiClassification & Record<string, unknown>;
      }
    | null;
}

async function unwrap<T>(res: Response, key: string): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data[key] as T;
}

// engagements.service_type / cover_image_url need a migration that may not
// have run yet in every environment - same graceful-degradation tasks.
// service_type already used. PostgREST only reports one missing column per
// error, so retry in a loop, stripping one field per attempt, rather than
// a single retry that only fixes the first of two missing columns.
const ENGAGEMENT_OPTIONAL_FIELDS = ["service_type", "cover_image_url"] as const;

async function writeEngagement(method: "POST" | "PATCH", body: Record<string, unknown>) {
  const payload = { ...body };
  for (let attempt = 0; attempt <= ENGAGEMENT_OPTIONAL_FIELDS.length; attempt++) {
    const res = await adminFetch("/api/admin/engagements", { method, body: JSON.stringify(payload) });
    if (res.ok) return unwrap<Engagement>(res, "engagement");
    const errBody = await res.json();
    const missing = ENGAGEMENT_OPTIONAL_FIELDS.find((f) => f in payload && errBody.error?.includes(f));
    if (!missing) throw new Error(errBody.error || "Could not save project");
    delete payload[missing];
  }
  throw new Error("Could not save project");
}

export const api = {
  clients: {
    list: async () => unwrap<Client[]>(await adminFetch("/api/admin/clients"), "clients"),
    update: async (id: string, updates: Partial<Client>) =>
      unwrap<Client>(
        await adminFetch("/api/admin/clients", { method: "PATCH", body: JSON.stringify({ id, ...updates }) }),
        "client",
      ),
  },
  tasks: {
    list: async () => unwrap<Task[]>(await adminFetch("/api/admin/tasks"), "tasks"),
    create: async (task: Partial<Task>) =>
      unwrap<Task>(await adminFetch("/api/admin/tasks", { method: "POST", body: JSON.stringify(task) }), "task"),
    update: async (id: string, updates: Partial<Task>) =>
      unwrap<Task>(
        await adminFetch("/api/admin/tasks", { method: "PATCH", body: JSON.stringify({ id, ...updates }) }),
        "task",
      ),
  },
  engagements: {
    list: async () => unwrap<Engagement[]>(await adminFetch("/api/admin/engagements"), "engagements"),
    create: async (payload: Record<string, unknown>) => writeEngagement("POST", payload),
    update: async (id: string, updates: Partial<Engagement>) => writeEngagement("PATCH", { id, ...updates }),
    delete: async (id: string) => {
      const res = await adminFetch("/api/admin/engagements", { method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not delete project");
    },
  },
  teamMembers: {
    list: async () => unwrap<TeamMember[]>(await adminFetch("/api/admin/team-members"), "teamMembers"),
  },
  conversations: {
    list: async () => unwrap<Conversation[]>(await adminFetch("/api/admin/ai-conversations"), "conversations"),
    update: async (id: string, updates: Partial<Conversation>) =>
      unwrap<Conversation>(
        await adminFetch("/api/admin/ai-conversations", { method: "PATCH", body: JSON.stringify({ id, ...updates }) }),
        "conversation",
      ),
  },
  profile: {
    // returns { ok: true } on success, not a wrapped resource - no unwrap()
    update: async (updates: { name?: string; role?: string; currentPassword?: string; newPassword?: string }) => {
      const res = await adminFetch("/api/admin/profile", { method: "PATCH", body: JSON.stringify(updates) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update profile");
      return data;
    },
  },
};
