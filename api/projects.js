// GET /api/projects — reads the portfolio from Supabase instead of the
// hardcoded js/projects-data.js. Reshapes each row back into the same
// flat shape the frontend already expects (serviceType, status_ka, blurb,
// etc. all top-level) so swapping the frontend's data source over is a
// small, mechanical change rather than a rewrite of work.js/project.js.
import { getSupabaseAnonClient } from "./_lib/supabase.js";

export default async function handler(req, res) {
  const supabase = getSupabaseAnonClient();

  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, client, service_type, industry, year, status, featured, content")
    .order("created_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const projects = data.map((row) => ({
    slug: row.slug,
    title: row.title,
    client: row.client,
    serviceType: row.service_type,
    industry: row.industry,
    year: row.year,
    status: row.status,
    featured: row.featured,
    ...row.content,
  }));

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ projects });
}
