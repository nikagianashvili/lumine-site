// Pricing registry — working prices, edit freely.
// The Pricing page renders entirely from this file: change a number here
// and the site updates. Prices in GEL (₾).
// `_ka` fields are the Georgian text picked by js/pricing.js when the
// language switcher is set to GE — everything else (numbers, GEL prices)
// is language-agnostic and shared.

export const packages = [
  {
    numeral: "I",
    name: "Starter",
    name_ka: "საწყისი",
    price: "1000–1500₾",
    perMonth: [
      { count: "4–8", label: "Posters", label_ka: "პოსტერი" },
      { count: "2–4", label: "Videos", label_ka: "ვიდეო" },
    ],
    includes: ["Social media management", "Paid advertising"],
    includes_ka: ["სოციალური მედიის მართვა", "ფასიანი რეკლამა"],
    addon: "Site management +300–500₾",
    addon_ka: "საიტის მართვა +300–500₾",
    featured: false,
  },
  {
    numeral: "II",
    name: "Growth",
    name_ka: "ზრდადი",
    price: "1500–2000₾",
    perMonth: [
      { count: "8–12", label: "Posters", label_ka: "პოსტერი" },
      { count: "4–6", label: "Videos", label_ka: "ვიდეო" },
    ],
    includes: ["Social media management", "Paid advertising"],
    includes_ka: ["სოციალური მედიის მართვა", "ფასიანი რეკლამა"],
    addon: "Site management +300–500₾",
    addon_ka: "საიტის მართვა +300–500₾",
    featured: true,
  },
  {
    numeral: "III",
    name: "Full Beam",
    name_ka: "სრული სინათლე",
    price: "2000–2500₾",
    perMonth: [
      { count: "12–16", label: "Posters", label_ka: "პოსტერი" },
      { count: "6–8", label: "Videos", label_ka: "ვიდეო" },
    ],
    includes: ["Social media management"],
    includes_ka: ["სოციალური მედიის მართვა"],
    addon: "Site management +300–500₾",
    addon_ka: "საიტის მართვა +300–500₾",
    featured: false,
  },
];

export const singles = [
  { name: "Photo Retouching & Correction", name_ka: "ფოტო რეტუში და კორექცია", price: "200–500₾" },
  { name: "Video Editing & Correction", name_ka: "ვიდეო მონტაჟი და კორექცია", price: "300–800₾" },
  { name: "Brand Book", name_ka: "ბრენდბუქი", price: "1500–2500₾" },
  { name: "Website — Design & Build", name_ka: "ვებსაიტი — დიზაინი და აშენება", price: "2000–3000₾" },
];

export const pricingNote =
  "Working prices — every project gets a final quote after one call. Custom visual material beyond the package is billed as an individual service.";

export const pricingNote_ka =
  "სამუშაო ფასებია — ყოველი პროექტი საბოლოო შეთავაზებას იღებს ერთი ზარის შემდეგ. პაკეტს მიღმა ინდივიდუალური ვიზუალური მასალა ცალკე სერვისად ფასდება.";
