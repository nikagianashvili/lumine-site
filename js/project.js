import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, getProject, getServiceType } from "/js/projects-data.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const L = isKa
  ? {
      client: "კლიენტი",
      industry: "ინდუსტრია",
      year: "წელი",
      status: "სტატუსი",
      phase01Challenge: "ფაზა 01 · გამოწვევა",
      phase02Research: "ფაზა 02 · კვლევა",
      wireframes: "კარკასები",
      uiDesign: "UI დიზაინი",
      phase03Development: "ფაზა 03 · დეველოპმენტი",
      results: "შედეგები",
      gallery: "გალერეა",
      technologiesUsed: "გამოყენებული ტექნოლოგიები",
      nextProject: "შემდეგი პროექტი",
      theConcept: "კონცეფცია",
      behindTheScenes: "კულისებში",
      theWork: "სამუშაო",
      theBrief: "დავალება",
      conceptMoodboard: "კონცეფცია და მუდბორდი",
      finalDeliverables: "საბოლოო მასალები",
    }
  : {
      client: "Client",
      industry: "Industry",
      year: "Year",
      status: "Status",
      phase01Challenge: "Phase 01 · The Challenge",
      phase02Research: "Phase 02 · Research",
      wireframes: "Wireframes",
      uiDesign: "UI Design",
      phase03Development: "Phase 03 · Development",
      results: "Results",
      gallery: "Gallery",
      technologiesUsed: "Technologies Used",
      nextProject: "Next Project",
      theConcept: "The Concept",
      behindTheScenes: "Behind The Scenes",
      theWork: "The Work",
      theBrief: "The Brief",
      conceptMoodboard: "Concept &amp; Moodboard",
      finalDeliverables: "Final Deliverables",
    };

// Picks `${field}_ka` when present and the page is under /ka/, otherwise
// the English field.
function t(project, field) {
  if (isKa && project[`${field}_ka`] !== undefined) return project[`${field}_ka`];
  return project[field];
}

// ── hero: one composition per service type, deliberately unalike ────────────
// Goal (per brief): screenshot the hero of each type side by side and the
// type should be readable without reading a word of copy.

function heroBadge(project) {
  const type = getServiceType(project.serviceType);
  const label = isKa ? type.label_ka : type.label;
  return `<span class="pd-hero-badge" style="background-color:${type.color};color:${type.onColor}">${label}</span>`;
}

function factsRow(project) {
  const status = isKa ? project.status_ka || project.status : project.status;
  return `
    <div class="pd-hero-facts">
      <div>
        <span class="pd-hero-fact-label">${L.client}</span>
        <span class="pd-hero-fact-value">${project.client}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">${L.industry}</span>
        <span class="pd-hero-fact-value">${project.industry}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">${L.year}</span>
        <span class="pd-hero-fact-value">${project.year}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">${L.status}</span>
        <span class="pd-hero-fact-value">${status}</span>
      </div>
    </div>
  `;
}

// web: a floating browser window on a flat ink field — the product is the
// artifact. tech stack sits right under it, like a spec sheet.
function heroWeb(project) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  return `
    <section class="pd-hero pd-hero-web">
      <div class="container">
        ${heroBadge(project)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${tagline}</p>

        <div class="pd-browser-frame pd-reveal">
          <div class="pd-browser-bar">
            <span class="pd-browser-dot"></span>
            <span class="pd-browser-dot"></span>
            <span class="pd-browser-dot"></span>
            <span class="pd-browser-url">${project.title.toLowerCase().replace(/\s+/g, "")}.ge</span>
          </div>
          <div class="pd-browser-viewport">
            <img src="${project.cover}" alt="${project.title} website" />
          </div>
        </div>

        <div class="pd-hero-tech pd-reveal">
          ${(project.technologies || []).map((tech) => `<span class="cs-chip">${tech}</span>`).join("")}
        </div>

        ${factsRow(project)}
      </div>
    </section>
  `;
}

// photo & video: the frame is the hero. full-bleed, minimal type, a play
// affordance — nothing between the visitor and the image.
function heroPhotoVideo(project) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  return `
    <section class="pd-hero pd-hero-photo">
      <div class="pd-hero-photo-media">
        <img src="${project.cover}" alt="${project.title}" />
      </div>
      <div class="pd-hero-photo-scrim"></div>
      <span class="pd-hero-photo-play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <div class="container">
        ${heroBadge(project)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${tagline}</p>
        ${factsRow(project)}
      </div>
    </section>
  `;
}

// graphic design: title on flat paper, then an asymmetric collage — one
// tall piece + two stacked — a portfolio wall, not one photograph.
function heroDesign(project) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  const mood = project.moodboardImages || [];
  const tall = project.cover;
  const a = mood[1] || mood[0] || project.cover;
  const b = mood[2] || mood[0] || project.cover;

  return `
    <section class="pd-hero pd-hero-design">
      <div class="container">
        ${heroBadge(project)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${tagline}</p>

        <div class="pd-collage pd-reveal">
          <div class="pd-collage-item pd-collage-tall">
            <img src="${tall}" alt="${project.title}" />
          </div>
          <div class="pd-collage-item pd-collage-a">
            <img src="${a}" alt="" loading="lazy" />
          </div>
          <div class="pd-collage-item pd-collage-b">
            <img src="${b}" alt="" loading="lazy" />
          </div>
        </div>
      </div>

      <div class="container">
        ${factsRow(project)}
      </div>
    </section>
  `;
}

function phaseSection(label, bodyHtml) {
  return `
    <section class="sample-project-details">
      <div class="container">
        <div class="sample-project-col">
          <p class="cs-phase pd-reveal">${label}</p>
        </div>
        <div class="sample-project-col">
          ${bodyHtml}
        </div>
      </div>
    </section>
  `;
}

// web-only: Wireframes/UI Design stay in the browser-frame visual language
// established by the hero, instead of a plain photo gallery.
function browserSection(label, image, project, path) {
  const url = `${project.title.toLowerCase().replace(/\s+/g, "")}.ge${path}`;
  return `
    <section class="sample-project-details">
      <div class="container">
        <div class="sample-project-col">
          <p class="cs-phase pd-reveal">${label}</p>
        </div>
        <div class="sample-project-col">
          <div class="pd-browser-frame pd-browser-frame-inline pd-reveal">
            <div class="pd-browser-bar">
              <span class="pd-browser-dot"></span>
              <span class="pd-browser-dot"></span>
              <span class="pd-browser-dot"></span>
              <span class="pd-browser-url">${url}</span>
            </div>
            <div class="pd-browser-viewport">
              <img src="${image}" alt="${label}" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function imageSection(label, images, dense = false) {
  const items = images
    .map(
      (src, i) => `
      <div class="cs-gallery-item${i === 0 && !dense ? " cs-gallery-wide" : ""}">
        <img src="${src}" alt="" loading="lazy" />
      </div>
    `,
    )
    .join("");

  return `
    <section class="cs-gallery">
      <div class="container">
        <p class="cs-section-label pd-reveal">${label}</p>
        <div class="cs-gallery-grid${dense ? " cs-gallery-dense" : ""}">
          ${items}
        </div>
      </div>
    </section>
  `;
}

// photo & video only: a filmic, mixed-ratio rhythm (wide / half+half /
// wide…) instead of a uniform grid — feels like scrolling through footage,
// not a flat contact sheet.
function cinematicSection(label, images) {
  const items = images
    .map((src, i) => {
      const isWide = i % 3 === 0;
      return `
        <div class="cs-gallery-item cs-gallery-cine-item${isWide ? " cs-gallery-cine-wide" : ""}">
          <img src="${src}" alt="" loading="lazy" />
        </div>
      `;
    })
    .join("");

  return `
    <section class="cs-gallery">
      <div class="container">
        <p class="cs-section-label pd-reveal">${label}</p>
        <div class="cs-gallery-grid cs-gallery-cinematic">${items}</div>
      </div>
    </section>
  `;
}

function resultsSection(results) {
  return `
    <section class="cs-results grain">
      <div class="container">
        <p class="cs-results-label pd-reveal">${L.results}</p>
        <div class="cs-results-grid">
          ${results
            .map(
              (r) => `
            <div class="cs-result">
              <h3>${r.stat}</h3>
              <p>${isKa ? r.label_ka || r.label : r.label}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function chipsSection(label, items) {
  return `
    <section class="cs-deliverables">
      <div class="container">
        <p class="cs-phase pd-reveal">${label}</p>
        <div class="cs-chips">
          ${items.map((i) => `<span class="cs-chip">${i}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function quoteSection(testimonial) {
  const quote = isKa ? testimonial.quote_ka || testimonial.quote : testimonial.quote;
  const author = isKa ? testimonial.author_ka || testimonial.author : testimonial.author;
  return `
    <section class="cs-quote">
      <div class="container">
        <h4 class="pd-reveal">"${quote}"</h4>
        <p class="cs-quote-attr">— ${author}</p>
      </div>
    </section>
  `;
}

function nextSection(current) {
  const idx = projects.findIndex((proj) => proj.slug === current.slug);
  const next = projects[(idx + 1) % projects.length];
  return `
    <a href="${p("/project")}?slug=${next.slug}" class="cs-next grain">
      <div class="container">
        <span class="cs-next-label">${L.nextProject}</span>
        <h3>${next.title}</h3>
        <span class="cs-next-arrow">↗</span>
      </div>
    </a>
  `;
}

// ── per-type template assembly ───────────────────────────────────────────────

function webTemplate(proj) {
  return [
    heroWeb(proj),
    phaseSection(L.phase01Challenge, `<h6 class="pd-reveal">${t(proj, "challenge")}</h6>`),
    phaseSection(L.phase02Research, `<h6 class="pd-reveal">${t(proj, "research")}</h6>`),
    browserSection(L.wireframes, proj.wireframesImage, proj, "/wireframes"),
    browserSection(L.uiDesign, proj.uiImage, proj, "/"),
    phaseSection(L.phase03Development, `<h6 class="pd-reveal">${t(proj, "development")}</h6>`),
    resultsSection(proj.results),
    imageSection(L.gallery, proj.gallery),
    chipsSection(L.technologiesUsed, proj.technologies),
    quoteSection(proj.testimonial),
    nextSection(proj),
  ].join("");
}

function photoVideoTemplate(proj) {
  return [
    heroPhotoVideo(proj),
    phaseSection(L.theConcept, `<h6 class="pd-reveal">${t(proj, "concept")}</h6>`),
    cinematicSection(L.behindTheScenes, proj.behindTheScenes),
    cinematicSection(L.theWork, proj.galleryImages),
    quoteSection(proj.testimonial),
    nextSection(proj),
  ].join("");
}

function designTemplate(proj) {
  return [
    heroDesign(proj),
    phaseSection(L.theBrief, `<h6 class="pd-reveal">${t(proj, "brief")}</h6>`),
    imageSection(L.conceptMoodboard, proj.moodboardImages, true),
    imageSection(L.finalDeliverables, proj.deliverablesImages, true),
    quoteSection(proj.testimonial),
    nextSection(proj),
  ].join("");
}

const TEMPLATES = {
  web: webTemplate,
  "photo-video": photoVideoTemplate,
  design: designTemplate,
};

// ── reveal animation for injected content ────────────────────────────────────

function initReveals(root) {
  const els = root.querySelectorAll(".pd-reveal");
  ScrollTrigger.batch(els, {
    start: "top 85%",
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" },
      ),
  });
}

// ── init ──────────────────────────────────────────────────────────────────────

function init() {
  const main = document.getElementById("pdMain");
  const notFound = document.getElementById("pdNotFound");
  if (!main) return;

  // The language-switch link in the nav is static in the HTML (no slug) —
  // append the current project's slug so it lands on the same project in
  // the other language instead of a bare, unspecified project page.
  const langLink = document.getElementById("navLangKa") || document.getElementById("navLangEn");
  if (langLink) langLink.href += window.location.search;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const project = slug ? getProject(slug) : null;

  if (!project) {
    main.hidden = true;
    notFound.hidden = false;
    document.title = isKa ? "პროექტი ვერ მოიძებნა | Lumine" : "Project Not Found | Lumine";
    return;
  }

  const build = TEMPLATES[project.serviceType] || webTemplate;
  main.innerHTML = build(project);
  document.title = `${project.title} | Lumine`;

  gsap.set(main.querySelectorAll(".pd-reveal"), { opacity: 0, y: 30 });
  requestAnimationFrame(() => {
    initReveals(main);
    ScrollTrigger.refresh();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
