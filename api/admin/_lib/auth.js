import { getSupabaseServerClient } from "../../_lib/supabase.js";

// Verifies the request's Supabase session token (sent by the browser as
// `Authorization: Bearer <access_token>` after supabase-js signInWithPassword)
// and confirms the signed-in user has a team_members row. Every admin
// endpoint calls this first — there is no anon/public access to any admin
// table, by design (see supabase/schema.sql RLS comments).
export async function requireTeamMember(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Missing Authorization header", status: 401 };

  const supabase = getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return { error: "Invalid or expired session", status: 401 };
  }

  const { data: member, error: memberError } = await supabase
    .from("team_members")
    .select("id, name, role")
    .eq("id", userData.user.id)
    .single();

  if (memberError || !member) {
    return { error: "Not a team member", status: 403 };
  }

  return { user: userData.user, member };
}
