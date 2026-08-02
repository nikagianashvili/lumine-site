import gsap from "gsap";

const hero = document.querySelector(".hero");
const heroHeader = document.querySelector(".hero-header");
const particleCanvas = document.querySelector(".particle-canvas");
const particleHeader = document.querySelector(".particle-header");
/* Not `h1`: the studio page's heading outline was rebuilt (one h1 for the
   hero, h2 for section titles) and this silently returned null afterwards,
   which killed the cursor-tilt on "Ideas In Motion" without erroring. Match
   the heading whatever level it is set at. */
const particleHeaderText = particleHeader
  ? particleHeader.querySelector("h1, h2, h3")
  : null;

function setupCursorTilt({ container, target }) {
  if (!container || !target) return;

  const state = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    raf: null,
    isInside: false,
  };

  const LERP = 0.05;
  const MAX_ROTATION = 20;

  const render = () => {
    state.currentX += (state.targetX - state.currentX) * LERP;
    state.currentY += (state.targetY - state.currentY) * LERP;

    gsap.set(target, {
      rotateX: state.currentY,
      rotateY: state.currentX,
      transformPerspective: 1000,
      transformOrigin: "center center",
      force3D: true,
    });

    const isSettled =
      Math.abs(state.currentX - state.targetX) < 0.01 &&
      Math.abs(state.currentY - state.targetY) < 0.01;

    if (isSettled && !state.isInside) {
      state.raf = null;
      return;
    }

    state.raf = requestAnimationFrame(render);
  };

  const ensureLoop = () => {
    if (!state.raf) state.raf = requestAnimationFrame(render);
  };

  container.addEventListener("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    state.targetX = normalizedX * MAX_ROTATION;
    state.targetY = -normalizedY * MAX_ROTATION;
    state.isInside = true;
    ensureLoop();
  });

  container.addEventListener("mouseleave", () => {
    state.targetX = 0;
    state.targetY = 0;
    state.isInside = false;
    ensureLoop();
  });
}

setupCursorTilt({ container: hero, target: heroHeader });
setupCursorTilt({ container: particleCanvas, target: particleHeaderText });

/* ── the roller ───────────────────────────────────────────────────────────
   The cursor lays Spark ink across the hero; each dab spreads and dries.
   CSS screens the canvas into halftone dots, so what the visitor leaves
   behind reads as something printed rather than a glow. Paired with the
   tilt above: the wordmark leans toward the cursor while the ink trails it. */
/* The sitewide cursor fluid (js/simulation.js) paints a difference-blended
   canvas over the whole document. Inside the hero it responds to the same
   cursor as the roller and inverts whatever it crosses — which is what put a
   dark blob across the wordmark. The hero gets the ink; the rest of the site
   keeps the fluid. */
function suppressGlobalFluidOverHero() {
  const fluid = [...document.body.querySelectorAll("canvas")].find(
    (c) =>
      !c.classList.contains("hero-ink") &&
      getComputedStyle(c).mixBlendMode === "difference",
  );
  if (!hero || !fluid) return;

  const original = fluid.style.opacity || "1";
  fluid.style.transition = "opacity 0.45s ease";
  // mousemove, not mouseenter: enter only fires on a real boundary crossing,
  // so a cursor that is already inside the hero would never suppress it
  hero.addEventListener("mousemove", () => {
    if (fluid.style.opacity !== "0") fluid.style.opacity = "0";
  });
  hero.addEventListener("mouseleave", () => (fluid.style.opacity = original));
}

/* The sheet is printed before anyone arrives: the studio's working
   principles sit under the hero in near-invisible ink, and the roller
   develops them. Positions are shuffled once per page load — so a return
   visit uncovers a different arrangement — then held for the whole visit,
   because text that moved while you were drawing would read as a slogan
   generator rather than as something that was already there. */
const PRINCIPLES = [...document.querySelectorAll("#heroPrinciples li")].map(
  (li) => li.textContent.trim(),
);

function layoutPrinciples(W, H, ctx) {
  // keep clear of the wordmark, the dek and the buttons
  const heroRect = hero.getBoundingClientRect();
  const keepOut = [".hero-header", ".hero-sub"]
    .map((sel) => document.querySelector(sel))
    .filter(Boolean)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - heroRect.left - 40,
        y: r.top - heroRect.top - 30,
        w: r.width + 80,
        h: r.height + 60,
      };
    });

  const overlaps = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // Purely random placement clumps: a few lines land on top of each other
  // while whole regions stay bare. Dealing one line per grid cell and
  // jittering inside it keeps them spread while still differing every load.
  const COLS = 3;
  const ROWS = 4;
  const cellW = W / COLS;
  const cellH = H / ROWS;

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) cells.push({ c, r });
  }
  cells.sort(() => Math.random() - 0.5);

  const placed = [];
  const shuffled = [...PRINCIPLES].sort(() => Math.random() - 0.5);

  shuffled.forEach((text) => {
    const w = ctx.measureText(text).width;
    const box = { w: w + 24, h: 34 };

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      // jitter inside the cell, then clamp so long lines stay on the sheet
      const jx = cell.c * cellW + 16 + Math.random() * Math.max(1, cellW - w - 32);
      const jy = cell.r * cellH + 30 + Math.random() * Math.max(1, cellH - 60);
      const cand = {
        x: Math.min(Math.max(24, jx), Math.max(24, W - w - 24)),
        y: Math.min(Math.max(50, jy), H - 40),
        w: box.w,
        h: box.h,
      };

      const clash =
        keepOut.some((k) => overlaps(cand, k)) ||
        placed.some((p) => overlaps(cand, p));

      if (!clash) {
        placed.push({ ...cand, text });
        cells.splice(i, 1); // one line per cell
        return;
      }
    }
  });

  return placed;
}

function setupInkRoller() {
  const canvas = document.querySelector(".hero-ink");
  const script = document.querySelector(".hero-script");
  if (!hero || !canvas) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");
  const sctx = script ? script.getContext("2d") : null;
  if (!ctx) return;

  const dabs = [];
  // a longer dwell means more ink is on the sheet at once, so the cap has to
  // rise with it or the oldest dabs pop out of existence mid-stroke
  const MAX_DABS = 340;
  const HOLD_FRAMES = 70; // ink sits wet before it starts drying
  const DRY_RATE = 0.0032; // then fades over roughly five seconds
  const FONT = "500 13px 'DM Mono', 'Courier New', monospace";
  let W = 0;
  let H = 0;
  let lines = [];
  let raf = null;

  const size = () => {
    const r = hero.getBoundingClientRect();
    W = canvas.width = r.width;
    H = canvas.height = r.height;
    if (script) {
      script.width = r.width;
      script.height = r.height;
    }
    if (sctx) {
      sctx.font = FONT;
      lines = layoutPrinciples(W, H, sctx);
      paintScript();
    }
  };

  // With reduced motion the roller never runs, so the principles simply stay
  // printed — faint, legible, and completely still.
  if (!reduced) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      dabs.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        r: 18,
        life: 1,
        hold: HOLD_FRAMES,
      });
      if (dabs.length > MAX_DABS) dabs.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  // The words are clipped to exactly the shape the roller has painted:
  // draw the ink, switch to source-in so only the overlap survives, then
  // lay the type over it. A ghost pass underneath hints that there is
  // something printed here at all, so nobody has to guess.
  function paintScript() {
    if (!sctx) return;
    sctx.clearRect(0, 0, W, H);
    sctx.font = FONT;
    sctx.textBaseline = "middle";

    // Nothing shows at rest — the sheet looks blank, and the "drag the ink"
    // cue in the corner is what invites the first move. Reduced motion is the
    // exception: with no roller to develop anything, the lines simply print.
    if (reduced) {
      sctx.globalAlpha = 0.34;
      sctx.fillStyle = "#17130F";
      lines.forEach((l) => sctx.fillText(l.text, l.x, l.y));
      sctx.globalAlpha = 1;
      return;
    }

    // Developed: clipped to the shape the roller has actually covered. A clip
    // path rather than a composite operation — the union of the dab arcs is
    // exactly the wet ink, and it survives being rebuilt every frame.
    if (!dabs.length) return;

    sctx.save();
    sctx.beginPath();
    dabs.forEach((d) => {
      sctx.moveTo(d.x + d.r * 0.92, d.y);
      sctx.arc(d.x, d.y, d.r * 0.92, 0, Math.PI * 2);
    });
    sctx.clip();

    // Each line gets the ink wiped off behind it before it is set, so the
    // type lands on clean paper instead of fighting the halftone dots
    // underneath. Signature on a Spark dot field was close to unreadable.
    lines.forEach((l) => {
      const w = sctx.measureText(l.text).width;
      sctx.globalAlpha = 0.94;
      sctx.fillStyle = "#F6F1E7";
      sctx.fillRect(l.x - 10, l.y - 13, w + 20, 26);
    });

    sctx.globalAlpha = 1;
    sctx.fillStyle = "#17130F";
    lines.forEach((l) => sctx.fillText(l.text, l.x, l.y));

    sctx.restore();
    sctx.globalAlpha = 1;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = dabs.length - 1; i >= 0; i--) {
      const d = dabs[i];
      d.r += (96 - d.r) * 0.05; // the ink spreads
      if (d.hold > 0) d.hold--; // stays wet a beat
      else d.life -= DRY_RATE; // then dries
      if (d.life <= 0) {
        dabs.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = d.life * 0.85;
      ctx.fillStyle = "#F2542D";
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    paintScript();

    // stop the loop once the sheet is dry again
    if (dabs.length) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = null;
    }
  }

  size();
  window.addEventListener("resize", size);
}

setupInkRoller();
// simulation.js appends its canvas on its own schedule, so look for it after
// the current task rather than racing it
setTimeout(suppressGlobalFluidOverHero, 1200);
