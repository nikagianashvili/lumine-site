// GET /api/pricing — reads packages/singles from Supabase. The one static
// piece (the disclaimer note) isn't in a table yet — one plain string
// isn't worth a settings table, so it's still sourced from
// js/pricing-data.js directly until there's more than one such value.
import { getSupabaseAnonClient } from "./_lib/supabase.js";
import { pricingNote, pricingNote_ka } from "../js/pricing-data.js";

export default async function handler(req, res) {
  const supabase = getSupabaseAnonClient();

  const [{ data: packageRows, error: pkgError }, { data: singleRows, error: singleError }] = await Promise.all([
    supabase.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    supabase.from("pricing_singles").select("*").order("sort_order", { ascending: true }),
  ]);

  if (pkgError || singleError) {
    res.status(500).json({ error: (pkgError || singleError).message });
    return;
  }

  const packages = packageRows.map((row) => ({
    numeral: row.numeral,
    name: row.name,
    name_ka: row.name_ka,
    price: row.price,
    perMonth: row.per_month,
    includes: row.includes,
    includes_ka: row.includes_ka,
    addon: row.addon,
    addon_ka: row.addon_ka,
    featured: row.featured,
  }));

  const singles = singleRows.map((row) => ({
    name: row.name,
    name_ka: row.name_ka,
    price: row.price,
  }));

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ packages, singles, pricingNote, pricingNote_ka });
}
