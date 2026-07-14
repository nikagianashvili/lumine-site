// Mirrors js/pricing-data.js's real SMM retainer packages exactly (same
// reasoning as portfolioTaxonomy.ts - different module context, kept in
// sync by hand). defaultPostersLimit/defaultVideosLimit are the midpoint
// of each range, used to pre-fill a specific client's contracted quota
// when a tier is picked - real contracts land somewhere in the range, not
// automatically at either end, and the number stays editable after.
export const RETAINER_TIERS = [
  { name: "Starter", postersRange: "4–8", videosRange: "2–4", defaultPostersLimit: 6, defaultVideosLimit: 3 },
  { name: "Growth", postersRange: "8–12", videosRange: "4–6", defaultPostersLimit: 10, defaultVideosLimit: 5 },
  { name: "Full Beam", postersRange: "12–16", videosRange: "6–8", defaultPostersLimit: 14, defaultVideosLimit: 7 },
] as const;
