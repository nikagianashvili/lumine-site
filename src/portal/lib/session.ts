// Session handling — same shape and localStorage pattern as
// src/admin/lib/session.ts, but its own key ("lumine_portal_session") and
// its own login redirect, so a team member and a client can be signed in
// on the same browser without colliding.
const KEY = "lumine_portal_session";

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email: string; name: string | null; company: string | null };
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

export class PortalFetchError extends Error {}

export async function portalFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = getSession();
  if (!session) {
    window.location.href = "/portal-login";
    throw new PortalFetchError("No session");
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
    window.location.href = "/portal-login";
    throw new PortalFetchError("Session expired");
  }

  return res;
}
