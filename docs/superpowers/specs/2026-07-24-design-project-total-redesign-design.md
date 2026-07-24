# Design-Project Case Study Template — Total Redesign

**Date:** 2026-07-24
**Scope:** the `design` service-type single-project template only — `heroDesign()` + `designTemplate()` and related section builders in [js/project.js](../../../js/project.js), the corresponding rules in [css/project.css](../../../css/project.css), new fields on `design`-type rows in [js/projects-data.js](../../../js/projects-data.js) + [scripts/migrate-content.js](../../../scripts/migrate-content.js), and the real gallery wiring for the 5 live clients. Applies automatically to every `serviceType: "design"` project — no per-project code, ever.

**Supersedes:** an earlier redesign attempt (2026-07-24, branch `worktree-design-project-template-redesign`, 6/9 tasks built) that the user explicitly rejected and asked to forget. That branch is left untouched and unmerged; nothing here reuses its code, only lessons (see Non-goals).

## Goals, in priority order

1. Premium, editorial, awards-tier — reference points: Apple, Instrument, Locomotive, Buck. Not a Behance/Dribbble template feel.
2. Every image openable full-view (lightbox), keyboard + swipe navigable.
3. Rich sections for a *complete* case study (brand identity, color, typography, applications, process) — but every one of them is data-gated: renders only when a project actually has that content, never fabricated.
4. Motion is choreographed, not scattered — one strong signature moment, everything else quiet and disciplined.
5. Stays inside the site's real stack and brand system (see Decisions).

## Decisions

**Stack: vanilla JS + GSAP + Lenis + Vite, not Next.js/React/Tailwind.** The user's brief asked for Next.js/React/TS/Tailwind, but Lumine's public site is a Vite multi-page vanilla-JS site — React only exists in the separate `/admin` panel. Introducing a second framework for one template would mean rearchitecting the whole public site's routing/build for no real gain; every effect requested (SplitText reveals, page-transition-grade choreography, pinned ScrollTrigger, magnetic buttons, custom cursor) is achievable in the stack already here, and it'll stay visually/behaviorally consistent with `web` and `photo-video` templates instead of feeling bolted on.

**Data-gated richness, not fabricated richness.** The site has a standing "no fake clients/team/stats" rule (concept projects are explicitly labeled "Concept"). Every optional section below (Process, Brand Identity, Color System, Typography, Motion) renders only if the project object has the relevant field populated, and is cleanly absent otherwise — never filled with placeholder Lorem-ipsum-style content on real or concept projects shown to real visitors.

**One hidden "kitchen sink" preview project for QA.** A new project row, `slug: "template-preview"`, `hidden: true`, with every optional field populated with clearly-fictional-but-plausible content — used only to visually verify every section at once via its direct URL (`/project?slug=template-preview`). `hidden: true` rows are filtered out of the Work grid, Featured picks, and any nav — `getProject(slug)` (used by the single-project page) stays unfiltered so the direct link keeps working. This is the *only* place fabricated content is allowed to exist, and it's never reachable through normal site navigation.

**Signature move: "Title as Window."** The hero's massive title doesn't just sit over the artwork — on load, the hero image is revealed *through* the letterforms (SVG/clip-path text mask), then the mask releases and the image expands to full-bleed as the visitor starts scrolling. One ownable, screenshot-worthy moment that encodes "this project's identity is its imagery." Everything else in the page stays quiet in comparison, per the "spend your boldness in one place" principle.

**CSS 3D over WebGL.** The site already runs two always-on WebGL/canvas loops site-wide (cursor fluid-trail, footer particles). A third continuous canvas on this page risks exactly the jank that would undercut "premium." All depth/tilt/parallax here is CSS (`perspective`/`translateZ`/`rotateX/Y`, GPU-composited) — genuine 3D, not a fake substitute.

**Brand consistency preserved.** Monochrome-until-hover stays the rule for every photographic image (galleries, hero, applications) — new richness is structural and motion-based, not a departure from the existing visual identity (ink `#121212` / paper `#f5f1e6` / white, LK Lumina display+body). Color-system swatches are the one deliberate exception — they show a project's *real* brand colors, which is the whole point of that section, not a violation of Lumine's own monochrome rule (which governs Lumine's chrome, not the artifacts it's presenting).

## Section-by-section

### 1. Hero
Fullscreen. "Title as Window" reveal (see Decisions) on load. Category badge (reuses existing service-type badge), client, industry, year, status. Tagline. Facts row (client/industry/year/status — existing `factsRow()`, kept). On scroll: a subtle scroll-scrubbed parallax between the title layer and the image layer as the hero passes — `scrub`, never pinned.

### 2. Overview
New two-column editorial spread, replacing the current thin "Brief" phase-section. Left: the brief text (existing `brief`/`brief_ka`, given real room to breathe — large type, generous line length). Right: a spec list — Client, Industry, Year, Status (always present, existing fields) plus **Services**, **Role**, **Timeline** (new fields, see Data model) — any of the three new ones simply doesn't render its row if absent on a given project.

### 3. Research / Moodboard
Real `moodboardImages`, shown as an interactive scroll-animated grid — sized to however many images a project actually provides (today: 2 on real clients, 3 on concepts; no hardcoded count). Each image opens in the lightbox (see §9).

### 4. Process (optional)
Renders only if `process` array is present. Vertical stage list (e.g. Concept → Iterations → Final — whatever stages the project actually defines), each stage expands on hover/tap to show its description and optional image. No project has this data today — the section is built and simply invisible until a project supplies it.

### 5. Brand Identity (optional)
Renders only if `brandIdentity` object is present — construction grid, clear-space diagram, incorrect-usage examples, lockup variations, whichever of those four the object actually includes. None of the 8 current projects have this; built for the moment they do.

### 6. Color System (optional)
Renders only if `colorPalette` array is present. Large animated swatches showing name + real HEX (and CMYK if explicitly supplied — CMYK is print data, not something to approximate from HEX). Contrast/accessibility score against white and ink is computed client-side from the real HEX value, not hand-entered.

### 7. Typography (optional)
Renders only if `typography` object is present (heading/body family + weights). Large-scale animated specimen. If the family isn't a webfont Lumine has license to embed, it displays as a styled label (family name + weights) in the site's own type system rather than faking the foreign font.

### 8. Applications
Real `deliverablesImages` plus any image tagged with a `type` (packaging / signage / merch / poster / etc. — see Data model), grouped by type when tags exist, shown as one clean large-format set otherwise. Each image sits in a generic presentation frame (poster frame / card frame / screen frame — unbranded, not a fabricated real-world placement) and opens in the lightbox.

### 9. Full Gallery + Lightbox
Masonry grid combining moodboard + deliverables + any additional real gallery photos (the 5 live clients have 10–15 unused photos on disk today — wired in here, see Data model). GSAP Flip-based lightbox, reusable across every section above that opens images: click grows the image from its exact on-page position/rotation to a centered full view; prev/next via arrows, swipe, and ←/→ keys, scoped per-section (hero images, moodboard, applications, full gallery are separate sequences, not one giant mixed lightbox); "2 / 6" counter; Esc/scrim-click/close-button returns the image to its exact origin slot; focus trapped in the overlay while open, returns to the origin thumbnail on close.

### 10. Motion Showcase (optional)
Renders only if a `video` field is present. Autoplays muted when scrolled into view, pauses out of view, smooth reveal in. No project has video today.

### 11. Testimonial & Results (optional, independent)
Testimonial renders if present (3 concept projects have one; 5 real clients don't yet). Results/metrics render only if present and only ever real numbers supplied by the user — never estimated or invented, and never shown on a project labeled "Concept."

### 12. Next Project
Upgraded from the current small text link to a full-bleed image preview with a hover-driven reveal, consistent with `photo-video`'s full-bleed language.

### 13. Contact CTA
One line + button, minimal — deliberately not a second full CTA section, since the site already has a sitewide final-CTA pattern elsewhere and duplicating it here would be redundant, not richer.

## Data model changes

All new fields are optional and Georgian-paired (`_ka`) where they carry display text. Existing fields (`brief`, `moodboardImages`, `deliverablesImages`, `testimonial`, `results`, `cover`) are unchanged in meaning.

- `services: string[]` / `services_ka: string[]`
- `role: string` / `role_ka: string`
- `timeline: string` / `timeline_ka: string`
- `process: [{ stage, stage_ka, description, description_ka, image? }]`
- `brandIdentity: { construction?, safeSpace?, variations?: string[], incorrectUsage?: string[] }` (each value an image path)
- `colorPalette: [{ name, name_ka, hex, cmyk? }]`
- `typography: { heading: { family, weights: number[] }, body: { family, weights: number[] } }`
- `video: { src, poster }`
- `hidden: boolean` — excluded from Work grid / Featured / nav enumeration; single-project lookup by slug still resolves it.
- Image entries (`moodboardImages`, `deliverablesImages`, and the new combined gallery) accept **either** a bare string (today's format, backward compatible — renders with empty alt) **or** an object `{ src, alt, alt_ka?, type? }` for projects that supply captions/application-type tags. No migration required for existing rows.

**Real-gallery wiring (5 live clients):** `public/work/design/<slug>/gallery1..N.jpg` already exist on disk (10–15 photos each) but aren't referenced anywhere. These get pulled into each project's gallery array as part of this work — no new photography needed, just wiring.

**Delivery path:** production reads project content from Supabase via `/api/projects`, not the static file directly — `projects-data.js` is the migration source. New fields and the hidden preview row get added there, then pushed through `scripts/migrate-content.js` so they actually appear on the live (Vercel) site, where the user previews — not `npm run dev`, which doesn't execute the API functions locally.

## Cross-cutting rules

- **Reduced motion:** `prefers-reduced-motion: reduce` guard (matching `js/animated-copy.js`'s existing convention) disables cursor-tilt, scroll-parallax, and the title-mask reveal's motion — content still fully visible, just static.
- **Touch/coarse pointer:** cursor-driven effects feature-detected via `(hover: hover) and (pointer: fine)`, not bound on touch. Touch gets the lightbox's swipe navigation instead.
- **Performance:** one shared rAF/mousemove loop drives any cursor-reactive elements currently in view, not one listener per element.
- **Accessibility:** lightbox focus trap + return-focus (see §9), real alt text wherever supplied, visible keyboard focus throughout, no motion that blocks scrolling (nothing is ever pinned in a way that traps the viewport).

## Non-goals (this pass)

- Not touching `web` or `photo-video` templates (the lightbox is built reusably and could extend to them later, but that's a future decision).
- No WebGL/Three.js hero (see Decisions — CSS 3D first).
- Not sourcing or commissioning new photography — real-gallery wiring uses what already exists on disk; new asset categories (brand identity, color, typography, process, video) activate only once the user supplies that material for a given project.
- Not reusing any code from the rejected branch (`worktree-design-project-template-redesign`) — this is a from-scratch direction.
