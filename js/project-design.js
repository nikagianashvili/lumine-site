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
