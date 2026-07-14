// Session handling — deliberately the same localStorage key and shape as
// the vanilla js/admin-session.js, since admin-login.html stays vanilla
// (out of scope for this rebuild) and writes a session in that exact form.
// The React app only needs to read/consume it, not produce it.
const KEY = "lumine_admin_session";

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email: string };
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export class AdminFetchError extends Error {}

export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = getSession();
  if (!session) {
    window.location.href = "/admin-login";
    throw new AdminFetchError("No session");
  }

  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (res.status === 401) {
    clearSession();
    window.location.href = "/admin-login";
    throw new AdminFetchError("Session expired");
  }

  return res;
}
