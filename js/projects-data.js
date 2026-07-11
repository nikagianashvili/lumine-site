// CMS-like project registry for the Portfolio.
// Concept/placeholder projects for now — swap fields (or add real entries)
// here and the grid, filters, featured picks, and single-project pages all
// update automatically. Nothing else needs to change.
//
// Every project has ONE `serviceType`, which decides both its card visual
// (browser-frame / play-button / stacked-posters) and which single-project
// template it gets (Web / Photo & Video / Design). Type-specific fields are
// only read by that type's template — leave the others out.

export const SERVICE_TYPES = [
  {
    id: "web",
    label: "Web Development",
    // brand-tone badge, dark end of the ink/paper ramp
    color: "#121212",
    onColor: "#f5f1e6",
  },
  {
    id: "photo-video",
    label: "Photo & Video",
    // mid warm-gray, halfway between ink and paper
    color: "#55524a",
    onColor: "#f5f1e6",
  },
  {
    id: "design",
    label: "Graphic Design",
    // deep tan, the warm end of the paper family
    color: "#b8ac8f",
    onColor: "#121212",
  },
];

export const INDUSTRIES = [
  "Medical",
  "Hotels",
  "Restaurants",
  "Real Estate",
  "SaaS",
  "E-Commerce",
  "Startups",
];

// Render order matters: the "All / All" grid reads this array in order and
// puts a spotlight card at every 3rd slot (0, 3, 6…) — 1 featured + 2
// regular, repeating, with the featured slot rotating across all 3 service
// types so no single discipline dominates the first screenful. Any filtered
// view ignores `featured` entirely and packs everything into a uniform
// dense grid instead — see js/work.js.
export const projects = [
  {
    slug: "kera-hotel",
    title: "Kera Hotel",
    client: "Kera Hotel",
    serviceType: "web",
    industry: "Hotels",
    year: "2026",
    status: "Concept",
    featured: true,
    cover: "/work/work4.jpg",
    blurb: "Booking-first website for a boutique hotel in old Tbilisi.",
    heroTagline: "A room booked is worth ten rooms browsed.",
    challenge:
      "Kera's old site buried the booking button three clicks deep behind a gallery nobody asked for. Guests left to book through a third-party platform that took a cut of every reservation.",
    research:
      "We watched five people try to book a room on the old site. None of them found the calendar without help. The fix wasn't more design — it was less: put the dates up front, everything else after.",
    wireframesImage: "/sample-project/details-1.jpg",
    uiImage: "/sample-project/details-2.jpg",
    development:
      "Built on a static front end with a lightweight booking widget wired straight to the hotel's calendar — no page reload between picking dates and confirming a room.",
    results: [
      { stat: "3", label: "Clicks To Book" },
      { stat: "0%", label: "Platform Commission" },
      { stat: "<2s", label: "Load Time" },
    ],
    technologies: ["HTML/CSS", "JavaScript", "Booking API", "Vercel"],
    gallery: ["/sample-project/hero.jpg", "/sample-project/details-1.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Direct bookings doubled in the first month. We finally stopped paying rent on our own front door.",
      author: "Kera Hotel, Front Office",
    },
  },
  {
    slug: "vantage-clinic",
    title: "Vantage Clinic",
    client: "Vantage Clinic",
    serviceType: "web",
    industry: "Medical",
    year: "2026",
    status: "Concept",
    cover: "/work/work1.jpg",
    blurb: "Appointment-first site for a private medical practice.",
    heroTagline: "Booking a doctor shouldn't need a phone call.",
    challenge:
      "Patients were calling during business hours to book appointments a website should have handled at 2am. The clinic wanted fewer calls, not more marketing.",
    research:
      "The brief here wasn't visual — it was trust. Medical sites either look sterile and cold or overdesigned and salesy. We needed calm, credible, and fast to book.",
    wireframesImage: "/sample-project/details-2.jpg",
    uiImage: "/sample-project/details-1.jpg",
    development:
      "A clean appointment flow by department, synced to the clinic's existing scheduling software, with clear hours and a real map — no chatbot standing in for a phone number.",
    results: [
      { stat: "40%", label: "Fewer Booking Calls" },
      { stat: "6", label: "Departments Online" },
      { stat: "<2s", label: "Load Time" },
    ],
    technologies: ["HTML/CSS", "JavaScript", "Scheduling API", "Vercel"],
    gallery: ["/sample-project/details-1.jpg", "/sample-project/hero.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Our front desk finally answers the phone for actual emergencies instead of rebooking Tuesdays.",
      author: "Vantage Clinic, Practice Manager",
    },
  },
  {
    slug: "tomas-kitchen",
    title: "Toma's Kitchen",
    client: "Toma's Kitchen",
    serviceType: "photo-video",
    industry: "Restaurants",
    year: "2026",
    status: "Concept",
    cover: "/work/work5.jpg",
    blurb: "Short-form video series built around one loud open kitchen.",
    heroTagline: "The kitchen is the show. We just pointed a camera at it.",
    concept:
      "Toma's didn't need a polished ad — it needed the actual 7pm chaos of an open kitchen on a Friday. The brief was one line: make it feel like standing at the pass.",
    behindTheScenes: ["/work/work2.jpg", "/work/work3.jpg", "/team-cards/team-member-1.jpg"],
    galleryImages: ["/work/work5.jpg", "/work/work2.jpg", "/work/work3.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "People started coming in asking for 'the dish from the video.' We didn't even name it in the caption.",
      author: "Toma's Kitchen, Owner",
    },
  },
  {
    slug: "meridian-realty",
    title: "Meridian Realty",
    client: "Meridian Realty",
    serviceType: "photo-video",
    industry: "Real Estate",
    year: "2026",
    status: "Concept",
    featured: true,
    cover: "/work/work4.jpg",
    blurb: "Listing photography and walkthrough video for a boutique agency.",
    heroTagline: "A listing photo is the first showing. Make it count.",
    concept:
      "Meridian's listings were shot on phones between viewings. We proposed a repeatable shoot format — light, angles, one walkthrough clip — fast enough to run on every new listing, not just the flagship ones.",
    behindTheScenes: ["/work/work1.jpg", "/team-cards/team-member-4.jpg", "/work/work6.jpg"],
    galleryImages: ["/work/work4.jpg", "/work/work1.jpg", "/work/work6.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "Listings with the new photos moved noticeably faster. Buyers decide whether to visit in the first three photos.",
      author: "Meridian Realty, Agent",
    },
  },
  {
    slug: "solar-market",
    title: "Solar Market",
    client: "Solar Market",
    serviceType: "web",
    industry: "E-Commerce",
    year: "2026",
    status: "Concept",
    cover: "/work/work6.jpg",
    blurb: "Storefront and SEO push for an online marketplace.",
    heroTagline: "Traffic means nothing without a cart that converts.",
    challenge:
      "Solar Market had paid traffic but a checkout that lost a third of buyers at the last step. Marketing was compensating for a site problem.",
    research:
      "We mapped the checkout drop-off screen by screen. The culprit was forced account creation before payment — a wall most people just walked away from.",
    wireframesImage: "/sample-project/details-1.jpg",
    uiImage: "/sample-project/details-2.jpg",
    development:
      "Rebuilt checkout as guest-first with account creation offered after purchase, not before, plus on-page SEO cleanup across the top 40 product pages.",
    results: [
      { stat: "+22%", label: "Checkout Completion" },
      { stat: "40", label: "Pages Optimized" },
      { stat: "<2s", label: "Load Time" },
    ],
    technologies: ["JavaScript", "SEO", "Payments API", "Vercel"],
    gallery: ["/sample-project/hero.jpg", "/sample-project/details-2.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "Same ad spend, more orders. Turns out the leak was in the bucket, not the tap.",
      author: "Solar Market, Founder",
    },
  },
  {
    slug: "northbeam",
    title: "Northbeam",
    client: "Northbeam",
    serviceType: "design",
    industry: "SaaS",
    year: "2026",
    status: "Concept",
    cover: "/work/work3.jpg",
    blurb: "Brand identity and pitch deck for a B2B analytics platform.",
    heroTagline: "A dashboard company needed a brand that wasn't a dashboard.",
    brief:
      "Every competitor's brand was blue gradients and abstract line charts. Northbeam asked for something a non-technical buyer could trust on sight — the deck had to work in a room with no product demo.",
    moodboardImages: ["/work/work3.jpg", "/sample-project/details-2.jpg", "/work/work4.jpg"],
    deliverablesImages: ["/work/work3.jpg", "/sample-project/hero.jpg", "/work/work4.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "We closed our seed round on this deck. Nobody asked to see the product until slide nine.",
      author: "Northbeam, Co-Founder",
    },
  },
  {
    slug: "aura-coffee",
    title: "Aura Coffee",
    client: "Aura Coffee",
    serviceType: "design",
    industry: "Restaurants",
    year: "2026",
    status: "Concept",
    featured: true,
    cover: "/work/work1.jpg",
    blurb: "Identity and print system for a specialty coffee bar.",
    heroTagline: "A cup you'd recognize with the logo covered.",
    brief:
      "Aura wanted to look like the coffee, not like every other coffee brand: warm, a little industrial, no leaf illustrations, no hand-lettered scripts.",
    moodboardImages: ["/work/work1.jpg", "/sample-project/details-1.jpg", "/work/work6.jpg"],
    deliverablesImages: ["/work/work1.jpg", "/sample-project/details-2.jpg", "/work/work6.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "Regulars started asking if the cups were for sale. That's the whole brief, answered.",
      author: "Aura Coffee, Founder",
    },
  },
  {
    slug: "launchpad-studio",
    title: "Launchpad Studio",
    client: "Launchpad Studio",
    serviceType: "photo-video",
    industry: "Startups",
    year: "2026",
    status: "Concept",
    cover: "/work/work2.jpg",
    blurb: "Founder-facing launch video for an early-stage accelerator cohort.",
    heroTagline: "Ninety seconds to explain what took a year to build.",
    concept:
      "Six founders, six products, one demo day. The brief was a launch reel that respected each founder's own voice instead of flattening them into one accelerator template.",
    behindTheScenes: ["/team-cards/team-member-3.jpg", "/work/work3.jpg", "/work/work5.jpg"],
    galleryImages: ["/work/work2.jpg", "/work/work3.jpg", "/work/work5.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Investors watched all six clips back to back and still remembered whose was whose. That's the whole job, done.",
      author: "Launchpad Studio, Program Lead",
    },
  },
  {
    slug: "forma-collective",
    title: "Forma Collective",
    client: "Forma Collective",
    serviceType: "design",
    industry: "Startups",
    year: "2026",
    status: "Concept",
    cover: "/work/work6.jpg",
    blurb: "Naming, identity, and launch posters for a coworking startup.",
    heroTagline: "The posters had to sell a room nobody could see yet.",
    brief:
      "Forma was pre-launch — no space to photograph yet. The identity and a run of posters had to sell the feeling of the room before the room existed.",
    moodboardImages: ["/work/work6.jpg", "/work/work1.jpg", "/sample-project/details-1.jpg"],
    deliverablesImages: ["/work/work6.jpg", "/sample-project/details-2.jpg", "/work/work1.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "We pre-sold a third of our desks off the poster campaign alone, before the paint dried.",
      author: "Forma Collective, Founder",
    },
  },
];

export function getServiceType(id) {
  return SERVICE_TYPES.find((s) => s.id === id);
}

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
