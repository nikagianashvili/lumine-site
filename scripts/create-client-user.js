// One-time script: creates a client-portal login (Supabase Auth user +
// matching client_users row), linked to an existing clients.id. Run
// locally:
//   node scripts/create-client-user.js <email> <password> <client_id> [name]
// There is no public signup form by design, same as team accounts
// (scripts/create-admin.js) — the agency provisions portal access itself
// once a client relationship is real, then shares the password directly.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = resolve(__dirname, "../.env");
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const [, , email, password, clientId, name = ""] = process.argv;
if (!email || !password || !clientId) {
  console.error("Usage: node scripts/create-client-user.js <email> <password> <client_id> [name]");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, company")
    .eq("id", clientId)
    .single();
  if (clientError || !client) throw new Error(`No client found with id ${clientId}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`auth.admin.createUser: ${error.message}`);

  const { error: memberError } = await supabase.from("client_users").insert({
    id: data.user.id,
    client_id: clientId,
    name: name || client.name || client.company || "",
  });
  if (memberError) throw new Error(`client_users insert: ${memberError.message}`);

  console.log(`Created portal login ${email} (${data.user.id}) for client "${client.company || client.name}" (${clientId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
