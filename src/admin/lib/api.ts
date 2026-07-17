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
  // Which skill(s) this task needs (lib/hats.ts) - independent of the
  // single `assignee`. Powers the Bandwidth view (Phase 7).
  hat_tags?: string[];
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
  // Retainer quota tracking (Phase 5) - only meaningful when is_retainer.
  // Tier matches lib/retainerTiers.ts's real SMM packages; limits are the
  // specific number *this* client's contract landed on within the tier's
  // range, not derived automatically. Solo (non-retainer) projects that
  // complete trigger the offboarding-upsell cron 7 days later - see
  // api/cron/offboarding-upsell.js - completed_at/upsell_task_created
  // are bookkeeping for that, not shown in the UI.
  is_retainer?: boolean;
  retainer_tier?: string | null;
  posters_limit?: number | null;
  posters_delivered?: number | null;
  videos_limit?: number | null;
  videos_delivered?: number | null;
  completed_at?: string | null;
  upsell_task_created?: boolean;
  // Structured MRR input (Phase 6/War Room) - a real number to sum, not
  // parsed out of the free-text `budget` field.
  monthly_rate?: number | null;
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

// Real file storage (Phase 9) - a private Supabase Storage bucket
// (agency-files), everything routed through api/admin/files.js. `path` is
// the storage object key; `url` is a short-lived signed URL generated
// fresh on every GET (never stored - signed URLs expire).
export interface AgencyFile {
  id: string;
  name: string;
  path: string;
  url: string | null;
  content_type: string | null;
  size_bytes: number | null;
  category: "creative" | "document";
  folder_id: string | null;
  engagement_id: string | null;
  client_id: string | null;
  skills_tags: string[];
  uploaded_by: string | null;
  created_at: string;
  team_members: { name: string | null } | null;
}

// Account-level folders only - project files use engagement_id directly,
// no folder row needed (see files.js).
export interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export interface PlaybookEntry {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// water_cooler_posts - a new table (Phase 8), not just new columns, so
// this feature has no partial/degraded state: it's either set up or it
// isn't. reactions is {emoji: [team_member_id, ...]} - a toggle set per
// emoji, not a count, so "did I react" is a simple .includes check.
export interface WaterCoolerPost {
  id: string;
  author_id: string | null;
  type: "manual" | "celebration";
  body: string;
  file_url: string | null;
  reactions: Record<string, string[]>;
  engagement_id: string | null;
  created_at: string;
  team_members: { name: string | null } | null;
}

export interface TeamMember {
  id: string;
  name: string | null;
  // Free text - a specialty label (Founder, Orchestrator, Media, Design, …),
  // not an access tier. No permissions are derived from this value.
  role: string;
  // What they're skilled at (lib/hats.ts) - feeds the Bandwidth view.
  skills_tags?: string[];
  // Manual, self-set (lib/teamStatus.ts) - never inferred from activity.
  status?: string;
  // Greys their own avatar elsewhere; also mutes the notification bell's
  // badge/toast (the feed itself still fills up, see useUnreadNotificationCount).
  focus_mode?: boolean;
  // "admin" (full access) | "member" (scoped) - the field exists and is
  // editable, but nothing reads it to restrict anything yet. Everyone
  // defaults to "admin" until real enforcement is built. Decided when
  // this was added: AI Inbox should stay visible to Team Members even
  // once enforcement exists (triaging leads is real member-level work),
  // the restriction is meant for Manage's full client pipeline/financials.
  access_level?: string;
}

export interface TeamMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export type NotificationType = "task_assigned" | "new_lead" | "new_comment";

// `target` mirrors DeepLinkTarget (lib/deepLink.ts) so a notification can be
// clicked straight into the record it's about, reusing the same navigation
// the command palette uses. Untyped here (server writes it as jsonb) since
// the two files can't share a type without api.ts depending on a page-level
// module - callers cast at the point of use.
export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  target: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
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

// Reads a File as base64 for the JSON upload body (api/admin/files.js) -
// no multipart parsing needed server-side, at the cost of ~33% payload
// overhead, acceptable given the 6MB cap on what this accepts anyway.
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

const ENGAGEMENT_OPTIONAL_FIELDS = [
  "service_type",
  "cover_image_url",
  "industry",
  "is_retainer",
  "retainer_tier",
  "posters_limit",
  "posters_delivered",
  "videos_limit",
  "videos_delivered",
  "monthly_rate",
] as const;
const TASK_OPTIONAL_FIELDS = ["service_type", "stage", "hat_tags"] as const;
const TEAM_MEMBER_OPTIONAL_FIELDS = ["skills_tags", "status", "focus_mode", "access_level"] as const;

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
  waterCooler: {
    list: async () => unwrap<WaterCoolerPost[]>(await adminFetch("/api/admin/water-cooler"), "posts"),
    post: async (body: string, fileUrl?: string) =>
      unwrap<WaterCoolerPost>(
        await adminFetch("/api/admin/water-cooler", {
          method: "POST",
          body: JSON.stringify({ body, file_url: fileUrl || null }),
        }),
        "post",
      ),
    react: async (id: string, emoji: string) =>
      unwrap<WaterCoolerPost>(
        await adminFetch("/api/admin/water-cooler", { method: "PATCH", body: JSON.stringify({ id, emoji }) }),
        "post",
      ),
  },
  files: {
    list: async (filters: { category?: string; folder_id?: string; engagement_id?: string; client_id?: string }) => {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
      return unwrap<AgencyFile[]>(await adminFetch(`/api/admin/files?${params}`), "files");
    },
    upload: async (
      file: File,
      meta: {
        category: "creative" | "document";
        folder_id?: string;
        engagement_id?: string;
        client_id?: string;
        skills_tags?: string[];
      },
    ) => {
      const dataBase64 = await fileToBase64(file);
      return unwrap<AgencyFile>(
        await adminFetch("/api/admin/files", {
          method: "POST",
          body: JSON.stringify({ filename: file.name, contentType: file.type, dataBase64, ...meta }),
        }),
        "file",
      );
    },
    delete: async (id: string) => {
      const res = await adminFetch("/api/admin/files", { method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not delete file");
    },
  },
  folders: {
    list: async () => unwrap<Folder[]>(await adminFetch("/api/admin/folders"), "folders"),
    create: async (name: string) =>
      unwrap<Folder>(await adminFetch("/api/admin/folders", { method: "POST", body: JSON.stringify({ name }) }), "folder"),
    delete: async (id: string) => {
      const res = await adminFetch("/api/admin/folders", { method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not delete folder");
    },
  },
  playbook: {
    list: async () => unwrap<PlaybookEntry[]>(await adminFetch("/api/admin/playbook"), "entries"),
    create: async (payload: { title: string; body: string; tags: string[] }) =>
      unwrap<PlaybookEntry>(
        await adminFetch("/api/admin/playbook", { method: "POST", body: JSON.stringify(payload) }),
        "entry",
      ),
    update: async (id: string, updates: Partial<PlaybookEntry>) =>
      unwrap<PlaybookEntry>(
        await adminFetch("/api/admin/playbook", { method: "PATCH", body: JSON.stringify({ id, ...updates }) }),
        "entry",
      ),
    delete: async (id: string) => {
      const res = await adminFetch("/api/admin/playbook", { method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not delete entry");
    },
  },
  teamMembers: {
    list: async () => unwrap<TeamMember[]>(await adminFetch("/api/admin/team-members"), "teamMembers"),
    update: async (id: string, updates: Partial<TeamMember>) =>
      writeWithFallback<TeamMember>(
        "/api/admin/team-members",
        "PATCH",
        { id, ...updates },
        TEAM_MEMBER_OPTIONAL_FIELDS,
        "teamMember",
        "Could not update team member",
      ),
  },
  teamMessages: {
    list: async () => unwrap<TeamMessage[]>(await adminFetch("/api/admin/team-messages"), "messages"),
    send: async (recipient_id: string, body: string) =>
      unwrap<TeamMessage>(
        await adminFetch("/api/admin/team-messages", { method: "POST", body: JSON.stringify({ recipient_id, body }) }),
        "message",
      ),
    markRead: async (id: string) =>
      unwrap<TeamMessage>(
        await adminFetch("/api/admin/team-messages", { method: "PATCH", body: JSON.stringify({ id }) }),
        "message",
      ),
  },
  notifications: {
    list: async () => unwrap<Notification[]>(await adminFetch("/api/admin/notifications"), "notifications"),
    markRead: async (id: string) =>
      unwrap<Notification>(
        await adminFetch("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ id }) }),
        "notification",
      ),
    markAllRead: async () =>
      adminFetch("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ markAllRead: true }) }),
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
    // returns { ok: true } on success, not a wrapped resource - no unwrap(),
    // so this can't reuse writeWithFallback (which expects a wrapped
    // resource under `key`) - same strip-and-retry logic, inlined.
    update: async (updates: {
      name?: string;
      role?: string;
      currentPassword?: string;
      newPassword?: string;
      skills_tags?: string[];
      status?: string;
      focus_mode?: boolean;
    }) => {
      const payload: Record<string, unknown> = { ...updates };
      for (let attempt = 0; attempt <= TEAM_MEMBER_OPTIONAL_FIELDS.length; attempt++) {
        const res = await adminFetch("/api/admin/profile", { method: "PATCH", body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) return data;
        const missing = TEAM_MEMBER_OPTIONAL_FIELDS.find((f) => f in payload && data.error?.includes(f));
        if (!missing) throw new Error(data.error || "Could not update profile");
        delete payload[missing];
      }
      throw new Error("Could not update profile");
    },
  },
};
