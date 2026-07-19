import { getSupabaseServerClient } from "../../_lib/supabase.js";

// Verifies the request's Supabase session token and confirms the signed-in
// user has a client_users row - the client-portal mirror of
// api/admin/_lib/auth.js's requireTeamMember. member.client_id is what
// every portal endpoint scopes its queries to; nothing here ever trusts a
// client_id supplied by the request itself.
export async function requireClientMember(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Missing Authorization header", status: 401 };

  try {
    const supabase = getSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return { error: "Invalid or expired session", status: 401 };
    }

    const { data: member, error: memberError } = await supabase
      .from("client_users")
      .select("id, client_id, name")
      .eq("id", userData.user.id)
      .single();

    if (memberError || !member) {
      return { error: "Not a portal account", status: 403 };
    }

    return { user: userData.user, member };
  } catch (err) {
    return { error: `Auth check failed: ${err.message}`, status: 500 };
  }
}
