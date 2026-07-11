// Utility footer — injected on every page from one config,
// so links live in a single place instead of eight HTML files.

const COLUMNS = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "Studio", href: "/studio" },
      { label: "Services", href: "/services" },
      { label: "Work", href: "/work" },
      { label: "Pricing", href: "/pricing" },
      { label: "Journal", href: "/journal" },
      { label: "Q&A", href: "/#faq" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Photography", href: "/services#photography" },
      { label: "Video", href: "/services#video" },
      { label: "Graphic Design", href: "/services#design" },
      { label: "Social Media", href: "/services#social" },
      { label: "Marketing", href: "/services#marketing" },
      { label: "Web", href: "/services#web" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Medical", href: "/work?industry=Medical" },
      { label: "Hotels", href: "/work?industry=Hotels" },
      { label: "Restaurants", href: "/work?industry=Restaurants" },
      { label: "Real Estate", href: "/work?industry=Real%20Estate" },
      { label: "SaaS", href: "/work?industry=SaaS" },
      { label: "E-Commerce", href: "/work?industry=E-Commerce" },
      { label: "Startups", href: "/work?industry=Startups" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@lumine.ge", href: "mailto:hello@lumine.ge" },
      { label: "+995 555 00 00 00", href: "tel:+995555000000" },
      {
        label: "Instagram",
        href: "https://www.instagram.com/lumine.ge",
        external: true,
      },
      { label: "Tbilisi, Georgia", href: "/contact" },
    ],
  },
];

// Turn the bare "big statement" CTA into a composed sign-off:
// corner meta (location + live availability) + a real action row.
function enhanceCta(footer) {
  const inner = footer.querySelector(".footer-inner");
  const cta = footer.querySelector(".footer-cta");
  if (!inner || !cta || inner.querySelector(".footer-cta-meta")) return;

  const meta = document.createElement("div");
  meta.className = "footer-cta-meta";
  meta.innerHTML = `
    <span class="footer-cta-meta-item">Based In Tbilisi</span>
    <span class="footer-cta-meta-item">Available For New Projects</span>
  `;
  inner.insertBefore(meta, inner.firstChild);

  const actions = document.createElement("div");
  actions.className = "footer-cta-actions";
  actions.innerHTML = `
    <a href="/contact" class="btn btn-invert">Book A Call</a>
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
      <p class="footer-links-tag">
        Photo, video, design, social, marketing, and web — in house, in
        Tbilisi.
      </p>
      <form class="footer-newsletter" id="footerNewsletter" novalidate>
        <span class="footer-newsletter-label">The Journal is the newsletter — new notes by email</span>
        <div class="footer-newsletter-row">
          <input type="email" name="email" placeholder="you@email.com" required />
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
    legal.innerHTML = `<a href="/legal#privacy">Privacy Policy</a> · <a href="/legal#terms">Terms</a> · © 2026 Lumine`;
    bottom.appendChild(legal);
    solid.appendChild(bottom);
  }

  // newsletter — no backend yet: composes a subscribe email, says so.
  const form = section.querySelector("#footerNewsletter");
  const status = form.querySelector(".footer-newsletter-status");
  const LANG_KEY = "lumine-lang";
  const currentLang = () => localStorage.getItem(LANG_KEY) || "en";
  const MSG = {
    en: {
      invalid: "Add a real email first.",
      sent: "A draft opened in your mail app — send it and you're on the list.",
    },
    ka: {
      invalid: "მიუთითეთ რეალური მეილი.",
      sent: "დრაფტი გაიხსნა თქვენს მეილ აპლიკაციაში — გააგზავნეთ და სიაშია ხართ.",
    },
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email || !email.includes("@")) {
      status.textContent = MSG[currentLang()].invalid;
      return;
    }
    window.location.href = `mailto:hello@lumine.ge?subject=${encodeURIComponent(
      "Journal subscription",
    )}&body=${encodeURIComponent(`Add me to the journal list: ${email}`)}`;
    status.textContent = MSG[currentLang()].sent;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildLinks);
} else {
  buildLinks();
}
