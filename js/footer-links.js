// Utility footer — injected on every page from one config,
// so links live in a single place instead of eight HTML files.
//
// Self-contained EN/GE text, same reasoning as js/nav.js's menu overlay:
// relying on a separate translation script to catch this content after
// the fact raced against page-load timing unreliably. Building the right
// language directly, and relabeling in place on language change, removes
// that dependency entirely.

const LANG_KEY = "lumine-lang";
const currentLang = () => localStorage.getItem(LANG_KEY) || "en";

const COLUMNS = [
  {
    title: { en: "Pages", ka: "გვერდები" },
    links: [
      { en: "Home", ka: "მთავარი", href: "/" },
      { en: "Studio", ka: "სტუდია", href: "/studio" },
      { en: "Services", ka: "სერვისები", href: "/services" },
      { en: "Work", ka: "ნამუშევრები", href: "/work" },
      { en: "Pricing", ka: "ფასები", href: "/pricing" },
      { en: "Journal", ka: "ჟურნალი", href: "/journal" },
      { en: "Q&A", ka: "კითხვა-პასუხი", href: "/#faq" },
    ],
  },
  {
    title: { en: "Services", ka: "სერვისები" },
    links: [
      { en: "Photography", ka: "ფოტოგრაფია", href: "/services#photography" },
      { en: "Video", ka: "ვიდეო", href: "/services#video" },
      { en: "Graphic Design", ka: "გრაფიკული დიზაინი", href: "/services#design" },
      { en: "Social Media", ka: "სოციალური მედია", href: "/services#social" },
      { en: "Marketing", ka: "მარკეტინგი", href: "/services#marketing" },
      { en: "Web", ka: "ვები", href: "/services#web" },
    ],
  },
  {
    title: { en: "Industries", ka: "ინდუსტრიები" },
    links: [
      { en: "Medical", ka: "სამედიცინო", href: "/work?industry=Medical" },
      { en: "Hotels", ka: "სასტუმროები", href: "/work?industry=Hotels" },
      { en: "Restaurants", ka: "რესტორნები", href: "/work?industry=Restaurants" },
      { en: "Real Estate", ka: "უძრავი ქონება", href: "/work?industry=Real%20Estate" },
      { en: "SaaS", ka: "SaaS", href: "/work?industry=SaaS" },
      { en: "E-Commerce", ka: "ელ-კომერცია", href: "/work?industry=E-Commerce" },
      { en: "Startups", ka: "სტარტაპები", href: "/work?industry=Startups" },
    ],
  },
  {
    title: { en: "Contact", ka: "კონტაქტი" },
    links: [
      { en: "hello@lumine.ge", ka: "hello@lumine.ge", href: "mailto:hello@lumine.ge" },
      { en: "+995 555 00 00 00", ka: "+995 555 00 00 00", href: "tel:+995555000000" },
      {
        en: "Instagram",
        ka: "Instagram",
        href: "https://www.instagram.com/lumine.ge",
        external: true,
      },
      { en: "Tbilisi, Georgia", ka: "თბილისი, საქართველო", href: "/contact" },
    ],
  },
];

const TEXT = {
  en: {
    tag: "Photo, video, design, social, marketing, and web — in house, in Tbilisi.",
    newsletterLabel: "The Journal is the newsletter — new notes by email",
    emailPlaceholder: "you@email.com",
    basedIn: "Based In Tbilisi",
    availableFor: "Available For New Projects",
    bookACall: "Book A Call",
    privacy: "Privacy Policy",
    terms: "Terms",
    invalid: "Add a real email first.",
    sent: "A draft opened in your mail app — send it and you're on the list.",
  },
  ka: {
    tag: "ფოტო, ვიდეო, დიზაინი, სოციალური მედია, მარკეტინგი და ვები — ყველაფერი ერთ გუნდში, თბილისში.",
    newsletterLabel: "ჟურნალი არის ჩვენი გამოწერა — ახალი ჩანაწერები პირდაპირ მეილზე",
    emailPlaceholder: "შენი@მეილი.com",
    basedIn: "დაფუძნებულია თბილისში",
    availableFor: "ხელმისაწვდომია ახალი პროექტებისთვის",
    bookACall: "დარეკვის დაჯავშნა",
    privacy: "კონფიდენციალურობის პოლიტიკა",
    terms: "წესები",
    invalid: "მიუთითეთ რეალური მეილი.",
    sent: "დრაფტი გაიხსნა თქვენს მეილ აპლიკაციაში — გააგზავნეთ და სიაშია ხართ.",
  },
};

// Turn the bare "big statement" CTA into a composed sign-off:
// corner meta (location + live availability) + a real action row.
function enhanceCta(footer, T) {
  const inner = footer.querySelector(".footer-inner");
  const cta = footer.querySelector(".footer-cta");
  if (!inner || !cta || inner.querySelector(".footer-cta-meta")) return;

  const meta = document.createElement("div");
  meta.className = "footer-cta-meta";
  meta.innerHTML = `
    <span class="footer-cta-meta-item">${T.basedIn}</span>
    <span class="footer-cta-meta-item">${T.availableFor}</span>
  `;
  inner.insertBefore(meta, inner.firstChild);

  const actions = document.createElement("div");
  actions.className = "footer-cta-actions";
  actions.innerHTML = `
    <a href="/contact" class="btn btn-invert">${T.bookACall}</a>
    <a href="mailto:hello@lumine.ge" class="footer-cta-mail">hello@lumine.ge</a>
  `;
  cta.insertAdjacentElement("afterend", actions);
}

function buildLinks() {
  const footer = document.querySelector("footer");
  if (!footer || footer.querySelector(".footer-links")) return;

  const lang = currentLang();
  const T = TEXT[lang];

  enhanceCta(footer, T);

  // The link grid + bottom bar live on a solid panel (like the home page's
  // ink CTA panel) instead of sitting exposed on the live particle canvas —
  // readability shouldn't depend on where the simulation happens to settle.
  const solid = document.createElement("div");
  solid.className = "footer-solid grain";

  const section = document.createElement("div");
  section.className = "footer-links";
  section.innerHTML = `
    <div class="footer-links-brand">
      <img src="/logo/lumine-logo-white.png" alt="Lumine" class="footer-links-logo" />
      <p class="footer-links-tag">${T.tag}</p>
      <form class="footer-newsletter" id="footerNewsletter" novalidate>
        <span class="footer-newsletter-label">${T.newsletterLabel}</span>
        <div class="footer-newsletter-row">
          <input type="email" name="email" placeholder="${T.emailPlaceholder}" required />
          <button type="submit" aria-label="Subscribe">↗</button>
        </div>
        <span class="footer-newsletter-status" aria-live="polite"></span>
      </form>
    </div>
    ${COLUMNS.map(
      (col) => `
      <div class="footer-links-col">
        <span class="footer-links-title">${lang === "ka" ? col.title.ka : col.title.en}</span>
        ${col.links
          .map(
            (l) =>
              `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${lang === "ka" ? l.ka : l.en}</a>`,
          )
          .join("")}
      </div>
    `,
    ).join("")}
  `;

  solid.appendChild(section);
  footer.appendChild(solid);

  // move the bottom bar after the links (onto the same solid panel) and
  // extend it with legal links
  const bottom = footer.querySelector(".footer-bottom");
  if (bottom) {
    bottom.classList.add("is-static");
    const legal = document.createElement("p");
    legal.className = "footer-legal";
    legal.innerHTML = `<a href="/legal#privacy">${T.privacy}</a> · <a href="/legal#terms">${T.terms}</a> · © 2026 Lumine`;
    bottom.appendChild(legal);
    solid.appendChild(bottom);
  }

  // newsletter — no backend yet: composes a subscribe email, says so.
  const form = section.querySelector("#footerNewsletter");
  const status = form.querySelector(".footer-newsletter-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email || !email.includes("@")) {
      status.textContent = TEXT[currentLang()].invalid;
      return;
    }
    window.location.href = `mailto:hello@lumine.ge?subject=${encodeURIComponent(
      "Journal subscription",
    )}&body=${encodeURIComponent(`Add me to the journal list: ${email}`)}`;
    status.textContent = TEXT[currentLang()].sent;
  });

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    const newLang = e.detail.lang;
    const nt = TEXT[newLang];

    const metaItems = footer.querySelectorAll(".footer-cta-meta-item");
    if (metaItems[0]) metaItems[0].textContent = nt.basedIn;
    if (metaItems[1]) metaItems[1].textContent = nt.availableFor;

    const bookBtn = footer.querySelector(".footer-cta-actions .btn-invert");
    if (bookBtn) bookBtn.textContent = nt.bookACall;

    const tagEl = footer.querySelector(".footer-links-tag");
    if (tagEl) tagEl.textContent = nt.tag;

    const newsletterLabel = footer.querySelector(".footer-newsletter-label");
    if (newsletterLabel) newsletterLabel.textContent = nt.newsletterLabel;

    const emailInput = footer.querySelector('.footer-newsletter input[name="email"]');
    if (emailInput) emailInput.setAttribute("placeholder", nt.emailPlaceholder);

    const cols = footer.querySelectorAll(".footer-links-col");
    COLUMNS.forEach((col, i) => {
      const colEl = cols[i];
      if (!colEl) return;
      const titleEl = colEl.querySelector(".footer-links-title");
      if (titleEl) titleEl.textContent = newLang === "ka" ? col.title.ka : col.title.en;
      const linkEls = colEl.querySelectorAll("a");
      col.links.forEach((l, j) => {
        if (linkEls[j]) linkEls[j].textContent = newLang === "ka" ? l.ka : l.en;
      });
    });

    const legalLinks = footer.querySelectorAll(".footer-legal a");
    if (legalLinks[0]) legalLinks[0].textContent = nt.privacy;
    if (legalLinks[1]) legalLinks[1].textContent = nt.terms;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildLinks);
} else {
  buildLinks();
}
