// One-time migration: pushes the hardcoded js/projects-data.js and
// js/pricing-data.js content into Supabase. Run locally once:
//   node scripts/migrate-content.js
// Safe to re-run — projects upsert by slug, pricing tables are cleared
// and reinserted each run so numeral/sort order always matches the source
// file exactly.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { projects } from "../js/projects-data.js";
import { packages, singles } from "../js/pricing-data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency) since this only ever runs
// locally via plain `node`, not through Vite or Vercel's bundler.
function loadEnvFile() {
  const envPath = resolve(__dirname, "../.env");
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function toProjectRow(p) {
  const { slug, title, client, serviceType, industry, year, status, featured, ...rest } = p;
  return {
    slug,
    title,
    client,
    service_type: serviceType,
    industry,
    year,
    status: status || "Concept",
    featured: Boolean(featured),
    content: rest,
  };
}

async function migrateProjects() {
  const rows = projects.map(toProjectRow);
  const { error } = await supabase.from("projects").upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`projects: ${error.message}`);
  console.log(`Upserted ${rows.length} projects`);
}

async function migratePricing() {
  // Clear and reinsert so sort_order always matches the current source
  // file order exactly (packages/singles have no natural unique key).
  const { error: delPkgErr } = await supabase.from("pricing_packages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delPkgErr) throw new Error(`pricing_packages delete: ${delPkgErr.message}`);
  const { error: delSingleErr } = await supabase.from("pricing_singles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delSingleErr) throw new Error(`pricing_singles delete: ${delSingleErr.message}`);

  const packageRows = packages.map((p, i) => ({
    numeral: p.numeral,
    name: p.name,
    name_ka: p.name_ka,
    price: p.price,
    per_month: p.perMonth,
    includes: p.includes,
    includes_ka: p.includes_ka,
    addon: p.addon,
    addon_ka: p.addon_ka,
    featured: Boolean(p.featured),
    sort_order: i,
  }));
  const { error: pkgErr } = await supabase.from("pricing_packages").insert(packageRows);
  if (pkgErr) throw new Error(`pricing_packages insert: ${pkgErr.message}`);
  console.log(`Inserted ${packageRows.length} pricing packages`);

  const singleRows = singles.map((s, i) => ({
    name: s.name,
    name_ka: s.name_ka,
    price: s.price,
    sort_order: i,
  }));
  const { error: singleErr } = await supabase.from("pricing_singles").insert(singleRows);
  if (singleErr) throw new Error(`pricing_singles insert: ${singleErr.message}`);
  console.log(`Inserted ${singleRows.length} pricing singles`);
}

async function main() {
  await migrateProjects();
  await migratePricing();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
