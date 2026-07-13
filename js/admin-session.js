// Shared session storage for the admin panel. The access token comes back
// from /api/admin/login (a thin proxy around Supabase's own password
// sign-in) and is stored in localStorage, then sent as
// `Authorization: Bearer <token>` on every /api/admin/* call.
const KEY = "lumine_admin_session";

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

// Fetch wrapper that attaches the session token and redirects to login on
// a 401 (expired/invalid session) instead of every call site handling it.
export async function adminFetch(path, options = {}) {
  const session = getSession();
  if (!session) {
    window.location.href = "/admin-login";
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
    window.location.href = "/admin-login";
    throw new Error("Session expired");
  }

  return res;
}
