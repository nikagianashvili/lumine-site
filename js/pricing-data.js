// Pricing registry — working prices, edit freely.
// The Pricing page renders entirely from this file: change a number here
// and the site updates. Prices in GEL (₾).

export const packages = [
  {
    numeral: "I",
    name: "Starter",
    price: "1000–1500₾",
    perMonth: [
      { count: "4–8", label: "Posters" },
      { count: "2–4", label: "Videos" },
    ],
    includes: ["Social media management", "Paid advertising"],
    addon: "Site management +300–500₾",
    featured: false,
  },
  {
    numeral: "II",
    name: "Growth",
    price: "1500–2000₾",
    perMonth: [
      { count: "8–12", label: "Posters" },
      { count: "4–6", label: "Videos" },
    ],
    includes: ["Social media management", "Paid advertising"],
    addon: "Site management +300–500₾",
    featured: true,
  },
  {
    numeral: "III",
    name: "Full Beam",
    price: "2000–2500₾",
    perMonth: [
      { count: "12–16", label: "Posters" },
      { count: "6–8", label: "Videos" },
    ],
    includes: ["Social media management"],
    addon: "Site management +300–500₾",
    featured: false,
  },
];

export const singles = [
  { name: "Photo Retouching & Correction", price: "200–500₾" },
  { name: "Video Editing & Correction", price: "300–800₾" },
  { name: "Brand Book", price: "1500–2500₾" },
  { name: "Website — Design & Build", price: "2000–3000₾" },
];

export const pricingNote =
  "Working prices — every project gets a final quote after one call. Custom visual material beyond the package is billed as an individual service.";
