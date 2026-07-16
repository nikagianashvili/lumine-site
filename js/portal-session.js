// Shared session storage for the client portal - identical shape to
// js/admin-session.js, but its own localStorage key ("lumine_portal_session")
// so a team member and a client can be logged into the same browser
// without one session overwriting the other.
const KEY = "lumine_portal_session";

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export async function portalFetch(path, options = {}) {
  const session = getSession();
  if (!session) {
    window.location.href = "/portal-login";
    throw new Error("No session");
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
    throw new Error("Session expired");
  }

  return res;
}
