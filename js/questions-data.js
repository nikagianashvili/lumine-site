// Questions — the long-form answer file.
//
// The homepage FAQ (js/faq-data.js) is the short version: seven questions a
// founder asks before booking a call. This is the full record — every
// package, every single service, money, process, files, and how to start.
//
// Each entry answers twice over: `a` is the plain answer, `detail` is the
// specifics behind it. That layering is the point of the page — a reader
// who wants the short version stops after the first paragraph, and a reader
// deciding between two packages keeps going.
//
// Numbers here are not restated by hand: anything that is a price or a
// volume is read from js/pricing-data.js at render time, so the rate card
// stays the single source of truth. Placeholders in copy:
//   {starter.price} {growth.price} {full.price}
//   {starter.posters} {growth.posters} {full.posters}
//   {starter.videos} {growth.videos} {full.videos}
//   {addon}
// See js/questions.js for the substitution.

export const SECTIONS = [
  {
    id: "packages",
    title: "The monthly packages",
    title_ka: "თვიური პაკეტები",
    lede: "Three tiers, same team, different volume.",
    lede_ka: "სამი დონე, ერთი გუნდი, სხვადასხვა მოცულობა.",
    items: [
      {
        q: "What is the difference between Starter, Growth and Full Beam?",
        q_ka: "რა განსხვავებაა საწყისს, ზრდადსა და სრულ სინათლეს შორის?",
        a: "Volume, not quality. The same in-house team makes the work at every tier — what changes is how much of it lands each month, and that is the only thing the price follows.",
        a_ka: "მოცულობა და არა ხარისხი. ყოველ დონეზე ერთი და იგივე შიდა გუნდი აკეთებს სამუშაოს — იცვლება მხოლოდ ის, რამდენი მზადდება თვეში, და ფასიც მხოლოდ ამას მიჰყვება.",
        detail: [
          "Starter — {starter.posters} posters and {starter.videos} videos a month, {starter.price}",
          "Growth — {growth.posters} posters and {growth.videos} videos a month, {growth.price}",
          "Full Beam — {full.posters} posters and {full.videos} videos a month, {full.price}",
          "Social media management is included on all three",
          "Paid advertising is included on Starter and Growth",
        ],
        detail_ka: [
          "საწყისი — {starter.posters} პოსტერი და {starter.videos} ვიდეო თვეში, {starter.price}",
          "ზრდადი — {growth.posters} პოსტერი და {growth.videos} ვიდეო თვეში, {growth.price}",
          "სრული სინათლე — {full.posters} პოსტერი და {full.videos} ვიდეო თვეში, {full.price}",
          "სოციალური მედიის მართვა სამივეშია",
          "ფასიანი რეკლამა შედის საწყისსა და ზრდადში",
        ],
        link: { href: "/pricing", label: "See the rate card", label_ka: "ნახე ფასების ბარათი" },
      },
      {
        q: "Which package should we start on?",
        q_ka: "რომელი პაკეტით დავიწყოთ?",
        a: "Growth, for most brands. It is enough content to post consistently without a month feeling thin, and it still leaves room to move up once you know what performs. Start lower if you are testing whether this is worth doing at all — moving up later costs nothing.",
        a_ka: "უმეტეს ბრენდს ზრდადით. ეს იმდენი კონტენტია, რომ თანმიმდევრულად დაპოსტო და თვე მწირად არ იგრძნობოდეს, და მაინც რჩება ადგილი ზრდისთვის, როცა უკვე იცი რა მუშაობს. დაიწყე უფრო დაბლა, თუ ჯერ ამოწმებ ღირს თუ არა საერთოდ — ზემოთ ასვლა მოგვიანებით არაფერი ჯდება.",
        detail: [
          "You can move between tiers at the start of any month",
          "Nothing is locked for a minimum term",
          "If the first month shows the tier is wrong, we say so before you renew",
        ],
        detail_ka: [
          "დონეებს შორის გადასვლა შეგიძლია ნებისმიერი თვის დასაწყისში",
          "მინიმალური ვადა არსად არ არის ჩაკეტილი",
          "თუ პირველი თვე აჩვენებს, რომ დონე არასწორია, განახლებამდე გეტყვით",
        ],
      },
      {
        q: "What counts as one poster?",
        q_ka: "რას ჩაითვლება ერთ პოსტერად?",
        a: "One finished static visual, delivered in every size the channel it is going to needs. A feed post that also has to run as a story is one poster, not two — the resize is part of making it, not a separate job.",
        a_ka: "ერთი დასრულებული სტატიკური ვიზუალი, მიწოდებული ყველა ზომაში, რაც არხს სჭირდება. ფიდის პოსტი, რომელიც სთორისთვისაც უნდა გავიდეს, ერთი პოსტერია და არა ორი — ზომის მორგება მისი დამზადების ნაწილია და არა ცალკე სამუშაო.",
        detail: [
          "Includes copywriting for the caption if you want it",
          "Includes two rounds of revisions",
          "A carousel counts as one poster per slide",
        ],
        detail_ka: [
          "საჭიროების შემთხვევაში მოიცავს ტექსტსაც",
          "მოიცავს ორ რაუნდ შესწორებას",
          "კარუსელი ითვლება თითო სლაიდზე ერთ პოსტერად",
        ],
      },
      {
        q: "What counts as one video?",
        q_ka: "რას ჩაითვლება ერთ ვიდეოდ?",
        a: "One finished short-form cut — the length social actually rewards, up to about a minute. Filming, editing, colour, sound and subtitles are all inside that number.",
        a_ka: "ერთი დასრულებული მოკლე ფორმატის მონტაჟი — ის ხანგრძლივობა, რასაც სოციალური ქსელი რეალურად აჯილდოებს, დაახლოებით წუთამდე. გადაღება, მონტაჟი, ფერი, ხმა და სუბტიტრები ამ ციფრშივეა.",
        detail: [
          "Shot by us, or cut from footage you already have",
          "Vertical and horizontal exports from the same edit count once",
          "Anything longer than about a minute is quoted as a single service",
        ],
        detail_ka: [
          "ჩვენ ვიღებთ, ან ვჭრით იმ მასალიდან, რაც უკვე გაქვს",
          "ვერტიკალური და ჰორიზონტალური ექსპორტი ერთი მონტაჟიდან ერთხელ ითვლება",
          "წუთზე გრძელი ცალკე სერვისად ფასდება",
        ],
      },
      {
        q: "What does social media management actually cover?",
        q_ka: "რას მოიცავს რეალურად სოციალური მედიის მართვა?",
        a: "The running of the account, not just the posting. A content plan agreed at the start of each month, scheduling, captions, hashtags, replying in comments and DMs, and a read of what worked at the end of it.",
        a_ka: "ანგარიშის მართვას და არა მხოლოდ პოსტვას. თვის დასაწყისში შეთანხმებული კონტენტ-გეგმა, დაგეგმვა, ტექსტები, ჰეშთეგები, პასუხები კომენტარებსა და პირად შეტყობინებებში, და თვის ბოლოს იმის ანალიზი, რა გამოვიდა.",
        detail: [
          "Instagram, Facebook and TikTok as standard",
          "A monthly content plan you approve before anything is made",
          "A short monthly report — reach, engagement, what to change",
        ],
        detail_ka: [
          "სტანდარტულად Instagram, Facebook და TikTok",
          "თვიური კონტენტ-გეგმა, რომელსაც ამტკიცებ დამზადებამდე",
          "მოკლე თვიური ანგარიში — მიწვდომა, ჩართულობა, რა შევცვალოთ",
        ],
      },
      {
        q: "Is the ad budget included in the package price?",
        q_ka: "სარეკლამო ბიუჯეტი პაკეტის ფასშია?",
        a: "No. The package covers running the advertising — setup, targeting, creative, watching and adjusting it. What you spend with the platform is yours and goes straight to Meta or TikTok, never through us.",
        a_ka: "არა. პაკეტი ფარავს რეკლამის მართვას — აწყობას, თარგეთინგს, კრეატივს, დაკვირვებასა და კორექციას. პლატფორმაზე დახარჯული თანხა შენია და პირდაპირ Meta-სთან ან TikTok-თან მიდის, არასდროს ჩვენით.",
        detail: [
          "You keep your own ad account and card on file",
          "We recommend a budget, you decide it",
          "Paid advertising is listed on Starter and Growth — to add it to Full Beam, say so and it goes in the quote",
        ],
        detail_ka: [
          "შენს სარეკლამო ანგარიშსა და ბარათს შენვე ინახავ",
          "ბიუჯეტს ჩვენ გირჩევთ, გადაწყვეტილებას შენ იღებ",
          "ფასიანი რეკლამა საწყისსა და ზრდადშია — სრულ სინათლეზე დასამატებლად თქვი და შეთავაზებაში შევა",
        ],
      },
      {
        q: "What if we need more than the package in one month?",
        q_ka: "რა ხდება, თუ ერთ თვეში პაკეტზე მეტი დაგვჭირდა?",
        a: "The extra is billed as an individual service at the single-service rate, that month only. Your tier does not change and the next month goes back to normal.",
        a_ka: "დამატებითი ცალკე სერვისის ტარიფით ფასდება, მხოლოდ იმ თვეში. შენი დონე არ იცვლება და მომდევნო თვე ჩვეულებრივ გრძელდება.",
        detail: [
          "Quoted before it is made, never after",
          "A busy launch month is the usual reason",
          "If it happens twice in a row we will suggest moving up a tier instead",
        ],
        detail_ka: [
          "ფასდება დამზადებამდე და არასდროს შემდეგ",
          "ჩვეულებრივ მიზეზი დატვირთული გაშვების თვეა",
          "თუ ზედიზედ ორჯერ მოხდა, გირჩევთ დონის აწევას",
        ],
      },
      {
        q: "Can you manage our website too?",
        q_ka: "საიტსაც მართავთ?",
        a: "Yes, as an add-on to any tier: {addon} a month. That is upkeep — content updates, new pages, fixes, speed and uptime — not building the site itself.",
        a_ka: "დიახ, ნებისმიერ დონეზე დამატებით: {addon} თვეში. ეს არის მოვლა — კონტენტის განახლება, ახალი გვერდები, შესწორებები, სიჩქარე და მუშაობის უწყვეტობა — და არა თავად საიტის აშენება.",
        detail: [
          "Building a new site is a single service, quoted separately",
          "Works on a site we built or one you already have",
          "Includes monthly backups and an uptime check",
        ],
        detail_ka: [
          "ახალი საიტის აშენება ცალკე სერვისია და ცალკე ფასდება",
          "მუშაობს ჩვენ მიერ აშენებულ ან უკვე არსებულ საიტზე",
          "მოიცავს თვიურ ბექაფებსა და მუშაობის შემოწმებას",
        ],
      },
    ],
  },

  {
    id: "single-services",
    title: "Booking one thing",
    title_ka: "ერთი სერვისის შეკვეთა",
    lede: "Not everyone needs a monthly package.",
    lede_ka: "ყველას თვიური პაკეტი არ სჭირდება.",
    items: [
      {
        q: "Can we book a single service instead of a package?",
        q_ka: "შეგვიძლია ცალკე სერვისი პაკეტის ნაცვლად?",
        a: "Yes. Photo, video, a brand book or a website can each be booked on their own, with no commitment to anything monthly.",
        a_ka: "დიახ. ფოტო, ვიდეო, ბრენდბუქი ან საიტი შეიძლება შეკვეთო ცალკე, ყოველთვიურ ვალდებულებაზე შეთანხმების გარეშე.",
        detail: [
          "Photo retouching and correction — 200–500₾",
          "Video editing and correction — 300–800₾",
          "Brand book — 1500–2500₾",
          "Website, design and build — 2000–3000₾",
        ],
        detail_ka: [
          "ფოტო რეტუში და კორექცია — 200–500₾",
          "ვიდეო მონტაჟი და კორექცია — 300–800₾",
          "ბრენდბუქი — 1500–2500₾",
          "ვებსაიტი, დიზაინი და აშენება — 2000–3000₾",
        ],
        link: { href: "/pricing", label: "See the rate card", label_ka: "ნახე ფასების ბარათი" },
      },
      {
        q: "What is in a brand book?",
        q_ka: "რა შედის ბრენდბუქში?",
        a: "Everything needed to keep the brand looking like itself when we are not the ones using it. A logo and its variants, colour, type, spacing rules, how it behaves on photography, and the mistakes to avoid.",
        a_ka: "ყველაფერი, რაც საჭიროა, რომ ბრენდი საკუთარ თავს ჰგავდეს მაშინაც, როცა მას ჩვენ არ ვიყენებთ. ლოგო და მისი ვარიანტები, ფერი, შრიფტი, სივრცის წესები, როგორ იქცევა ფოტოზე და რა შეცდომებია ასარიდებელი.",
        detail: [
          "Logo in every format your printer and your developer will ask for",
          "A colour system with print and screen values",
          "Type scale and the licences you need to buy",
          "Ready-made templates for the formats you post most",
        ],
        detail_ka: [
          "ლოგო ყველა ფორმატში, რასაც ტიპოგრაფიაც და დეველოპერიც მოგთხოვს",
          "ფერთა სისტემა ბეჭდვისა და ეკრანის მნიშვნელობებით",
          "შრიფტის სკალა და ლიცენზიები, რაც უნდა შეიძინო",
          "მზა შაბლონები იმ ფორმატებისთვის, რასაც ყველაზე ხშირად პოსტავ",
        ],
      },
      {
        q: "What is in a website build?",
        q_ka: "რა შედის საიტის აშენებაში?",
        a: "Design and build of the whole thing, in Georgian and English if you need both, ready to launch. Not a template with your logo dropped in.",
        a_ka: "მთლიანის დიზაინი და აშენება, ქართულად და ინგლისურად თუ ორივე გჭირდება, გაშვებისთვის მზად. და არა შაბლონი, რომელშიც შენი ლოგოა ჩასმული.",
        detail: [
          "Design, build, content loading and launch",
          "Works down to a phone screen, not just on a laptop",
          "Basic on-page SEO and analytics wired in",
          "Hosting and domain stay in your name",
        ],
        detail_ka: [
          "დიზაინი, აშენება, კონტენტის ჩატვირთვა და გაშვება",
          "მუშაობს ტელეფონის ეკრანამდე და არა მხოლოდ ლეპტოპზე",
          "ჩაშენებული საბაზისო SEO და ანალიტიკა",
          "ჰოსტინგი და დომენი შენს სახელზე რჩება",
        ],
        link: { href: "/services/web", label: "Web development", label_ka: "ვებ დეველოპმენტი" },
      },
      {
        q: "Do you shoot, or only edit?",
        q_ka: "იღებთ თუ მხოლოდ მონტაჟს აკეთებთ?",
        a: "Both. We shoot in studio and on location, and we also work with footage you already have when a reshoot is not worth it.",
        a_ka: "ორივეს. ვიღებთ სტუდიაშიც და ლოკაციაზეც, და ვმუშაობთ იმ მასალაზეც, რაც უკვე გაქვს, როცა თავიდან გადაღება არ ღირს.",
        detail: [
          "Product, interior, food, portrait and event",
          "Retouching and colour correction are priced on their own",
          "Raw files come to you with the finished exports",
        ],
        detail_ka: [
          "პროდუქტი, ინტერიერი, საკვები, პორტრეტი და ღონისძიება",
          "რეტუში და ფერის კორექცია ცალკე ფასდება",
          "საწყისი ფაილები დასრულებულ ექსპორტებთან ერთად გადმოგეცემა",
        ],
        link: { href: "/services/photography", label: "Photography", label_ka: "ფოტოგრაფია" },
      },
      {
        q: "Can a single service turn into a package later?",
        q_ka: "შეიძლება ცალკე სერვისი მოგვიანებით პაკეტად იქცეს?",
        a: "Often that is exactly the order it happens in — a brand book or a site first, then monthly content once there is something to be consistent about. Nothing about starting small makes the package more expensive later.",
        a_ka: "ხშირად სწორედ ასეთია თანმიმდევრობა — ჯერ ბრენდბუქი ან საიტი, მერე თვიური კონტენტი, როცა უკვე არსებობს ის, რაშიც თანმიმდევრული უნდა იყო. მცირედით დაწყება პაკეტს მოგვიანებით არ აძვირებს.",
        detail: [
          "The single-service work carries straight into the monthly plan",
          "No setup fee for switching",
        ],
        detail_ka: [
          "ცალკე შესრულებული სამუშაო პირდაპირ გადადის თვიურ გეგმაში",
          "გადასვლისთვის საწყისი გადასახადი არ არის",
        ],
      },
    ],
  },

  {
    id: "money",
    title: "Money and terms",
    title_ka: "ფული და პირობები",
    lede: "Published up front, quoted after one call.",
    lede_ka: "წინასწარ გამოქვეყნებული, ერთი ზარის შემდეგ დაზუსტებული.",
    items: [
      {
        q: "Why is every price a range?",
        q_ka: "რატომ არის ყოველი ფასი დიაპაზონი?",
        a: "Because the work inside a tier is not identical for every brand. The range is honest about that: it is the real floor and the real ceiling, not a low number you will never actually pay.",
        a_ka: "იმიტომ, რომ ერთი დონის შიგნით სამუშაო ყველა ბრენდისთვის ერთნაირი არ არის. დიაპაზონი ამაზე გულწრფელია: ეს რეალური ქვედა და რეალური ზედა ზღვარია და არა დაბალი ციფრი, რომელსაც არასდროს გადაიხდი.",
        detail: [
          "Where you land depends on how much shooting the month needs",
          "The quote after the call is a fixed number, not a range",
          "The quote does not move unless the brief does",
        ],
        detail_ka: [
          "სად აღმოჩნდები, დამოკიდებულია იმაზე, რამდენი გადაღება სჭირდება თვეს",
          "ზარის შემდეგ შეთავაზება ფიქსირებული ციფრია და არა დიაპაზონი",
          "შეთავაზება არ იცვლება, თუ დავალება არ შეიცვალა",
        ],
      },
      {
        q: "How and when do we pay?",
        q_ka: "როგორ და როდის ვიხდით?",
        a: "Monthly packages are invoiced at the start of each month. Single services are half up front and half on delivery.",
        a_ka: "თვიური პაკეტები ყოველი თვის დასაწყისში ფასდება ინვოისით. ცალკე სერვისები ნახევარი წინასწარ და ნახევარი ჩაბარებისას.",
        detail: [
          "Bank transfer, in GEL",
          "Invoice with full details for your accountant",
          "Payment terms are on the invoice, not buried in a contract",
        ],
        detail_ka: [
          "საბანკო გადარიცხვით, ლარში",
          "ინვოისი სრული დეტალებით შენი ბუღალტრისთვის",
          "გადახდის პირობები ინვოისზეა და არა კონტრაქტში ჩამარხული",
        ],
      },
      {
        q: "Is there a contract, and is there a minimum term?",
        q_ka: "არის კონტრაქტი და აქვს მინიმალური ვადა?",
        a: "There is a contract — it says what we make, when, and what it costs, and it protects both sides. There is no minimum term. A month that is not working is a month you can end.",
        a_ka: "კონტრაქტი არის — მასში წერია რას ვქმნით, როდის და რა ღირს, და ორივე მხარეს იცავს. მინიმალური ვადა არ არსებობს. თვე, რომელიც არ მუშაობს, არის თვე, რომელიც შეგიძლია დაასრულო.",
        detail: [
          "Notice before the start of the next month is all we ask",
          "Work already made and paid for stays yours",
          "No cancellation fee",
        ],
        detail_ka: [
          "მხოლოდ იმას ვითხოვთ, რომ მომდევნო თვის დაწყებამდე გვაცნობო",
          "უკვე დამზადებული და ანაზღაურებული სამუშაო შენი რჩება",
          "გაუქმების საფასური არ არის",
        ],
      },
      {
        q: "Do you invoice for VAT?",
        q_ka: "დღგ-ს ინვოისში რთავთ?",
        a: "Invoices are issued to a registered entity with everything your accountant needs on them. Tax treatment depends on your registration, so it is confirmed on the call rather than guessed at here.",
        a_ka: "ინვოისები გამოიწერება რეგისტრირებულ სუბიექტზე და მასზეა ყველაფერი, რაც შენს ბუღალტერს სჭირდება. საგადასახადო რეჟიმი შენს რეგისტრაციაზეა დამოკიდებული, ამიტომ ზარზე დაზუსტდება და არა აქ ნავარაუდევი.",
        detail: ["Ask on the call and you get a straight answer, in writing"],
        detail_ka: ["იკითხე ზარზე და მიიღებ პირდაპირ პასუხს, წერილობით"],
      },
      {
        q: "What is not included in any price on this site?",
        q_ka: "რა არ შედის ამ საიტზე მოცემულ არცერთ ფასში?",
        a: "Things we buy on your behalf rather than make. Naming them here rather than in a footnote is deliberate.",
        a_ka: "ის, რასაც შენთვის ვყიდულობთ და არა ვქმნით. ეს აქ არის ჩამოთვლილი და არა სქოლიოში — განზრახ.",
        detail: [
          "Advertising spend on the platforms",
          "Font and stock-image licences",
          "Domain and hosting",
          "Print production and delivery",
          "Talent, models and location fees",
        ],
        detail_ka: [
          "სარეკლამო ხარჯი პლატფორმებზე",
          "შრიფტისა და სტოკ-ფოტოს ლიცენზიები",
          "დომენი და ჰოსტინგი",
          "ბეჭდვა და მიწოდება",
          "მსახიობები, მოდელები და ლოკაციის საფასური",
        ],
      },
    ],
  },

  {
    id: "working",
    title: "How the work runs",
    title_ka: "როგორ მიმდინარეობს სამუშაო",
    lede: "One team, one contact, from brief to launch.",
    lede_ka: "ერთი გუნდი, ერთი საკონტაქტო, ბრიფიდან გაშვებამდე.",
    items: [
      {
        q: "Who actually does the work?",
        q_ka: "ვინ აკეთებს რეალურად სამუშაოს?",
        a: "We do, in house, in Tbilisi. Photo, video, design, social, marketing and web all sit with the same team, so nothing is passed to a subcontractor you never meet.",
        a_ka: "ჩვენ, შიდა გუნდით, თბილისში. ფოტო, ვიდეო, დიზაინი, სოციალური, მარკეტინგი და ვები ერთსა და იმავე გუნდშია, ასე რომ არაფერი გადაეცემა სუბკონტრაქტორს, რომელსაც ვერასდროს ნახავ.",
        detail: [
          "One point of contact from brief to launch",
          "The people on the call are the people making it",
        ],
        detail_ka: [
          "ერთი საკონტაქტო პირი ბრიფიდან გაშვებამდე",
          "ვინც ზარზეა, ისვე აკეთებს",
        ],
        link: { href: "/studio", label: "Meet the studio", label_ka: "გაიცანი სტუდია" },
      },
      {
        q: "How long does a project take?",
        q_ka: "რამდენი ხანი სჭირდება პროექტს?",
        a: "A shoot or a single set of content lands within a week or two. A brand book takes three to four weeks and a website four to six, depending on how much of your content is ready when we start.",
        a_ka: "გადაღება ან კონტენტის ერთი ნაკრები ერთ-ორ კვირაში მზადდება. ბრენდბუქს სამი-ოთხი კვირა სჭირდება, საიტს ოთხი-ექვსი, იმის მიხედვით, რამდენად მზად არის შენი კონტენტი დაწყებისას.",
        detail: [
          "Monthly packages run continuously, planned at the start of each month",
          "The single thing that moves a deadline is waiting on content or approval",
        ],
        detail_ka: [
          "თვიური პაკეტები უწყვეტად მიმდინარეობს, დაგეგმილი თვის დასაწყისში",
          "ვადას მხოლოდ ერთი რამ ცვლის — კონტენტის ან დადასტურების მოლოდინი",
        ],
      },
      {
        q: "How many rounds of revisions do we get?",
        q_ka: "რამდენი რაუნდი შესწორება გვეკუთვნის?",
        a: "Two on anything we make. That is enough for real feedback and few enough that the feedback stays specific — an open-ended number is how projects quietly stop finishing.",
        a_ka: "ორი ყველაფერზე, რასაც ვქმნით. ეს საკმარისია რეალური უკუკავშირისთვის და იმდენად ცოტა, რომ უკუკავშირი კონკრეტული დარჩეს — შეუზღუდავი რაოდენობა სწორედ ისაა, რითიც პროექტები ჩუმად ვეღარ სრულდება.",
        detail: [
          "A round is one consolidated set of notes, not a message at a time",
          "Further rounds are possible and quoted before they start",
          "Changing the brief is a new brief, not a revision",
        ],
        detail_ka: [
          "რაუნდი ერთი გაერთიანებული შენიშვნების ნაკრებია და არა თითო შეტყობინება",
          "დამატებითი რაუნდები შესაძლებელია და დაწყებამდე ფასდება",
          "დავალების შეცვლა ახალი დავალებაა და არა შესწორება",
        ],
      },
      {
        q: "How do we stay in touch during a project?",
        q_ka: "როგორ ვინარჩუნებთ კავშირს პროექტის განმავლობაში?",
        a: "One shared channel, whichever one you already live in, plus a call when something needs a decision rather than a message.",
        a_ka: "ერთი საერთო არხი, ის, რომელშიც უკვე ცხოვრობ, პლუს ზარი, როცა რაღაცას გადაწყვეტილება სჭირდება და არა შეტყობინება.",
        detail: [
          "Files and approvals in one place, not scattered across chats",
          "A short check-in at the start and the end of each month",
          "Working hours are Georgian time, Monday to Friday",
        ],
        detail_ka: [
          "ფაილები და დადასტურებები ერთ ადგილას და არა ჩატებში მიმოფანტული",
          "მოკლე შეხვედრა ყოველი თვის დასაწყისსა და ბოლოს",
          "სამუშაო საათები საქართველოს დროით, ორშაბათიდან პარასკევამდე",
        ],
      },
      {
        q: "What do you need from us to start?",
        q_ka: "რა გვჭირდება თქვენგან დასაწყებად?",
        a: "Less than most people expect. What the business does, who it is for, and access to whatever already exists — the rest we work out together on the first call.",
        a_ka: "იმაზე ნაკლები, ვიდრე უმეტესობა ფიქრობს. რას აკეთებს ბიზნესი, ვისთვისაა და წვდომა იმაზე, რაც უკვე არსებობს — დანარჩენს პირველ ზარზე ერთად ვარკვევთ.",
        detail: [
          "Access to the social accounts you already run",
          "Any existing logo, photography or brand files",
          "One person on your side who can approve",
        ],
        detail_ka: [
          "წვდომა სოციალურ ანგარიშებზე, რომლებსაც უკვე მართავ",
          "არსებული ლოგო, ფოტოები ან ბრენდის ფაილები",
          "ერთი ადამიანი შენს მხარეს, ვისაც დამტკიცება შეუძლია",
        ],
      },
      {
        q: "Do you work with brand-new businesses?",
        q_ka: "მუშაობთ სულ ახალდაწყებულ ბიზნესებთან?",
        a: "Yes, and a good share of what we do is exactly that — taking a founder from nothing to a working brand: name, look, first content, first site.",
        a_ka: "დიახ, და ჩვენი საქმის დიდი ნაწილი სწორედ ესაა — დამფუძნებლის ნულიდან სამუშაო ბრენდამდე მიყვანა: სახელი, სახე, პირველი კონტენტი, პირველი საიტი.",
        detail: [
          "Having no brand yet is easier to work with than an inconsistent one",
          "We will say plainly if you need less than you came to ask for",
        ],
        detail_ka: [
          "როცა ბრენდი ჯერ არ გაქვს, უფრო ადვილია, ვიდრე როცა არათანმიმდევრულია",
          "პირდაპირ გეტყვით, თუ იმაზე ნაკლები გჭირდება, ვიდრე სთხოვე",
        ],
      },
    ],
  },

  {
    id: "files",
    title: "Files and rights",
    title_ka: "ფაილები და უფლებები",
    lede: "You own what you paid for. All of it.",
    lede_ka: "შენია ის, რაშიც გადაიხადე. მთლიანად.",
    items: [
      {
        q: "Do we own everything you make?",
        q_ka: "ჩვენია ყველაფერი, რასაც ქმნით?",
        a: "Yes. Final files, source files and full usage rights are yours once the project is paid — including editable design files and the original photo and video footage, not just the exports.",
        a_ka: "დიახ. საბოლოო ფაილები, საწყისი ფაილები და სრული გამოყენების უფლებები შენია პროექტის ანაზღაურების შემდეგ — მათ შორის რედაქტირებადი დიზაინ-ფაილები და ორიგინალი ფოტო-ვიდეო მასალა, და არა მხოლოდ ექსპორტები.",
        detail: [
          "No licence to renew, no usage window that expires",
          "Use it in print, on air, on a billboard — it is yours",
          "Fonts and stock are the exception: those licences are issued to you by their owner, not by us",
        ],
        detail_ka: [
          "განსაახლებელი ლიცენზია არ არის, გამოყენების ვადა არ იწურება",
          "გამოიყენე ბეჭდვაში, ეთერში, ბილბორდზე — შენია",
          "შრიფტები და სტოკი გამონაკლისია: ის ლიცენზიები შენზე გამოიწერება მათი მფლობელის მიერ და არა ჩვენ მიერ",
        ],
      },
      {
        q: "How do we get the files?",
        q_ka: "როგორ მივიღებთ ფაილებს?",
        a: "One delivery folder per project, organised so a person who was not on the project can still find what they need in it.",
        a_ka: "თითო პროექტზე ერთი მიწოდების საქაღალდე, ისე დალაგებული, რომ ადამიანმაც იპოვოს საჭირო, ვინც პროექტში არ ყოფილა.",
        detail: [
          "Exports separated from source files",
          "Named so the file tells you what it is",
          "Kept available for twelve months after delivery",
        ],
        detail_ka: [
          "ექსპორტები საწყისი ფაილებისგან გამოყოფილი",
          "სახელდებული ისე, რომ ფაილი თავად გეუბნება რა არის",
          "ხელმისაწვდომია მიწოდებიდან თორმეტი თვის განმავლობაში",
        ],
      },
      {
        q: "Can you show our work in your portfolio?",
        q_ka: "შეგიძლიათ ჩვენი სამუშაო თქვენს პორტფოლიოში აჩვენოთ?",
        a: "We ask, and you can say no. Nothing goes on this site or on our social without your say-so, and unreleased work stays unreleased until you launch it.",
        a_ka: "ვკითხულობთ და შეგიძლია უარი თქვა. არაფერი ჩნდება ამ საიტზე ან ჩვენს სოციალურში შენი თანხმობის გარეშე, და გამოუშვებელი სამუშაო გამოუშვებელი რჩება, სანამ შენ არ გაუშვებ.",
        detail: [
          "A no costs you nothing and changes nothing about the work",
          "Confidential projects can be covered by an NDA before we start",
        ],
        detail_ka: [
          "უარი არაფერს გიჯდება და სამუშაოში არაფერს ცვლის",
          "კონფიდენციალური პროექტები დაწყებამდე NDA-თი შეიძლება დაიფაროს",
        ],
      },
      {
        q: "What happens to our accounts if we stop working together?",
        q_ka: "რა ემართება ჩვენს ანგარიშებს, თუ თანამშრომლობას შევწყვეტთ?",
        a: "They were always yours. We are added as a manager on your accounts rather than owning them, so ending the work is us removing our access, not you asking for your own property back.",
        a_ka: "ისინი ყოველთვის შენი იყო. ჩვენ შენს ანგარიშებზე მენეჯერად ვემატებით და არ ვფლობთ, ამიტომ სამუშაოს დასრულება ჩვენი წვდომის მოხსნაა და არა შენი საკუთრების დაბრუნების თხოვნა.",
        detail: [
          "Ad accounts, pages, domain and hosting all stay in your name",
          "Handover includes the current content plan and the source files",
        ],
        detail_ka: [
          "სარეკლამო ანგარიშები, გვერდები, დომენი და ჰოსტინგი შენს სახელზე რჩება",
          "გადაბარება მოიცავს მიმდინარე კონტენტ-გეგმასა და საწყის ფაილებს",
        ],
      },
    ],
  },

  {
    id: "starting",
    title: "Starting",
    title_ka: "დაწყება",
    lede: "One call, then a number.",
    lede_ka: "ერთი ზარი, მერე ციფრი.",
    items: [
      {
        q: "What happens on the first call?",
        q_ka: "რა ხდება პირველ ზარზე?",
        a: "Fifteen minutes, straight talk. You say what the business needs, we say what we would actually do and roughly what it costs. Nobody is selling anything in that fifteen minutes.",
        a_ka: "თხუთმეტი წუთი, პირდაპირი საუბარი. შენ ამბობ, რა სჭირდება ბიზნესს, ჩვენ ვამბობთ, რას გავაკეთებდით რეალურად და დაახლოებით რა ეღირება. ამ თხუთმეტ წუთში არავინ არაფერს ყიდის.",
        detail: [
          "No preparation needed on your side",
          "A written quote follows within two working days",
          "If we are not the right studio for it, we will say so on the call",
        ],
        detail_ka: [
          "შენს მხარეს მომზადება არ სჭირდება",
          "წერილობითი შეთავაზება მოჰყვება ორ სამუშაო დღეში",
          "თუ ჩვენ არ ვართ სწორი სტუდია ამისთვის, ზარზევე გეტყვით",
        ],
        link: { href: "/contact", label: "Book a call", label_ka: "დაჯავშნე ზარი" },
      },
      {
        q: "How soon can you start?",
        q_ka: "რამდენად მალე შეგიძლიათ დაწყება?",
        a: "Usually within a week or two of the quote being agreed. Monthly packages start on the first of a month so the content plan lines up with it.",
        a_ka: "ჩვეულებრივ შეთანხმებიდან ერთ-ორ კვირაში. თვიური პაკეტები თვის პირველიდან იწყება, რომ კონტენტ-გეგმა დაემთხვეს.",
        detail: [
          "Urgent work is possible and priced as such — ask rather than assume",
          "A shoot needs about a week of lead time to schedule",
        ],
        detail_ka: [
          "სასწრაფო სამუშაო შესაძლებელია და შესაბამისად ფასდება — იკითხე და არ ივარაუდო",
          "გადაღების დასაგეგმად დაახლოებით ერთი კვირა სჭირდება",
        ],
      },
      {
        q: "Do you work with clients outside Georgia?",
        q_ka: "მუშაობთ საქართველოს გარეთ კლიენტებთან?",
        a: "Yes for anything that does not need us physically in the room — design, brand books, websites, social, editing. Shooting means being where you are, so that one depends on where that is.",
        a_ka: "დიახ ყველაფერზე, რასაც ჩვენი ფიზიკური ყოფნა არ სჭირდება — დიზაინი, ბრენდბუქები, საიტები, სოციალური, მონტაჟი. გადაღება ნიშნავს იქ ყოფნას, სადაც შენ ხარ, ამიტომ ის ლოკაციაზეა დამოკიდებული.",
        detail: [
          "We work in English and Georgian",
          "Invoicing is in GEL",
        ],
        detail_ka: [
          "ვმუშაობთ ინგლისურად და ქართულად",
          "ინვოისები ლარშია",
        ],
      },
      {
        q: "Our question is not here.",
        q_ka: "ჩვენი კითხვა აქ არ არის.",
        a: "Then ask it. The chat on this page answers from this same file and the rate card, and anything it cannot answer goes to a person.",
        a_ka: "მაშინ დასვი. ამ გვერდზე არსებული ჩატი პასუხობს იმავე ფაილიდან და ფასების ბარათიდან, და რასაც ვერ უპასუხებს, ადამიანთან მიდის.",
        detail: ["hello@lumine.ge, or the chat in the corner of this page"],
        detail_ka: ["hello@lumine.ge, ან ჩატი ამ გვერდის კუთხეში"],
        link: { href: "/contact", label: "Contact", label_ka: "კონტაქტი" },
      },
    ],
  },
];
