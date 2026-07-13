// One-time script: creates the first admin login (Supabase Auth user +
// matching team_members row). Run locally:
//   node scripts/create-admin.js <email> <password>
// There is no public signup form by design — team accounts are created
// this way (or later, by an existing admin inside the dashboard).
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

const [, , email, password, name = "Admin"] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.js <email> <password> [name]");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`auth.admin.createUser: ${error.message}`);

  const { error: memberError } = await supabase.from("team_members").insert({
    id: data.user.id,
    name,
    role: "admin",
  });
  if (memberError) throw new Error(`team_members insert: ${memberError.message}`);

  console.log(`Created admin user ${email} (${data.user.id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
