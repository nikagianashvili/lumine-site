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
  // Fine-grained per-service pipeline stage (e.g. "Shoot Day", "QA") - see
  // lib/pipelines.ts. status above is derived from this, never set
  // independently, so a task's coarse and fine-grained state can't drift.
  stage?: string | null;
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
  // Matches lib/portfolioTaxonomy.ts's INDUSTRIES - used to pre-fill and
  // filter the Archive grid once a project is completed.
  industry?: string | null;
}

// Shape of a row in the public `projects` table (see api/projects.js) -
// what "Publish to Portfolio" writes. `content` is the jsonb blob the
// public site spreads onto the project object at render time.
export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  service_type: string;
  industry: string | null;
  year: string | null;
  status: string;
  featured: boolean;
  sort_order: number;
  content: {
    cover?: string;
    blurb?: string;
    testimonial?: { quote: string; author: string };
    [key: string]: unknown;
  };
  created_at: string;
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

// Several columns (engagements.service_type/cover_image_url,
// tasks.service_type/stage) need migrations that may not have run yet in
// every environment - degrade gracefully rather than losing the write.
// PostgREST only reports one missing column per error, so retry in a loop,
// stripping one optional field per attempt, not a single retry (which only
// fixes the first of several missing columns).
async function writeWithFallback<T>(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
  optionalFields: readonly string[],
  key: string,
  errorLabel: string,
): Promise<T> {
  const payload = { ...body };
  for (let attempt = 0; attempt <= optionalFields.length; attempt++) {
    const res = await adminFetch(path, { method, body: JSON.stringify(payload) });
    if (res.ok) return unwrap<T>(res, key);
    const errBody = await res.json();
    const missing = optionalFields.find((f) => f in payload && errBody.error?.includes(f));
    if (!missing) throw new Error(errBody.error || errorLabel);
    delete payload[missing];
  }
  throw new Error(errorLabel);
}

const ENGAGEMENT_OPTIONAL_FIELDS = ["service_type", "cover_image_url", "industry"] as const;
const TASK_OPTIONAL_FIELDS = ["service_type", "stage"] as const;

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
    create: async (task: Record<string, unknown>) =>
      writeWithFallback<Task>("/api/admin/tasks", "POST", task, TASK_OPTIONAL_FIELDS, "task", "Could not create task"),
    update: async (id: string, updates: Partial<Task>) =>
      writeWithFallback<Task>(
        "/api/admin/tasks",
        "PATCH",
        { id, ...updates },
        TASK_OPTIONAL_FIELDS,
        "task",
        "Could not update task",
      ),
  },
  engagements: {
    list: async () => unwrap<Engagement[]>(await adminFetch("/api/admin/engagements"), "engagements"),
    create: async (payload: Record<string, unknown>) =>
      writeWithFallback<Engagement>(
        "/api/admin/engagements",
        "POST",
        payload,
        ENGAGEMENT_OPTIONAL_FIELDS,
        "engagement",
        "Could not create project",
      ),
    update: async (id: string, updates: Partial<Engagement>) =>
      writeWithFallback<Engagement>(
        "/api/admin/engagements",
        "PATCH",
        { id, ...updates },
        ENGAGEMENT_OPTIONAL_FIELDS,
        "engagement",
        "Could not update project",
      ),
    delete: async (id: string) => {
      const res = await adminFetch("/api/admin/engagements", { method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not delete project");
    },
  },
  portfolio: {
    list: async () => unwrap<PortfolioProject[]>(await adminFetch("/api/admin/portfolio"), "projects"),
    create: async (payload: Record<string, unknown>) =>
      unwrap<PortfolioProject>(
        await adminFetch("/api/admin/portfolio", { method: "POST", body: JSON.stringify(payload) }),
        "project",
      ),
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
