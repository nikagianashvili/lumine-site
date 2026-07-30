// Ideas In Motion — a dot field that gets written into.
//
// Replaces js/particle-visual.js, which rendered the wordmark as a cloud of
// particles you could push around with the cursor. Two things were wrong with
// it beyond taste: the mark was drawn into a forced square (the source is
// 2000x508, so it was stretched almost 4x) and then scaled to width only, so a
// 2000px field sat inside an 868px canvas — the logo was never once visible,
// only a horizontal slice through the middle of the letterforms. And it was a
// section called "Ideas In Motion" that had no motion at all on a phone: the
// sole listener was `mousemove`, which touch never fires.
//
// What replaces it: the grid is permanent — it is the ground, not the message —
// and phrases light it. Dots falling inside a letterform swell and warm toward
// the accent while the rest of the field stays quiet, so each line is built out
// of the same material it dissolves back into.
//
// The detail that makes it read as a real sign rather than text with dots
// sprinkled on it: the phrase is rasterised at grid resolution, one offscreen
// pixel per dot, so every lit dot genuinely IS a pixel of the letter. That
// coarseness is the whole look, and it is why the phrases must stay short.
//
// Nothing here needs GSAP — it is a canvas and a rAF loop, gated on an
// IntersectionObserver so it costs nothing while it is off screen.

import { toMtavruli } from "/js/mtavruli.js";

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Set as lines, not sentences. A fifteen-character phrase across one row of
   the grid gives each letter about eight cells, which is not enough to hold a
   stroke — the letters merge into blobs. Broken over two lines each letter
   gets roughly double the cells and the words actually read. Short by
   necessity: these are things the studio would put on a wall, not taglines. */
const PHRASES_EN = [
  ["IDEAS IN", "MOTION"],
  ["STRATEGY", "FIRST"],
  ["SAY IT", "SHORTER"],
  ["WHO IS", "IT FOR"],
  ["IN HOUSE"],
  ["SHIP IT"],
];

const PHRASES_KA = [
  ["იდეები", "მოძრაობაში"],
  ["ჯერ", "სტრატეგია"],
  ["მოკლედ", "თქვი"],
  ["ვისთვის", "არის"],
  ["საკუთარ", "გუნდში"],
  ["გავუშვათ"],
];

const PHRASES = (isKa ? PHRASES_KA : PHRASES_EN).map((lines) =>
  isKa ? lines.map(toMtavruli) : lines,
);

// paper ground, ink dots, Signature Text where a dot is lit
const BG = "#f6f1e7";
const DIM = "23, 19, 15";
const LIT = "196, 58, 24";

const CYCLE = 260; // write on, hold, release, rest — in frames

/* Not the display face, and deliberately. LK Lumina is condensed — it sets
   "IDEAS IN" at 300 units where Neue Montreal takes 402 — and on a fixed grid
   width is the resource there is most of, so a narrow face spends the budget
   it should be using. Bold made it worse: heavy strokes closed the counters,
   and a D with a filled bowl is just a rectangle. Medium weight at normal
   width gives four-to-five cells of stroke with the counters still open.

   The stack matters as much as the face. Neue Montreal carries no Georgian, so
   Mtavruli falls through per glyph to LK Lumina, which does — measured: the
   Georgian strings come back at exactly LK Lumina's widths through this stack.
   Latin gets the grid-friendly face, Georgian gets the one that can set it. */
const FONT =
  '500 SIZEpx "Neue Montreal", "LK Lumina", Helvetica, Arial, sans-serif';

// alpha is quantised into this many levels so the field can be drawn as a
// handful of batched paths instead of ~11k individual fill() calls
const ABUCKETS = 32;

function init() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const section = canvas.closest(".particle-canvas") || canvas;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const off = document.createElement("canvas");
  const octx = off.getContext("2d", { willReadFrequently: true });

  let w = 0,
    h = 0,
    step = 12,
    cols = 0,
    rows = 0,
    mask = new Float32Array(0);

  let phrase = 0,
    started = 0,
    frame = 0,
    rings = [],
    live = false,
    raf = null;

  function raster(lines) {
    octx.clearRect(0, 0, cols, rows);

    const n = lines.length;
    const setFont = (s) => {
      octx.font = FONT.replace("SIZE", String(s));
    };

    /* Solved, not shrunk. The first version started from a guess and only ever
       stepped DOWN until the line fit, so a short phrase kept the guess and
       rendered at about half the available width — each letter got ~8 cells,
       the counters filled in, and the words read as slabs. Measuring once at a
       reference size and scaling to whichever of width or height binds means
       the type always fills the grid it has. */
    const REF = 100;
    setFont(REF);
    const widestAtRef = lines.reduce(
      (m, l) => Math.max(m, octx.measureText(l).width),
      1,
    );

    const byWidth = ((cols * 0.92) / widestAtRef) * REF;
    // n lines at 0.92 leading, inside 88% of the grid height
    const byHeight = (rows * 0.88) / (n * 0.92);
    const size = Math.max(4, Math.min(byWidth, byHeight));
    setFont(size);

    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";

    const lead = size * 0.92;
    const top = rows / 2 - ((n - 1) * lead) / 2;
    for (let i = 0; i < n; i++) octx.fillText(lines[i], cols / 2, top + i * lead);

    const d = octx.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < cols * rows; i++) mask[i] = d[i * 4 + 3] / 255;
  }

  function measure() {
    const r = section.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Grid resolution is the whole legibility budget. At /38 a cell was 22px
       and a letter stroke was one or two dots, so adjacent letters fused into
       blobs; /54 still only bought about nine cells per character, which is
       under what a counter needs to survive. At /68 — measured on this section
       — a character gets ~17 cells across and a 25-row cap height, which is a
       comfortable dot-matrix cell. Much finer and it stops reading as a sign
       made of dots and just looks like small text. */
    step = Math.max(10, Math.round(Math.min(w, h) / 68));
    cols = Math.ceil(w / step) + 1;
    rows = Math.ceil(h / step) + 1;

    // one offscreen pixel per dot — this is what makes the letters BE dots
    off.width = cols;
    off.height = rows;
    mask = new Float32Array(cols * rows);
    raster(PHRASES[phrase]);
  }

  function draw(t) {
    let local = t - started;
    if (local >= CYCLE) {
      started = t;
      phrase = (phrase + 1) % PHRASES.length;
      raster(PHRASES[phrase]);
      local = 0;
    }

    // the phrase pushes a ring out as it lets go — the only place the old
    // "waves" reading survives, and now the words are what cause it
    if (local === 190) rings.push({ x: w / 2, y: h / 2, born: t });

    const writeP = Math.min(1, local / 70);
    const fade = local < 185 ? 1 : Math.max(0, 1 - (local - 185) / 30);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    /* The finer grid puts ~11k dots on screen, and a beginPath/arc/fill per
       dot is ~11k state changes a frame. Alpha is the only thing that forces a
       new fill, so dots are collected into one path per quantised alpha level
       and each path is filled once: two colours x 32 levels is at most 64
       fills instead of 11k. Radius stays exact, so the swell still reads as a
       smooth wave even though opacity is stepped. Buckets are allocated lazily
       — a frame typically touches only a handful. */
    const dimP = new Array(ABUCKETS).fill(null);
    const litP = new Array(ABUCKETS).fill(null);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * step;
        const y = r * step;

        // writes on left to right instead of appearing all at once
        const reveal = Math.max(
          0,
          Math.min(1, (writeP * (cols + 26) - c) / 26),
        );
        const lit = mask[r * cols + c] * reveal * fade;

        const swell = 0.5 + 0.5 * Math.sin(x * 0.02 + y * 0.016 - t * 0.018);

        let ring = 0;
        for (let i = 0; i < rings.length; i++) {
          const g = rings[i];
          const age = t - g.born;
          if (age < 0 || age > 190) continue;
          const dx = x - g.x;
          const dy = y - g.y;
          const d = Math.sqrt(dx * dx + dy * dy) - age * 2.4;
          if (d > -26 && d < 26) {
            ring = Math.max(ring, Math.cos((d / 26) * 1.57) * (1 - age / 190));
          }
        }

        /* The mask is antialiased, so a dot clipped by a letter edge arrives
           as a fraction. Smoothstep pushes those toward 0 and full cells
           toward 1, which keeps the edge of a letterform crisp instead of
           surrounding every word with a soft coral halo. */
        const litS = lit * lit * (3 - 2 * lit);

        const alpha = 0.1 + 0.13 * swell + ring * 0.42;
        /* Every term is inside one radius budget rather than lit being added
           on top. The old form peaked at 0.20*step + 0.24*step = 0.44*step,
           a dot 0.88 as wide as the cell spacing — so lit neighbours touched
           and a letter read as a solid slab. Capped at 0.30*step a lit dot is
           0.60 of the spacing: still clearly the biggest thing on the grid,
           but with paper visible between every pair. Contrast does the rest,
           since a lit dot is also coral at roughly four times the alpha. */
        const rad = step * (0.11 + 0.05 * swell + ring * 0.07 + 0.14 * litS);
        if (rad < 0.35) continue;

        const isLit = litS > 0.05;
        const a = Math.min(1, isLit ? alpha + litS * 1.1 : alpha);
        const bi = Math.round(a * (ABUCKETS - 1));
        const bucket = isLit ? litP : dimP;
        const p = bucket[bi] || (bucket[bi] = new Path2D());
        // arc() draws a line from the current point to its start, so each dot
        // has to open its own subpath or the field is strung together
        p.moveTo(x + rad, y);
        p.arc(x, y, rad, 0, 6.2832);
      }
    }

    for (let i = 0; i < ABUCKETS; i++) {
      const a = (i / (ABUCKETS - 1)).toFixed(3);
      if (dimP[i]) {
        ctx.fillStyle = `rgba(${DIM}, ${a})`;
        ctx.fill(dimP[i]);
      }
      if (litP[i]) {
        ctx.fillStyle = `rgba(${LIT}, ${a})`;
        ctx.fill(litP[i]);
      }
    }

    while (rings.length && t - rings[0].born > 190) rings.shift();
  }

  function loop() {
    if (!live) return;
    frame += 1;
    draw(frame);
    raf = requestAnimationFrame(loop);
  }

  measure();

  if (reduced) {
    /* One settled frame, phrase fully written, nothing moving.

       The frame has to be taken from inside the hold window — writeP reaches 1
       at local 70 and the dissolve starts at 185. The first version used
       started = -120 with draw(120), which is local 240: past the fade, so
       `fade` evaluated to 0 and the one frame a reduced-motion visitor ever
       sees was an empty grid with no words on it at all. */
    const HOLD = 130;
    started = 0;
    draw(HOLD);
    return;
  }

  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !live) {
        live = true;
        loop();
      } else if (!entry.isIntersecting && live) {
        live = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }
    },
    { rootMargin: "200px" },
  ).observe(section);

  // pointermove covers mouse, pen and touch from one listener — the module
  // this replaces bound `mousemove` only, so a phone got nothing at all
  section.addEventListener(
    "pointermove",
    (e) => {
      const r = section.getBoundingClientRect();
      if (Math.random() < 0.045) {
        rings.push({
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          born: frame,
        });
      }
    },
    { passive: true },
  );

  let resizeTimer = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 180);
    },
    { passive: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
