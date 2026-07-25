// js/project-design.js
// All section builders + post-render interactivity for the `design`
// service-type single-project template. Exports designTemplate(proj, projects)
// (HTML string) and initDesignTemplate(root, proj) (wires interactivity) —
// both consumed by js/project.js's TEMPLATES/POST_INIT dispatch.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLightbox } from "/js/pd-lightbox.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

function t(project, field) {
  if (isKa && project[`${field}_ka`] !== undefined) return project[`${field}_ka`];
  return project[field];
}

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// ── Hero: "Title as Window" ─────────────────────────────────────────────────
// The hero image is revealed *through* the massive title on load (CSS
// background-clip: text), then the title recedes to a faint watermark as
// the full image fades in behind it; a scroll-scrubbed parallax between
// the two layers continues as the hero passes.

export function heroDesign(project, heroBadge, factsRow) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  return `
    <section class="pdx-hero" data-pdx-hero>
      <div class="pdx-hero-stage">
        <h1
          class="pdx-hero-title"
          style="background-image:url('${project.cover}')"
          data-pdx-hero-title
        >${project.title}</h1>
        <div class="pdx-hero-media" data-pdx-hero-media>
          <img src="${project.cover}" alt="${project.title}" />
        </div>
      </div>
      <div class="container pdx-hero-meta">
        ${heroBadge(project)}
        <p class="pdx-hero-tagline pd-reveal">${tagline}</p>
        ${factsRow(project)}
      </div>
    </section>
  `;
}

export function initHeroDesign(root) {
  const stage = root.querySelector("[data-pdx-hero]");
  if (!stage) return;
  const title = stage.querySelector("[data-pdx-hero-title]");
  const media = stage.querySelector("[data-pdx-hero-media]");

  if (reduceMotion()) {
    gsap.set(media, { opacity: 1, scale: 1 });
    gsap.set(title, { opacity: 0.14 });
    return;
  }

  gsap.set(media, { opacity: 0, scale: 1.08 });
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(title, { scale: 1.15, duration: 1.4 })
    .to(media, { opacity: 1, scale: 1, duration: 1.2 }, "-=0.5")
    .to(title, { opacity: 0.14, duration: 1 }, "-=0.6");

  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "+=60%",
    scrub: 0.6,
    onUpdate: (self) => {
      gsap.set(media, { scale: 1 + self.progress * 0.08 });
      gsap.set(title, { yPercent: self.progress * -12 });
    },
  });
}

// ── Overview: two-column editorial spread ───────────────────────────────────

function specRow(label, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return "";
  const display = Array.isArray(value) ? value.join(", ") : value;
  return `
    <div class="pdx-spec-row">
      <span class="pdx-spec-label">${label}</span>
      <span class="pdx-spec-value">${display}</span>
    </div>
  `;
}

export function overviewSection(project) {
  const L = isKa
    ? { overview: "მიმოხილვა", client: "კლიენტი", industry: "ინდუსტრია", services: "სერვისები", role: "როლი", timeline: "ვადები", year: "წელი", status: "სტატუსი" }
    : { overview: "Overview", client: "Client", industry: "Industry", services: "Services", role: "Role", timeline: "Timeline", year: "Year", status: "Status" };
  const status = isKa ? project.status_ka || project.status : project.status;

  return `
    <section class="pdx-section pdx-overview">
      <div class="container pdx-overview-grid">
        <div class="pdx-overview-story">
          <p class="pdx-section-label pd-reveal">${L.overview}</p>
          <p class="pdx-overview-text pd-reveal">${t(project, "brief")}</p>
        </div>
        <div class="pdx-overview-specs pd-reveal">
          ${specRow(L.client, project.client)}
          ${specRow(L.industry, project.industry)}
          ${specRow(L.services, isKa ? project.services_ka || project.services : project.services)}
          ${specRow(L.role, t(project, "role"))}
          ${specRow(L.timeline, t(project, "timeline"))}
          ${specRow(L.year, project.year)}
          ${specRow(L.status, status)}
        </div>
      </div>
    </section>
  `;
}

// ── Shared image normalization ──────────────────────────────────────────────
// moodboardImages/deliverablesImages/galleryImages accept either a bare
// string (legacy, still used by every project today) or an object with
// alt text and an application `type` tag. Every section reads through
// this so both shapes work everywhere.

function normalizeImages(images) {
  return (images || []).map((entry) =>
    typeof entry === "string" ? { src: entry, alt: "", type: null } : { src: entry.src, alt: entry.alt || "", type: entry.type || null },
  );
}

function frame(image, group) {
  return `
    <button type="button" class="pdx-frame" data-lightbox-group="${group}">
      <img src="${image.src}" alt="${image.alt}" loading="lazy" />
    </button>
  `;
}

// ── Research / Moodboard ─────────────────────────────────────────────────────

export function moodboardSection(project) {
  const L = isKa ? "კვლევა & მუდბორდი" : "Research & Moodboard";
  const images = normalizeImages(project.moodboardImages);
  if (!images.length) return "";

  return `
    <section class="pdx-section pdx-moodboard">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        <div class="pdx-moodboard-grid">
          ${images.map((img) => `<div class="pdx-moodboard-item pd-reveal">${frame(img, "moodboard")}</div>`).join("")}
        </div>
      </div>
    </section>
  `;
}

// ── Process (optional — renders only if project.process exists) ────────────

export function processSection(project) {
  if (!project.process || !project.process.length) return "";
  const L = isKa ? "პროცესი" : "Process";

  const stages = project.process
    .map(
      (stage, i) => `
      <div class="pdx-process-stage pd-reveal" data-pdx-process-stage>
        <div class="pdx-process-head">
          <span class="pdx-process-num">${String(i + 1).padStart(2, "0")}</span>
          <h4 class="pdx-process-name">${isKa ? stage.stage_ka || stage.stage : stage.stage}</h4>
        </div>
        <div class="pdx-process-body">
          <p>${isKa ? stage.description_ka || stage.description : stage.description}</p>
          ${stage.image ? `<img src="${stage.image}" alt="" loading="lazy" />` : ""}
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <section class="pdx-section pdx-process">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        <div class="pdx-process-list">${stages}</div>
      </div>
    </section>
  `;
}

export function initProcess(root) {
  const stages = root.querySelectorAll("[data-pdx-process-stage]");
  stages.forEach((stage) => {
    const open = () => stage.classList.add("is-open");
    const close = () => stage.classList.remove("is-open");
    if (fineHover()) {
      stage.addEventListener("mouseenter", open);
      stage.addEventListener("mouseleave", close);
    }
    stage.addEventListener("click", () => stage.classList.toggle("is-open"));
  });
}

// ── Brand Identity (optional) ────────────────────────────────────────────────

export function brandIdentitySection(project) {
  const bi = project.brandIdentity;
  if (!bi) return "";
  const L = isKa
    ? { title: "საბრენდო იდენტობა", construction: "კონსტრუქცია", safeSpace: "დაცული სივრცე", variations: "ვარიაციები", incorrect: "არასწორი გამოყენება" }
    : { title: "Brand Identity", construction: "Construction", safeSpace: "Safe Space", variations: "Variations", incorrect: "Incorrect Usage" };

  const blocks = [];
  if (bi.construction) blocks.push(`<figure class="pdx-brand-block pd-reveal"><img src="${bi.construction}" alt="${L.construction}" loading="lazy" /><figcaption>${L.construction}</figcaption></figure>`);
  if (bi.safeSpace) blocks.push(`<figure class="pdx-brand-block pd-reveal"><img src="${bi.safeSpace}" alt="${L.safeSpace}" loading="lazy" /><figcaption>${L.safeSpace}</figcaption></figure>`);
  (bi.variations || []).forEach((src) => blocks.push(`<figure class="pdx-brand-block pd-reveal"><img src="${src}" alt="${L.variations}" loading="lazy" /><figcaption>${L.variations}</figcaption></figure>`));
  (bi.incorrectUsage || []).forEach((src) => blocks.push(`<figure class="pdx-brand-block pdx-brand-block-incorrect pd-reveal"><img src="${src}" alt="${L.incorrect}" loading="lazy" /><figcaption>${L.incorrect}</figcaption></figure>`));

  if (!blocks.length) return "";

  return `
    <section class="pdx-section pdx-brand">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L.title}</p>
        <div class="pdx-brand-grid">${blocks.join("")}</div>
      </div>
    </section>
  `;
}

// ── Color System (optional) ──────────────────────────────────────────────────
// Contrast is computed from the real hex value, never hand-entered.

function relativeLuminance(hex) {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA) + 0.05;
  const lB = relativeLuminance(hexB) + 0.05;
  return Math.round((Math.max(lA, lB) / Math.min(lA, lB)) * 100) / 100;
}

function hexToContrastLabel(hex) {
  const onWhite = contrastRatio(hex, "#ffffff");
  const onInk = contrastRatio(hex, "#17130f");
  const best = Math.max(onWhite, onInk);
  const grade = best >= 7 ? "AAA" : best >= 4.5 ? "AA" : best >= 3 ? "AA Large" : "Fail";
  return `${best.toFixed(1)}:1 · ${grade}`;
}

export function colorSystemSection(project) {
  const palette = project.colorPalette;
  if (!palette || !palette.length) return "";
  const L = isKa ? "ფერების სისტემა" : "Color System";

  const swatches = palette
    .map(
      (c) => `
      <div class="pdx-swatch pd-reveal">
        <div class="pdx-swatch-block" style="background-color:${c.hex}"></div>
        <div class="pdx-swatch-meta">
          <span class="pdx-swatch-name">${isKa ? c.name_ka || c.name : c.name}</span>
          <span class="pdx-swatch-hex">${c.hex.toUpperCase()}</span>
          ${c.cmyk ? `<span class="pdx-swatch-cmyk">${c.cmyk}</span>` : ""}
          <span class="pdx-swatch-contrast">${hexToContrastLabel(c.hex)}</span>
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <section class="pdx-section pdx-colors">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        <div class="pdx-swatch-grid">${swatches}</div>
      </div>
    </section>
  `;
}

// ── Typography (optional) ────────────────────────────────────────────────────

export function typographySection(project) {
  const typ = project.typography;
  if (!typ) return "";
  const L = isKa ? { title: "ტიპოგრაფია", heading: "სათაური", body: "ტექსტი", weights: "წონები" } : { title: "Typography", heading: "Heading", body: "Body", weights: "Weights" };

  const specimen = (role, label) => `
    <div class="pdx-type-specimen pd-reveal">
      <span class="pdx-type-role">${label}</span>
      <p class="pdx-type-sample" style="font-family:'${role.family}'">Aa Bb Cc</p>
      <span class="pdx-type-name">${role.family} — ${L.weights} ${role.weights.join(", ")}</span>
    </div>
  `;

  return `
    <section class="pdx-section pdx-typography">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L.title}</p>
        ${specimen(typ.heading, L.heading)}
        ${specimen(typ.body, L.body)}
      </div>
    </section>
  `;
}

// ── Applications ──────────────────────────────────────────────────────────────

export function applicationsSection(project) {
  const images = normalizeImages(project.deliverablesImages);
  if (!images.length) return "";
  const L = isKa ? "აპლიკაციები" : "Applications";
  const hasTypes = images.some((img) => img.type);

  let body;
  if (hasTypes) {
    const groupsByType = new Map();
    images.forEach((img) => {
      const key = img.type || "other";
      if (!groupsByType.has(key)) groupsByType.set(key, []);
      groupsByType.get(key).push(img);
    });
    body = Array.from(groupsByType.entries())
      .map(
        ([type, imgs]) => `
        <div class="pdx-app-type-group">
          <p class="pdx-app-type-label">${type}</p>
          <div class="pdx-app-grid">
            ${imgs.map((img) => `<div class="pdx-app-item pd-reveal">${frame(img, "applications")}</div>`).join("")}
          </div>
        </div>
      `,
      )
      .join("");
  } else {
    body = `
      <div class="pdx-app-grid">
        ${images.map((img) => `<div class="pdx-app-item pd-reveal">${frame(img, "applications")}</div>`).join("")}
      </div>
    `;
  }

  return `
    <section class="pdx-section pdx-applications">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        ${body}
      </div>
    </section>
  `;
}

// ── Full Gallery ──────────────────────────────────────────────────────────────

export function fullGallerySection(project) {
  const all = [
    ...normalizeImages(project.moodboardImages),
    ...normalizeImages(project.deliverablesImages),
    ...normalizeImages(project.galleryImages),
  ];
  const seen = new Set();
  const deduped = all.filter((img) => {
    if (seen.has(img.src)) return false;
    seen.add(img.src);
    return true;
  });
  if (deduped.length < 3) return "";
  const L = isKa ? "სრული გალერეა" : "Full Gallery";

  return `
    <section class="pdx-section pdx-full-gallery">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        <div class="pdx-masonry">
          ${deduped.map((img) => `<div class="pdx-masonry-item pd-reveal">${frame(img, "gallery")}</div>`).join("")}
        </div>
      </div>
    </section>
  `;
}

// ── Motion Showcase (optional) ───────────────────────────────────────────────

export function motionSection(project) {
  const video = project.video;
  if (!video || !video.src) return "";
  const L = isKa ? "მოძრაობაში" : "Motion Showcase";

  return `
    <section class="pdx-section pdx-motion">
      <div class="container">
        <p class="pdx-section-label pd-reveal">${L}</p>
        <video
          class="pdx-motion-video pd-reveal"
          src="${video.src}"
          poster="${video.poster || ""}"
          muted
          loop
          playsinline
          preload="metadata"
          data-pdx-video
        ></video>
      </div>
    </section>
  `;
}

export function initMotion(root) {
  const video = root.querySelector("[data-pdx-video]");
  if (!video) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    },
    { threshold: 0.4 },
  );
  io.observe(video);
}

// ── Testimonial & Results (both independently data-gated) ──────────────────

export function testimonialResultsSection(project) {
  const parts = [];
  if (project.testimonial) {
    const quote = isKa ? project.testimonial.quote_ka || project.testimonial.quote : project.testimonial.quote;
    const author = isKa ? project.testimonial.author_ka || project.testimonial.author : project.testimonial.author;
    parts.push(`
      <div class="pdx-quote pd-reveal">
        <h4>"${quote}"</h4>
        <p class="pdx-quote-attr">— ${author}</p>
      </div>
    `);
  }
  if (project.results && project.results.length) {
    parts.push(`
      <div class="pdx-results-grid">
        ${project.results
          .map(
            (r) => `
          <div class="pdx-result pd-reveal">
            <h3>${r.stat}</h3>
            <p>${isKa ? r.label_ka || r.label : r.label}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `);
  }
  if (!parts.length) return "";

  return `<section class="pdx-section pdx-testimonial-results grain">${`<div class="container">${parts.join("")}</div>`}</section>`;
}

// ── Next Project: full-bleed hover preview ──────────────────────────────────

export function nextProjectSection(project, projects, p) {
  const idx = projects.findIndex((proj) => proj.slug === project.slug);
  const pool = projects.filter((proj) => !proj.hidden);
  const poolIdx = pool.findIndex((proj) => proj.slug === project.slug);
  const next = poolIdx === -1 ? pool[0] : pool[(poolIdx + 1) % pool.length];
  if (!next) return "";
  const L = isKa ? "შემდეგი პროექტი" : "Next Project";

  return `
    <a href="${p("/project")}?slug=${next.slug}" class="pdx-next">
      <img src="${next.cover}" alt="" class="pdx-next-bg" />
      <div class="pdx-next-scrim"></div>
      <div class="container pdx-next-inner">
        <span class="pdx-next-label">${L}</span>
        <h2 class="pdx-next-title">${next.title}</h2>
        <span class="pdx-next-arrow">↗</span>
      </div>
    </a>
  `;
}

// ── Contact CTA — minimal, one line + button, not a duplicate of the ────────
// sitewide footer CTA that already appears on every page.

export function contactCtaSection(project, p) {
  const L = isKa
    ? { line: "მოდი, ერთად შევქმნათ დაუვიწყარი რამ.", button: "დაგვიკავშირდი" }
    : { line: "Let's build something unforgettable.", button: "Get In Touch" };
  return `
    <section class="pdx-cta">
      <div class="container pdx-cta-inner">
        <p class="pdx-cta-line pd-reveal">${L.line}</p>
        <a href="${p("/contact")}" class="btn btn-solid pd-reveal">${L.button}</a>
      </div>
    </section>
  `;
}

// ── Assembly ──────────────────────────────────────────────────────────────────

export function designTemplate(project, projects, deps) {
  const { heroBadge, factsRow, p } = deps;
  return [
    heroDesign(project, heroBadge, factsRow),
    overviewSection(project),
    moodboardSection(project),
    processSection(project),
    brandIdentitySection(project),
    colorSystemSection(project),
    typographySection(project),
    applicationsSection(project),
    fullGallerySection(project),
    motionSection(project),
    testimonialResultsSection(project),
    nextProjectSection(project, projects, p),
    contactCtaSection(project, p),
  ]
    .filter(Boolean)
    .join("");
}

export function initDesignTemplate(root, project) {
  initHeroDesign(root);
  initProcess(root);
  initMotion(root);
  initLightbox(root);
}
