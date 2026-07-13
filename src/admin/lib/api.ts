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

export interface TeamMember {
  id: string;
  name: string | null;
  role: "admin" | "member";
}

async function unwrap<T>(res: Response, key: string): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data[key] as T;
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
  teamMembers: {
    list: async () => unwrap<TeamMember[]>(await adminFetch("/api/admin/team-members"), "teamMembers"),
  },
};
