// Typed wrappers around api/portal/* — same unwrap()-over-portalFetch
// pattern as src/admin/lib/api.ts. Every field here is a subset of what
// the admin's api.ts exposes: internal fields (assignee, priority,
// hat_tags, budget, notes) are left out because the server never sends
// them to a client-portal caller in the first place.
import { portalFetch } from "./session";

export type EngagementStatus = "active" | "on_hold" | "completed" | "cancelled";

export interface Engagement {
  id: string;
  title: string;
  status: EngagementStatus;
  start_date: string | null;
  end_date: string | null;
  service_type?: string | null;
  is_retainer?: boolean;
  retainer_tier?: string | null;
  posters_limit?: number | null;
  posters_delivered?: number | null;
  videos_limit?: number | null;
  videos_delivered?: number | null;
  created_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  engagement_id: string | null;
  title: string;
  status: TaskStatus;
  stage?: string | null;
  due_date: string | null;
  created_at: string;
}

export type ApprovalStatus = "approved" | "changes_requested" | null;

export interface PortalFile {
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
  approval_status: ApprovalStatus;
  created_at: string;
  team_members: { name: string | null } | null;
}

export interface DeliverableComment {
  id: string;
  file_id: string;
  body: string;
  author_client_user_id: string | null;
  author_team_member_id: string | null;
  x_pct: number | null;
  y_pct: number | null;
  timecode_seconds: number | null;
  resolved: boolean;
  created_at: string;
  client_users: { name: string | null } | null;
  team_members: { name: string | null } | null;
}

async function unwrap<T>(res: Response, key: string): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data[key] as T;
}

export const api = {
  engagements: {
    list: async () => unwrap<Engagement[]>(await portalFetch("/api/portal/engagements"), "engagements"),
  },
  tasks: {
    list: async () => unwrap<Task[]>(await portalFetch("/api/portal/tasks"), "tasks"),
  },
  files: {
    list: async (category?: "creative" | "document") => {
      const params = category ? `?category=${category}` : "";
      return unwrap<PortalFile[]>(await portalFetch(`/api/portal/files${params}`), "files");
    },
    setApproval: async (id: string, approval_status: "approved" | "changes_requested") =>
      unwrap<PortalFile>(
        await portalFetch("/api/portal/files", { method: "PATCH", body: JSON.stringify({ id, approval_status }) }),
        "file",
      ),
  },
  comments: {
    list: async (fileId: string) =>
      unwrap<DeliverableComment[]>(await portalFetch(`/api/portal/comments?file_id=${fileId}`), "comments"),
    create: async (payload: { file_id: string; body: string; x_pct?: number; y_pct?: number; timecode_seconds?: number }) =>
      unwrap<DeliverableComment>(
        await portalFetch("/api/portal/comments", { method: "POST", body: JSON.stringify(payload) }),
        "comment",
      ),
    resolve: async (id: string, resolved: boolean) =>
      unwrap<DeliverableComment>(
        await portalFetch("/api/portal/comments", { method: "PATCH", body: JSON.stringify({ id, resolved }) }),
        "comment",
      ),
  },
};
