// Mirrors js/projects-data.js's SERVICE_TYPES/INDUSTRIES exactly - the
// public portfolio only has three service lines (no SMM; that's ongoing
// retainer work, not a single case study) and a fixed industry list. Kept
// as a separate constant rather than cross-imported: the vanilla site's JS
// and this TypeScript app are different module contexts (see
// src/admin/lib/serviceTypes.ts for the same pattern already established
// for the admin's own, larger service-type list). Keep in sync by hand if
// js/projects-data.js's taxonomy changes.
export const PORTFOLIO_SERVICE_TYPES = [
  { id: "web", label: "Web Development" },
  { id: "photo-video", label: "Photo & Video" },
  { id: "design", label: "Graphic Design" },
] as const;

export const INDUSTRIES = [
  "Medical",
  "Hotels",
  "Restaurants",
  "Real Estate",
  "SaaS",
  "E-Commerce",
  "Startups",
  "Public Sector",
  "Fitness",
  "Electronics",
  "Finance",
  "Retail",
] as const;
