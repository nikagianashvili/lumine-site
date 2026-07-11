// Utility footer — injected on every page from one config,
// so links live in a single place instead of eight HTML files.
//
// Georgian pages live under /ka/ as real, separate static HTML, so this
// only needs to know which side of that split it's on to link and label
// itself correctly — no language state to read/write.

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const COLUMNS_EN = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: p("/") },
      { label: "Studio", href: p("/studio") },
      { label: "Services", href: p("/services") },
      { label: "Work", href: p("/work") },
      { label: "Pricing", href: p("/pricing") },
      { label: "Journal", href: p("/journal") },
      { label: "Q&A", href: `${p("/")}#faq` },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Photography", href: `${p("/services")}#photography` },
      { label: "Video", href: `${p("/services")}#video` },
      { label: "Graphic Design", href: `${p("/services")}#design` },
      { label: "Social Media", href: `${p("/services")}#social` },
      { label: "Marketing", href: `${p("/services")}#marketing` },
      { label: "Web", href: `${p("/services")}#web` },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Medical", href: `${p("/work")}?industry=Medical` },
      { label: "Hotels", href: `${p("/work")}?industry=Hotels` },
      { label: "Restaurants", href: `${p("/work")}?industry=Restaurants` },
      { label: "Real Estate", href: `${p("/work")}?industry=Real%20Estate` },
      { label: "SaaS", href: `${p("/work")}?industry=SaaS` },
      { label: "E-Commerce", href: `${p("/work")}?industry=E-Commerce` },
      { label: "Startups", href: `${p("/work")}?industry=Startups` },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@lumine.ge", href: "mailto:hello@lumine.ge" },
      { label: "+995 555 00 00 00", href: "tel:+995555000000" },
      { label: "Instagram", href: "https://www.instagram.com/lumine.ge", external: true },
      { label: "Tbilisi, Georgia", href: p("/contact") },
    ],
  },
];

const COLUMNS_KA = [
  {
    title: "გვერდები",
    links: [
      { label: "მთავარი", href: p("/") },
      { label: "სტუდია", href: p("/studio") },
      { label: "სერვისები", href: p("/services") },
      { label: "ნამუშევრები", href: p("/work") },
      { label: "ფასები", href: p("/pricing") },
      { label: "ჟურნალი", href: p("/journal") },
      { label: "კითხვა-პასუხი", href: `${p("/")}#faq` },
    ],
  },
  {
    title: "სერვისები",
    links: [
      { label: "ფოტოგრაფია", href: `${p("/services")}#photography` },
      { label: "ვიდეო", href: `${p("/services")}#video` },
      { label: "გრაფიკული დიზაინი", href: `${p("/services")}#design` },
      { label: "სოციალური მედია", href: `${p("/services")}#social` },
      { label: "მარკეტინგი", href: `${p("/services")}#marketing` },
      { label: "ვები", href: `${p("/services")}#web` },
    ],
  },
  {
    title: "ინდუსტრიები",
    links: [
      { label: "სამედიცინო", href: `${p("/work")}?industry=Medical` },
      { label: "სასტუმროები", href: `${p("/work")}?industry=Hotels` },
      { label: "რესტორნები", href: `${p("/work")}?industry=Restaurants` },
      { label: "უძრავი ქონება", href: `${p("/work")}?industry=Real%20Estate` },
      { label: "SaaS", href: `${p("/work")}?industry=SaaS` },
      { label: "ელ-კომერცია", href: `${p("/work")}?industry=E-Commerce` },
      { label: "სტარტაპები", href: `${p("/work")}?industry=Startups` },
    ],
  },
  {
    title: "კონტაქტი",
    links: [
      { label: "hello@lumine.ge", href: "mailto:hello@lumine.ge" },
      { label: "+995 555 00 00 00", href: "tel:+995555000000" },
      { label: "Instagram", href: "https://www.instagram.com/lumine.ge", external: true },
      { label: "თბილისი, საქართველო", href: p("/contact") },
    ],
  },
];

const COLUMNS = isKa ? COLUMNS_KA : COLUMNS_EN;

const T = isKa
  ? {
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
    }
  : {
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
    };

// Turn the bare "big statement" CTA into a composed sign-off:
// corner meta (location + live availability) + a real action row.
function enhanceCta(footer) {
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
    <a href="${p("/contact")}" class="btn btn-invert">${T.bookACall}</a>
    <a href="mailto:hello@lumine.ge" class="footer-cta-mail">hello@lumine.ge</a>
  `;
  cta.insertAdjacentElement("afterend", actions);
}

function buildLinks() {
  const footer = document.querySelector("footer");
  if (!footer || footer.querySelector(".footer-links")) return;

  enhanceCta(footer);

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
        <span class="footer-links-title">${col.title}</span>
        ${col.links
          .map(
            (l) =>
              `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${l.label}</a>`,
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
    legal.innerHTML = `<a href="${p("/legal")}#privacy">${T.privacy}</a> · <a href="${p("/legal")}#terms">${T.terms}</a> · © 2026 Lumine`;
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
      status.textContent = T.invalid;
      return;
    }
    window.location.href = `mailto:hello@lumine.ge?subject=${encodeURIComponent(
      "Journal subscription",
    )}&body=${encodeURIComponent(`Add me to the journal list: ${email}`)}`;
    status.textContent = T.sent;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildLinks);
} else {
  buildLinks();
}
