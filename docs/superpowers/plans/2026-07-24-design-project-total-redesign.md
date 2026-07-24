# Design-Project Case Study Template — Total Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `design` service-type single-project template (currently `heroDesign()`/`designTemplate()` in `js/project.js`) into a premium, editorial, richly-animated case-study page — data-gated so every deep-dive section (Process, Brand Identity, Color System, Typography, Motion) activates automatically the moment a project has that content, and stays cleanly absent otherwise.

**Architecture:** New standalone `js/project-design.js` module owns every design-template section builder and its post-render interactivity; `js/project.js` keeps only what's shared across all three templates (`heroBadge`, `factsRow`, `nextSection`, `initReveals`, the `TEMPLATES` dispatch, translation helpers) and now exports them for reuse. A new reusable `js/pd-lightbox.js` (GSAP Flip) is the openable-image system, wired into every image-bearing section. All new visuals live in a new `css/project-design.css`, loaded only from `project.html`/`ka/project.html`. Data lives in `js/projects-data.js` and reaches production through the existing Supabase migration path — no backend code changes needed (`api/projects.js` already spreads arbitrary extra fields through).

**Tech Stack:** Vanilla JS (ES modules), GSAP 3.15 + ScrollTrigger + Flip (already installed, `gsap/Flip` confirmed present), Lenis (already sitewide), Vite multi-page build. No new dependencies.

## Global Constraints

- Brand tokens (from `css/globals.css`): ink `--d: #17130f`, paper `--l: #f6f1e7`, `--d-soft: #6b6259`, `--white: #ffffff`, font `--f-nm: "LK Lumina", "Neue Montreal", system-ui, sans-serif` (same face for display and body). Use these variables, never hardcode the hex values.
- Every photographic image keeps the site's monochrome-until-hover rule: `filter: grayscale(1) contrast(1.08)` at rest, `grayscale(0) contrast(1)` on hover/focus — this is existing convention (`css/project.css` `.pd-collage-item img`, `.cs-gallery-item img`), carry it into every new image rule.
- Every new field on a project object is optional; a template section renders only when its field is present, and must not throw or render an empty husk when it's absent — guard with an early return / conditional string, not an empty `<section>`.
- No fabricated content ships to real projects: the only project allowed placeholder/demo content in every optional field is the new `hidden: true` `template-preview` row (Task 1).
- `prefers-reduced-motion: reduce` disables all cursor/scroll-driven motion added in this plan (title-mask reveal motion, scroll parallax, process hover-expand transition, lightbox Flip transition duration drops to near-instant) — content stays fully visible either way. Match the existing guard convention in `js/animated-copy.js`.
- Cursor-reactive or hover-only interactions are feature-detected via `(hover: hover) and (pointer: fine)` and are no-ops on touch; touch devices get swipe navigation in the lightbox instead (Task 4).
- New CSS classes for this template are prefixed `pdx-` (Project Design eXtended) to avoid any collision with the existing shared `.pd-`/`.cs-` classes still used by the `web`/`photo-video` templates.
- Production reads project content from Supabase via `/api/projects`, not from `js/projects-data.js` directly — `npm run dev` does not execute that endpoint locally. Verify all data-facing work against the Vercel deployment, not localhost (per user instruction — do not attempt to stand up a local `/api` fallback).
- Not touching `web` or `photo-video` templates' own builder functions or CSS rules — only the shared helpers explicitly listed above get exported (their behavior is unchanged, just made importable).

---

### Task 1: Data model — new fields, real gallery wiring, hidden preview project

**Files:**
- Modify: `js/projects-data.js`

**Interfaces:**
- Produces: every `design`-type project object may now carry `services: string[]`, `services_ka: string[]`, `role: string`, `role_ka: string`, `timeline: string`, `timeline_ka: string`, `galleryImages: string[]` (real clients only), `hidden: boolean` (new `template-preview` row only), plus the demo row's full optional-field set (`process`, `brandIdentity`, `colorPalette`, `typography`, `video`) that later tasks' renderers will consume by these exact shapes:
  - `process: [{ stage, stage_ka, description, description_ka, image? }]`
  - `brandIdentity: { construction?, safeSpace?, variations?: string[], incorrectUsage?: string[] }` (each a string image path)
  - `colorPalette: [{ name, name_ka, hex, cmyk? }]`
  - `typography: { heading: { family, weights: number[] }, body: { family, weights: number[] } }`
  - `video: { src, poster }`

- [ ] **Step 1: Add a gallery-path helper and real-client fields**

Add this helper right after the `INDUSTRY_LABELS_KA` block (after line 74, before the `projects` array comment on line 76) in `js/projects-data.js`:

```js
// Real client galleries live on disk as /work/design/<slug>/gallery1.jpg
// .. galleryN.jpg — built here instead of typed out by hand so the count
// always matches what's actually there.
function galleryPaths(slug, count) {
  return Array.from({ length: count }, (_, i) => `/work/design/${slug}/gallery${i + 1}.jpg`);
}
```

Then add `services`/`services_ka`/`role`/`role_ka`/`timeline`/`timeline_ka`/`galleryImages` to each of the 5 real design projects, inserted right after each project's existing `deliverablesImages` line. These values are inferred from each project's existing `blurb`/`brief` copy — flag to the user that they're a best-guess placeholder for real service/timeline data, not confirmed facts:

`tbilisi-zoo` (after line 393's `deliverablesImages`):
```js
    services: ["Brand Identity", "Illustration", "Merchandise System"],
    services_ka: ["საბრენდო იდენტობა", "ილუსტრაცია", "სუვენირული სისტემა"],
    role: "Full-service branding",
    role_ka: "სრული საბრენდო მომსახურება",
    timeline: "8 weeks",
    timeline_ka: "8 კვირა",
    galleryImages: galleryPaths("tbilisi-zoo", 10),
```

`fit-rock` (after line 414's `deliverablesImages`):
```js
    services: ["Brand Identity", "Packaging", "3D Product Rendering", "Social Content"],
    services_ka: ["საბრენდო იდენტობა", "შეფუთვა", "3D რენდერინგი", "სოციალური კონტენტი"],
    role: "Full-service branding",
    role_ka: "სრული საბრენდო მომსახურება",
    timeline: "6 weeks",
    timeline_ka: "6 კვირა",
    galleryImages: galleryPaths("fit-rock", 14),
```

`tene` (after line 435's `deliverablesImages`):
```js
    services: ["Social Content System", "Art Direction"],
    services_ka: ["სოციალური კონტენტის სისტემა", "არტ-დირექშენი"],
    role: "Ongoing content partner",
    role_ka: "მუდმივი კონტენტ-პარტნიორი",
    timeline: "Ongoing",
    timeline_ka: "მიმდინარე",
    galleryImages: galleryPaths("tene", 15),
```

`tera-leasing` (after line 456's `deliverablesImages`):
```js
    services: ["Social Content System", "Copy Direction"],
    services_ka: ["სოციალური კონტენტის სისტემა", "კოპირაითინგის მიმართულება"],
    role: "Ongoing content partner",
    role_ka: "მუდმივი კონტენტ-პარტნიორი",
    timeline: "Ongoing",
    timeline_ka: "მიმდინარე",
    galleryImages: galleryPaths("tera-leasing", 7),
```

`4pets` (after line 477's `deliverablesImages`):
```js
    services: ["Social Content System", "Template Design"],
    services_ka: ["სოციალური კონტენტის სისტემა", "შაბლონის დიზაინი"],
    role: "Ongoing content partner",
    role_ka: "მუდმივი კონტენტ-პარტნიორი",
    timeline: "Ongoing",
    timeline_ka: "მიმდინარე",
    galleryImages: galleryPaths("4pets", 15),
```

- [ ] **Step 2: Add the same fields to the 3 concept projects**

`northbeam` (after line 283's `deliverablesImages`, i.e. before its `testimonial` block):
```js
    services: ["Brand Identity", "Pitch Deck"],
    services_ka: ["საბრენდო იდენტობა", "პიჩ-დეკი"],
    role: "Identity & deck design",
    role_ka: "იდენტობისა და დეკის დიზაინი",
    timeline: "4 weeks",
    timeline_ka: "4 კვირა",
```

`aura-coffee` (after line 312's `deliverablesImages`):
```js
    services: ["Brand Identity", "Print System"],
    services_ka: ["საბრენდო იდენტობა", "ბეჭდვითი სისტემა"],
    role: "Full-service branding",
    role_ka: "სრული საბრენდო მომსახურება",
    timeline: "5 weeks",
    timeline_ka: "5 კვირა",
```

`forma-collective` (after line 366's `deliverablesImages`):
```js
    services: ["Naming", "Brand Identity", "Poster Campaign"],
    services_ka: ["სახელდება", "საბრენდო იდენტობა", "პოსტერების კამპანია"],
    role: "Full-service branding",
    role_ka: "სრული საბრენდო მომსახურება",
    timeline: "6 weeks",
    timeline_ka: "6 კვირა",
```

- [ ] **Step 3: Add the hidden `template-preview` project**

Insert this as a new object at the end of the `projects` array, right before the closing `];` (currently line 479):

```js
  {
    slug: "template-preview",
    title: "Full Template Preview",
    client: "Internal QA",
    serviceType: "design",
    industry: "SaaS",
    year: "2026",
    status: "Concept",
    status_ka: "კონცეფცია",
    hidden: true,
    cover: "/work/work3.jpg",
    blurb: "Every optional section populated, for visual QA only — never linked from the live site.",
    blurb_ka: "ყველა არასავალდებულო სექცია შევსებული, მხოლოდ ვიზუალური QA-სთვის — არასდროს ჩნდება საიტზე.",
    heroTagline: "If every section can look right at once, each one alone will too.",
    heroTagline_ka: "თუ ყველა სექცია ერთად კარგად გამოიყურება, თითოეული ცალკეც გამოიყურება.",
    brief:
      "This row exists only to render every optional block on the design template at the same time — Process, Brand Identity, Color System, Typography, Motion — so the whole page can be reviewed at full richness in one pass. It is excluded from the Work grid and Featured picks and is not linked from anywhere on the live site.",
    brief_ka:
      "ეს ჩანაწერი მხოლოდ იმისთვის არსებობს, რომ დიზაინის შაბლონის ყველა არასავალდებულო სექცია ერთდროულად აჩვენოს — პროცესი, საბრენდო იდენტობა, ფერების სისტემა, ტიპოგრაფია, მოძრაობა — რათა მთელი გვერდი ერთბაშად შემოწმდეს სრული სიმდიდრით. გამორიცხულია სამუშაოების ბადიდან და გამორჩეულთაგან და არსად არის მიბმული საიტზე.",
    services: ["Brand Identity", "Packaging", "Motion", "Social Content"],
    services_ka: ["საბრენდო იდენტობა", "შეფუთვა", "მოძრაობა", "სოციალური კონტენტი"],
    role: "Full-service branding",
    role_ka: "სრული საბრენდო მომსახურება",
    timeline: "10 weeks",
    timeline_ka: "10 კვირა",
    moodboardImages: ["/work/work1.jpg", "/work/work3.jpg", "/sample-project/details-1.jpg"],
    deliverablesImages: [
      { src: "/work/work4.jpg", alt: "Packaging mockup", type: "packaging" },
      { src: "/sample-project/hero.jpg", alt: "Poster application", type: "poster" },
      { src: "/work/work6.jpg", alt: "Business card application", type: "card" },
      { src: "/work/work2.jpg", alt: "Signage application", type: "signage" },
    ],
    galleryImages: ["/work/work5.jpg", "/sample-project/details-2.jpg", "/work/work1.jpg", "/work/work3.jpg"],
    process: [
      {
        stage: "Concept",
        stage_ka: "კონცეფცია",
        description: "Two directions explored against the brief — one literal, one abstract.",
        description_ka: "ბრიფის მიხედვით შესწავლილია ორი მიმართულება — ერთი პირდაპირი, ერთი აბსტრაქტული.",
        image: "/work/work1.jpg",
      },
      {
        stage: "Iterations",
        stage_ka: "იტერაციები",
        description: "The abstract mark refined across six passes for legibility at small sizes.",
        description_ka: "აბსტრაქტული ნიშანი დახვეწილია ექვს ვერსიაში მცირე ზომაზე წაკითხვადობისთვის.",
        image: "/work/work2.jpg",
      },
      {
        stage: "Final",
        stage_ka: "საბოლოო",
        description: "Locked mark, full system, and a launch-ready asset library.",
        description_ka: "დაფიქსირებული ნიშანი, სრული სისტემა და გასაშვებად მზა აქტივების ბიბლიოთეკა.",
        image: "/work/work3.jpg",
      },
    ],
    brandIdentity: {
      construction: "/sample-project/details-1.jpg",
      safeSpace: "/sample-project/details-2.jpg",
      variations: ["/work/work1.jpg", "/work/work3.jpg"],
      incorrectUsage: ["/work/work2.jpg", "/work/work6.jpg"],
    },
    colorPalette: [
      { name: "Northbeam Ink", name_ka: "ინკი", hex: "#17130f" },
      { name: "Signal Amber", name_ka: "სიგნალის ქარვა", hex: "#e8a33d" },
      { name: "Paper", name_ka: "ქაღალდი", hex: "#f6f1e7" },
    ],
    typography: {
      heading: { family: "LK Lumina", weights: [400, 700] },
      body: { family: "Neue Montreal", weights: [400, 500] },
    },
    video: { src: "/work/work-reel.mp4", poster: "/work/work4.jpg" },
    results: [
      { stat: "+18%", label: "Merch Sales", label_ka: "სუვენირის გაყიდვები" },
      { stat: "4", label: "Applications Shipped", label_ka: "შესრულებული აპლიკაცია" },
    ],
    testimonial: {
      quote: "This is a placeholder testimonial used only to verify layout — never shown to a real visitor.",
      quote_ka: "ეს არის მხოლოდ განლაგების შესამოწმებელი სატესტო ციტატა — რეალურ ვიზიტორს არასდროს ეჩვენება.",
      author: "Internal QA",
      author_ka: "შიდა QA",
    },
  },
```

Note the `deliverablesImages` on this row uses the object form (`{ src, alt, type }`) deliberately, to exercise both the plain-string and object image formats the renderer must support (Task 8 onward).

- [ ] **Step 4: Verify the file still parses**

Run: `node --check js/projects-data.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add js/projects-data.js
git commit -m "Add services/role/timeline fields, real gallery wiring, and hidden preview project"
```

---

### Task 2: Exclude hidden projects from the Work grid and Featured picks

**Files:**
- Modify: `js/work.js:228` (inside `init()`, right after `projects = await fetchProjects();`)
- Modify: `js/featured.js:38` (inside `init()`, right after `projects = await fetchProjects();`)

**Interfaces:**
- Consumes: `fetchProjects()` from `js/api-client.js` (unchanged), `project.hidden` from Task 1.
- Produces: both modules' module-level `projects` array excludes any row with `hidden: true` from this point on — every downstream read (`render()`, `pickFeatured()`, the `projects.length` count) sees the filtered list automatically, no other line needs to change.

- [ ] **Step 1: Filter in `js/work.js`**

Change line 228 from:
```js
  projects = await fetchProjects();
```
to:
```js
  projects = (await fetchProjects()).filter((proj) => !proj.hidden);
```

- [ ] **Step 2: Filter in `js/featured.js`**

Change line 38 from:
```js
  projects = await fetchProjects();
```
to:
```js
  projects = (await fetchProjects()).filter((proj) => !proj.hidden);
```

- [ ] **Step 3: Verify both files still parse**

Run: `node --check js/work.js` and `node --check js/featured.js`
Expected: no output, exit code 0 for both.

- [ ] **Step 4: Manual verification (after Task 3 pushes data live)**

Visit the Vercel deployment's `/work` and `/` (home) pages. Confirm "Full Template Preview" never appears in the grid, filter counts, or the featured strip, and that `/project?slug=template-preview` still loads directly (single-project lookup is unfiltered — see `js/project.js`'s `getProject`, untouched by this task).

- [ ] **Step 5: Commit**

```bash
git add js/work.js js/featured.js
git commit -m "Exclude hidden projects from Work grid and Featured picks"
```

---

### Task 3: Push the new data to Supabase

**Files:** none (operational task — runs the existing `scripts/migrate-content.js` unchanged; `api/projects.js` already spreads arbitrary `content` fields through, confirmed by reading it, so no backend code needs to change for any new field added in Task 1).

- [ ] **Step 1: Confirm env vars are available**

`scripts/migrate-content.js` reads `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` from a `.env` file at the repo root (not `.env.local`). Check: `Test-Path .env`. If it doesn't exist but `.env.local` does, copy it: `Copy-Item .env.local .env`.

- [ ] **Step 2: Run the migration**

Run: `node scripts/migrate-content.js`
Expected output ends with `Upserted 14 projects` (the existing rows plus the new hidden one) and `Migration complete.`

- [ ] **Step 3: Verify live**

`Invoke-RestMethod https://lumine-site.vercel.app/api/projects | Select-Object -ExpandProperty projects | Where-Object slug -eq "template-preview"` — confirm the row comes back with `hidden: true` and the full field set from Task 1, Step 3.

- [ ] **Step 4: No commit** (no files changed in this repo — data lives in Supabase, not git).

---

### Task 4: Reusable Flip-based lightbox

**Files:**
- Create: `js/pd-lightbox.js`

**Interfaces:**
- Consumes: `gsap` (default export), `Flip` from `"gsap/Flip"` (confirmed present in `node_modules/gsap/Flip.js`).
- Produces: `export function initLightbox(root)` — call once after a template's HTML is in the DOM. Scans `root.querySelectorAll("[data-lightbox-group]")`, groups elements by their `data-lightbox-group` value (DOM order = index within group), and wires click-to-open, Esc/scrim/close-button to close, ←/→ keys + on-screen prev/next, and touch swipe. Each triggering element must be a `<button type="button" class="pdx-frame" data-lightbox-group="...">` wrapping exactly one `<img>` — the lightbox reads `img.src`/`img.alt` directly, so no separate data attributes are needed per image.

- [ ] **Step 1: Write the module**

```js
// js/pd-lightbox.js
// Reusable GSAP-Flip openable-image lightbox. Any <button class="pdx-frame"
// data-lightbox-group="NAME"> wrapping an <img> becomes openable; buttons
// sharing the same group name become one prev/next sequence. Call
// initLightbox(root) once after the group's HTML is in the DOM.
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

let overlay, overlayImg, overlayCounter, overlayCloseBtn, prevBtn, nextBtn;
let groups = new Map();
let activeGroup = null;
let activeIndex = 0;
let lastFocused = null;
let built = false;

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildOverlay() {
  if (built) return;
  built = true;
  overlay = document.createElement("div");
  overlay.className = "pdx-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="pdx-lightbox-scrim" data-pdx-close></div>
    <button type="button" class="pdx-lightbox-nav pdx-lightbox-prev" aria-label="Previous image">‹</button>
    <img class="pdx-lightbox-img" alt="" />
    <button type="button" class="pdx-lightbox-nav pdx-lightbox-next" aria-label="Next image">›</button>
    <button type="button" class="pdx-lightbox-close" aria-label="Close">✕</button>
    <span class="pdx-lightbox-counter"></span>
  `;
  document.body.appendChild(overlay);
  overlayImg = overlay.querySelector(".pdx-lightbox-img");
  overlayCounter = overlay.querySelector(".pdx-lightbox-counter");
  overlayCloseBtn = overlay.querySelector(".pdx-lightbox-close");
  prevBtn = overlay.querySelector(".pdx-lightbox-prev");
  nextBtn = overlay.querySelector(".pdx-lightbox-next");

  overlay.querySelector(".pdx-lightbox-scrim").addEventListener("click", close);
  overlayCloseBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  document.addEventListener("keydown", onKeydown);

  let touchStartX = null;
  overlay.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
  overlay.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      touchStartX = null;
    },
    { passive: true },
  );
}

function onKeydown(e) {
  if (!overlay || overlay.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
}

function open(groupName, index, triggerEl) {
  buildOverlay();
  activeGroup = groupName;
  activeIndex = index;
  lastFocused = document.activeElement;

  const state = Flip.getState(triggerEl.querySelector("img"));
  render();
  overlay.hidden = false;
  document.body.classList.add("pdx-lightbox-open");

  if (!reduceMotion()) {
    Flip.from(state, { targets: overlayImg, duration: 0.5, ease: "power3.inOut", absolute: true });
  }
  overlayCloseBtn.focus();
}

function render() {
  const list = groups.get(activeGroup) || [];
  const el = list[activeIndex];
  if (!el) return;
  const img = el.querySelector("img");
  overlayImg.src = img.src;
  overlayImg.alt = img.alt || "";
  overlayCounter.textContent = `${activeIndex + 1} / ${list.length}`;
  prevBtn.hidden = list.length < 2;
  nextBtn.hidden = list.length < 2;
}

function step(delta) {
  const list = groups.get(activeGroup) || [];
  if (!list.length) return;
  activeIndex = (activeIndex + delta + list.length) % list.length;
  if (reduceMotion()) {
    render();
    return;
  }
  gsap.to(overlayImg, {
    opacity: 0,
    duration: 0.15,
    onComplete: () => {
      render();
      gsap.to(overlayImg, { opacity: 1, duration: 0.25 });
    },
  });
}

function close() {
  if (!overlay || overlay.hidden) return;
  const list = groups.get(activeGroup) || [];
  const triggerEl = list[activeIndex];
  const returnImg = triggerEl ? triggerEl.querySelector("img") : null;

  const finish = () => {
    overlay.hidden = true;
    document.body.classList.remove("pdx-lightbox-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  if (returnImg && !reduceMotion()) {
    const state = Flip.getState(overlayImg);
    overlayImg.src = returnImg.src;
    Flip.from(state, {
      targets: returnImg,
      duration: 0.4,
      ease: "power3.inOut",
      absolute: true,
      onComplete: finish,
    });
  } else {
    finish();
  }
}

export function initLightbox(root) {
  const frames = root.querySelectorAll("[data-lightbox-group]");
  frames.forEach((el) => {
    const groupName = el.dataset.lightboxGroup;
    if (!groups.has(groupName)) groups.set(groupName, []);
    const list = groups.get(groupName);
    const index = list.length;
    list.push(el);
    el.addEventListener("click", () => open(groupName, index, el));
  });
}
```

- [ ] **Step 2: Verify it parses**

Run: `node --check js/pd-lightbox.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add js/pd-lightbox.js
git commit -m "Add reusable GSAP-Flip openable-image lightbox"
```

---

### Task 5: New stylesheet skeleton, HTML wiring, retire dead design-only CSS

**Files:**
- Create: `css/project-design.css`
- Modify: `project.html:19` (add stylesheet link)
- Modify: `ka/project.html` (same, find its equivalent `<link rel="stylesheet" href="/css/project.css" />` line)
- Modify: `css/project.css` — remove lines 442–504 (`.pd-hero-design` through `.pd-collage-item:hover img`, including the `/* hero variant: graphic design */` comment) and the design-specific media-query block at lines 706–730 (`.pd-hero-design`/`.pd-collage*` inside the `@media` block) — these rules only ever applied to markup this plan replaces.

- [ ] **Step 1: Create the new stylesheet with its base layer**

```css
/* css/project-design.css
   Design-template-only styling — everything prefixed .pdx- to avoid any
   collision with the shared .pd-/.cs- classes still used by the web and
   photo-video templates. Loaded only from project.html/ka/project.html. */

.pdx-section {
  padding: 7rem 0;
  background-color: var(--l);
  color: var(--d);
}

.pdx-section-label {
  font-family: var(--f-nm);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 2rem;
}

.pdx-frame {
  display: block;
  position: relative;
  overflow: hidden;
  border: 0;
  padding: 0;
  cursor: zoom-in;
  border-radius: 0.85rem;
  background: none;
}

.pdx-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.08);
  transition:
    transform 0.6s cubic-bezier(0.65, 0, 0.35, 1),
    filter 0.6s ease;
}

.pdx-frame:hover img,
.pdx-frame:focus-visible img {
  filter: grayscale(0) contrast(1);
  transform: scale(1.03);
}

@media (prefers-reduced-motion: reduce) {
  .pdx-frame img {
    transition: none;
  }
}
```

- [ ] **Step 2: Wire the stylesheet into both HTML entry points**

In `project.html`, after line 19 (`<link rel="stylesheet" href="/css/project.css" />`), add:
```html
    <link rel="stylesheet" href="/css/project-design.css" />
```

Open `ka/project.html`, find its equivalent `project.css` link tag, and add the same line directly after it.

- [ ] **Step 3: Remove the superseded design-only rules from `css/project.css`**

Delete lines 442–504 (the `/* hero variant: graphic design */` comment through `.pd-collage-item:hover img { ... }`) and, in the responsive block further down, delete the `.pd-hero-design { ... }`, `.pd-collage { ... }`, `.pd-collage-tall { ... }`, `.pd-collage-a { ... }`, `.pd-collage-b { ... }` rules (originally lines 706–730). Leave every other rule in the file untouched — `.pd-hero-web`, `.pd-hero-photo`, `.cs-gallery`, `.cs-results-grid`, `.cs-quote`, `.cs-next`, `.cs-chip`, etc. are still used by `web`/`photo-video` and by the shared `nextSection()`/`quoteSection()`/`resultsSection()` helpers this plan keeps.

- [ ] **Step 4: Verify nothing references the removed classes anymore**

Run: `Select-String -Path js\*.js -Pattern "pd-collage|pd-hero-design"`
Expected: no matches (Task 6 will replace `heroDesign()`'s markup before this is fully true — if this step is run before Task 6 lands, expect matches only in `js/project.js`'s current `heroDesign()`, which Task 14 removes).

- [ ] **Step 5: Commit**

```bash
git add css/project-design.css css/project.css project.html ka/project.html
git commit -m "Add design-template stylesheet, wire into HTML, retire superseded hero-collage CSS"
```

---

### Task 6: Hero — "Title as Window" signature

**Files:**
- Create: `js/project-design.js` (this task starts the file; later tasks append to it)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Consumes: `heroBadge(project)`, `factsRow(project)`, `t(project, field)`, `isKa`, `L` (exported from `js/project.js` in Task 14 — until then, this task's own file duplicates the three-line `t()`/`isKa` logic locally so it can be built and reviewed independently; Task 14 removes the duplication when it wires everything together).
- Produces: `export function heroDesign(project)` → HTML string. `export function initHeroDesign(root)` → wires the load/scroll animation for the hero this function rendered. Both are consumed by `designTemplate()`/`initDesignTemplate()` added in Task 13.

- [ ] **Step 1: Start `js/project-design.js` with local translation helpers and the hero**

```js
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
```

- [ ] **Step 2: Add the hero CSS**

Append to `css/project-design.css`:

```css
.pdx-hero-stage {
  position: relative;
  height: 100svh;
  min-height: 32rem;
  overflow: hidden;
  background-color: var(--d);
}

.pdx-hero-title {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 1rem;
  font-family: var(--f-nm);
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  line-height: 0.92;
  font-size: clamp(3.5rem, 11vw, 11rem);
  background-size: cover;
  background-position: center;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.pdx-hero-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.pdx-hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdx-hero-meta {
  position: relative;
  z-index: 3;
  padding: 3rem 0 4rem;
  background-color: var(--l);
  color: var(--d);
}

.pdx-hero-tagline {
  max-width: 42rem;
  font-size: clamp(1.1rem, 1.6vw, 1.4rem);
  opacity: 0.75;
}

@media (max-width: 720px) {
  .pdx-hero-title {
    font-size: clamp(2.4rem, 14vw, 4rem);
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add design-template hero: Title as Window signature reveal"
```

---

### Task 7: Overview spread (Services / Role / Timeline)

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function overviewSection(project)` → HTML string, appended to `designTemplate()`'s output in Task 13.

- [ ] **Step 1: Add the section builder**

Append to `js/project-design.js`:

```js
// ── Overview: two-column editorial spread ───────────────────────────────────

function specRow(label, value) {
  if (!value) return "";
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
```

- [ ] **Step 2: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-overview-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 5rem;
  align-items: start;
}

.pdx-overview-text {
  max-width: 40rem;
  font-size: clamp(1.4rem, 2.4vw, 2.1rem);
  line-height: 1.4;
}

.pdx-overview-specs {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid rgba(23, 19, 15, 0.15);
}

.pdx-spec-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(23, 19, 15, 0.15);
}

.pdx-spec-label {
  font-family: var(--f-nm);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
}

.pdx-spec-value {
  font-weight: 500;
  text-align: right;
}

@media (max-width: 900px) {
  .pdx-overview-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add design-template Overview section with Services/Role/Timeline"
```

---

### Task 8: Research/Moodboard gallery (openable)

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function moodboardSection(project)` → HTML string. Every image is wrapped in a `data-lightbox-group="moodboard"` `.pdx-frame`, consumed by `initLightbox()` (Task 4) once `initDesignTemplate` (Task 13) calls it.
- Consumes/establishes the shared image-normalizing helper other sections reuse: `normalizeImages(images)` — accepts either a plain string array or an array of `{ src, alt?, type? }` objects (per the spec's backward-compatible image shape) and returns `{ src, alt, type }[]`.

- [ ] **Step 1: Add the shared image normalizer and the section**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-moodboard-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 12rem;
  gap: 1.25rem;
}

.pdx-moodboard-item {
  grid-column: span 3;
  grid-row: span 2;
}

.pdx-moodboard-item:nth-child(3n + 2) {
  grid-column: span 2;
  grid-row: span 1;
}

.pdx-moodboard-item:nth-child(3n) {
  grid-column: span 4;
  grid-row: span 1;
}

.pdx-moodboard-item .pdx-frame,
.pdx-moodboard-item .pdx-frame img {
  width: 100%;
  height: 100%;
}

@media (max-width: 720px) {
  .pdx-moodboard-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 14rem;
  }
  .pdx-moodboard-item,
  .pdx-moodboard-item:nth-child(3n + 2),
  .pdx-moodboard-item:nth-child(3n) {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add openable Research/Moodboard gallery to design template"
```

---

### Task 9: Process section (optional, hover-expand)

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function processSection(project)` → HTML string, or `""` when `project.process` is absent (data-gated per spec).

- [ ] **Step 1: Add the section**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-process-list {
  border-top: 1px solid rgba(23, 19, 15, 0.15);
}

.pdx-process-stage {
  border-bottom: 1px solid rgba(23, 19, 15, 0.15);
  cursor: pointer;
}

.pdx-process-head {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  padding: 1.75rem 0;
}

.pdx-process-num {
  font-family: var(--f-nm);
  font-size: 0.9rem;
  opacity: 0.5;
}

.pdx-process-name {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}

.pdx-process-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.pdx-process-body > * {
  overflow: hidden;
}

.pdx-process-stage.is-open .pdx-process-body {
  grid-template-rows: 1fr;
}

.pdx-process-body p {
  max-width: 40rem;
  padding-bottom: 1.5rem;
  opacity: 0.8;
}

.pdx-process-body img {
  width: 100%;
  max-width: 28rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  filter: grayscale(1) contrast(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .pdx-process-body {
    transition: none;
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add optional Process section with hover/tap-expand stages"
```

---

### Task 10: Optional specimen sections — Brand Identity, Color System, Typography

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function brandIdentitySection(project)`, `export function colorSystemSection(project)`, `export function typographySection(project)` — each returns `""` when its gating field (`brandIdentity`/`colorPalette`/`typography`) is absent.
- Establishes `hexToContrastLabel(hex)` — pure function, used only by `colorSystemSection`, computes WCAG-style contrast against white and ink from a real hex value (never hand-entered).

- [ ] **Step 1: Add Brand Identity**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add Color System**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 3: Add Typography**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 4: Add the CSS for all three**

Append to `css/project-design.css`:

```css
.pdx-brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.pdx-brand-block {
  margin: 0;
}

.pdx-brand-block img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  background-color: var(--white);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.pdx-brand-block figcaption {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
}

.pdx-brand-block-incorrect img {
  outline: 1px solid rgba(178, 46, 26, 0.4);
}

.pdx-swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 2rem;
}

.pdx-swatch-block {
  height: 10rem;
  border-radius: 0.75rem;
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.pdx-swatch:hover .pdx-swatch-block {
  transform: scale(1.03);
}

.pdx-swatch-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 1rem;
  font-family: var(--f-nm);
}

.pdx-swatch-name {
  font-weight: 600;
}

.pdx-swatch-hex,
.pdx-swatch-cmyk,
.pdx-swatch-contrast {
  font-size: 0.85rem;
  opacity: 0.6;
}

.pdx-type-specimen {
  padding: 3rem 0;
  border-bottom: 1px solid rgba(23, 19, 15, 0.15);
}

.pdx-type-role {
  font-family: var(--f-nm);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
}

.pdx-type-sample {
  font-size: clamp(3rem, 9vw, 8rem);
  line-height: 1;
  margin: 1rem 0;
}

.pdx-type-name {
  font-size: 0.9rem;
  opacity: 0.6;
}

@media (max-width: 900px) {
  .pdx-brand-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 5: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 6: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add optional Brand Identity, Color System, and Typography sections"
```

---

### Task 11: Applications section

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function applicationsSection(project)` — groups `deliverablesImages` (normalized via `normalizeImages` from Task 8) by `type` when any entry has one, otherwise renders one flat set. Every image is a `data-lightbox-group="applications"` frame.

- [ ] **Step 1: Add the section**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-app-type-group {
  margin-bottom: 3rem;
}

.pdx-app-type-group:last-child {
  margin-bottom: 0;
}

.pdx-app-type-label {
  font-family: var(--f-nm);
  font-size: 0.85rem;
  text-transform: capitalize;
  opacity: 0.55;
  margin-bottom: 1rem;
}

.pdx-app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.pdx-app-item {
  aspect-ratio: 4 / 5;
}

.pdx-app-item .pdx-frame,
.pdx-app-item .pdx-frame img {
  width: 100%;
  height: 100%;
}

.pdx-app-item .pdx-frame {
  box-shadow: 0 1.5rem 3rem rgba(23, 19, 15, 0.18);
}

@media (max-width: 900px) {
  .pdx-app-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .pdx-app-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add Applications section with type-grouped, openable deliverable images"
```

---

### Task 12: Full Gallery + Motion Showcase (optional)

**Files:**
- Modify: `js/project-design.js` (append)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function fullGallerySection(project)` — masonry of moodboard + deliverables + `galleryImages`, deduped by `src`, in a `data-lightbox-group="gallery"` sequence separate from the other groups. `export function motionSection(project)` — returns `""` unless `project.video` is present.

- [ ] **Step 1: Add Full Gallery**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add Motion Showcase**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 3: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-masonry {
  columns: 3;
  column-gap: 1.25rem;
}

.pdx-masonry-item {
  break-inside: avoid;
  margin-bottom: 1.25rem;
}

.pdx-masonry-item .pdx-frame img {
  width: 100%;
  height: auto;
}

.pdx-motion-video {
  width: 100%;
  border-radius: 1rem;
  filter: grayscale(1) contrast(1.08);
  transition: filter 0.6s ease;
}

.pdx-motion-video:hover {
  filter: grayscale(0) contrast(1);
}

@media (max-width: 900px) {
  .pdx-masonry {
    columns: 2;
  }
}

@media (max-width: 560px) {
  .pdx-masonry {
    columns: 1;
  }
}
```

- [ ] **Step 4: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 5: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add Full Gallery masonry and optional Motion Showcase section"
```

---

### Task 13: Testimonial/Results, Next Project, Contact CTA, and template assembly

**Files:**
- Modify: `js/project-design.js` (append + add the exported `designTemplate`/`initDesignTemplate`)
- Modify: `css/project-design.css` (append)

**Interfaces:**
- Produces: `export function designTemplate(project, projects)` — assembles every section from Tasks 6–13 in order, skipping any that return `""`. `export function initDesignTemplate(root, project)` — runs every section's post-render init (hero, process, lightbox, motion). This is what Task 14 imports into `js/project.js`.
- Consumes: `quoteSection`/`resultsSection` are **not** reused from `js/project.js` (those remain private to that file per Task 14) — this task defines its own, visually consistent with `.pdx-` styling, so the design template never depends on web/photo-video's internals.

- [ ] **Step 1: Add Testimonial/Results, Next Project, Contact CTA**

Append to `js/project-design.js`:

```js
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
```

- [ ] **Step 2: Add the CSS**

Append to `css/project-design.css`:

```css
.pdx-quote {
  max-width: 56rem;
  margin: 0 auto 4rem;
  text-align: center;
}

.pdx-quote h4 {
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  text-transform: none;
}

.pdx-quote-attr {
  margin-top: 1.5rem;
  opacity: 0.6;
}

.pdx-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 2rem;
  text-align: center;
}

.pdx-result h3 {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
}

.pdx-result p {
  margin-top: 0.5rem;
  opacity: 0.7;
}

.pdx-next {
  position: relative;
  display: block;
  height: 70svh;
  min-height: 26rem;
  overflow: hidden;
  text-decoration: none;
  color: var(--white);
}

.pdx-next-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.05);
  transform: scale(1.05);
  transition:
    transform 0.8s cubic-bezier(0.65, 0, 0.35, 1),
    filter 0.8s ease;
}

.pdx-next:hover .pdx-next-bg {
  transform: scale(1);
  filter: grayscale(0) contrast(1);
}

.pdx-next-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(23, 19, 15, 0.75), rgba(23, 19, 15, 0.15));
}

.pdx-next-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-bottom: 3rem;
}

.pdx-next-label {
  font-family: var(--f-nm);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.75;
}

.pdx-next-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

.pdx-next:hover .pdx-next-title {
  transform: translateX(1rem);
}

.pdx-cta {
  padding: 6rem 0;
  background-color: var(--d);
  color: var(--l);
  text-align: center;
}

.pdx-cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.pdx-cta-line {
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  max-width: 36rem;
}

@media (max-width: 720px) {
  .pdx-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 3: Verify it parses**

Run: `node --check js/project-design.js`

- [ ] **Step 4: Commit**

```bash
git add js/project-design.js css/project-design.css
git commit -m "Add Testimonial/Results, full-bleed Next Project, Contact CTA, and template assembly"
```

---

### Task 14: Wire into `js/project.js`

**Files:**
- Modify: `js/project.js`

**Interfaces:**
- Consumes: `designTemplate`, `initDesignTemplate` from `js/project-design.js` (Task 13).
- Produces: `heroBadge`, `factsRow`, `L`, `t`, `isKa`, `p` become exported (`export function`/`export const`) so `js/project-design.js` no longer needs its own duplicated `t`/`isKa` — this task removes that duplication too.

- [ ] **Step 1: Export the shared helpers**

In `js/project.js`, add `export` to the declarations at lines 11 (`const isKa`), 12 (`const p`), 14 (`const L`), 60 (`function t`), 69 (`function heroBadge`), 75 (`function factsRow`). No logic changes — just the keyword.

- [ ] **Step 2: Remove the old `heroDesign`/`designTemplate` and delegate to the new module**

Delete `heroDesign()` (lines 157–189) and `designTemplate()` (lines 373–382) from `js/project.js` entirely.

Add near the top, with the other imports:
```js
import { designTemplate as buildDesignTemplate, initDesignTemplate } from "/js/project-design.js";
```

Replace the `TEMPLATES` map (lines 384–388):
```js
const TEMPLATES = {
  web: webTemplate,
  "photo-video": photoVideoTemplate,
  design: (proj) => buildDesignTemplate(proj, projects, { heroBadge, factsRow, p }),
};
```

- [ ] **Step 3: Remove the now-unused duplicated helpers from `js/project-design.js`**

In `js/project-design.js`, delete the local `const isKa = ...` and `function t(project, field) {...}` block added in Task 6 Step 1, and instead import the real ones:
```js
import { isKa, t, p } from "/js/project.js";
```
(`heroBadge`/`factsRow` are already threaded in via the `deps` parameter from `designTemplate`, not imported directly — that keeps `project-design.js` decoupled from `project.js`'s module-level `projects` state.)

- [ ] **Step 4: Call `initDesignTemplate` after render**

In `js/project.js`'s `init()`, after `initReveals(main)` inside the `requestAnimationFrame` callback (around line 436), add:
```js
    if (project.serviceType === "design") initDesignTemplate(main, project);
```

- [ ] **Step 5: Verify both files parse**

Run: `node --check js/project.js` and `node --check js/project-design.js`

- [ ] **Step 6: Manual smoke test**

`npm run build` (production build, exercises real module resolution — this catches import errors `node --check` per-file can't). Expected: build succeeds with no errors mentioning `project.js` or `project-design.js`.

- [ ] **Step 7: Commit**

```bash
git add js/project.js js/project-design.js
git commit -m "Wire design-template module into project.js, remove superseded inline builders"
```

---

### Task 15: Reduced-motion/touch/responsive audit and final QA

**Files:**
- Modify: `js/project-design.js`, `css/project-design.css` (only if the audit below finds a real gap — do not add new features here, only close gaps Tasks 6–14 were supposed to already guarantee).

- [ ] **Step 1: Reduced-motion pass**

With the OS/browser "reduce motion" setting on (or `window.matchMedia("(prefers-reduced-motion: reduce)")` forced via devtools), load `/project?slug=template-preview` on the Vercel deployment. Confirm: hero image is visible immediately (not stuck at `opacity:0` from Task 6's `gsap.set`), title sits at its faint resting state, no scroll-parallax on the hero, process stages still open on click (Task 9's CSS-grid transition — verify it doesn't rely on JS that's skipped under reduced motion; it doesn't, `initProcess` always binds the click handler), lightbox open/close is instant rather than animated (Task 4's `reduceMotion()` branch in `step()`/`open()`/`close()`).

- [ ] **Step 2: Touch/coarse-pointer pass**

On a touch device or emulated touch viewport, confirm: no hover-only interaction is required to see any content (process stages toggle on tap via the `click` listener, which fires on touch too), lightbox swipe left/right navigates, moodboard/applications/gallery images open on tap.

- [ ] **Step 3: Responsive pass**

Check `/project?slug=template-preview` at 1440px, 768px, and 375px widths. Confirm: hero title never overflows its viewport (Task 6's `@media (max-width: 720px)` rule), Overview's two columns stack under 900px (Task 7), moodboard/applications grids reflow to fewer columns (Tasks 8/11), masonry gallery drops to 1 column on mobile (Task 12), Next Project banner text stays legible at small widths.

- [ ] **Step 4: Full-page QA against every optional section**

Load `/project?slug=template-preview` and confirm every section from the spec renders: Hero, Overview, Moodboard, Process (3 stages, hover/tap-expand), Brand Identity (4 blocks), Color System (3 swatches with real computed contrast labels), Typography (2 specimens in actual LK Lumina/Neue Montreal), Applications (4 images grouped by type), Full Gallery (masonry), Motion Showcase (video card — note: `/work/work-reel.mp4` referenced in Task 1's demo data does not exist on disk; expect the `<video>` element to render with no playable source — this is expected and fine for a QA-only row, not a real defect, since no real project has video content yet).

- [ ] **Step 5: Spot-check a real project**

Load `/project?slug=tbilisi-zoo` (or any of the 5 real clients) on Vercel. Confirm: Hero/Overview/Moodboard/Applications/Full Gallery/Next Project/Contact CTA all render correctly with real content; Process/Brand Identity/Color System/Typography/Motion/Testimonial/Results sections are cleanly absent (no empty headers, no broken layout gaps) since those projects don't have that data yet.

- [ ] **Step 6: Commit any fixes found**

If Steps 1–5 surface a real gap, fix it in the task file it belongs to and commit with a message naming which task's guarantee was incomplete, e.g.:
```bash
git commit -m "Fix: Task 9 process stages didn't toggle on touch (click listener was hover-only)"
```
If no gaps are found, no commit is needed for this task.

## Self-Review Notes

- **Spec coverage:** every section in the design spec (Hero, Overview, Moodboard, Process, Brand Identity, Color System, Typography, Applications, Full Gallery + Lightbox, Motion, Testimonial/Results, Next Project, Contact CTA) has a task. Data model, hidden-filtering, and the Supabase push are covered in Tasks 1–3. The stack/CSS-3D/data-gating/monochrome decisions from the spec are enforced as Global Constraints rather than repeated per task.
- **No placeholders:** every task's code steps are complete, runnable code — no "TBD" or "similar to Task N" left for the implementer to invent. All 8 real design projects' `services`/`role`/`timeline` values are written out individually in Task 1, not templated.
- **Type consistency:** `normalizeImages()` (Task 8) is used identically by `moodboardSection`, `applicationsSection`, and `fullGallerySection` (Tasks 8/11/12). `frame(image, group)` (Task 8) is reused by all three for consistent lightbox wiring. `designTemplate(project, projects, deps)`'s `deps` shape (`{ heroBadge, factsRow, p }`, Task 13) matches exactly what Task 14's `TEMPLATES.design` closure passes.
