// Thin fetch wrappers for the Supabase-backed content endpoints
// (api/projects.js, api/pricing.js), shared by work.js/featured.js/
// project.js/pricing.js.
//
// Both wrappers fall back to the bundled registries when the API is
// unreachable or returns something unusable. The portfolio and the price
// list are the two things on this site that must never render empty — a
// blank grid reads as "this agency has no work," which is worse than
// showing slightly stale content. The bundled data is already in the
// bundle, so the fallback costs nothing at runtime.

import { projects as bundledProjects } from "/js/projects-data.js";
import {
  packages as bundledPackages,
  singles as bundledSingles,
  pricingNote as bundledNote,
  pricingNote_ka as bundledNoteKa,
} from "/js/pricing-data.js";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  // A dev server or a misrouted deploy can answer with the handler's own
  // source (`// GET /api/...`), which parses as JSON only by accident —
  // check the content type before trusting the body.
  const type = res.headers.get("content-type") || "";
  if (!type.includes("json")) throw new Error(`${url} returned ${type || "no content-type"}`);
  return res.json();
}

export async function fetchProjects() {
  try {
    const { projects } = await fetchJson("/api/projects");
    if (!Array.isArray(projects) || !projects.length) {
      throw new Error("/api/projects returned no projects");
    }
    return projects;
  } catch (err) {
    console.warn("[lumine] projects API unavailable, using bundled registry:", err.message);
    return bundledProjects;
  }
}

export async function fetchPricing() {
  try {
    const data = await fetchJson("/api/pricing");
    if (!Array.isArray(data?.packages) || !data.packages.length) {
      throw new Error("/api/pricing returned no packages");
    }
    return data;
  } catch (err) {
    console.warn("[lumine] pricing API unavailable, using bundled registry:", err.message);
    return {
      packages: bundledPackages,
      singles: bundledSingles,
      pricingNote: bundledNote,
      pricingNote_ka: bundledNoteKa,
    };
  }
}
