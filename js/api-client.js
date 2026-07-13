// Thin fetch wrappers for the Supabase-backed content endpoints
// (api/projects.js, api/pricing.js), shared by work.js/featured.js/
// project.js/pricing.js.

export async function fetchProjects() {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`);
  const { projects } = await res.json();
  return projects;
}

export async function fetchPricing() {
  const res = await fetch("/api/pricing");
  if (!res.ok) throw new Error(`Failed to load pricing: ${res.status}`);
  return res.json();
}
