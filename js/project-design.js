// js/project-design.js
// All section builders + post-render interactivity for the `design`
// service-type single-project template. Exports designTemplate(project, projects, deps)
// (HTML string) and initDesignTemplate(root, proj) (wires interactivity) —
// both consumed by js/project.js's TEMPLATES/POST_INIT dispatch.
//
// Structure is a ground-up rebuild referencing Montoya (ClaPat Studio)'s
// real case-study/reference-page vocabulary, translated into Lumine's own
// ink/paper/LK-Lumina identity: two registers, alternated deliberately —
// NARRATIVE bands (mask-fill headline + an asymmetric empty-or-image
// column, alternating sides — the Challenge/Research/Solution rhythm of
// Montoya's project01.html) for anything telling the story of the work,
// and SPEC rows (label column + content column + hairline rules — the
// one_third/two_third rhythm of Montoya's typography.html) for anything
// systematic/reference-like (facts, brand identity, color, type).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLightbox } from "/js/pd-lightbox.js";
import { isKa, t } from "/js/project.js";

gsap.registerPlugin(ScrollTrigger);

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// ── Ink fill: scroll-driven ink reveal ──────────────────────────────────────
// A pale outline layer sits behind a solid layer that's revealed
// left-to-right via clip-path as the element scrolls into view — like a
// stencil being inked in. Used both for small eyebrow labels and for the
// big mask-fill narrative headlines (Montoya's `.has-mask-fill`).

function inkFill(text, tag, extraClass) {
  return `
    <${tag} class="pdx-ink-fill ${extraClass}" data-pdx-ink-fill>
      <span class="pdx-ink-fill-track">${text}</span>
      <span class="pdx-ink-fill-solid" aria-hidden="true">${text}</span>
    </${tag}>
  `;
}

function sectionLabel(text) {
  return inkFill(text, "p", "pdx-section-label");
}

function bandHeading(text) {
  return inkFill(text, "h2", "pdx-band-heading");
}

function initInkFillLabels(root) {
  const labels = root.querySelectorAll("[data-pdx-ink-fill]");
  labels.forEach((label) => {
    const solid = label.querySelector(".pdx-ink-fill-solid");
    if (!solid) return;
    if (reduceMotion()) {
      gsap.set(solid, { clipPath: "inset(0 0% 0 0)" });
      return;
    }
    gsap.set(solid, { clipPath: "inset(0 100% 0 0)" });
    gsap.to(solid, {
      clipPath: "inset(0 0% 0 0)",
      ease: "none",
      scrollTrigger: {
        trigger: label,
        start: "top 88%",
        end: "top 45%",
        scrub: 0.4,
      },
    });
  });
}

// ── Ink-stamp cursor ─────────────────────────────────────────────────────────
// A heavier companion to the sitewide cursor dot: hovering an openable frame
// or the next-project link grows a solid ink circle that stamps a one-word
// verb inside itself ("OPEN", "VIEW") — reads like a rubber date-stamp, and
// stays legible over photography since it's opaque, not blend-mode-based.
// The sitewide dot (#custom-cursor) is suppressed while this is active so
// the two never double up.

function initStampCursor(root) {
  if (!fineHover() || reduceMotion()) return;

  const cursor = document.createElement("div");
  cursor.className = "pdx-cursor";
  cursor.innerHTML = `<span class="pdx-cursor-label"></span>`;
  document.body.appendChild(cursor);
  const label = cursor.querySelector(".pdx-cursor-label");

  let tx = -100,
    ty = -100,
    cx = tx,
    cy = ty;
  const onMove = (e) => {
    tx = e.clientX;
    ty = e.clientY;
  };
  window.addEventListener("mousemove", onMove, { passive: true });
  gsap.ticker.add(() => {
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    cursor.style.setProperty("--sx", `${cx}px`);
    cursor.style.setProperty("--sy", `${cy}px`);
  });

  const targets = root.querySelectorAll("[data-cursor-label]");
  targets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      label.textContent = el.dataset.cursorLabel;
      cursor.classList.add("is-active");
      document.body.classList.add("pdx-stamp-active");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-active");
      document.body.classList.remove("pdx-stamp-active");
    });
  });
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
    <button type="button" class="pdx-frame" data-lightbox-group="${group}" data-cursor-label="OPEN">
      <img src="${image.src}" alt="${image.alt}" loading="lazy" />
    </button>
  `;
}

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

// ── Hero: framed color image + shuffled letter-assembly title ──────────────
// Sits on the SAME paper background as every other section (no dark
// full-bleed stage) — the image is real color, generously framed like
// every other frame on the page, with the title assembling itself out of
// randomized letter order beneath it (Montoya's LazyLoad() shuffled-reveal:
// letters arrive out of sequence, not left-to-right, so it reads as
// assembled rather than typed). A slow continuous idle drift on the image
// keeps the hero alive even at rest, not just while scrolling.

function splitLetters(text) {
  return text
    .split("")
    .map((ch) => `<span class="pdx-hero-letter">${ch === " " ? "&nbsp;" : ch}</span>`)
    .join("");
}

export function heroDesign(project) {
  return `
    <section class="pdx-hero" data-pdx-hero>
      <div class="container pdx-hero-inner">
        <div class="pdx-hero-media-frame" data-pdx-hero-media>
          <img src="${project.cover}" alt="${project.title}" />
        </div>
        <h1 class="pdx-hero-title" data-pdx-hero-title>${splitLetters(project.title)}</h1>
        <span class="pdx-hero-hint">${isKa ? "დაასქროლეთ" : "Scroll to Explore"}</span>
      </div>
    </section>
  `;
}

export function initHeroDesign(root) {
  const stage = root.querySelector("[data-pdx-hero]");
  if (!stage) return;
  const media = stage.querySelector("[data-pdx-hero-media]");
  const letters = Array.from(stage.querySelectorAll(".pdx-hero-letter"));

  if (reduceMotion()) {
    gsap.set(letters, { opacity: 1, scaleY: 1 });
    return;
  }

  // shuffle the ANIMATION order (not DOM order) so letters assemble out of
  // sequence, like type being set on a press bed rather than typed in.
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  gsap.set(letters, { opacity: 0, scaleY: 0.3, transformOrigin: "50% 100%" });
  gsap.to(shuffled, { opacity: 1, scaleY: 1, duration: 0.6, stagger: 0.035, ease: "power3.out", delay: 0.2 });

  // continuous idle breathing — one GSAP tween owns `scale` here, so it
  // never fights the entrance tween above (which only touches scaleY on
  // letters, a different target entirely).
  gsap.to(media, { scale: 1.035, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
}

// ── Intro: badge + opening line + stacked facts ─────────────────────────────
// Replaces the old boxed two-column Overview grid. A short punchy line
// (heroTagline) sits beside a Montoya-style STACKED label/value facts
// list (not a table) — the longer explanatory `brief` copy is its own
// narrative beat further down, not duplicated here.

export function introSection(project, heroBadge) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  const status = isKa ? project.status_ka || project.status : project.status;
  const L = isKa
    ? { client: "კლიენტი", industry: "ინდუსტრია", services: "სერვისები", role: "როლი", timeline: "ვადები", year: "წელი", status: "სტატუსი" }
    : { client: "Client", industry: "Industry", services: "Services", role: "Role", timeline: "Timeline", year: "Year", status: "Status" };

  return `
    <section class="pdx-section pdx-intro">
      <div class="container pdx-intro-grid">
        <div class="pdx-intro-open">
          ${heroBadge(project)}
          <p class="pdx-intro-tagline pd-reveal">${tagline}</p>
        </div>
        <div class="pdx-intro-specs">
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

// ── Narrative band: mask-fill headline + asymmetric empty/image column ──────
// The core rhythm reused by The Brief and every Process stage — alternates
// which side carries the empty/secondary column via the `align` flag,
// matching Montoya's Challenge (content-left) / Research (content-left,
// empty-right stays but visually the whitespace read varies with content
// length) rhythm. Here we alternate strictly left/right for a clear beat.

function narrativeBand(headingText, bodyText, opts) {
  const { align = "left", eyebrow = "", secondary = "", num = "" } = opts || {};
  return `
    <section class="pdx-section pdx-band pdx-band-${align}">
      <div class="container pdx-band-grid">
        <div class="pdx-band-content">
          ${num ? `<span class="pdx-band-num">${num}</span>` : ""}
          ${eyebrow ? sectionLabel(eyebrow) : ""}
          ${bandHeading(headingText)}
          ${bodyText ? `<p class="pdx-band-copy">${bodyText}</p>` : ""}
        </div>
        <div class="pdx-band-secondary">${secondary}</div>
      </div>
    </section>
  `;
}

// ── The Brief: pinned text beside a scrolling image ──────────────────────────
// A real pinned-section technique (Montoya's project02.html) — the text
// stays put via CSS position:sticky while a tall image scrolls past
// beside it, instead of a flat empty column.

export function briefSection(project) {
  const brief = t(project, "brief");
  if (!brief) return "";
  const L = isKa ? "დავალება" : "The Brief";
  const img = project.cover;

  return `
    <section class="pdx-section pdx-tone-dark pdx-pinned">
      <div class="container pdx-pinned-grid">
        <div class="pdx-pinned-sticky">
          ${bandHeading(L)}
          <p class="pdx-band-copy">${brief}</p>
        </div>
        <div class="pdx-pinned-scroll">
          <img src="${img}" alt="" loading="lazy" class="pdx-pinned-img" />
        </div>
      </div>
    </section>
  `;
}

// ── Research / Moodboard: paired images with independent parallax ──────────
// Montoya's project01.html vertical-parallax image pairs — two images per
// row, each drifting at its own speed as the row scrolls, one offset
// lower than the other so the pair never lines up as a flat grid cell.

// Scattered, rotated "corkboard" collage — not a grid. Each item's tilt/
// vertical offset comes from a deterministic 6-recipe cycle (like the
// Applications rhythm) so it never repeats identically row over row, and
// every item sways gently and independently at rest (per-item random
// phase) so the whole board reads as pinned-up and alive, not aligned.

export function moodboardSection(project) {
  const images = normalizeImages(project.moodboardImages);
  if (!images.length) return "";
  const L = isKa ? "კვლევა & მუდბორდი" : "Research & Moodboard";

  const items = images
    .map((img) => `<div class="pdx-scatter-item" data-pdx-sway>${frame(img, "moodboard")}</div>`)
    .join("");

  return `
    <section class="pdx-section pdx-moodboard">
      <div class="container">
        ${sectionLabel(L)}
        <div class="pdx-moodboard-scatter">${items}</div>
      </div>
    </section>
  `;
}

// Base tilt per item mirrors the CSS nth-child(6n+N) cycle exactly — GSAP
// sets this explicitly before swaying around it so motion users get a
// smooth sway from the same angle reduced-motion users see statically
// from CSS alone, instead of snapping from the CSS tilt to 0 on load.
const SCATTER_BASE_ANGLES = [-6, 4, -2, 7, -5, 3];

export function initMoodboardSway(root) {
  const items = root.querySelectorAll("[data-pdx-sway]");
  if (reduceMotion()) return;
  items.forEach((el, i) => {
    const base = SCATTER_BASE_ANGLES[i % SCATTER_BASE_ANGLES.length];
    gsap.set(el, { rotate: base });
    gsap.to(el, {
      rotate: base + 1.5 + (i % 3),
      duration: 4 + (i % 4),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 0.3,
    });
  });
}

// ── Process: alternating narrative bands, not an accordion ─────────────────
// Every stage becomes its own beat in the page's scroll narrative — giant
// ghost numeral, mask-fill stage name, description — alternating sides,
// with the stage's own image (when supplied) filling the secondary column
// instead of leaving it empty. Optional — renders "" if project.process
// is absent.

export function processSection(project) {
  if (!project.process || !project.process.length) return "";
  return project.process
    .map((stage, i) => {
      const align = i % 2 === 0 ? "left" : "right";
      const num = String(i + 1).padStart(2, "0");
      const name = isKa ? stage.stage_ka || stage.stage : stage.stage;
      const desc = isKa ? stage.description_ka || stage.description : stage.description;
      const secondary = stage.image ? `<img src="${stage.image}" alt="" loading="lazy" class="pdx-band-image pd-reveal" />` : "";
      return narrativeBand(name, desc, { align, num, secondary });
    })
    .join("");
}

// ── Full-bleed punctuation break ─────────────────────────────────────────────
// One large image on ink, parallax-scrubbed — a "breath" beat between the
// narrative sections and the systematic spec sections, matching Montoya's
// full-bleed dark-section rows. Shown in full color (not monochrome-until-
// hover) since it's a singular emotional beat, not a grid thumbnail — the
// same deliberate exception the Color System swatches already carry.

export function punctuationSection(project) {
  const candidates = [
    ...(project.deliverablesImages || []),
    ...(project.galleryImages || []),
    ...(project.moodboardImages || []),
  ];
  if (!candidates.length) return "";
  const first = candidates[0];
  const src = typeof first === "string" ? first : first.src;

  return `
    <section class="pdx-punctuation">
      <img src="${src}" alt="" loading="lazy" class="pdx-punctuation-img" data-pdx-parallax data-parallax-speed="0.15" />
    </section>
  `;
}

// ── Spec block: label column + content column, hairline rules ──────────────
// The systematic register (Montoya's typography.html one_third/two_third
// rhythm) — reused by Brand Identity, Color System, and Typography so
// they read as one continuous "spec sheet" when several appear together,
// distinct from the narrative bands above.

function specBlock(label, contentHtml) {
  return `
    <div class="pdx-spec-block pd-reveal">
      <div class="pdx-spec-block-label"><h5>${label}</h5></div>
      <div class="pdx-spec-block-content">${contentHtml}</div>
    </div>
  `;
}

// ── Brand Identity (optional) ────────────────────────────────────────────────

export function brandIdentitySection(project) {
  const bi = project.brandIdentity;
  if (!bi) return "";
  const L = isKa
    ? { title: "საბრენდო იდენტობა", construction: "კონსტრუქცია", safeSpace: "დაცული სივრცე", variations: "ვარიაციები", incorrect: "არასწორი გამოყენება" }
    : { title: "Brand Identity", construction: "Construction", safeSpace: "Safe Space", variations: "Variations", incorrect: "Incorrect Usage" };

  const blocks = [];
  if (bi.construction) blocks.push(`<figure class="pdx-brand-block"><img src="${bi.construction}" alt="${L.construction}" loading="lazy" /><figcaption>${L.construction}</figcaption></figure>`);
  if (bi.safeSpace) blocks.push(`<figure class="pdx-brand-block"><img src="${bi.safeSpace}" alt="${L.safeSpace}" loading="lazy" /><figcaption>${L.safeSpace}</figcaption></figure>`);
  (bi.variations || []).forEach((src) => blocks.push(`<figure class="pdx-brand-block"><img src="${src}" alt="${L.variations}" loading="lazy" /><figcaption>${L.variations}</figcaption></figure>`));
  (bi.incorrectUsage || []).forEach((src) => blocks.push(`<figure class="pdx-brand-block pdx-brand-block-incorrect"><img src="${src}" alt="${L.incorrect}" loading="lazy" /><figcaption>${L.incorrect}</figcaption></figure>`));

  if (!blocks.length) return "";

  return `
    <section class="pdx-spec-section">
      <div class="container">
        <hr class="pdx-spec-hr" />
        ${specBlock(L.title, `<div class="pdx-brand-grid">${blocks.join("")}</div>`)}
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
      <div class="pdx-swatch">
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
    <section class="pdx-spec-section pdx-tone-dark">
      <div class="container">
        <hr class="pdx-spec-hr" />
        ${specBlock(L, `<div class="pdx-swatch-grid">${swatches}</div>`)}
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
    <div class="pdx-type-specimen">
      <span class="pdx-type-role">${label}</span>
      <p class="pdx-type-sample" style="font-family:'${role.family}'">Aa Bb Cc</p>
      <span class="pdx-type-name">${role.family} — ${L.weights} ${role.weights.join(", ")}</span>
    </div>
  `;

  return `
    <section class="pdx-spec-section">
      <div class="container">
        <hr class="pdx-spec-hr" />
        ${specBlock(L.title, `${specimen(typ.heading, L.heading)}${specimen(typ.body, L.body)}`)}
      </div>
    </section>
  `;
}

// ── Applications ──────────────────────────────────────────────────────────────
// Asymmetric, deterministic 6-recipe rhythm — varied widths, aspect ratios,
// and vertical offsets per item so the grid reads as art-directed rather
// than a repeating template.

// Horizontal scroll-snap sequence, not a grid — a different mechanic from
// both the moodboard scatter (overlapping, no scroll) and the full-gallery
// ticker (passive auto-drift): here the visitor drives it, one deliverable
// at a time, each card its own presentation moment with its application
// type as a caption when tagged.

export function applicationsSection(project) {
  const images = normalizeImages(project.deliverablesImages);
  if (!images.length) return "";
  const L = isKa ? "აპლიკაციები" : "Applications";

  const cards = images
    .map(
      (img) => `
      <div class="pdx-app-card">
        ${img.type ? `<span class="pdx-app-card-label">${img.type}</span>` : ""}
        ${frame(img, "applications")}
      </div>
    `,
    )
    .join("");

  return `
    <section class="pdx-section pdx-applications">
      <div class="container">${sectionLabel(L)}</div>
      <div class="pdx-app-scroll">
        <div class="pdx-app-track">${cards}</div>
      </div>
    </section>
  `;
}

// ── Full Gallery: horizontal moving ticker, not a grid ──────────────────────
// Two rows drifting in opposite directions (Montoya's project06.html
// moving-gallery) — a genuinely different rhythm from every other grid on
// the page, closing out the imagery before Results/Next Project. The
// duplicated "loop" half of each row is decorative only (aria-hidden,
// plain <img>) so it never pollutes the lightbox group's real image count.

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

  const half = Math.ceil(deduped.length / 2);
  const rowA = deduped.slice(0, half);
  const rowB = deduped.slice(half).length ? deduped.slice(half) : rowA;

  const tickerRow = (imgs, dirClass) => `
    <div class="pdx-ticker-row ${dirClass}" data-pdx-ticker>
      <div class="pdx-ticker-track">
        ${imgs.map((img) => `<div class="pdx-ticker-item">${frame(img, "gallery")}</div>`).join("")}
        ${imgs.map((img) => `<div class="pdx-ticker-item" aria-hidden="true"><img src="${img.src}" alt="" loading="lazy" class="pdx-ticker-plain" /></div>`).join("")}
      </div>
    </div>
  `;

  return `
    <section class="pdx-section pdx-tone-dark pdx-full-gallery">
      <div class="container">${sectionLabel(L)}</div>
      ${tickerRow(rowA, "pdx-ticker-fw")}
      ${tickerRow(rowB, "pdx-ticker-bw")}
    </section>
  `;
}

export function initTicker(root) {
  if (reduceMotion()) return;
  const rows = root.querySelectorAll("[data-pdx-ticker]");
  rows.forEach((row) => {
    const track = row.querySelector(".pdx-ticker-track");
    const isBackward = row.classList.contains("pdx-ticker-bw");
    gsap.set(track, { xPercent: isBackward ? -50 : 0 });
    gsap.to(track, {
      xPercent: isBackward ? 0 : -50,
      duration: 44,
      ease: "none",
      repeat: -1,
    });
  });
}

// ── Motion Showcase (optional) ───────────────────────────────────────────────

export function motionSection(project) {
  const video = project.video;
  if (!video || !video.src) return "";
  const L = isKa ? "მოძრაობაში" : "Motion Showcase";

  return `
    <section class="pdx-section pdx-motion">
      <div class="container">
        ${sectionLabel(L)}
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

// ── Testimonial & Results ───────────────────────────────────────────────────
// Testimonial styled as Montoya's centered "Solution" beat (double hairline
// rule, big centered statement); Results stays a numeral grid below it.
// Both independently data-gated.

export function testimonialResultsSection(project) {
  const parts = [];
  if (project.testimonial) {
    const quote = isKa ? project.testimonial.quote_ka || project.testimonial.quote : project.testimonial.quote;
    const author = isKa ? project.testimonial.author_ka || project.testimonial.author : project.testimonial.author;
    parts.push(`
      <div class="pdx-quote pd-reveal">
        <h2 class="pdx-quote-text">"${quote}"</h2>
        <hr class="pdx-quote-hr" /><hr class="pdx-quote-hr" />
        <p class="pdx-quote-attr">${author}</p>
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

  return `<section class="pdx-section pdx-tone-dark pdx-testimonial-results grain"><div class="container">${parts.join("")}</div></section>`;
}

// ── Next Project: cinematic unfurl entrance + hover preview ─────────────────
// The image un-clips from the bottom edge and settles out of a slight
// rotation as the banner scrolls into view — a load-in moment, not just a
// hover state. A "View All Works" link sits above it, matching Montoya's
// project-nav pattern.

export function nextProjectSection(project, projects, p) {
  const pool = projects.filter((proj) => !proj.hidden);
  const poolIdx = pool.findIndex((proj) => proj.slug === project.slug);
  const next = poolIdx === -1 ? pool[0] : pool[(poolIdx + 1) % pool.length];
  if (!next) return "";
  const L = isKa ? "შემდეგი პროექტი" : "Next Project";
  const allWorks = isKa ? "ყველა სამუშაო" : "View All Works";

  return `
    <div class="pdx-next-wrap">
      <p class="pdx-all-works"><a href="${p("/work")}" class="pdx-all-works-link">${allWorks}</a></p>
      <a href="${p("/project")}?slug=${next.slug}" class="pdx-next" data-cursor-label="VIEW" data-pdx-next>
        <img src="${next.cover}" alt="" class="pdx-next-bg" data-pdx-next-bg />
        <div class="pdx-next-scrim"></div>
        <div class="container pdx-next-inner">
          <span class="pdx-next-label">${L}</span>
          <h2 class="pdx-next-title">${next.title}</h2>
          <span class="pdx-next-arrow">↗</span>
        </div>
      </a>
    </div>
  `;
}

export function initNextUnfurl(root) {
  const el = root.querySelector("[data-pdx-next]");
  if (!el) return;
  const bg = el.querySelector("[data-pdx-next-bg]");
  if (reduceMotion()) return;

  // Ends exactly at the CSS rest state (scale(1.05), no clip) — clearProps
  // hands control back to the stylesheet on completion so the existing
  // hover zoom (scale(1.05) -> scale(1)) keeps working afterward instead of
  // being pinned by a leftover inline transform.
  gsap.set(bg, { clipPath: "inset(100% 0 0 0)", scale: 1.25, rotate: -3 });
  gsap.to(bg, {
    clipPath: "inset(0% 0 0 0)",
    scale: 1.05,
    rotate: 0,
    duration: 1.3,
    ease: "power3.out",
    clearProps: "transform,clipPath",
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      once: true,
    },
  });
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
  const { heroBadge, p } = deps;
  return [
    heroDesign(project),
    introSection(project, heroBadge),
    briefSection(project),
    moodboardSection(project),
    processSection(project),
    punctuationSection(project),
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

// Scroll-scrubbed parallax for any [data-pdx-parallax] element (currently
// just the full-bleed punctuation image — the moodboard scatter uses its
// own independent idle sway instead, see initMoodboardSway).
function initScrollParallax(root) {
  if (reduceMotion()) return;
  const els = root.querySelectorAll("[data-pdx-parallax]");
  els.forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.1;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

export function initDesignTemplate(root, project) {
  initHeroDesign(root);
  initMotion(root);
  initLightbox(root);
  initInkFillLabels(root);
  initStampCursor(root);
  initNextUnfurl(root);
  initScrollParallax(root);
  initMoodboardSway(root);
  initTicker(root);
}
