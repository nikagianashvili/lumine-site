// i18n-data.js — selector -> [english, georgian] pair (or {attr, en, ka}
// for attributes, or an array of pairs when a selector matches several
// elements in document order). Consumed by js/i18n.js.
//
// Values are always written from here, never read back out of the DOM —
// see the comment at the top of js/i18n.js for why that matters.
//
// Dynamic content (work grid, pricing cards, single project pages) is
// translated separately — see js/projects-data.js, js/pricing-data.js,
// js/work.js, js/pricing.js, js/project.js, js/featured.js, js/team-cards.js.

// Keys inside `common` below that exist in the raw server-rendered HTML
// on every page from the start (as opposed to the nav menu overlay and
// footer link grid, which nav.js / footer-links.js build later at
// runtime). js/i18n-early.js uses this list to translate everything it
// safely can before any animation script gets a turn — see its own
// header comment for why that ordering matters.
export const STATIC_COMMON_KEYS = [".footer-cta-eyebrow", ".footer-cta-heading", ".footer-copy"];

export const translations = {
  // ────────────────────────────────────────────────────────────────────────
  // shared across every page: nav menu overlay + footer
  // ────────────────────────────────────────────────────────────────────────
  common: {
    ".open-label": ["Menu", "მენიუ"],
    ".close-label": ["Close", "დახურვა"],

    '.menu-col[data-col="0"] .menu-content-group:nth-child(1) p:last-child': ["Tbilisi, Georgia", "თბილისი, საქართველო"],

    '.menu-col[data-col="0"] .menu-content-group:nth-child(2) p': [
      ["What We Do", "რას ვაკეთებთ"],
      ["Photo & Video", "ფოტო და ვიდეო"],
      ["Design & Branding", "დიზაინი და ბრენდინგი"],
      ["Marketing & Web", "მარკეტინგი და ვები"],
    ],
    '.menu-col[data-col="0"] .menu-content-group:nth-child(3) p:first-child': ["Say Hello", "მოგვწერეთ"],
    '.menu-col[data-col="0"] .menu-content-group:nth-child(4) p:first-child': ["Hotline", "სატელეფონო ხაზი"],
    '.menu-col[data-col="1"] .menu-content-group:nth-child(1) p:first-child': ["Socials", "სოციალური ქსელები"],
    '.menu-col[data-col="1"] .menu-content-group:nth-child(2) p:first-child': ["Language", "ენა"],
    '.menu-col[data-col="1"] .menu-content-group:nth-child(2) p:last-child': ["Georgian, Mostly", "ძირითადად ქართული"],
    '.menu-col[data-col="1"] .menu-content-group:nth-child(3) p:first-child': ["Available For", "ხელმისაწვდომია"],
    '.menu-col[data-col="1"] .menu-content-group:nth-child(3) p:last-child': ["New Projects", "ახალი პროექტებისთვის"],

    '.menu-link[data-route="/"] a span': ["Home", "მთავარი"],
    '.menu-link[data-route="/studio"] a span': ["Studio", "სტუდია"],
    '.menu-link[data-route="/services"] a span': ["Services", "სერვისები"],
    '.menu-link[data-route="/work"] a span': ["Work", "ნამუშევრები"],
    '.menu-link[data-route="/pricing"] a span': ["Pricing", "ფასები"],
    '.menu-link[data-route="/journal"] a span': ["Journal", "ჟურნალი"],
    '.menu-link[data-route="/contact"] a span': ["Contact", "კონტაქტი"],

    ".footer-cta-eyebrow": ["We Are Listening", "გისმენთ"],
    ".footer-cta-heading": ["Your Next Big Thing Starts Here", "თქვენი შემდეგი დიდი საქმე სწორედ აქედან იწყება"],
    ".footer-copy": ["Tbilisi, Georgia", "თბილისი, საქართველო"],

    ".footer-cta-meta-item:nth-child(1)": ["Based In Tbilisi", "დაფუძნებულია თბილისში"],
    ".footer-cta-meta-item:nth-child(2)": ["Available For New Projects", "ხელმისაწვდომია ახალი პროექტებისთვის"],
    ".footer-cta-actions .btn-invert": ["Book A Call", "დარეკვის დაჯავშნა"],

    ".footer-links-tag": [
      "Photo, video, design, social, marketing, and web — in house, in Tbilisi.",
      "ფოტო, ვიდეო, დიზაინი, სოციალური მედია, მარკეტინგი და ვები — ყველაფერი ერთ გუნდში, თბილისში.",
    ],
    ".footer-newsletter-label": [
      "The Journal is the newsletter — new notes by email",
      "ჟურნალი არის ჩვენი გამოწერა — ახალი ჩანაწერები პირდაპირ მეილზე",
    ],
    '.footer-newsletter input[name="email"]': { attr: "placeholder", en: "you@email.com", ka: "შენი@მეილი.com" },

    ".footer-links > div:nth-child(2) .footer-links-title": ["Pages", "გვერდები"],
    ".footer-links > div:nth-child(2) a": [
      ["Home", "მთავარი"],
      ["Studio", "სტუდია"],
      ["Services", "სერვისები"],
      ["Work", "ნამუშევრები"],
      ["Pricing", "ფასები"],
      ["Journal", "ჟურნალი"],
      ["Q&A", "კითხვა-პასუხი"],
    ],
    ".footer-links > div:nth-child(3) .footer-links-title": ["Services", "სერვისები"],
    ".footer-links > div:nth-child(3) a": [
      ["Photography", "ფოტოგრაფია"],
      ["Video", "ვიდეო"],
      ["Graphic Design", "გრაფიკული დიზაინი"],
      ["Social Media", "სოციალური მედია"],
      ["Marketing", "მარკეტინგი"],
      ["Web", "ვები"],
    ],
    ".footer-links > div:nth-child(4) .footer-links-title": ["Industries", "ინდუსტრიები"],
    ".footer-links > div:nth-child(4) a": [
      ["Medical", "სამედიცინო"],
      ["Hotels", "სასტუმროები"],
      ["Restaurants", "რესტორნები"],
      ["Real Estate", "უძრავი ქონება"],
      ["SaaS", "SaaS"],
      ["E-Commerce", "ელ-კომერცია"],
      ["Startups", "სტარტაპები"],
    ],
    ".footer-links > div:nth-child(5) .footer-links-title": ["Contact", "კონტაქტი"],
    ".footer-links > div:nth-child(5) a": [
      ["hello@lumine.ge", "hello@lumine.ge"],
      ["+995 555 00 00 00", "+995 555 00 00 00"],
      ["Instagram", "Instagram"],
      ["Tbilisi, Georgia", "თბილისი, საქართველო"],
    ],
    ".footer-legal": [
      '<a href="/legal#privacy">Privacy Policy</a> · <a href="/legal#terms">Terms</a> · © 2026 Lumine',
      '<a href="/legal#privacy">კონფიდენციალურობის პოლიტიკა</a> · <a href="/legal#terms">წესები</a> · © 2026 Lumine',
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // home
  // ────────────────────────────────────────────────────────────────────────
  index: {
    ".tag-1 p": ["Bold Ideas", "თამამი იდეები"],
    ".tag-2 p": ["Real Results", "რეალური შედეგები"],
    ".tag-3 p": ["Tbilisi Made", "თბილისში შექმნილი"],

    ".hero-sub p": [
      "A creative agency in Tbilisi — photo, video, design, social, marketing, and web, handled in house and built to perform.",
      "შემოქმედებითი სააგენტო თბილისში — ფოტო, ვიდეო, დიზაინი, სოციალური მედია, მარკეტინგი და ვები, ყველაფერი საკუთარ გუნდში და შედეგზე ორიენტირებული.",
    ],
    ".hero-sub .btn-solid": ["Book A Call", "დარეკვის დაჯავშნა"],
    ".hero-footer-col:nth-child(1) p:nth-child(1)": ["Creative Agency", "შემოქმედებითი სააგენტო"],
    ".hero-footer-col:nth-child(1) p:nth-child(2)": ["Based In Tbilisi", "დაფუძნებული თბილისში"],

    ".strip-track span": [
      ["Photo", "ფოტო"], ["Video", "ვიდეო"], ["Design", "დიზაინი"],
      ["Social", "სოციალური"], ["Marketing", "მარკეტინგი"], ["Web", "ვები"],
      ["Photo", "ფოტო"], ["Video", "ვიდეო"], ["Design", "დიზაინი"],
      ["Social", "სოციალური"], ["Marketing", "მარკეტინგი"], ["Web", "ვები"],
    ],

    ".manifesto .eyebrow": ["The Studio", "სტუდია"],
    ".manifesto h2": ["We Make Brands Impossible To Ignore", "ბრენდებს ვქმნით, რომლებზეც თვალს ვერ მოაშორებ"],
    ".manifesto-foot": [
      "Lumine is a young studio in Tbilisi that treats every brand like its own — strategy first, then photo, video, design, social, marketing, and web, all under one roof.",
      "Lumine ახალგაზრდა სტუდიაა თბილისში, სადაც ყოველ ბრენდს საკუთარივით ვეპყრობით — ჯერ სტრატეგია, მერე ფოტო, ვიდეო, დიზაინი, სოციალური მედია, მარკეტინგი და ვები, ყველაფერი ერთად.",
    ],

    ".trusted-by h3": ["Trusted By", "გვენდობიან"],
    ".trusted-by .section-head-copy": [
      "Placeholder marks for now — this row fills in with real client logos as the roster grows.",
      "ჯერჯერობით სანიმუშო ნიშნებია — ეს რიგი რეალური კლიენტების ლოგოებით ივსება, როცა როსტერი გაიზრდება.",
    ],

    ".section:has(#featuredGrid) .section-head h3": ["Featured Work", "გამორჩეული ნამუშევრები"],
    ".section:has(#featuredGrid) .section-head-copy": [
      "A look at the kind of work we make — across web, photo &amp; video, and design.",
      "შეხედეთ იმ ტიპის ნამუშევრებს, რასაც ვქმნით — ვები, ფოტო და ვიდეო, დიზაინი.",
    ],
    ".section:has(#featuredGrid) .btn-outline": ["View All Work", "ყველა ნამუშევარი"],

    ".section-dark.grain .section-head h3": ["What We Do", "რას ვაკეთებთ"],
    ".section-dark.grain .section-head-copy": [
      "Six services, one team — no handing your project between vendors.",
      "ექვსი სერვისი, ერთი გუნდი — პროექტი არავის ხელში არ გადადის.",
    ],
    '.service-row[href*="Photography"] .service-name': ["Photography", "ფოტოგრაფია"],
    '.service-row[href*="Photography"] .service-desc': [
      "Retouching and color correction, on location or in studio.",
      "რეტუში და ფერთა კორექცია, ლოკაციაზე თუ სტუდიაში.",
    ],
    '.service-row[href*="Video"] .service-name': ["Video Production", "ვიდეო პროდაქშენი"],
    '.service-row[href*="Video"] .service-desc': [
      "Editing, retouching, and color correction for every format.",
      "მონტაჟი, რეტუში და ფერთა კორექცია ნებისმიერი ფორმატისთვის.",
    ],
    '.service-row[href*="Design"] .service-name': ["Graphic Design", "გრაფიკული დიზაინი"],
    '.service-row[href*="Design"] .service-desc': [
      "Posters, logos, banners, business cards, brand books.",
      "პოსტერები, ლოგოები, ბანერები, სავიზიტო ბარათები, ბრენდბუქები.",
    ],
    '.service-row[href*="Social"] .service-name': ["Social Media", "სოციალური მედია"],
    '.service-row[href*="Social"] .service-desc': [
      "Page management and a content plan that actually ships.",
      "გვერდის მართვა და კონტენტ-გეგმა, რომელიც რეალურად სრულდება.",
    ],
    '.service-row[href*="Marketing"] .service-name': ["Digital Marketing", "ციფრული მარკეტინგი"],
    '.service-row[href*="Marketing"] .service-desc': [
      "Paid social advertising and SEO that earns the click.",
      "ფასიანი სოციალური რეკლამა და SEO, რომელიც კლიკს იმსახურებს.",
    ],
    '.service-row[href*="Web"] .service-name': ["Web Development", "ვებ დეველოპმენტი"],
    '.service-row[href*="Web"] .service-desc': [
      "Sites built and maintained — like this one.",
      "საიტები, აშენებული და მხარდაჭერილი — როგორც ეს.",
    ],

    ".section:has(.bento) .section-head h3": ["Why Lumine", "რატომ Lumine"],
    ".bento-lead h6": ["Strategy First", "ჯერ სტრატეგია"],
    ".bento-lead p": [
      "Every project starts with what it needs to achieve, not what looks nice. The brief comes before the moodboard, every time.",
      "ყოველი პროექტი იწყება იმით, თუ რისი მიღწევაა საჭირო და არა იმით, რა გამოიყურება ლამაზად. ბრიფი ყოველთვის წინ უსწრებს მუდბორდს.",
    ],
    ".bento .bento-cell:nth-child(2) h6": ["Design", "დიზაინი"],
    ".bento .bento-cell:nth-child(2) p": [
      "Bold, current, and built around who you're actually talking to.",
      "თამამი, აქტუალური და აგებული იმაზე, ვისთანაც რეალურად საუბრობ.",
    ],
    ".bento .bento-cell:nth-child(4) h6": ["Development", "დეველოპმენტი"],
    ".bento .bento-cell:nth-child(4) p": [
      "Fast, clean sites — no template feel, no bloat.",
      "სწრაფი, სუფთა საიტები — შაბლონის შეგრძნების და ზედმეტი წონის გარეშე.",
    ],
    ".bento .bento-cell:nth-child(5) h6": ["Performance", "შედეგი"],
    ".bento .bento-cell:nth-child(5) p": [
      "Content and ads that get measured, not just posted.",
      "კონტენტი და რეკლამა, რომელსაც ვზომავთ და არა უბრალოდ ვაქვეყნებთ.",
    ],
    ".bento-wide h6": ["Support", "მხარდაჭერა"],
    ".bento-wide p": [
      "One team, one point of contact, from brief to launch and after.",
      "ერთი გუნდი, ერთი საკონტაქტო პირი — ბრიფიდან გაშვებამდე და მის შემდეგაც.",
    ],
    ".bento-wide .btn-outline": ["Start A Project", "პროექტის დაწყება"],

    ".section:has(.process-list) .section-head h3": ["How We Work", "როგორ ვმუშაობთ"],
    ".process-step:nth-child(1) h6": ["Discovery", "კვლევა"],
    ".process-step:nth-child(1) p": [
      "Understanding the brand, the audience, and what success looks like.",
      "ბრენდის, აუდიტორიისა და წარმატების გაგება.",
    ],
    ".process-step:nth-child(2) h6": ["Strategy", "სტრატეგია"],
    ".process-step:nth-child(2) p": [
      "A plan for the services, formats, and channels that fit.",
      "სერვისების, ფორმატებისა და არხების გეგმა, რომელიც ჯდება.",
    ],
    ".process-step:nth-child(3) h6": ["Design", "დიზაინი"],
    ".process-step:nth-child(3) p": [
      "Concepts you can react to, refined until they're right.",
      "კონცეფციები, რომლებზეც რეაგირებ, დახვეწილი სანამ სწორი გახდება.",
    ],
    ".process-step:nth-child(4) h6": ["Development", "დეველოპმენტი"],
    ".process-step:nth-child(4) p": ["Building it — photo, video, design, or code.", "აშენება — ფოტო, ვიდეო, დიზაინი თუ კოდი."],
    ".process-step:nth-child(5) h6": ["Launch", "გაშვება"],
    ".process-step:nth-child(5) p": ["Shipped, tested, and live.", "გაგზავნილი, ტესტირებული და ცოცხალი."],
    ".process-step:nth-child(6) h6": ["Growth", "ზრდა"],
    ".process-step:nth-child(6) p": [
      "Ongoing content, marketing, and support after launch.",
      "მუდმივი კონტენტი, მარკეტინგი და მხარდაჭერა გაშვების შემდეგ.",
    ],

    ".section:has(.testimonial-track) .section-head h3": ["What Clients Say", "რას ამბობენ კლიენტები"],
    ".section:has(.testimonial-track) .section-head-copy": [
      "Placeholder quotes, written in Lumine's voice — swapped for real ones as they come in.",
      "სანიმუშო ციტატებია, დაწერილი Lumine-ის ხმით — შეიცვლება რეალურით, როგორც კი გამოჩნდება.",
    ],
    ".testimonial-card:nth-child(1) .testimonial-quote": [
      '"They actually asked what we needed before showing us what looked cool."',
      '"მართლა გვკითხეს, რა გვჭირდებოდა, სანამ რამე მაგარს გვაჩვენებდნენ."',
    ],
    ".testimonial-card:nth-child(1) .testimonial-attr": ["— A Local Business Owner, Tbilisi", "— ადგილობრივი ბიზნესის მფლობელი, თბილისი"],
    ".testimonial-card:nth-child(2) .testimonial-quote": [
      '"Fast turnaround, and the content still felt like us, not a template."',
      '"სწრაფად მოამზადეს და მაინც ჩვენი ხმა დარჩა, არა შაბლონი."',
    ],
    ".testimonial-card:nth-child(2) .testimonial-attr": ["— A Social Media Client", "— სოციალური მედიის კლიენტი"],
    ".testimonial-card:nth-child(3) .testimonial-quote": [
      '"One team handled the shoot, the site, and the ads. No chasing three vendors."',
      '"ერთმა გუნდმა გადაიღო, გააკეთა საიტი და აწარმოა რეკლამაც. სამ სხვადასხვა კონტრაქტორს აღარ ვდევნებდი."',
    ],
    ".testimonial-card:nth-child(3) .testimonial-attr": ["— A Startup Founder", "— სტარტაპის დამფუძნებელი"],

    ".stat-item:nth-child(1) p": ["Core Services", "ძირითადი სერვისი"],
    ".stat-item:nth-child(2) p": ["In-House Team", "საკუთარი გუნდი"],
    ".stat-item:nth-child(3) p": ["Average Response", "საშუალო პასუხის დრო"],
    ".stat-item:nth-child(4) p": ["Dedicated Point Of Contact", "პირადი საკონტაქტო პირი"],

    "#faq .faq-intro .eyebrow": ["FAQ", "კითხვები"],
    "#faq .faq-intro h3": ["Questions", "კითხვები"],
    ".faq-intro-copy": [
      "Short answers to the things founders usually ask before booking a call. Anything else — just ask.",
      "მოკლე პასუხები იმაზე, რასაც დამფუძნებლები ჩვეულებრივ სვამენ ზარამდე. სხვა რამეზე — უბრალოდ გვკითხეთ.",
    ],
    ".faq-intro .btn-outline": ["Ask Something Else", "სხვა კითხვის დასმა"],
    ".faq-item:nth-child(1) .faq-question-text": ["What does a package actually include?", "რას მოიცავს პაკეტი რეალურად?"],
    ".faq-item:nth-child(1) .faq-answer p": [
      "Packages bundle a set number of posters and videos with social media management and paid advertising. Site management is available as an add-on. Individual services — photo, video, a brand book, or a standalone site — are also booked on their own.",
      "პაკეტები აერთიანებს გარკვეულ რაოდენობის პოსტერსა და ვიდეოს სოციალური მედიის მართვასთან და ფასიან რეკლამასთან ერთად. საიტის მართვა ხელმისაწვდომია დამატებით. ცალკეული სერვისები — ფოტო, ვიდეო, ბრენდბუქი ან ცალკე საიტი — ასევე შესაძლებელია დამოუკიდებლად შეკვეთა.",
    ],
    ".faq-item:nth-child(2) .faq-question-text": ["How is pricing structured?", "როგორ არის აწყობილი ფასები?"],
    ".faq-item:nth-child(2) .faq-answer p": [
      "Three package tiers cover most ongoing work, priced by scope — how many posters and videos per month, plus social and ad management. Single services are quoted separately. Exact numbers live on the Pricing page.",
      "სამი პაკეტის დონე მოიცავს უმეტეს მუდმივ სამუშაოს, ფასდება მოცულობის მიხედვით — რამდენი პოსტერი და ვიდეო თვეში, პლუს სოციალური და რეკლამის მართვა. ცალკეული სერვისები ფასდება ცალკე. ზუსტი ციფრები ფასების გვერდზეა.",
    ],
    ".faq-item:nth-child(3) .faq-question-text": ["Do you work with brand-new businesses?", "მუშაობთ სულ ახალდაწყებულ ბიზნესებთან?"],
    ".faq-item:nth-child(3) .faq-answer p": [
      "Yes — a good share of what we do is helping a founder go from nothing to a working brand: name, look, first content, first site.",
      "დიახ — ჩვენი საქმის დიდი ნაწილი სწორედ დამფუძნებელს ეხმარება ნულიდან სამუშაო ბრენდამდე მისვლაში: სახელი, სახე, პირველი კონტენტი, პირველი საიტი.",
    ],
    ".faq-item:nth-child(4) .faq-question-text": ["Can you handle just one service, not a full package?", "შეგიძლიათ მხოლოდ ერთი სერვისი, არა მთელი პაკეტი?"],
    ".faq-item:nth-child(4) .faq-answer p": [
      "Yes. Photo, video, a brand book, or a website can each be booked individually if that's all you need right now.",
      "დიახ. ფოტო, ვიდეო, ბრენდბუქი ან საიტი შეიძლება შეკვეთოთ ცალ-ცალკე, თუ ახლა მხოლოდ ეს გჭირდებათ.",
    ],

    ".cta-panel .eyebrow": ["Your Move", "შენი სვლაა"],
    ".cta-panel h2": ['Let\'s Build <span class="outline">Something</span>', 'მოდი, <span class="outline">რაღაც</span> ავაშენოთ'],
    ".cta-panel .btn-invert": ["Book A Call", "დარეკვის დაჯავშნა"],
  },

  // ────────────────────────────────────────────────────────────────────────
  // studio
  // ────────────────────────────────────────────────────────────────────────
  studio: {
    ".studio-hero-header:nth-child(1) h1": ["All", "ყველა"],
    ".studio-hero-header:nth-child(2) h1": ["Light", "სინათლე"],
    ".studio-hero .hero-footer-col:nth-child(1) p:nth-child(1)": ["Creative Studio", "შემოქმედებითი სტუდია"],
    ".studio-hero .hero-footer-col:nth-child(1) p:nth-child(2)": ["Tbilisi-Based", "თბილისში"],

    ".about-row:nth-child(1) h1": ["Concept Driven", "კონცეფცია წინ უსწრებს"],
    ".about-row:nth-child(2) .about-col-copy p": [
      "Lumine is a creative agency rooted in Tbilisi and working with brands everywhere else. We believe that great design is not decoration.",
      "Lumine შემოქმედებითი სააგენტოა, ფესვგადგმული თბილისში და მომუშავე ბრენდებთან ყველგან. გვჯერა, რომ კარგი დიზაინი დეკორაცია არ არის.",
    ],
    ".about-row:nth-child(2) h1": ["Visual Culture", "ვიზუალური კულტურა"],
    ".about-row:nth-child(3) h1": ["Found in Tbilisi", "ნაპოვნია თბილისში"],
    ".about-row:nth-child(3) .about-col-copy p": [
      "From brand strategy to the final pixel, we handle it all in house. We work with founders and small businesses who want to look and sound like themselves.",
      "ბრენდის სტრატეგიიდან ბოლო პიქსელამდე, ყველაფერს საკუთარ გუნდში ვაკეთებთ. ვთანამშრომლობთ დამფუძნებლებთან და მცირე ბიზნესებთან, რომლებსაც სურთ საკუთარი თავივით გამოჩენა და ჟღერადობა.",
    ],
    ".particle-header h1": ["Ideas In Motion", "იდეები მოძრაობაში"],

    ".mission-col:nth-child(1) .eyebrow": ["Mission", "მისია"],
    ".mission-col:nth-child(1) h5": [
      "Give small brands the kind of creative work usually reserved for big budgets.",
      "მცირე ბრენდებს ვაძლევთ იმ დონის შემოქმედებით სამუშაოს, რომელიც ჩვეულებრივ დიდი ბიუჯეტისთვისაა დაცული.",
    ],
    ".mission-col:nth-child(2) .eyebrow": ["Vision", "ხედვა"],
    ".mission-col:nth-child(2) h5": [
      "A Tbilisi where local businesses look as good as they actually are.",
      "თბილისი, სადაც ადგილობრივი ბიზნესები ისე კარგად გამოიყურებიან, როგორადაც რეალურად არიან.",
    ],

    ".studio-timeline h3": ["The Story So Far", "ისტორია დღემდე"],
    ".timeline-note": ["Young studio, short timeline, no filler.", "ახალგაზრდა სტუდია, მოკლე გზა, ზედმეტის გარეშე."],
    ".timeline-item:nth-child(1) h6": ["The Document", "დოკუმენტი"],
    ".timeline-item:nth-child(1) p": [
      "Strategy before style: audience, tone, services, and pricing written down first.",
      "სტრატეგია სტილამდე: აუდიტორია, ტონი, სერვისები და ფასები — ჯერ დაწერილი, მერე ყველაფერი დანარჩენი.",
    ],
    ".timeline-item:nth-child(2) h6": ["The Mark", "ნიშანი"],
    ".timeline-item:nth-child(2) p": [
      'A black wordmark with a sparkle cut into the "e" — the whole identity grew from it.',
      'შავი სავაჭრო ნიშანი ბზინვარებით, ამოჭრილი "e"-ში — მთელი იდენტობა აქედან გაიზარდა.',
    ],
    ".timeline-item:nth-child(3) h6": ["The Site", "საიტი"],
    ".timeline-item:nth-child(3) p": [
      "Built in house, the same way client work ships. You're looking at it.",
      "აშენებული საკუთარ გუნდში, ისევე როგორც კლიენტის სამუშაო. სწორედ მას უყურებთ.",
    ],
    ".timeline-item:nth-child(4) h6": ["First Projects", "პირველი პროექტები"],
    ".timeline-item:nth-child(4) p": [
      "Taking on founding clients. Early means more attention, not less.",
      "ვიღებთ დამფუძნებელ კლიენტებს. ადრეული ნიშნავს მეტ ყურადღებას, არა ნაკლებს.",
    ],

    ".studio-values h3": ["House Rules", "სახლის წესები"],
    ".value-item:nth-child(1) h6": ["Trustworthy", "სანდო"],
    ".value-item:nth-child(1) p": ["Deadlines and prices mean what they say.", "ვადები და ფასები ნიშნავს იმას, რასაც ამბობს."],
    ".value-item:nth-child(2) h6": ["Results-Oriented", "შედეგზე ორიენტირებული"],
    ".value-item:nth-child(2) p": ["Pretty that doesn't perform is just expensive.", "ლამაზი, რომელიც არ მუშაობს, უბრალოდ ძვირია."],
    ".value-item:nth-child(3) h6": ["Curious", "ცნობისმოყვარე"],
    ".value-item:nth-child(3) p": ["Always learning — new tools, new formats, on purpose.", "მუდამ ვსწავლობთ — ახალი ხელსაწყოები, ახალი ფორმატები, განზრახ."],
    ".value-item:nth-child(4) h6": ["Communicative", "კომუნიკაბელური"],
    ".value-item:nth-child(4) p": ["You always know where your project stands.", "ყოველთვის იცით, სად დგას თქვენი პროექტი."],
    ".value-item:nth-child(5) h6": ["Creatively Free", "შემოქმედებითად თავისუფალი"],
    ".value-item:nth-child(5) p": ["Bold ideas welcome — from our side and yours.", "თამამი იდეები მისასალმებელია — ჩვენი მხრიდანაც და თქვენიდანაც."],
    ".value-item:nth-child(6) h6": ["Balanced", "დაბალანსებული"],
    ".value-item:nth-child(6) p": ["Humor and seriousness, each where it belongs.", "იუმორი და სერიოზულობა, თითოეული თავის ადგილას."],

    ".clients-header h3": ["Good Company", "კარგი კომპანია"],
    ".clients-copy p": [
      "Placeholder marks for now — this wall fills in with real client logos as the roster grows. Founders, small businesses, and anyone tired of looking generic: that's who it's reserved for.",
      "ჯერჯერობით სანიმუშო ნიშნებია — ეს კედელი რეალური კლიენტების ლოგოებით ივსება, როცა როსტერი გაიზრდება. დამფუძნებლები, მცირე ბიზნესები და ყველა, ვისაც შაბლონურის ყოფა მოსწყინდა — სწორედ მათთვისაა დაცული.",
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // services
  // ────────────────────────────────────────────────────────────────────────
  services: {
    ".svc-hero .eyebrow": ["Services", "სერვისები"],
    ".svc-hero h1": ["What We Do", "რას ვაკეთებთ"],
    ".svc-hero-copy": [
      "Six services, one team, one point of contact. Book a single service or bundle a month — either way, nothing gets handed to a vendor you never meet.",
      "ექვსი სერვისი, ერთი გუნდი, ერთი საკონტაქტო პირი. დაჯავშნეთ ერთი სერვისი ან აიღეთ თვიური პაკეტი — ორივე შემთხვევაში პროექტი არავის ხელში არ გადადის.",
    ],

    "#photography h2": ["Photography", "ფოტოგრაფია"],
    "#photography .svc-col h6": [
      "Phone photos flatten good products. Your work deserves better light.",
      "ტელეფონის ფოტო ბრტყელს ხდის კარგ პროდუქტს. თქვენი სამუშაო უკეთეს განათებას იმსახურებს.",
    ],
    "#photography .svc-copy": [
      "Product and campaign shoots, on location or in studio, with retouching and color correction done in house. You get files ready for print, web, and every feed size.",
      "პროდუქტისა და კამპანიის გადაღებები, ლოკაციაზე თუ სტუდიაში, რეტუშითა და ფერთა კორექციით საკუთარ გუნდში. იღებთ ფაილებს, მზადს ბეჭდვისთვის, ვებისთვის და ნებისმიერი ზომის ფიდისთვის.",
    ],
    "#photography .svc-chip": [
      ["Product Shoots", "პროდუქტის გადაღება"],
      ["Campaign Shoots", "კამპანიის გადაღება"],
      ["Retouching", "რეტუში"],
      ["Color Correction", "ფერთა კორექცია"],
    ],
    "#photography .svc-price": ["From 200₾", "200₾-დან"],
    "#photography .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    "#video h2": ["Video", "ვიდეო"],
    "#video .svc-col h6": ["You have three seconds before the thumb moves on.", "სამი წამი გაქვთ, სანამ თითი გადავა შემდეგზე."],
    "#video .svc-copy": [
      "Short-form video built for the feed — shot, edited, retouched, and color-corrected by the same hands. From product loops to brand films that hold attention past the hook.",
      "მოკლემეტრაჟიანი ვიდეო, აგებული ფიდისთვის — გადაღებული, მონტაჟირებული, რეტუშირებული და ფერადკორექტირებული ერთი ხელით. პროდუქტის ციკლური ვიდეოებიდან საბრენდო ფილმებამდე, რომლებიც ყურადღებას აჩერებენ ჰუკის შემდეგაც.",
    ],
    "#video .svc-chip": [
      ["Short-Form", "მოკლემეტრაჟიანი"],
      ["Brand Films", "საბრენდო ფილმები"],
      ["Editing", "მონტაჟი"],
      ["Color Grade", "ფერთა კორექცია"],
    ],
    "#video .svc-price": ["From 300₾", "300₾-დან"],
    "#video .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    "#design h2": ["Graphic Design", "გრაფიკული დიზაინი"],
    "#design .svc-col h6": [
      "A brand that looks improvised gets treated like one.",
      "ბრენდს, რომელიც იმპროვიზირებულად გამოიყურება, ისეთადვე ეპყრობიან.",
    ],
    "#design .svc-copy": [
      "Everything visual a brand needs to hold together: logos and full brand books, posters, banners, business cards, certificates — one visual language across all of it.",
      "ყველაფერი ვიზუალური, რაც ბრენდს ერთიანობისთვის სჭირდება: ლოგოები და სრული ბრენდბუქები, პოსტერები, ბანერები, სავიზიტო ბარათები, სერტიფიკატები — ერთი ვიზუალური ენა ყველგან.",
    ],
    "#design .svc-chip": [
      ["Logos", "ლოგოები"],
      ["Brand Books", "ბრენდბუქები"],
      ["Posters", "პოსტერები"],
      ["Banners", "ბანერები"],
      ["Business Cards", "სავიზიტო ბარათები"],
    ],
    "#design .svc-price": ["Brand Book 1500–2500₾", "ბრენდბუქი 1500–2500₾"],
    "#design .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    "#social h2": ["Social Media", "სოციალური მედია"],
    "#social .svc-col h6": ["Posting when you remember to isn't a strategy.", "პოსტინგი, როცა გაგახსენდება, სტრატეგია არ არის."],
    "#social .svc-copy": [
      "Full page management with a content plan that actually ships — posts, stories, and the comments section, in a voice tuned to your brand, not a template's.",
      "გვერდის სრული მართვა კონტენტ-გეგმით, რომელიც რეალურად სრულდება — პოსტები, სთორები და კომენტარების სექცია, თქვენი ბრენდის ხმით, არა შაბლონის.",
    ],
    "#social .svc-chip": [
      ["Page Management", "გვერდის მართვა"],
      ["Content Planning", "კონტენტ-დაგეგმვა"],
      ["Community", "საზოგადოება"],
    ],
    "#social .svc-price": ["In Packages — See Pricing", "პაკეტებში — იხილეთ ფასები"],
    "#social .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    "#marketing h2": ["Digital Marketing", "ციფრული მარკეტინგი"],
    "#marketing .svc-col h6": [
      "Good content nobody sees is a diary, not marketing.",
      "კარგი კონტენტი, რომელსაც არავინ ხედავს, დღიურია და არა მარკეტინგი.",
    ],
    "#marketing .svc-copy": [
      "Paid campaigns on social platforms and SEO that compounds — targeted, measured, and reported in numbers you can check yourself.",
      "ფასიანი კამპანიები სოციალურ პლატფორმებზე და SEO, რომელიც აგროვდება — მიზნობრივი, გაზომვადი და დარეპორტებული ციფრებში, რომლის გადამოწმებაც თვითონ შეგიძლიათ.",
    ],
    "#marketing .svc-chip": [
      ["Paid Social", "ფასიანი სოციალური"],
      ["SEO", "SEO"],
      ["Reporting", "რეპორტინგი"],
    ],
    "#marketing .svc-price": ["In Packages — See Pricing", "პაკეტებში — იხილეთ ფასები"],
    "#marketing .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    "#web h2": ["Web Development", "ვებ დეველოპმენტი"],
    "#web .svc-col h6": [
      "Your site is the one channel you own. Most look rented.",
      "თქვენი საიტი ერთადერთი არხია, რომელიც თქვენია. უმეტესობა ქირავნობას ჰგავს.",
    ],
    "#web .svc-copy": [
      "Sites designed and built in house — fast, maintained, and made to match the brand instead of a theme store. This site is the portfolio piece.",
      "საიტები, დაპროექტებული და აშენებული საკუთარ გუნდში — სწრაფი, მხარდაჭერილი და აგებული ბრენდზე, არა თემის მაღაზიაზე. ეს საიტი სწორედ პორტფოლიოს ნიმუშია.",
    ],
    "#web .svc-chip": [
      ["Design & Build", "დიზაინი და აშენება"],
      ["Maintenance", "მხარდაჭერა"],
      ["Performance", "წარმადობა"],
    ],
    "#web .svc-price": ["2000–3000₾", "2000–3000₾"],
    "#web .btn-outline": ["See The Work", "ნამუშევრების ნახვა"],

    ".svc-industries .eyebrow": ["Set Up For", "მზადაა"],
    ".svc-industries-track span": [
      ["Medical", "სამედიცინო"], ["Hotels", "სასტუმროები"], ["Restaurants", "რესტორნები"],
      ["Real Estate", "უძრავი ქონება"], ["SaaS", "SaaS"], ["E-Commerce", "ელ-კომერცია"], ["Startups", "სტარტაპები"],
      ["Medical", "სამედიცინო"], ["Hotels", "სასტუმროები"], ["Restaurants", "რესტორნები"],
      ["Real Estate", "უძრავი ქონება"], ["SaaS", "SaaS"], ["E-Commerce", "ელ-კომერცია"], ["Startups", "სტარტაპები"],
    ],
    ".svc-industries-foot p": [
      "Different rooms, same job: make the brand impossible to ignore. Don't see your industry? It just means we haven't met yet.",
      "სხვადასხვა ოთახი, ერთი და იგივე საქმე: ბრენდი გავხადოთ ისეთი, რომ თვალს ვერ მოაშორო. არ ხედავთ თქვენს ინდუსტრიას? უბრალოდ ჯერ არ გვქონია შანსი.",
    ],
    ".svc-industries-foot .btn-solid": ["See Pricing", "ფასების ნახვა"],
  },

  // ────────────────────────────────────────────────────────────────────────
  // work
  // ────────────────────────────────────────────────────────────────────────
  work: {
    ".work-hero .eyebrow": ["Portfolio", "პორტფოლიო"],
    ".work-hero h1": ["The Archive", "არქივი"],
    ".work-note": [
      "Concept projects for now — real case studies replace these as they ship.",
      "ჯერჯერობით საკონცეფციო პროექტებია — რეალური ქეისები მათ ჩაანაცვლებს გაშვებისთანავე.",
    ],
    '[data-filter-group="type"] .filter-label': ["Type", "ტიპი"],
    '[data-filter-group="industry"] .filter-label': ["Industry", "ინდუსტრია"],
    "#workEmpty h5": ["Nothing Here Yet", "აქ ჯერ არაფერია"],
    "#workEmpty p": ["That combination is waiting for its first project.", "ეს კომბინაცია თავის პირველ პროექტს ელოდება."],
    "#workEmpty .btn-outline": ["Start It With Us", "დაიწყე ჩვენთან ერთად"],
  },

  // ────────────────────────────────────────────────────────────────────────
  // pricing (static chrome — package/single card content is in pricing-data.js)
  // ────────────────────────────────────────────────────────────────────────
  pricing: {
    ".price-hero .eyebrow": ["Pricing", "ფასები"],
    ".price-hero h1": ["Priced In The Open", "ღიად დაფასებული"],
    ".price-hero-copy": [
      "Three monthly packages, four standalone services, all in GEL. Pick what fits — or book a call and we'll size it together.",
      "სამი თვიური პაკეტი, ოთხი დამოუკიდებელი სერვისი, ყველაფერი ლარში. აირჩიეთ, რაც გერგებათ — ან დაჯავშნეთ ზარი და ერთად შევარჩევთ ზომას.",
    ],
    ".price-singles-head h3": ["Solo Services", "ცალკეული სერვისები"],
    ".price-singles-head p": [
      "Need just one service instead of a monthly package? Book it on its own.",
      "გჭირდებათ ერთი სერვისი თვიური პაკეტის ნაცვლად? დაჯავშნეთ ცალკე.",
    ],
    ".price-cta-inner h4": ["Not Sure Which Fits?", "არ იცით, რომელი გერგებათ?"],
    ".price-cta-inner p": [
      "Fifteen minutes, straight talk — we'll say plainly what you need, even if it's less than you expected.",
      "თხუთმეტი წუთი, პირდაპირი საუბარი — გულახდილად გეტყვით, რა გჭირდებათ, თუნდაც ეს ნაკლები აღმოჩნდეს, ვიდრე ელოდებოდით.",
    ],
    ".price-cta-inner .btn-solid": ["Book A Call", "დარეკვის დაჯავშნა"],
  },

  // ────────────────────────────────────────────────────────────────────────
  // journal
  // ────────────────────────────────────────────────────────────────────────
  journal: {
    ".journal-intro .eyebrow": ["Journal", "ჟურნალი"],
    ".journal-intro-copy": [
      "Short reads on how we work and why. No listicles, no growth hacks — just the thinking behind the work.",
      "მოკლე წაკითხვები იმაზე, როგორ და რატომ ვმუშაობთ ასე. არანაირი სიები, არანაირი ზრდის ხრიკები — მხოლოდ აზროვნება სამუშაოს მიღმა.",
    ],

    ".journal-entry:nth-child(1) .journal-entry-meta": ["Note 01 · Process · 2026", "ჩანაწერი 01 · პროცესი · 2026"],
    ".journal-entry:nth-child(1) h3": ["Strategy Before Style", "სტრატეგია სტილამდე"],
    ".journal-entry:nth-child(1) .journal-entry-excerpt": [
      "Every project here starts as a document, not a moodboard. Here's why that order matters.",
      "ყოველი პროექტი აქ იწყება დოკუმენტად და არა მუდბორდად. აი, რატომ აქვს ამ თანმიმდევრობას მნიშვნელობა.",
    ],
    ".journal-entry:nth-child(1) .journal-entry-text p": [
      [
        'The fastest way to waste a budget is to start with how things should look. Moodboards are seductive — everyone has opinions about color, and those meetings feel productive. But a brand that starts as an aesthetic has nothing to check itself against later. When someone asks "should the poster say this or that?", the only available answer is taste.',
        'ბიუჯეტის დახარჯვის ყველაზე სწრაფი გზა არის დაწყება იმით, თუ როგორ უნდა გამოიყურებოდეს ყველაფერი. მუდბორდები მაცდურია — ყველას აქვს აზრი ფერზე, და ეს შეხვედრები პროდუქტიულად გვეჩვენება. მაგრამ ბრენდი, რომელიც ესთეტიკად იწყება, მოგვიანებით ვერაფერს ამოწმებს საკუთარ თავს. როცა კითხულობენ „პოსტერზე ეს დაიწეროს თუ ის?", ერთადერთი პასუხი გემოვნებაა.',
      ],
      [
        "So we write the boring document first. Who is this actually for? What do they already believe? What should they do after seeing the work — follow, visit, buy, book? What's the one thing this brand can say that its neighbors can't? None of this requires a designer. All of it constrains the design in useful ways.",
        "ამიტომ ჯერ მოსაწყენ დოკუმენტს ვწერთ. ვისთვისაა ეს რეალურად? რა სჯერათ მათ უკვე? რა უნდა გააკეთონ სამუშაოს ნახვის შემდეგ — გამოწერა, ვიზიტი, ყიდვა, დაჯავშნა? რა ერთი რამის თქმა შეუძლია ამ ბრენდს, რაც მეზობლებს არ შეუძლიათ? ამისთვის დიზაინერი არ სჭირდება. მაგრამ ეს ყველაფერი დიზაინს სასარგებლო ჩარჩოში აქცევს.",
      ],
      [
        "We did it to ourselves before doing it to anyone else. Lumine existed as a strategy document — audience, tone, six services, three price tiers — months before it had a wordmark. When the mark finally arrived, it had a job description waiting for it. Every visual decision since has had something to answer to.",
        "ჩვენ ეს საკუთარ თავზე გავაკეთეთ, სანამ სხვაზე გავაკეთებდით. Lumine სტრატეგიის დოკუმენტად არსებობდა — აუდიტორია, ტონი, ექვსი სერვისი, სამი ფასის დონე — თვეების განმავლობაში, სანამ სავაჭრო ნიშანი გაჩნდებოდა. როცა ნიშანი ბოლოს მოვიდა, მას უკვე ჰქონდა სამუშაო აღწერილობა. ყოველ ვიზუალურ გადაწყვეტილებას მას შემდეგ რაღაცის პასუხი მოეთხოვება.",
      ],
      [
        "Style is the last decision, not the first. That's not a lack of imagination — it's what lets the imaginative choices survive contact with reality.",
        "სტილი ბოლო გადაწყვეტილებაა, არა პირველი. ეს წარმოსახვის ნაკლებობა არ არის — ეს არის ის, რაც წარმოსახვით გადაწყვეტილებებს რეალობასთან შეხვედრის შემდეგაც სიცოცხლისუნარიანს ხდის.",
      ],
    ],

    ".journal-entry:nth-child(2) .journal-entry-meta": ["Note 02 · Craft · 2026", "ჩანაწერი 02 · ხელობა · 2026"],
    ".journal-entry:nth-child(2) h3": ["Monochrome Until It Earns Color", "მონოქრომია, სანამ ფერს არ დაიმსახურებს"],
    ".journal-entry:nth-child(2) .journal-entry-excerpt": [
      "Every image on this site is black and white until you touch it. It's a brand principle first, a hover effect second.",
      "ამ საიტზე ყოველი სურათი შავ-თეთრია, სანამ არ შეეხები. ეს ჯერ ბრენდის პრინციპია, მერე ჰოვერ-ეფექტი.",
    ],
    ".journal-entry:nth-child(2) .journal-entry-text p": [
      [
        'Scroll through this site and every photograph is monochrome — until your cursor lands on it, and the color comes back. It would be easy to file that under "nice hover effect." It\'s actually the whole brand argument in miniature.',
        'გადაატრიალეთ ეს საიტი და ყოველი ფოტო მონოქრომია — სანამ კურსორი არ დაეშვება მასზე და ფერი არ დაბრუნდება. ადვილი იქნებოდა ამის „კარგ ჰოვერ-ეფექტად" ჩათვლა. სინამდვილეში ეს მთელი ბრენდის არგუმენტია მინიატურაში.',
      ],
      [
        "Feeds are loud. Every brand shouts in saturated color all the time, which means color has stopped meaning anything. The restraint is the differentiator: when everything around you is maximum volume, the quiet thing is the one you notice.",
        "ფიდები ხმაურიანია. ყოველი ბრენდი მუდმივად ყვირის გაჯერებულ ფერში, რაც იმას ნიშნავს, რომ ფერმა აზრი დაკარგა. თავშეკავება გამორჩევის საშუალებაა: როცა ირგვლივ ყველაფერი მაქსიმალურ ხმაშია, სწორედ ჩუმი რამ იქცევა შესამჩნევად.",
      ],
      [
        "But restraint alone is just minimalism cosplay. The point of holding color back is the release — color as a reward for attention, not a default state. Touch the work and it wakes up. That's what we want a brand to feel like: composed at rest, alive on contact.",
        "მაგრამ თავშეკავება მარტო მინიმალიზმის კოსტიუმია. ფერის შეკავების აზრი გათავისუფლებაშია — ფერი ჯილდოა ყურადღებისთვის და არა ნაგულისხმევი მდგომარეობა. შეეხეთ სამუშაოს და ის იღვიძებს. ასეთი გვინდა, იყოს ბრენდი: მშვიდი უმოძრაოდ, ცოცხალი შეხებისას.",
      ],
      [
        "The practical lesson for any brand we work on: pick the one moment that deserves the emphasis, and starve everything else of it. Emphasis spent everywhere is emphasis spent nowhere.",
        "პრაქტიკული გაკვეთილი ნებისმიერი ბრენდისთვის, რომელზეც ვმუშაობთ: აირჩიე ერთი მომენტი, რომელიც ხაზგასმას იმსახურებს, და დანარჩენს ჩამოაშორე. ხაზგასმა, დახარჯული ყველგან, დახარჯულია არსად.",
      ],
    ],

    ".journal-entry:nth-child(3) .journal-entry-meta": ["Note 03 · Pricing · 2026", "ჩანაწერი 03 · ფასები · 2026"],
    ".journal-entry:nth-child(3) h3": ["Packages, Explained", "პაკეტები, ახსნილი"],
    ".journal-entry:nth-child(3) .journal-entry-excerpt": [
      'What "4–8 posters a month" actually means, and why we publish prices at all.',
      'რას ნიშნავს რეალურად "თვეში 4–8 პოსტერი" და რატომ ვაქვეყნებთ ფასებს საერთოდ.',
    ],
    ".journal-entry:nth-child(3) .journal-entry-text p": [
      [
        "Most agencies hide their prices behind a discovery call. We publish ours, in lari, on a page anyone can read. Partly because we'd want the same courtesy; partly because a price you're afraid to show is usually a price you can't defend.",
        "უმეტესი სააგენტო ფასებს მალავს აღმომჩენ ზარამდე. ჩვენ ჩვენს ფასებს ვაქვეყნებთ, ლარში, გვერდზე, რომელსაც ნებისმიერი წაიკითხავს. ნაწილობრივ იმიტომ, რომ თვითონაც იგივე თავაზიანობას ველოდებოდით; ნაწილობრივ იმიტომ, რომ ფასი, რომლის ჩვენებაც გეშინია, ჩვეულებრივ ისეთი ფასია, რომლის დაცვაც არ შეგიძლია.",
      ],
      [
        '"4–8 posters and 2–4 videos a month" isn\'t a warehouse order — it\'s a publishing pace: enough presence to stay in the feed without flooding it. Social management and advertising ride along in every tier because content without distribution is a diary. The packages are rhythm, not inventory.',
        'პაკეტები რიტმია და არა საწყობი. „თვეში 4–8 პოსტერი და 2–4 ვიდეო" საწყობის შეკვეთა არ არის — ეს პუბლიკაციის ტემპია: საკმარისი ყოფნა ფიდში, მისი დატბორვის გარეშე. სოციალური მართვა და რეკლამა ყოველ დონეზე თან სდევს, რადგან კონტენტი გავრცელების გარეშე დღიურია.',
      ],
      [
        "The ranges exist because businesses differ. A café that needs a new visual every weekend sits at the top of a range; a consultancy posting twice a week sits at the bottom. The call is where we place you — not where we invent the number.",
        "დიაპაზონები არსებობს, რადგან ბიზნესები განსხვავებულია. კაფე, რომელსაც ყოველ შაბათ-კვირას ახალი ვიზუალი სჭირდება, დიაპაზონის ზედა ნაწილშია; საკონსულტაციო კომპანია, რომელიც კვირაში ორჯერ დებს პოსტს — ქვედა ნაწილში. ზარი გვიჩვენებს, სად ხართ — ჩვენ ციფრს არ ვიგონებთ.",
      ],
      [
        "And if a package is more than you need, we'll say so. Photo retouching, a video edit, a brand book, a website — each is bookable alone. Selling someone the wrong size is a good way to get one invoice and no second one.",
        "და თუ პაკეტი თქვენთვის მეტია, ვიტყვით პირდაპირ. ფოტო რეტუში, ვიდეო მონტაჟი, ბრენდბუქი, საიტი — თითოეული ცალკე შესაძლებელია. კლიენტისთვის არასწორი ზომის გაყიდვა კარგი გზაა ერთი ინვოისისთვის და არა მეორესთვის.",
      ],
    ],

    ".journal-foot p": [
      'More notes as the work ships. For the day-to-day — <a href="https://www.instagram.com/lumine.ge" target="_blank" rel="noopener">@lumine.ge</a>.',
      'მეტი ჩანაწერი მოდის, სამუშაოს გაშვებასთან ერთად. ყოველდღიურობისთვის — <a href="https://www.instagram.com/lumine.ge" target="_blank" rel="noopener">@lumine.ge</a>.',
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // contact
  // ────────────────────────────────────────────────────────────────────────
  contact: {
    ".contact-head .eyebrow": ["Contact", "კონტაქტი"],
    ".contact-head h1": ["Say Hello", "მოგესალმებით"],
    ".contact-direct-copy": [
      "One call, fifteen minutes, no pitch deck. Tell us what you're building and we'll tell you honestly what it needs.",
      "ერთი ზარი, თხუთმეტი წუთი, პიჩის გარეშე. გვითხარით, რას აშენებთ და გულახდილად გეტყვით, რა სჭირდება.",
    ],
    ".contact-line:nth-child(1) .contact-line-label": ["Email", "ელფოსტა"],
    ".contact-line:nth-child(2) .contact-line-label": ["Phone", "ტელეფონი"],
    ".contact-line:nth-child(4) .contact-line-label": ["Studio", "სტუდია"],
    ".contact-line:nth-child(4) .contact-line-value": ["Tbilisi, Georgia", "თბილისი, საქართველო"],

    '.form-field:has(input[name="name"]) .form-label': ["Your Name", "სახელი"],
    '.form-field:has(input[name="brand"]) .form-label': ["Brand / Company", "ბრენდი / კომპანია"],
    '.form-field:has(input[name="reach"]) .form-label': ["Email Or Phone", "ელფოსტა ან ტელეფონი"],
    '.form-row:has(#serviceChips) > .form-label': ["What Do You Need?", "რა გჭირდებათ?"],
    "#serviceChips .form-chip": [
      ["Photography", "ფოტოგრაფია"], ["Video", "ვიდეო"], ["Design", "დიზაინი"],
      ["Social", "სოციალური"], ["Marketing", "მარკეტინგი"], ["Web", "ვები"],
    ],
    '.form-row:has(#budgetChips) > .form-label': ["Budget", "ბიუჯეტი"],
    "#budgetChips .form-chip": [
      ["Package I", "პაკეტი I"], ["Package II", "პაკეტი II"], ["Package III", "პაკეტი III"],
      ["Single Service", "ერთი სერვისი"], ["Not Sure Yet", "ჯერ არ ვიცი"],
    ],
    '.form-field:has(textarea) .form-label': ["The Project, In A Few Lines", "პროექტი, რამდენიმე სტრიქონად"],
    ".form-actions .btn-solid": ["Send It", "გაგზავნა"],

    ".contact-footer p": ["While you decide — spin the cube.", "სანამ გადაწყვეტთ — დაატრიალეთ კუბი."],
  },

  // ────────────────────────────────────────────────────────────────────────
  // legal
  // ────────────────────────────────────────────────────────────────────────
  legal: {
    ".legal-hero .eyebrow": ["The Fine Print", "წვრილი შრიფტი"],
    ".legal-hero h1": ["Plain Language", "მარტივი ენა"],
    ".legal-hero-copy": [
      "Working versions, kept short on purpose. Last updated July 2026.",
      "სამუშაო ვერსიები, განზრახ მოკლედ დაწერილი. ბოლო განახლება — 2026 წლის ივლისი.",
    ],

    "#privacy h4": ["Privacy Policy", "კონფიდენციალურობის პოლიტიკა"],
    "#privacy .legal-text p": [
      [
        "This site collects nothing about you. There are no cookies, no analytics, no trackers, and no accounts. We can't see who visits, and we're fine with that.",
        "ეს საიტი თქვენ შესახებ არაფერს აგროვებს. არ არის ქუქიები, ანალიტიკა, თრექერები თუ ანგარიშები. ჩვენ ვერ ვხედავთ, ვინ სტუმრობს საიტს — და ამას ვეთანხმებით.",
      ],
      [
        "The contact and newsletter forms don't send data to a server — they open a draft in your own mail app, and nothing leaves your device unless you hit send yourself. Anything you do send us by email (name, contact details, project descriptions) is used only to reply to you and run your project. We don't sell, share, or hand it to advertisers.",
        "საკონტაქტო და გამოწერის ფორმები სერვერზე მონაცემებს არ აგზავნის — ისინი თქვენს საკუთარ მეილ აპლიკაციაში აღებენ დრაფტს, და თქვენი მოწყობილობიდან არაფერი გადის, სანამ თვითონ არ გააგზავნით. ნებისმიერი, რასაც მეილით გვიგზავნით (სახელი, საკონტაქტო დეტალები, პროექტის აღწერა), გამოიყენება მხოლოდ პასუხის გასაცემად და თქვენი პროექტის სამუშაოდ. ჩვენ არ ვყიდით, არ ვუზიარებთ და არ გადავცემთ რეკლამის განმთავსებლებს.",
      ],
      [
        "If a form ever starts submitting to a server, or analytics ever get added, this page changes first and says so plainly.",
        "თუ ოდესმე ფორმა სერვერზე გაგზავნას დაიწყებს, ან დაემატება ანალიტიკა, ეს გვერდი ჯერ შეიცვლება და პირდაპირ გეტყვით ამის შესახებ.",
      ],
      [
        "Want an email deleted from our inbox? Ask at hello@lumine.ge and it's gone.",
        "გინდათ, ინბოქსიდან მეილი წაიშალოს? მოგვწერეთ hello@lumine.ge-ზე და გაქრება.",
      ],
    ],
    "#terms h4": ["Terms", "წესები"],
    "#terms .legal-text p": [
      [
        "Everything on this site — text, design, images, code — belongs to Lumine unless labeled otherwise. Don't republish it as yours.",
        "ყველაფერი ამ საიტზე — ტექსტი, დიზაინი, სურათები, კოდი — ეკუთვნის Lumine-ს, თუ სხვაგვარად არ არის მითითებული. ნუ გამოაქვეყნებთ საკუთარ სახელზე.",
      ],
      [
        "Prices on the Pricing page are working figures in GEL. They're honest, but every project gets a written quote before any work starts, and that quote is the number that counts.",
        "ფასების გვერდზე მითითებული ფასები სამუშაო ციფრებია ლარში. ისინი გულახდილია, მაგრამ ყოველ პროექტს წერილობითი შეთავაზება ეძლევა სამუშაოს დაწყებამდე, და სწორედ ეს შეთავაზება ითვლება საბოლოო ციფრად.",
      ],
      [
        'Portfolio items marked "Concept" are exactly that — concept work made to show our range, not deliverables for named clients.',
        'პორტფოლიოს ერთეულები, რომლებზეც წერია „კონცეფცია", ზუსტად ეს არის — საკონცეფციო სამუშაო, შექმნილი ჩვენი დიაპაზონის საჩვენებლად და არა კონკრეტული კლიენტისთვის მიწოდებული პროდუქტი.',
      ],
      [
        "Client work terms — deadlines, revisions, payment, ownership of delivered files — live in the written agreement each project starts with, not on this page.",
        "კლიენტის სამუშაოს პირობები — ვადები, გადასინჯვები, გადახდა, მიწოდებული ფაილების საკუთრება — განისაზღვრება წერილობითი ხელშეკრულებით, რომლითაც იწყება ყოველი პროექტი და არა ამ გვერდზე.",
      ],
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // project (dynamic single-project template — see js/project.js for the
  // section labels, which are language-aware there directly; this only
  // covers the static "not found" fallback)
  // ────────────────────────────────────────────────────────────────────────
  project: {
    "#pdNotFound .eyebrow": ["404", "404"],
    "#pdNotFound h2": ["That Project Isn't In The Archive", "ეს პროექტი არქივში არ არის"],
    "#pdNotFound .pd-not-found-copy": [
      "Either the link is old or the slug's wrong. The rest of the work is still where you left it.",
      "ან ბმული მოძველებულია, ან slug არასწორია. დანარჩენი სამუშაო იქვეა, სადაც დატოვეთ.",
    ],
    "#pdNotFound .btn-solid": ["Back To The Archive", "უკან არქივში"],
  },

  // ────────────────────────────────────────────────────────────────────────
  // sample-project ("Building Lumine" — the studio's own case study)
  // ────────────────────────────────────────────────────────────────────────
  sampleProject: {
    ".sample-project-hero-header h2": ["Building Lumine", "Lumine-ის აშენება"],
    ".sample-project-content > .sample-project-col:first-child p": ["Tbilisi, Georgia", "თბილისი, საქართველო"],
    ".sample-project-col .sample-project-content-wrapper:nth-of-type(1) p": ["Brand Identity", "საბრენდო იდენტობა"],
    ".sample-project-col .sample-project-content-wrapper:nth-of-type(2) h6:nth-of-type(1)": [
      'Lumine started with a name and a sparkle cut into an "e" — everything else, the type, the palette, the motion, had to earn its place around that mark.',
      'Lumine დაიწყო სახელით და ბზინვარებით, ამოჭრილი "e"-ში — ყველაფერი დანარჩენი, შრიფტი, პალიტრა, მოძრაობა, ამ ნიშანს ირგვლივ თავისი ადგილი უნდა დაემსახურებინა.',
    ],
    ".sample-project-col .sample-project-content-wrapper:nth-of-type(2) h6:nth-of-type(2)": [
      "We built a system that stays quiet until it needs to perform — fast navigation, confident hierarchy, and micro-interactions that make browsing feel tactile.",
      "ავაშენეთ სისტემა, რომელიც ჩუმად რჩება მანამ, სანამ საჭირო არ გახდება — სწრაფი ნავიგაცია, თავდაჯერებული იერარქია და მიკროინტერაქციები, რომლებიც დათვალიერებას ხელშესახებად აქცევს.",
    ],

    ".sample-project-meta:nth-of-type(1) .sample-project-hero-sub-col:nth-child(1) p:nth-child(1)": ["Date Completed", "დასრულების თარიღი"],
    ".sample-project-meta:nth-of-type(1) .sample-project-hero-sub-col:nth-child(2) p:nth-child(1)": ["Project Type", "პროექტის ტიპი"],
    ".sample-project-meta:nth-of-type(1) .sample-project-hero-sub-col:nth-child(2) p:nth-child(2)": ["Brand Identity", "საბრენდო იდენტობა"],
    ".sample-project-meta:nth-of-type(1) .sample-project-hero-sub-col:nth-child(2) p:nth-child(3)": ["Website", "ვებსაიტი"],
    ".sample-project-meta:nth-of-type(2) .sample-project-hero-sub-col:nth-child(1) p": [
      "Collaborators <br />Lumine (Design + Dev)",
      "თანამშრომლები<br />Lumine (დიზაინი + დეველოპმენტი)",
    ],
    ".sample-project-meta:nth-of-type(2) .sample-project-hero-sub-col:nth-child(2) p": [
      "Photography <br />In-house",
      "ფოტოგრაფია<br />საკუთარ გუნდში",
    ],

    ".sample-project-details:nth-of-type(1) .cs-phase": ["Phase 01 <br /> The Challenge", "ფაზა 01<br />გამოწვევა"],
    ".sample-project-details:nth-of-type(1) h6": [
      "Launch a new creative agency with zero legacy, zero portfolio, and one asset: a point of view. The brand had to feel credible to young founders on day one — without pretending to be older or bigger than it is.",
      "წამოვიწყოთ ახალი შემოქმედებითი სააგენტო ნულოვანი მემკვიდრეობით, ნულოვანი პორტფოლიოთი და ერთადერთი აქტივით: საკუთარი მოსაზრებით. ბრენდს პირველივე დღეს სანდოდ უნდა მოეჩვენებინა ახალგაზრდა დამფუძნებლებისთვის — იმის დამტკიცების გარეშე, რომ უფროსი ან დიდია, ვიდრე რეალურად არის.",
    ],

    ".sample-project-details:nth-of-type(2) .cs-phase": ["Phase 02 <br /> The Approach", "ფაზა 02<br />მიდგომა"],
    ".sample-project-details:nth-of-type(2) h6": [
      "Strategy before style. We wrote the business down first — audience, tone, six services, three pricing tiers — and let every visual decision answer to that document.",
      "სტრატეგია სტილამდე. ჯერ ბიზნესი დავწერეთ — აუდიტორია, ტონი, ექვსი სერვისი, სამი ფასის დონე — და ყოველ ვიზუალურ გადაწყვეტილებას ამ დოკუმენტისთვის პასუხის გაცემა მოვთხოვეთ.",
    ],
    ".sample-project-details:nth-of-type(2) .sample-project-hero-sub-col:nth-child(1) p": [
      "Audience <br />Gen-Z founders <br />Small businesses <br />Tbilisi first",
      "აუდიტორია<br />თაობა Z დამფუძნებლები<br />მცირე ბიზნესები<br />თბილისი პირველ რიგში",
    ],
    ".sample-project-details:nth-of-type(2) .sample-project-hero-sub-col:nth-child(2) p": [
      "Tone <br />Bold, not loud <br />Humor = seriousness <br />Personal, per client",
      "ტონი<br />თამამი, არა ხმაურიანი<br />იუმორი = სერიოზულობა<br />პერსონალური, კლიენტის მიხედვით",
    ],

    ".sample-project-details:nth-of-type(3) .cs-phase": ["Phase 03 <br /> Design", "ფაზა 03<br />დიზაინი"],
    ".sample-project-details:nth-of-type(3) h6": [
      'A black wordmark with a sparkle cut into the "e" set the rules: ink and paper, condensed display type, monochrome imagery that earns its color back on touch. Light as the idea, restraint as the method.',
      'შავი სავაჭრო ნიშანი ბზინვარებით, ამოჭრილი "e"-ში, დაადგინა წესები: მელანი და ქაღალდი, შემჭიდროებული საჩვენებელი შრიფტი, მონოქრომული სურათები, რომლებიც შეხებისას ფერს იბრუნებენ. სინათლე იდეად, თავშეკავება — მეთოდად.',
    ],

    ".sample-project-details:nth-of-type(4) .cs-phase": ["Phase 04 <br /> The Build", "ფაზა 04<br />აშენება"],
    ".sample-project-details:nth-of-type(4) h6": [
      "The site went up the same way client work does: smooth scroll, scroll-triggered type, a WebGL cursor trail, and a fluid simulation in the footer — every effect budgeted against load time, nothing decorative enough to slow it down.",
      "საიტი ავიდა ისევე, როგორც კლიენტის სამუშაო ადის: გლუვი სქროლი, სქროლზე გამომწვევი შრიფტი, WebGL კურსორის კვალი და თხევადი სიმულაცია ფუტერში — ყოველი ეფექტი ბიუჯეტირებული ჩატვირთვის დროის მიხედვით, არაფერი დეკორატიულია იმდენად, რომ შეანელოს.",
    ],

    ".cs-results-label": ["What Shipped", "რა გაშვდა"],
    ".cs-result:nth-child(1) p": ["Brand System", "საბრენდო სისტემა"],
    ".cs-result:nth-child(2) p": ["Page Templates", "გვერდის შაბლონი"],
    ".cs-result:nth-child(3) p": ["Services Defined", "განსაზღვრული სერვისი"],
    ".cs-result:nth-child(4) p": ["First Load", "პირველი ჩატვირთვა"],

    ".cs-deliverables .cs-phase": ["Deliverables", "მიწოდებული"],
    ".cs-deliverables .cs-chip": [
      ["Strategy & Positioning", "სტრატეგია და პოზიციონირება"],
      ["Naming & Tone", "სახელდება და ტონი"],
      ["Visual Identity", "ვიზუალური იდენტობა"],
      ["Web Design", "ვებ დიზაინი"],
      ["Development", "დეველოპმენტი"],
      ["Content System", "კონტენტ-სისტემა"],
    ],

    ".cs-quote h4": [
      '"The brief we give every client is the one we gave ourselves: be impossible to ignore."',
      '"ბრიფი, რომელსაც ყოველ კლიენტს ვაძლევთ, იგივეა, რაც საკუთარ თავს მივეცით: თვალი ვერ მოაშორო."',
    ],
    ".cs-quote-attr": ["— Lumine, Studio Notes", "— Lumine, სტუდიის ჩანაწერები"],

    ".cs-next-label": ["Next", "შემდეგი"],
    ".cs-next h3": ["Back To The Archive", "უკან არქივში"],
  },
};
