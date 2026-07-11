import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, getProject, getServiceType } from "/js/projects-data.js";

gsap.registerPlugin(ScrollTrigger);

const LANG_KEY = "lumine-lang";
const currentLang = () => localStorage.getItem(LANG_KEY) || "en";

const LABELS = {
  en: {
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
  },
  ka: {
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
  },
};

// Picks `${field}_ka` when present and lang is "ka", otherwise the English field.
function t(project, field, lang) {
  if (lang === "ka" && project[`${field}_ka`] !== undefined) return project[`${field}_ka`];
  return project[field];
}

// ── hero: one composition per service type, deliberately unalike ────────────
// Goal (per brief): screenshot the hero of each type side by side and the
// type should be readable without reading a word of copy.

function heroBadge(project, lang) {
  const type = getServiceType(project.serviceType);
  const label = lang === "ka" ? type.label_ka : type.label;
  return `<span class="pd-hero-badge" style="background-color:${type.color};color:${type.onColor}">${label}</span>`;
}

function factsRow(project, lang) {
  const L = LABELS[lang];
  const status = lang === "ka" ? project.status_ka || project.status : project.status;
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
function heroWeb(project, lang) {
  const tagline = t(project, "heroTagline", lang) || t(project, "blurb", lang);
  return `
    <section class="pd-hero pd-hero-web">
      <div class="container">
        ${heroBadge(project, lang)}
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
          ${(project.technologies || []).map((t) => `<span class="cs-chip">${t}</span>`).join("")}
        </div>

        ${factsRow(project, lang)}
      </div>
    </section>
  `;
}

// photo & video: the frame is the hero. full-bleed, minimal type, a play
// affordance — nothing between the visitor and the image.
function heroPhotoVideo(project, lang) {
  const tagline = t(project, "heroTagline", lang) || t(project, "blurb", lang);
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
        ${heroBadge(project, lang)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${tagline}</p>
        ${factsRow(project, lang)}
      </div>
    </section>
  `;
}

// graphic design: title on flat paper, then an asymmetric collage — one
// tall piece + two stacked — a portfolio wall, not one photograph.
function heroDesign(project, lang) {
  const tagline = t(project, "heroTagline", lang) || t(project, "blurb", lang);
  const mood = project.moodboardImages || [];
  const tall = project.cover;
  const a = mood[1] || mood[0] || project.cover;
  const b = mood[2] || mood[0] || project.cover;

  return `
    <section class="pd-hero pd-hero-design">
      <div class="container">
        ${heroBadge(project, lang)}
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
        ${factsRow(project, lang)}
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

function resultsSection(results, lang) {
  return `
    <section class="cs-results grain">
      <div class="container">
        <p class="cs-results-label pd-reveal">${LABELS[lang].results}</p>
        <div class="cs-results-grid">
          ${results
            .map(
              (r) => `
            <div class="cs-result">
              <h3>${r.stat}</h3>
              <p>${lang === "ka" ? r.label_ka || r.label : r.label}</p>
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

function quoteSection(testimonial, lang) {
  const quote = lang === "ka" ? testimonial.quote_ka || testimonial.quote : testimonial.quote;
  const author = lang === "ka" ? testimonial.author_ka || testimonial.author : testimonial.author;
  return `
    <section class="cs-quote">
      <div class="container">
        <h4 class="pd-reveal">"${quote}"</h4>
        <p class="cs-quote-attr">— ${author}</p>
      </div>
    </section>
  `;
}

function nextSection(current, lang) {
  const idx = projects.findIndex((p) => p.slug === current.slug);
  const next = projects[(idx + 1) % projects.length];
  return `
    <a href="/project?slug=${next.slug}" class="cs-next grain">
      <div class="container">
        <span class="cs-next-label">${LABELS[lang].nextProject}</span>
        <h3>${next.title}</h3>
        <span class="cs-next-arrow">↗</span>
      </div>
    </a>
  `;
}

// ── per-type template assembly ───────────────────────────────────────────────

function webTemplate(p, lang) {
  const L = LABELS[lang];
  return [
    heroWeb(p, lang),
    phaseSection(L.phase01Challenge, `<h6 class="pd-reveal">${t(p, "challenge", lang)}</h6>`),
    phaseSection(L.phase02Research, `<h6 class="pd-reveal">${t(p, "research", lang)}</h6>`),
    browserSection(L.wireframes, p.wireframesImage, p, "/wireframes"),
    browserSection(L.uiDesign, p.uiImage, p, "/"),
    phaseSection(L.phase03Development, `<h6 class="pd-reveal">${t(p, "development", lang)}</h6>`),
    resultsSection(p.results, lang),
    imageSection(L.gallery, p.gallery),
    chipsSection(L.technologiesUsed, p.technologies),
    quoteSection(p.testimonial, lang),
    nextSection(p, lang),
  ].join("");
}

function photoVideoTemplate(p, lang) {
  const L = LABELS[lang];
  return [
    heroPhotoVideo(p, lang),
    phaseSection(L.theConcept, `<h6 class="pd-reveal">${t(p, "concept", lang)}</h6>`),
    cinematicSection(L.behindTheScenes, p.behindTheScenes),
    cinematicSection(L.theWork, p.galleryImages),
    quoteSection(p.testimonial, lang),
    nextSection(p, lang),
  ].join("");
}

function designTemplate(p, lang) {
  const L = LABELS[lang];
  return [
    heroDesign(p, lang),
    phaseSection(L.theBrief, `<h6 class="pd-reveal">${t(p, "brief", lang)}</h6>`),
    imageSection(L.conceptMoodboard, p.moodboardImages, true),
    imageSection(L.finalDeliverables, p.deliverablesImages, true),
    quoteSection(p.testimonial, lang),
    nextSection(p, lang),
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

let currentProject = null;

function renderProject(lang) {
  const main = document.getElementById("pdMain");
  if (!main || !currentProject) return;
  const build = TEMPLATES[currentProject.serviceType] || webTemplate;
  main.innerHTML = build(currentProject, lang);
  gsap.set(main.querySelectorAll(".pd-reveal"), { opacity: 1, y: 0 });
  ScrollTrigger.refresh();
}

function init() {
  const main = document.getElementById("pdMain");
  const notFound = document.getElementById("pdNotFound");
  if (!main) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const project = slug ? getProject(slug) : null;

  if (!project) {
    main.hidden = true;
    notFound.hidden = false;
    document.title = "Project Not Found | Lumine";
    return;
  }

  currentProject = project;
  const lang = currentLang();
  const build = TEMPLATES[project.serviceType] || webTemplate;
  main.innerHTML = build(project, lang);
  document.title = `${project.title} | Lumine`;

  gsap.set(main.querySelectorAll(".pd-reveal"), { opacity: 0, y: 30 });
  requestAnimationFrame(() => {
    initReveals(main);
    ScrollTrigger.refresh();
  });

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    renderProject(e.detail.lang);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
