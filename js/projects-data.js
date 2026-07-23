// CMS-like project registry for the Portfolio.
// Concept/placeholder projects for now — swap fields (or add real entries)
// here and the grid, filters, featured picks, and single-project pages all
// update automatically. Nothing else needs to change.
//
// Every project has ONE `serviceType`, which decides both its card visual
// (browser-frame / play-button / stacked-posters) and which single-project
// template it gets (Web / Photo & Video / Design). Type-specific fields are
// only read by that type's template — leave the others out.
//
// `_ka` fields are the Georgian text, picked at render time by js/work.js,
// js/project.js, and js/featured.js based on whether the current page is
// under /ka/. `industry` itself stays in English everywhere (it's a
// filter/data value, not display text) — see INDUSTRY_LABELS_KA below for
// its display translation.

export const SERVICE_TYPES = [
  {
    id: "web",
    label: "Web Development",
    label_ka: "ვებ დეველოპმენტი",
    // brand-tone badge, dark end of the ink/paper ramp
    color: "#17130f",
    onColor: "#f6f1e7",
  },
  {
    id: "photo-video",
    label: "Photo & Video",
    label_ka: "ფოტო და ვიდეო",
    // mid warm-gray, halfway between ink and paper
    color: "#6b6259",
    onColor: "#f6f1e7",
  },
  {
    id: "design",
    label: "Graphic Design",
    label_ka: "გრაფიკული დიზაინი",
    // deep tan, the warm end of the paper family
    color: "#b8ac8f",
    onColor: "#17130f",
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
  "Public Sector",
  "Fitness",
  "Electronics",
  "Finance",
  "Retail",
];

// Display-only Georgian labels for INDUSTRIES — the English strings above
// stay the actual filter/data values (project.industry, URL params, etc).
export const INDUSTRY_LABELS_KA = {
  Medical: "სამედიცინო",
  Hotels: "სასტუმროები",
  Restaurants: "რესტორნები",
  "Real Estate": "უძრავი ქონება",
  SaaS: "SaaS",
  "E-Commerce": "ელ-კომერცია",
  Startups: "სტარტაპები",
  "Public Sector": "საჯარო სექტორი",
  Fitness: "ფიტნესი",
  Electronics: "ელექტრონიკა",
  Finance: "ფინანსები",
  Retail: "საცალო ვაჭრობა",
};

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
    status_ka: "კონცეფცია",
    featured: true,
    cover: "/work/work4.jpg",
    blurb: "Booking-first website for a boutique hotel in old Tbilisi.",
    blurb_ka: "დაჯავშნაზე ორიენტირებული საიტი ბუტიკ სასტუმროსთვის ძველ თბილისში.",
    heroTagline: "A room booked is worth ten rooms browsed.",
    heroTagline_ka: "დაჯავშნილი ნომერი ათი დათვალიერებულის ღირს.",
    challenge:
      "Kera's old site buried the booking button three clicks deep behind a gallery nobody asked for. Guests left to book through a third-party platform that took a cut of every reservation.",
    challenge_ka:
      "Kera-ს ძველი საიტი დაჯავშნის ღილაკს სამი კლიკის სიღრმეში მალავდა, გალერეის უკან, რომელიც არავის უთხოვია. სტუმრები მესამე მხარის პლატფორმაზე მიდიოდნენ დასაჯავშნად, რომელიც ყოველი ჯავშნიდან პროცენტს იღებდა.",
    research:
      "We watched five people try to book a room on the old site. None of them found the calendar without help. The fix wasn't more design — it was less: put the dates up front, everything else after.",
    research_ka:
      "ხუთმა ადამიანმა ძველ საიტზე ოთახის დაჯავშნა სცადა ჩვენს თვალწინ. არცერთმა კალენდარი დახმარების გარეშე ვერ იპოვა. გამოსავალი მეტი დიზაინი კი არა, ნაკლები იყო: თარიღები წინ, ყველაფერი დანარჩენი — შემდეგ.",
    wireframesImage: "/sample-project/details-1.jpg",
    uiImage: "/sample-project/details-2.jpg",
    development:
      "Built on a static front end with a lightweight booking widget wired straight to the hotel's calendar — no page reload between picking dates and confirming a room.",
    development_ka:
      "აშენდა სტატიკურ ფრონტენდზე მსუბუქი დაჯავშნის ვიჯეტით, პირდაპირ სასტუმროს კალენდარზე მიბმული — გვერდის გადატვირთვის გარეშე თარიღების არჩევასა და ოთახის დადასტურებას შორის.",
    results: [
      { stat: "3", label: "Clicks To Book", label_ka: "დაჯავშნის კლიკი" },
      { stat: "0%", label: "Platform Commission", label_ka: "პლატფორმის საკომისიო" },
      { stat: "<2s", label: "Load Time", label_ka: "ჩატვირთვის დრო" },
    ],
    technologies: ["HTML/CSS", "JavaScript", "Booking API", "Vercel"],
    gallery: ["/sample-project/hero.jpg", "/sample-project/details-1.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Direct bookings doubled in the first month. We finally stopped paying rent on our own front door.",
      quote_ka: "პირდაპირი ჯავშნები პირველ თვეშივე გაორმაგდა. ბოლოს და ბოლოს შევწყვიტეთ საკუთარ კართან ქირის გადახდა.",
      author: "Kera Hotel, Front Office",
      author_ka: "Kera Hotel, მიმღები",
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
    status_ka: "კონცეფცია",
    cover: "/work/work1.jpg",
    blurb: "Appointment-first site for a private medical practice.",
    blurb_ka: "ვიზიტზე ორიენტირებული საიტი კერძო სამედიცინო კლინიკისთვის.",
    heroTagline: "Booking a doctor shouldn't need a phone call.",
    heroTagline_ka: "ექიმთან ჩაწერას სატელეფონო ზარი არ უნდა სჭირდებოდეს.",
    challenge:
      "Patients were calling during business hours to book appointments a website should have handled at 2am. The clinic wanted fewer calls, not more marketing.",
    challenge_ka:
      "პაციენტები სამუშაო საათებში რეკავდნენ ჩასაწერად, რაც საიტს ღამის 2 საათზეც უნდა შეეძლო. კლინიკას სურდა ნაკლები ზარი, არა მეტი მარკეტინგი.",
    research:
      "The brief here wasn't visual — it was trust. Medical sites either look sterile and cold or overdesigned and salesy. We needed calm, credible, and fast to book.",
    research_ka:
      "ბრიფი აქ ვიზუალური არ იყო — ის ნდობა იყო. სამედიცინო საიტები ან სტერილურად ცივია, ან ზედმეტად გაფორმებული და მოსაყიდი. გვჭირდებოდა მშვიდი, სანდო და სწრაფად დასაჯავშნი.",
    wireframesImage: "/sample-project/details-2.jpg",
    uiImage: "/sample-project/details-1.jpg",
    development:
      "A clean appointment flow by department, synced to the clinic's existing scheduling software, with clear hours and a real map — no chatbot standing in for a phone number.",
    development_ka:
      "სუფთა ჩაწერის ნაკადი დეპარტამენტების მიხედვით, სინქრონიზებული კლინიკის არსებულ პროგრამასთან, ნათელი საათებითა და რეალური რუკით — ჩატბოტის გარეშე, რომელიც ტელეფონის ნომერს ჩაანაცვლებდა.",
    results: [
      { stat: "40%", label: "Fewer Booking Calls", label_ka: "ნაკლები ჩაწერის ზარი" },
      { stat: "6", label: "Departments Online", label_ka: "დეპარტამენტი ონლაინ" },
      { stat: "<2s", label: "Load Time", label_ka: "ჩატვირთვის დრო" },
    ],
    technologies: ["HTML/CSS", "JavaScript", "Scheduling API", "Vercel"],
    gallery: ["/sample-project/details-1.jpg", "/sample-project/hero.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Our front desk finally answers the phone for actual emergencies instead of rebooking Tuesdays.",
      quote_ka: "ჩვენი მისაღები ბოლოს და ბოლოს უპასუხებს ტელეფონს რეალურ გადაუდებელ შემთხვევებზე და არა სამშაბათის ხელახლა ჩაწერაზე.",
      author: "Vantage Clinic, Practice Manager",
      author_ka: "Vantage Clinic, პრაქტიკის მენეჯერი",
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
    status_ka: "კონცეფცია",
    cover: "/work/work5.jpg",
    blurb: "Short-form video series built around one loud open kitchen.",
    blurb_ka: "მოკლემეტრაჟიანი ვიდეო სერია, აგებული ერთი ხმაურიანი ღია სამზარეულოს გარშემო.",
    heroTagline: "The kitchen is the show. We just pointed a camera at it.",
    heroTagline_ka: "სამზარეულო თვითონაა შოუ. უბრალოდ კამერა მივმართეთ.",
    concept:
      "Toma's didn't need a polished ad — it needed the actual 7pm chaos of an open kitchen on a Friday. The brief was one line: make it feel like standing at the pass.",
    concept_ka:
      "Toma's-ს გაპრიალებული რეკლამა არ სჭირდებოდა — რეალური, პარასკევის 19:00 საათის ქაოსი სჭირდებოდა ღია სამზარეულოში. ბრიფი ერთი წინადადება იყო: შეგრძნება, თითქოს დგახარ დახლთან.",
    behindTheScenes: ["/work/work2.jpg", "/work/work3.jpg", "/team-cards/team-member-1.jpg"],
    galleryImages: ["/work/work5.jpg", "/work/work2.jpg", "/work/work3.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "People started coming in asking for 'the dish from the video.' We didn't even name it in the caption.",
      quote_ka: 'ხალხმა შემოსვლა დაიწყო და "ვიდეოდან კერძს" ითხოვდა. სახელიც კი არ ვახსენეთ წარწერაში.',
      author: "Toma's Kitchen, Owner",
      author_ka: "Toma's Kitchen, მფლობელი",
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
    status_ka: "კონცეფცია",
    featured: true,
    cover: "/work/work4.jpg",
    blurb: "Listing photography and walkthrough video for a boutique agency.",
    blurb_ka: "სარეკლამო ფოტოგრაფია და სავიზიტო ვიდეო ბუტიკ საბროკერო კომპანიისთვის.",
    heroTagline: "A listing photo is the first showing. Make it count.",
    heroTagline_ka: "სარეკლამო ფოტო პირველი ჩვენებაა. დათვალე.",
    concept:
      "Meridian's listings were shot on phones between viewings. We proposed a repeatable shoot format — light, angles, one walkthrough clip — fast enough to run on every new listing, not just the flagship ones.",
    concept_ka:
      "Meridian-ის განცხადებები ტელეფონით იყო გადაღებული, ორ ჩვენებას შორის. შევთავაზეთ განმეორებადი გადაღების ფორმატი — განათება, კუთხეები, ერთი სავიზიტო ვიდეო — საკმარისად სწრაფი ყოველი ახალი განცხადებისთვის, არა მხოლოდ ფლაგმანისთვის.",
    behindTheScenes: ["/work/work1.jpg", "/team-cards/team-member-4.jpg", "/work/work6.jpg"],
    galleryImages: ["/work/work4.jpg", "/work/work1.jpg", "/work/work6.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "Listings with the new photos moved noticeably faster. Buyers decide whether to visit in the first three photos.",
      quote_ka: "ახალი ფოტოებით განცხადებები შესამჩნევად სწრაფად გაიყიდა. მყიდველები პირველივე სამი ფოტოთი წყვეტენ, ჩამოვიდნენ თუ არა.",
      author: "Meridian Realty, Agent",
      author_ka: "Meridian Realty, აგენტი",
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
    status_ka: "კონცეფცია",
    cover: "/work/work6.jpg",
    blurb: "Storefront and SEO push for an online marketplace.",
    blurb_ka: "მაღაზია და SEO-ს ბიძგი ონლაინ მარკეტფლეისისთვის.",
    heroTagline: "Traffic means nothing without a cart that converts.",
    heroTagline_ka: "ტრაფიკს აზრი არ აქვს, თუ კალათა არ იყიდის.",
    challenge:
      "Solar Market had paid traffic but a checkout that lost a third of buyers at the last step. Marketing was compensating for a site problem.",
    challenge_ka:
      "Solar Market-ს ჰქონდა ფასიანი ტრაფიკი, მაგრამ ჩექაუთი ბოლო ეტაპზე მყიდველების მესამედს კარგავდა. მარკეტინგი საიტის პრობლემას აბალანსებდა.",
    research:
      "We mapped the checkout drop-off screen by screen. The culprit was forced account creation before payment — a wall most people just walked away from.",
    research_ka:
      "ჩექაუთის დანაკარგი ეკრანების მიხედვით დავხატეთ. დამნაშავე იძულებითი რეგისტრაცია იყო გადახდამდე — კედელი, რომელსაც უმეტესობა უბრალოდ ტოვებდა.",
    wireframesImage: "/sample-project/details-1.jpg",
    uiImage: "/sample-project/details-2.jpg",
    development:
      "Rebuilt checkout as guest-first with account creation offered after purchase, not before, plus on-page SEO cleanup across the top 40 product pages.",
    development_ka:
      "ჩექაუთი ხელახლა აშენდა სტუმრად-პირველ ფორმატში, რეგისტრაცია შემოთავაზებულია ყიდვის შემდეგ და არა წინ, პლუს ტოპ 40 პროდუქტის გვერდის SEO-ს გასუფთავება.",
    results: [
      { stat: "+22%", label: "Checkout Completion", label_ka: "ჩექაუთის დასრულება" },
      { stat: "40", label: "Pages Optimized", label_ka: "ოპტიმიზებული გვერდი" },
      { stat: "<2s", label: "Load Time", label_ka: "ჩატვირთვის დრო" },
    ],
    technologies: ["JavaScript", "SEO", "Payments API", "Vercel"],
    gallery: ["/sample-project/hero.jpg", "/sample-project/details-2.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "Same ad spend, more orders. Turns out the leak was in the bucket, not the tap.",
      quote_ka: "იგივე რეკლამის ბიუჯეტი, მეტი შეკვეთა. გამოდის, ჟონგლი ვედროში იყო და არა ონკანში.",
      author: "Solar Market, Founder",
      author_ka: "Solar Market, დამფუძნებელი",
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
    status_ka: "კონცეფცია",
    cover: "/work/work3.jpg",
    blurb: "Brand identity and pitch deck for a B2B analytics platform.",
    blurb_ka: "საბრენდო იდენტობა და პიჩ-დეკი B2B ანალიტიკის პლატფორმისთვის.",
    heroTagline: "A dashboard company needed a brand that wasn't a dashboard.",
    heroTagline_ka: "დეშბორდის კომპანიას სჭირდებოდა ბრენდი, რომელიც დეშბორდს არ ჰგავდა.",
    brief:
      "Every competitor's brand was blue gradients and abstract line charts. Northbeam asked for something a non-technical buyer could trust on sight — the deck had to work in a room with no product demo.",
    brief_ka:
      "ყოველი კონკურენტის ბრენდი ლურჯი გრადიენტი და აბსტრაქტული გრაფიკი იყო. Northbeam-მა ითხოვა რაღაც, რასაც არატექნიკური მყიდველი პირველივე შეხედვით ენდობოდა — დეკი ისეთი ოთახისთვისაც უნდა მუშაობდა, სადაც პროდუქტის დემო არ იქნებოდა.",
    moodboardImages: ["/work/work3.jpg", "/sample-project/details-2.jpg", "/work/work4.jpg"],
    deliverablesImages: ["/work/work3.jpg", "/sample-project/hero.jpg", "/work/work4.jpg", "/sample-project/details-1.jpg"],
    testimonial: {
      quote: "We closed our seed round on this deck. Nobody asked to see the product until slide nine.",
      quote_ka: "ამ დეკზე დავხურეთ ჩვენი პირველი რაუნდი. ცხრილამდე არავის უკითხავს პროდუქტის ჩვენება.",
      author: "Northbeam, Co-Founder",
      author_ka: "Northbeam, თანადამფუძნებელი",
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
    status_ka: "კონცეფცია",
    featured: true,
    cover: "/work/work1.jpg",
    blurb: "Identity and print system for a specialty coffee bar.",
    blurb_ka: "იდენტობა და ბეჭდვითი სისტემა სპეციალობის ყავის ბარისთვის.",
    heroTagline: "A cup you'd recognize with the logo covered.",
    heroTagline_ka: "ჭიქა, რომელსაც ლოგოს გარეშეც იცნობ.",
    brief:
      "Aura wanted to look like the coffee, not like every other coffee brand: warm, a little industrial, no leaf illustrations, no hand-lettered scripts.",
    brief_ka:
      "Aura-ს სურდა ეგონა ყავასავით და არა სხვა ყავის ბრენდივით: თბილი, ოდნავ ინდუსტრიული, ფოთლების ილუსტრაციისა და ხელნაწერი შრიფტების გარეშე.",
    moodboardImages: ["/work/work1.jpg", "/sample-project/details-1.jpg", "/work/work6.jpg"],
    deliverablesImages: ["/work/work1.jpg", "/sample-project/details-2.jpg", "/work/work6.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "Regulars started asking if the cups were for sale. That's the whole brief, answered.",
      quote_ka: "მუდმივმა კლიენტებმა ჭიქების ყიდვაზეც კი გვკითხეს. მთელი ბრიფი, ერთ პასუხში.",
      author: "Aura Coffee, Founder",
      author_ka: "Aura Coffee, დამფუძნებელი",
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
    status_ka: "კონცეფცია",
    cover: "/work/work2.jpg",
    blurb: "Founder-facing launch video for an early-stage accelerator cohort.",
    blurb_ka: "დამფუძნებლისკენ მიმართული გამშვები ვიდეო ადრეული სტადიის აქსელერატორის ჯგუფისთვის.",
    heroTagline: "Ninety seconds to explain what took a year to build.",
    heroTagline_ka: "ოთხმოცდაათი წამი იმის ასახსნელად, რაც წელიწადში აშენდა.",
    concept:
      "Six founders, six products, one demo day. The brief was a launch reel that respected each founder's own voice instead of flattening them into one accelerator template.",
    concept_ka:
      "ექვსი დამფუძნებელი, ექვსი პროდუქტი, ერთი დემო დღე. ბრიფი გამშვები რგოლი იყო, რომელიც პატივს სცემდა თითოეული დამფუძნებლის საკუთარ ხმას, ერთ აქსელერატორის შაბლონად გადაქცევის ნაცვლად.",
    behindTheScenes: ["/team-cards/team-member-3.jpg", "/work/work3.jpg", "/work/work5.jpg"],
    galleryImages: ["/work/work2.jpg", "/work/work3.jpg", "/work/work5.jpg", "/sample-project/details-2.jpg"],
    testimonial: {
      quote: "Investors watched all six clips back to back and still remembered whose was whose. That's the whole job, done.",
      quote_ka: "ინვესტორებმა ექვსივე კლიპი ზედიზედ ნახეს და მაინც ახსოვდათ, ვისი რომელი იყო. ეს არის მთელი დავალება, შესრულებული.",
      author: "Launchpad Studio, Program Lead",
      author_ka: "Launchpad Studio, პროგრამის ხელმძღვანელი",
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
    status_ka: "კონცეფცია",
    cover: "/work/work6.jpg",
    blurb: "Naming, identity, and launch posters for a coworking startup.",
    blurb_ka: "სახელდება, იდენტობა და გამშვები პოსტერები კოვორქინგ სტარტაპისთვის.",
    heroTagline: "The posters had to sell a room nobody could see yet.",
    heroTagline_ka: "პოსტერებს უნდა გაეყიდა ოთახი, რომელიც ჯერ არავის ენახა.",
    brief:
      "Forma was pre-launch — no space to photograph yet. The identity and a run of posters had to sell the feeling of the room before the room existed.",
    brief_ka:
      "Forma გაშვებამდე იყო — სივრცე ჯერ არ არსებობდა გადასაღებად. იდენტობასა და პოსტერების სერიას ოთახის შეგრძნება უნდა გაეყიდა, სანამ ოთახი თვითონ იარსებებდა.",
    moodboardImages: ["/work/work6.jpg", "/work/work1.jpg", "/sample-project/details-1.jpg"],
    deliverablesImages: ["/work/work6.jpg", "/sample-project/details-2.jpg", "/work/work1.jpg", "/sample-project/hero.jpg"],
    testimonial: {
      quote: "We pre-sold a third of our desks off the poster campaign alone, before the paint dried.",
      quote_ka: "მაგიდების მესამედი წინასწარ გავყიდეთ მხოლოდ პოსტერების კამპანიით, ღებავიც არ გამშრალა.",
      author: "Forma Collective, Founder",
      author_ka: "Forma Collective, დამფუძნებელი",
    },
  },
  {
    slug: "tbilisi-zoo",
    title: "Tbilisi Zoo",
    client: "Tbilisi Zoo",
    serviceType: "design",
    industry: "Public Sector",
    year: "2024",
    status: "Completed",
    status_ka: "დასრულებული",
    cover: "/work/design/tbilisi-zoo/cover.jpg",
    blurb: "Illustrated brand identity and merchandise system for Georgia's national zoo.",
    blurb_ka: "ილუსტრირებული საბრენდო იდენტობა და სუვენირული სისტემა თბილისის ზოოპარკისთვის.",
    heroTagline: "A zoo's identity, told through the animals themselves.",
    heroTagline_ka: "ზოოპარკის იდენტობა, ნაამბობი თავად ცხოველების მეშვეობით.",
    brief:
      "Tbilisi Zoo wanted an identity that read as playful and family-facing without leaning on animal photography — a mark and pattern system flexible enough to carry across bags, t-shirts, badges, and signage.",
    brief_ka:
      "თბილისის ზოოპარკს სურდა იდენტობა, რომელიც მხიარული და ოჯახზე ორიენტირებული იქნებოდა ცხოველების ფოტოგრაფიის გარეშე — ნიშანი და პატერნების სისტემა, საკმარისად მოქნილი ჩანთებზე, მაისურებზე, ბეჯებსა და აბრებზე გადასატანად.",
    moodboardImages: ["/work/design/tbilisi-zoo/mood1.jpg", "/work/design/tbilisi-zoo/cover.jpg"],
    deliverablesImages: ["/work/design/tbilisi-zoo/mood2.jpg", "/work/design/tbilisi-zoo/mood1.jpg"],
  },
  {
    slug: "fit-rock",
    title: "Fit Rock",
    client: "Fit Rock",
    serviceType: "design",
    industry: "Fitness",
    year: "2026",
    status: "Completed",
    status_ka: "დასრულებული",
    cover: "/work/design/fit-rock/cover.jpg",
    blurb: "3D product identity for a fitness-equipment brand built around stone and metal.",
    blurb_ka: "3D საბრენდო იდენტობა ფიტნეს-აღჭურვილობის ბრენდისთვის, აგებული ქვასა და მეტალზე.",
    heroTagline: "Weights that look as tough as the workout.",
    heroTagline_ka: "წონები, რომლებიც ვარჯიშივით მძიმედ გამოიყურება.",
    brief:
      "Fit Rock needed packaging and social content that felt heavier and more durable than a typical gym-equipment brand — rendered dumbbells set against real stone, plus a wordmark and weight-plate badge system for the product line.",
    brief_ka:
      "Fit Rock-ს სჭირდებოდა შეფუთვა და სოციალური კონტენტი, რომელიც ჩვეულებრივ სავარჯიშო აღჭურვილობის ბრენდზე მძიმე და გამძლე შეგრძნებას მისცემდა — რეალურ ქვაზე დარენდერებული სავარჯიშო წონები, პლუს სავაჭრო ნიშანი და წონის დისკოს ბეჯების სისტემა პროდუქტის ხაზისთვის.",
    moodboardImages: ["/work/design/fit-rock/mood1.jpg", "/work/design/fit-rock/cover.jpg"],
    deliverablesImages: ["/work/design/fit-rock/mood2.jpg", "/work/design/fit-rock/deliv1.jpg"],
  },
  {
    slug: "tene",
    title: "TENE",
    client: "TENE",
    serviceType: "design",
    industry: "Electronics",
    year: "2025",
    status: "Completed",
    status_ka: "დასრულებული",
    cover: "/work/design/tene/cover.jpg",
    blurb: "Bold product-launch content for a charging-cable and accessories brand.",
    blurb_ka: "თამამი კონტენტი დამტენი კაბელებისა და აქსესუარების ბრენდის პროდუქტის გაშვებისთვის.",
    heroTagline: "A lightning bolt you don't need to explain.",
    heroTagline_ka: "ელვა, რომლის ახსნაც აღარ გჭირდება.",
    brief:
      "TENE's cable lineup needed social posts that read instantly on a small screen — one motif, a lightning-bolt cut, repeated across every product announcement so the brand stayed recognizable launch after launch.",
    brief_ka:
      "TENE-ს კაბელების ხაზს სჭირდებოდა სოციალური პოსტები, რომლებიც მცირე ეკრანზეც მაშინვე იკითხებოდა — ერთი მოტივი, ელვის ჭრილობა, გამეორებული ყოველ პროდუქტის გამოცხადებაზე, რათა ბრენდი ყოველი გაშვებისას ამოსაცნობი დარჩენილიყო.",
    moodboardImages: ["/work/design/tene/mood1.jpg", "/work/design/tene/cover.jpg"],
    deliverablesImages: ["/work/design/tene/mood2.jpg", "/work/design/tene/mood1.jpg"],
  },
  {
    slug: "tera-leasing",
    title: "Tera Leasing",
    client: "Tera Leasing",
    serviceType: "design",
    industry: "Finance",
    year: "2025",
    status: "Completed",
    status_ka: "დასრულებული",
    cover: "/work/design/tera-leasing/cover.jpg",
    blurb: "Social content system for a financial leasing company.",
    blurb_ka: "სოციალური კონტენტის სისტემა ლიზინგის საფინანსო კომპანიისთვის.",
    heroTagline: "Making leasing terms feel like plain conversation.",
    heroTagline_ka: "ლიზინგის პირობები, ჩვეულებრივი საუბრის შეგრძნებით.",
    brief:
      "Tera Leasing's product terms were dense by nature. The brief was a repeatable post format — a bold question, a short answer — that could explain financing terms without feeling like fine print.",
    brief_ka:
      "Tera Leasing-ის პროდუქტის პირობები ბუნებრივად რთული იყო გასაგებად. დავალება იყო განმეორებადი პოსტის ფორმატი — თამამი კითხვა, მოკლე პასუხი — რომელიც საფინანსო პირობებს იოლად ასახსნიდა, წვრილი შრიფტის შეგრძნების გარეშე.",
    moodboardImages: ["/work/design/tera-leasing/mood1.jpg", "/work/design/tera-leasing/cover.jpg"],
    deliverablesImages: ["/work/design/tera-leasing/mood2.jpg", "/work/design/tera-leasing/mood1.jpg"],
  },
  {
    slug: "4pets",
    title: "4Pets",
    client: "4Pets",
    serviceType: "design",
    industry: "Retail",
    year: "2026",
    status: "Completed",
    status_ka: "დასრულებული",
    cover: "/work/design/4pets/cover.jpg",
    blurb: "Product-promo content system for a pet-supply retailer.",
    blurb_ka: "პროდუქტის სარეკლამო კონტენტის სისტემა შინაური ცხოველების საქონლის რითეილერისთვის.",
    heroTagline: "Every bag of food gets its own moment.",
    heroTagline_ka: "საკვების ყოველ ტომარას თავისი მომენტი აქვს.",
    brief:
      "4Pets sells dozens of product lines across multiple pet-food brands. The brief was a consistent post template — product front and center, one clear headline — that could scale across an entire catalog without a new layout every time.",
    brief_ka:
      "4Pets ყიდის ათობით პროდუქტის ხაზს რამდენიმე ცხოველის საკვების ბრენდში. დავალება იყო თანმიმდევრული პოსტის შაბლონი — პროდუქტი ცენტრში, ერთი მკაფიო სათაური — რომელიც მთელ კატალოგზე გავრცელდებოდა ახალი განლაგების გარეშე ყოველ ჯერზე.",
    moodboardImages: ["/work/design/4pets/mood1.jpg", "/work/design/4pets/cover.jpg"],
    deliverablesImages: ["/work/design/4pets/mood2.jpg", "/work/design/4pets/mood1.jpg"],
  },
];

export function getServiceType(id) {
  return SERVICE_TYPES.find((s) => s.id === id);
}

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}
