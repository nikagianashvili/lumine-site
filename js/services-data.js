// Services registry — nine capabilities, one team. Powers both the
// services.html overview grid and the service.html detail pages
// (service.js renders from this the same way project.js renders
// project.html from projects-data.js).
//
// `_ka` fields are picked by service.js when the page is under /ka/ —
// same convention as projects-data.js. Sub-service name/description pairs
// are filled in for Georgian (sourced directly from the agency's own
// breakdown); top-level hero/problem/whatWeDo/process/deliverables copy is
// English-only for now and falls back accordingly — a fuller Georgian pass
// on those is still a follow-up.

export const services = [
  {
    slug: "strategy",
    index: "01",
    title: "Strategy & Creative Management",
    title_ka: "სტრატეგია და კრეატიული მენეჯმენტი",
    eyebrow: "Service 01",
    heroTagline: "The engine underneath everything else — right before anything gets made.",
    heroTagline_ka: "",
    problem: "Good creative built on the wrong brief is just expensive guessing.",
    problem_ka: "",
    whatWeDo:
      "Before a single asset gets made, this is where the audience gets named, the brief gets right, and someone owns the outcome. Account management, brand positioning, and campaign management — one thread from pitch to delivery, not three separate handoffs.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Account Management & Sales", name_ka: "ანგარიშების მართვა და გაყიდვები", desc: "Pitching, onboarding, retainers, and keeping communication flowing between the client and the creative team.", desc_ka: "" },
      { name: "Brand Strategy & Positioning", name_ka: "ბრენდის სტრატეგია და პოზიციონირება", desc: "Defining the core identity, voice, and market position before any design work begins.", desc_ka: "" },
      { name: "Campaign Management", name_ka: "კამპანიების მენეჯმენტი", desc: "Owning a project end to end, from the initial brief to final delivery.", desc_ka: "" },
    ],
    chips: ["Account Management", "Brand Positioning", "Campaign Management"],
    price: "In Every Package",
    price_ka: "",
    process: [
      { title: "Discover", body: "Audience, competitors, and the actual business problem — named, not assumed." },
      { title: "Define", body: "A written strategy: positioning, voice, and what success looks like." },
      { title: "Direct", body: "The brief goes to the right discipline, with a strategist keeping it on course." },
      { title: "Deliver", body: "One owner accountable for the handoff — nothing lands without a check." },
    ],
    deliverables: [
      "A written brand strategy document",
      "Positioning statement & audience profile",
      "A single accountable account owner",
      "A campaign timeline with real milestones",
    ],
    workFilter: null,
  },

  {
    slug: "photography",
    index: "02",
    title: "Photography",
    title_ka: "ფოტოგრაფია",
    eyebrow: "Service 02",
    heroTagline: "Five kinds of shoot, one eye behind all of them.",
    heroTagline_ka: "",
    problem: "Phone photos flatten good products, and a rushed shoot looks like one.",
    problem_ka: "",
    whatWeDo:
      "Product, commercial, corporate, event, and food photography — shot, retouched, and color-corrected by the same in-house team, so the standard never drops between shoot types.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Product Photography", name_ka: "პროდუქტის გადაღება", desc: "For e-commerce, catalogs, and styled shots built for social media.", desc_ka: "ელ-კომერციისთვის, კატალოგებისთვის და სტილიზებული გადაღებები სოციალური მედიისთვის." },
      { name: "Commercial & Lifestyle", name_ka: "სარეკლამო და ლაიფსთაილ გადაღება", desc: "Brand image photo sessions and creative frames built for campaigns.", desc_ka: "ბრენდის იმიჯური ფოტო-სესიები, კამპანიებისთვის განკუთვნილი კრეატიული კადრები." },
      { name: "Corporate Photography", name_ka: "კორპორატიული ფოტოგრაფია", desc: "Team portraits, workplace process, and office interior shoots.", desc_ka: "გუნდის წევრების პორტრეტები, სამუშაო პროცესის და ოფისის ინტერიერის გადაღება." },
      { name: "Event Photography", name_ka: "ღონისძიებების გაშუქება", desc: "Coverage for corporate parties, conferences, presentations, and festivals.", desc_ka: "კორპორატიული წვეულებების, კონფერენციების, პრეზენტაციებისა და ფესტივალების ფოტო-გაშუქება." },
      { name: "Food & Beverage Photography", name_ka: "კულინარიული ფოტოგრაფია", desc: "Professional shoots for restaurants, cafés, and food products.", desc_ka: "რესტორნების, კაფეებისა და კვების პროდუქტების პროფესიონალური გადაღება." },
    ],
    chips: ["Product", "Commercial", "Corporate", "Events", "Food & Beverage"],
    price: "From 200₾",
    price_ka: "",
    process: [
      { title: "Concept", body: "A short treatment — what the shot needs to prove, not just look like." },
      { title: "Shoot", body: "In-house studio and crew — no scheduling around an outside vendor." },
      { title: "Retouch", body: "Color and detail work handled by the same team that shot it." },
      { title: "Deliver", body: "Sized and cut for print, web, and every feed size." },
    ],
    deliverables: [
      "Finished, retouched image files",
      "Platform-cut versions (feed, story, print)",
      "Raw select files on request",
      "A repeatable shoot cadence",
    ],
    workFilter: "Photography",
  },

  {
    slug: "video",
    index: "03",
    title: "Video Production",
    title_ka: "ვიდეო პროდაქშენი",
    eyebrow: "Service 03",
    heroTagline: "From a three-second hook to a full brand film.",
    heroTagline_ka: "",
    problem: "You have three seconds before the thumb moves on, and a flat video wastes all of them.",
    problem_ka: "",
    whatWeDo:
      "Commercials, short-form social video, corporate and brand films, event highlights, and motion graphics — concepted, shot, edited, and graded in house.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Commercials", name_ka: "სარეკლამო რგოლები", desc: "High-quality ad concepting, shooting, and editing, for TV or digital.", desc_ka: "მაღალი ხარისხის სარეკლამო ვიდეოების იდეის გენერირება, გადაღება და მონტაჟი." },
      { name: "Social Media Video", name_ka: "სოციალური მედიის ვიდეოები", desc: "Trend-aware, dynamic vertical video (Reels, TikToks, Shorts), shot and cut fast.", desc_ka: "ტრენდებზე მორგებული, დინამიური ვერტიკალური ვიდეოების გადაღება და სწრაფი მონტაჟი." },
      { name: "Corporate & Brand Films", name_ka: "კორპორატიული და იმიჯური ვიდეოები", desc: "Brand story, mission, or interview and podcast recording and post.", desc_ka: "ბრენდის ისტორიის, მისიის ან ინტერვიუების/პოდკასტების ჩაწერა და დამუშავება." },
      { name: "Event Highlights", name_ka: "ღონისძიებების ვიდეო გაშუქება", desc: "Energetic recap videos that summarize an event.", desc_ka: "ივენთების შემაჯამებელი, ენერგიული ვიდეო კოლაჟების შექმნა." },
      { name: "Motion Graphics", name_ka: "მოუშენ დიზაინი და ანიმაცია", desc: "Logo animation, 2D explainer videos, and visual effects.", desc_ka: "ლოგოს ანიმაცია, 2D ანიმაციური ახსნითი ვიდეოები და ვიზუალური ეფექტები." },
    ],
    chips: ["Commercials", "Social Video", "Brand Films", "Motion Graphics"],
    price: "From 300₾",
    price_ka: "",
    process: [
      { title: "Concept", body: "A short treatment — what the video needs to prove, not just look like." },
      { title: "Shoot", body: "In-house studio and crew — no scheduling around an outside vendor." },
      { title: "Edit", body: "Color, motion, and sound handled by the same team that shot it." },
      { title: "Deliver", body: "Cut for the platform it's actually going to run on." },
    ],
    deliverables: [
      "Finished, graded video assets",
      "Platform-cut versions (feed, story, ad)",
      "Raw select files on request",
      "A repeatable shoot cadence",
    ],
    workFilter: "Video",
  },

  {
    slug: "brand",
    index: "04",
    title: "Brand & Graphic Design",
    title_ka: "გრაფიკული დიზაინი და ბრენდინგი",
    eyebrow: "Service 04",
    heroTagline: "The visual foundation everything else stands on.",
    heroTagline_ka: "",
    problem: "A brand that looks improvised gets treated like one.",
    problem_ka: "",
    whatWeDo:
      "A system, not a logo in isolation — type, color, and usage rules written down once so every future asset inherits it instead of reinventing it.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Visual Identity (Brand Book)", name_ka: "ვიზუალური იდენტობა (ბრენდბუქი)", desc: "Logo creation, color palette, typography, and a full brand visual guideline.", desc_ka: "ლოგოს შექმნა, ფერთა პალიტრის, ტიპოგრაფიის და ბრენდის ვიზუალური გაიდლაინის შემუშავება." },
      { name: "Digital Assets", name_ka: "ციფრული დიზაინი", desc: "Social media posters, website banners, email design, and digital ad visuals.", desc_ka: "სოციალური მედიის პოსტერები, ვებსაიტის ბანერები, ელ. ფოსტის დიზაინი და ციფრული რეკლამის ვიზუალები." },
      { name: "Print Design", name_ka: "ბეჭდვითი დიზაინი", desc: "Flyers, business cards, catalogs, menus, certificates, badges, and billboards.", desc_ka: "ფლაერები, სავიზიტო ბარათები, კატალოგები, მენიუები, სერტიფიკატები, ბეიჯები და ბილბორდები." },
      { name: "Packaging Design", name_ka: "შეფუთვის დიზაინი", desc: "Creative design for product labels and boxes or packaging.", desc_ka: "პროდუქტის ეტიკეტებისა და ყუთების/შეფუთვების კრეატიული დიზაინი." },
      { name: "UI/UX Design", name_ka: "UI/UX დიზაინი", desc: "Interface and user-experience design for websites and mobile applications.", desc_ka: "ვებგვერდებისა და მობილური აპლიკაციების ინტერფეისის და მომხმარებლის გამოცდილების დიზაინი." },
    ],
    chips: ["Visual Identity", "Digital Assets", "Print", "Packaging", "UI/UX"],
    price: "Brand Book 1500–2500₾",
    price_ka: "",
    process: [
      { title: "Reference", body: "Pull from the brand strategy — voice and positioning come before pixels." },
      { title: "Explore", body: "Type, color, and mark direction — a few real options, not twenty half-ideas." },
      { title: "Systemize", body: "Rules get written down: spacing, pairing, what never happens to the mark." },
      { title: "Apply", body: "The system gets stress-tested across a deck, a post, and a package." },
    ],
    deliverables: [
      "A complete brand guideline document",
      "Primary & secondary logo files",
      "A defined type & color system",
      "Ready-to-use collateral templates",
    ],
    workFilter: "Design",
  },

  {
    slug: "smm",
    index: "05",
    title: "Social Media Management",
    title_ka: "სოციალური მედიის მართვა",
    eyebrow: "Service 05",
    heroTagline: "A content plan that actually ships, not just gets discussed.",
    heroTagline_ka: "",
    problem: "Posting when you remember to isn't a strategy.",
    problem_ka: "",
    whatWeDo:
      "Strategy, a real content calendar, copywriting, community management, and influencer partnerships — the full page-management job, not just the posting.",
    whatWeDo_ka: "",
    subservices: [
      { name: "SMM Strategy", name_ka: "SMM სტრატეგიის შემუშავება", desc: "Target audience research, defining the brand's tone of voice, and planning the communication strategy.", desc_ka: "სამიზნე აუდიტორიის კვლევა, ბრენდის ხმის (Tone of Voice) განსაზღვრა და საკომუნიკაციო სტრატეგიის დაგეგმვა." },
      { name: "Content Plan", name_ka: "კონტენტ გეგმის შედგენა", desc: "A monthly or weekly publishing calendar — posts, stories, and Reels.", desc_ka: "თვიური ან კვირეული პუბლიკაციების კალენდრის შექმნა (პოსტები, სთორები, Reels)." },
      { name: "Copywriting", name_ka: "ქოფირაითინგი", desc: "Creative, engaging, sales-driving copy for every post.", desc_ka: "კრეატიული, საინტერესო და გამყიდველი ტექსტების შექმნა პოსტებისთვის." },
      { name: "Community Management", name_ka: "კომუნითი მენეჯმენტი", desc: "Communicating with followers — replying to comments and direct messages.", desc_ka: "გამომწერებთან კომუნიკაცია, კომენტარებსა და პირად შეტყობინებებზე პასუხის გაცემა." },
      { name: "Influencer Marketing", name_ka: "ინფლუენსერ მარკეტინგი", desc: "Sourcing brand-fit influencers and planning or managing campaigns with them.", desc_ka: "ბრენდთან თავსებადი ინფლუენსერების მოძიება და მათთან სარეკლამო კამპანიების დაგეგმვა/მართვა." },
    ],
    chips: ["Strategy", "Content Plan", "Copywriting", "Community"],
    price: "In Packages — See Pricing",
    price_ka: "",
    process: [
      { title: "Plan", body: "A calendar sized to the tier — rhythm, not a random content dump." },
      { title: "Publish", body: "Platform-native formatting — a Reel isn't a resized ad." },
      { title: "Engage", body: "Comments and DMs answered in the brand's actual voice." },
      { title: "Report", body: "Real numbers, reviewed together, every month." },
    ],
    deliverables: [
      "A live content calendar",
      "A managed community inbox",
      "On-voice copy across every post",
      "Regular performance reporting",
    ],
    workFilter: null,
  },

  {
    slug: "marketing",
    index: "06",
    title: "Digital Marketing & Ads Management",
    title_ka: "ციფრული მარკეტინგი და რეკლამების მართვა",
    eyebrow: "Service 06",
    heroTagline: "Targeted, measured, and reported in numbers you can check yourself.",
    heroTagline_ka: "",
    problem: "Good content nobody sees is a diary, not marketing.",
    problem_ka: "",
    whatWeDo:
      "Paid social, Google Ads, funnel optimization, SEO, and real analytics — spend directed at what's actually converting, not what looks good in a deck.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Paid Social", name_ka: "სოციალური მედიის რეკლამა", desc: "Targeted campaign planning, launch, and optimization on Meta, TikTok, and LinkedIn.", desc_ka: "მიზნობრივი სარეკლამო კამპანიების დაგეგმვა, გაშვება და ოპტიმიზაცია Meta, TikTok, LinkedIn პლატფორმებზე." },
      { name: "Google Ads / PPC", name_ka: "საძიებო სისტემების რეკლამა", desc: "Search, display, and YouTube ad management and optimization.", desc_ka: "Google-ის საძიებო, დისფლეი და YouTube რეკლამების მართვა და ოპტიმიზაცია." },
      { name: "Funnel Optimization", name_ka: "გაყიდვების ძაბრის მართვა", desc: "The full digital path from lead generation to sale, planned and optimized for conversion.", desc_ka: "მომხმარებლის მოზიდვიდან გაყიდვამდე სრული ციფრული გზის დაგეგმვა და კონვერსიის გაზრდა." },
      { name: "SEO", name_ka: "SEO ოპტიმიზაცია", desc: "Technical and content optimization for better organic Google ranking.", desc_ka: "ვებსაიტის ტექნიკური და კონტენტური ოპტიმიზაცია Google-ის ძიებაში ორგანული პოზიციების გასაუმჯობესებლად." },
      { name: "Analytics & Reporting", name_ka: "ანალიტიკა და რეპორტინგი", desc: "Google Analytics, Meta Pixel, and Conversion API setup, with real ROI/ROAS measurement and reporting.", desc_ka: "Google Analytics-ის, Meta Pixel-ის და Conversion API-ს დანერგვა, შედეგების გაზომვა და დეტალური რეპორტები." },
    ],
    chips: ["Paid Social", "Google Ads", "SEO", "Analytics"],
    price: "In Packages — See Pricing",
    price_ka: "",
    process: [
      { title: "Plan", body: "Budget and channels sized to what's actually being sold." },
      { title: "Launch", body: "Campaigns built with real targeting, not a broad guess." },
      { title: "Optimize", body: "Spend adjusted toward what's actually converting." },
      { title: "Report", body: "Real numbers, reviewed together — not a vanity-metrics deck." },
    ],
    deliverables: [
      "Managed, optimized ad campaigns",
      "An SEO baseline and roadmap",
      "Analytics & pixel tracking set up correctly",
      "A monthly ROI/ROAS report",
    ],
    workFilter: null,
  },

  {
    slug: "web",
    index: "07",
    title: "Web Development & Digital Platforms",
    title_ka: "ვებ დეველოპმენტი",
    eyebrow: "Service 07",
    heroTagline: "Where the brand actually lives and operates.",
    heroTagline_ka: "",
    problem: "Your site is the one channel you own. Most look rented.",
    problem_ka: "",
    whatWeDo:
      "Corporate sites, e-commerce, and landing pages, designed and built in house — plus the internal tools most agencies never mention: client portals, admin panels, operational dashboards. Built to be used daily, not just launched once.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Corporate Websites", name_ka: "კორპორატიული საიტების შექმნა", desc: "Brand-representative informational websites.", desc_ka: "ბრენდის წარმომადგენლობითი (ინფორმაციული) ვებგვერდების აწყობა." },
      { name: "E-Commerce", name_ka: "ელ-კომერცია", desc: "Online stores, payment integration, and product catalog setup.", desc_ka: "ონლაინ მაღაზიების შექმნა, გადახდის სისტემების ინტეგრაცია და პროდუქტების კატალოგის გამართვა." },
      { name: "Landing Pages", name_ka: "სადესანტო გვერდები", desc: "Single-page, high-conversion sites for a specific campaign or product.", desc_ka: "კონკრეტული სარეკლამო კამპანიებისთვის ან პროდუქტებისთვის ერთგვერდიანი, მაღალ-კონვერსიული საიტების შექმნა." },
      { name: "Technical Support", name_ka: "საიტის ტექნიკური მხარდაჭერა", desc: "Ongoing updates, bug fixes, and speed optimization.", desc_ka: "ვებსაიტის მუდმივი განახლება, ბაგების გასწორება და სიჩქარის ოპტიმიზაცია." },
      { name: "Hosting & Domain", name_ka: "ჰოსტინგი და დომენი", desc: "Technical infrastructure setup and server administration.", desc_ka: "ტექნიკური ინფრასტრუქტურის გამართვა და სერვერის ადმინისტრირება." },
    ],
    chips: ["Corporate Sites", "E-Commerce", "Landing Pages", "Support"],
    price: "2000–3000₾",
    price_ka: "",
    process: [
      { title: "Wireframe", body: "What has to happen on the page, before anything is styled." },
      { title: "Build", body: "Real code, real content — no placeholder text left behind." },
      { title: "Test", body: "Checked on the devices people actually use, not just a wide monitor." },
      { title: "Launch", body: "Shipped with a way to update it without calling us first." },
    ],
    deliverables: [
      "A live, working site or platform",
      "Editable content — no developer required",
      "Documentation for anything custom-built",
      "A direct line for support after launch",
    ],
    workFilter: "Web",
  },

  {
    slug: "ai",
    index: "08",
    title: "AI Front Office",
    title_ka: "AI Front Office",
    eyebrow: "Service 08",
    heroTagline: "Not a slide in a pitch deck — a front office that never sleeps.",
    heroTagline_ka: "",
    problem: "Most \"AI-powered\" claims are marketing, not infrastructure.",
    problem_ka: "",
    whatWeDo:
      "AI chatbots, automated lead qualification, booking, CRM integration, and voice AI — a real front office that runs around the clock. The agency's own client intake and internal team assistant already run on this, and everything is reviewed by a person before it ships.",
    whatWeDo_ka: "",
    subservices: [
      { name: "AI Chatbots & Virtual Assistants", name_ka: "AI ჩატბოტები და ვირტუალური ასისტენტები", desc: "24/7 customer-support systems, built and integrated into your website, Messenger, and WhatsApp.", desc_ka: "24/7 მომხმარებელთა მხარდაჭერის ინტელექტუალური სისტემების შექმნა და ინტეგრაცია ვებსაიტებზე, Messenger-სა და WhatsApp-ში." },
      { name: "Automated Lead Qualification", name_ka: "ლიდების ავტომატური კვალიფიკაცია", desc: "AI that handles inbound inquiries, asks qualifying questions, and scores potential clients automatically.", desc_ka: "AI სისტემების დანერგვა, რომლებიც ავტომატურად ამუშავებენ შემოსულ მოთხოვნებს და ახარისხებენ პოტენციურ კლიენტებს." },
      { name: "Automated Booking & Calendar Management", name_ka: "ავტომატიზებული ჯავშნები და კალენდრის მართვა", desc: "AI agents that schedule meetings or bookings directly into the calendar during the conversation.", desc_ka: "AI აგენტების დაყენება, რომლებიც მომხმარებელთან საუბრის პარალელურად დამოუკიდებლად ნიშნავენ შეხვედრებს." },
      { name: "CRM Integration & Automation", name_ka: "CRM-ის ინტეგრაცია და ავტომატიზაცია", desc: "AI-collected data sent automatically into HubSpot, Salesforce, Pipedrive, and other internal systems.", desc_ka: "AI-ის მიერ შეგროვებული მონაცემების ავტომატური გაგზავნა კომპანიის შიდა აღრიცხვის სისტემებში." },
      { name: "Voice AI Assistants", name_ka: "ხმოვანი AI ასისტენტები", desc: "AI-powered phone agents for handling inbound calls or outbound cold calling.", desc_ka: "ხელოვნურ ინტელექტზე დაფუძნებული სატელეფონო აგენტების დანერგვა შემომავალი ზარებისთვის ან ცივი დარეკვებისთვის." },
    ],
    chips: ["AI Chatbots", "Lead Qualification", "CRM Integration", "Voice AI"],
    price: "Custom Quote",
    price_ka: "",
    process: [
      { title: "Identify", body: "Find the repetitive step actually worth automating — not everything is." },
      { title: "Prototype", body: "A working version, tested internally before it touches client work." },
      { title: "Review", body: "A person checks the output — AI drafts, it doesn't decide." },
      { title: "Integrate", body: "Folded into the existing workflow and CRM, not a separate tool to remember." },
    ],
    deliverables: [
      "A working, reviewed AI front office",
      "Faster first-response time on every channel",
      "Documentation of what's automated",
      "No black-box decisions on your brand",
    ],
    workFilter: null,
  },

  {
    slug: "printing",
    index: "09",
    title: "Printing Services",
    title_ka: "ბეჭდვითი მომსახურება",
    eyebrow: "Service 09",
    heroTagline: "From a single business card to a full print run.",
    heroTagline_ka: "",
    problem: "Digital work that never becomes something you can hold isn't finished.",
    problem_ka: "",
    whatWeDo:
      "Promotional print, large-format, packaging, branded merchandise, and full print management — the physical half of a brand, handled with the same eye as the digital half.",
    whatWeDo_ka: "",
    subservices: [
      { name: "Promotional Print", name_ka: "სარეკლამო პოლიგრაფია", desc: "Flyers, brochures, booklets, catalogs, menus, and business cards.", desc_ka: "ფლაერების, ბროშურების, ბუკლეტების, კატალოგების, მენიუებისა და სავიზიტო ბარათების ბეჭდვა." },
      { name: "Large Format Printing", name_ka: "ფართო ფორმატის ბეჭდვა", desc: "Billboards, banners, posters, roll-ups, and window or vehicle stickers.", desc_ka: "ბილბორდების, ბანერების, პოსტერების, როლ-აპების და ვიტრინის/მანქანის სტიკერების ბეჭდვა." },
      { name: "Packaging Print", name_ka: "შეფუთვების ბეჭდვა", desc: "Boxes, product labels, paper bags, and gift wrapping.", desc_ka: "ყუთების, პროდუქტის ეტიკეტების, ქაღალდის ჩანთებისა და სასაჩუქრე შეფუთვების წარმოება." },
      { name: "Merchandise & Promo Items", name_ka: "პრომო მასალები", desc: "T-shirts, hoodies, mugs, pens, tote bags, and other branded corporate swag.", desc_ka: "მაისურების, ჰუდების, ჭიქების, კალმების, ტილოს ჩანთებისა და სხვა კორპორატიული სუვენირების ბრენდირება." },
      { name: "Print Management", name_ka: "სტამბური მართვა", desc: "Paper stock and finish selection, proofing oversight, and final quality control.", desc_ka: "ქაღალდის ფაქტურის/ტიპის შერჩევა, სატესტო ბეჭდვის ზედამხედველობა და საბოლოო ხარისხის კონტროლი." },
    ],
    chips: ["Promo Print", "Large Format", "Packaging", "Merchandise"],
    price: "Custom Quote",
    price_ka: "",
    process: [
      { title: "Specify", body: "Stock, finish, and quantity, matched to what the piece actually needs." },
      { title: "Proof", body: "A physical proof checked before the full run — no surprises at scale." },
      { title: "Produce", body: "Run production managed start to finish, print-side." },
      { title: "Deliver", body: "Delivered ready to use, with the spec saved for an easy reorder." },
    ],
    deliverables: [
      "Print-ready files",
      "A checked physical proof",
      "The completed, delivered run",
      "A saved spec for reordering",
    ],
    workFilter: null,
  },
];

export function getService(slug) {
  return services.find((s) => s.slug === slug);
}
