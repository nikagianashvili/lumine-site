import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, getProject, getServiceType } from "/js/projects-data.js";

gsap.registerPlugin(ScrollTrigger);

// ── hero: one composition per service type, deliberately unalike ────────────
// Goal (per brief): screenshot the hero of each type side by side and the
// type should be readable without reading a word of copy.

function heroBadge(project) {
  const type = getServiceType(project.serviceType);
  return `<span class="pd-hero-badge" style="background-color:${type.color};color:${type.onColor}">${type.label}</span>`;
}

function factsRow(project) {
  return `
    <div class="pd-hero-facts">
      <div>
        <span class="pd-hero-fact-label">Client</span>
        <span class="pd-hero-fact-value">${project.client}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">Industry</span>
        <span class="pd-hero-fact-value">${project.industry}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">Year</span>
        <span class="pd-hero-fact-value">${project.year}</span>
      </div>
      <div>
        <span class="pd-hero-fact-label">Status</span>
        <span class="pd-hero-fact-value">${project.status}</span>
      </div>
    </div>
  `;
}

// web: a floating browser window on a flat ink field — the product is the
// artifact. tech stack sits right under it, like a spec sheet.
function heroWeb(project) {
  return `
    <section class="pd-hero pd-hero-web">
      <div class="container">
        ${heroBadge(project)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${project.heroTagline || project.blurb}</p>

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

        ${factsRow(project)}
      </div>
    </section>
  `;
}

// photo & video: the frame is the hero. full-bleed, minimal type, a play
// affordance — nothing between the visitor and the image.
function heroPhotoVideo(project) {
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
        <p class="pd-hero-tagline pd-reveal">${project.heroTagline || project.blurb}</p>
        ${factsRow(project)}
      </div>
    </section>
  `;
}

// graphic design: title on flat paper, then an asymmetric collage — one
// tall piece + two stacked — a portfolio wall, not one photograph.
function heroDesign(project) {
  const mood = project.moodboardImages || [];
  const tall = project.cover;
  const a = mood[1] || mood[0] || project.cover;
  const b = mood[2] || mood[0] || project.cover;

  return `
    <section class="pd-hero pd-hero-design">
      <div class="container">
        ${heroBadge(project)}
        <h2 class="pd-reveal">${project.title}</h2>
        <p class="pd-hero-tagline pd-reveal">${project.heroTagline || project.blurb}</p>

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
        <p class="cs-results-label pd-reveal">Results</p>
        <div class="cs-results-grid">
          ${results
            .map(
              (r) => `
            <div class="cs-result">
              <h3>${r.stat}</h3>
              <p>${r.label}</p>
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
  return `
    <section class="cs-quote">
      <div class="container">
        <h4 class="pd-reveal">"${testimonial.quote}"</h4>
        <p class="cs-quote-attr">— ${testimonial.author}</p>
      </div>
    </section>
  `;
}

function nextSection(current) {
  const idx = projects.findIndex((p) => p.slug === current.slug);
  const next = projects[(idx + 1) % projects.length];
  return `
    <a href="/project?slug=${next.slug}" class="cs-next grain">
      <div class="container">
        <span class="cs-next-label">Next Project</span>
        <h3>${next.title}</h3>
        <span class="cs-next-arrow">↗</span>
      </div>
    </a>
  `;
}

// ── per-type template assembly ───────────────────────────────────────────────

function webTemplate(p) {
  return [
    heroWeb(p),
    phaseSection("Phase 01 · The Challenge", `<h6 class="pd-reveal">${p.challenge}</h6>`),
    phaseSection("Phase 02 · Research", `<h6 class="pd-reveal">${p.research}</h6>`),
    browserSection("Wireframes", p.wireframesImage, p, "/wireframes"),
    browserSection("UI Design", p.uiImage, p, "/"),
    phaseSection("Phase 03 · Development", `<h6 class="pd-reveal">${p.development}</h6>`),
    resultsSection(p.results),
    imageSection("Gallery", p.gallery),
    chipsSection("Technologies Used", p.technologies),
    quoteSection(p.testimonial),
    nextSection(p),
  ].join("");
}

function photoVideoTemplate(p) {
  return [
    heroPhotoVideo(p),
    phaseSection("The Concept", `<h6 class="pd-reveal">${p.concept}</h6>`),
    cinematicSection("Behind The Scenes", p.behindTheScenes),
    cinematicSection("The Work", p.galleryImages),
    quoteSection(p.testimonial),
    nextSection(p),
  ].join("");
}

function designTemplate(p) {
  return [
    heroDesign(p),
    phaseSection("The Brief", `<h6 class="pd-reveal">${p.brief}</h6>`),
    imageSection("Concept &amp; Moodboard", p.moodboardImages, true),
    imageSection("Final Deliverables", p.deliverablesImages, true),
    quoteSection(p.testimonial),
    nextSection(p),
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

  const slug = new URLSearchParams(window.location.search).get("slug");
  const project = slug ? getProject(slug) : null;

  if (!project) {
    main.hidden = true;
    notFound.hidden = false;
    document.title = "Project Not Found | Lumine";
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
