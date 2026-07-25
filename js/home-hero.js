import gsap from "gsap";

const hero = document.querySelector(".hero");
const heroHeader = document.querySelector(".hero-header");
const particleCanvas = document.querySelector(".particle-canvas");
const particleHeader = document.querySelector(".particle-header");
const particleHeaderText = particleHeader
  ? particleHeader.querySelector("h1")
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
  hero.addEventListener("mouseenter", () => (fluid.style.opacity = "0"));
  hero.addEventListener("mouseleave", () => (fluid.style.opacity = original));
}

function setupInkRoller() {
  const canvas = document.querySelector(".hero-ink");
  if (!hero || !canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dabs = [];
  const MAX_DABS = 200;
  let W = 0;
  let H = 0;
  let raf = null;

  const size = () => {
    const r = hero.getBoundingClientRect();
    W = canvas.width = r.width;
    H = canvas.height = r.height;
  };
  size();
  window.addEventListener("resize", size);

  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    dabs.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 18, life: 1 });
    if (dabs.length > MAX_DABS) dabs.shift();
    if (!raf) raf = requestAnimationFrame(frame);
  });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = dabs.length - 1; i >= 0; i--) {
      const d = dabs[i];
      d.r += (96 - d.r) * 0.05; // the ink spreads
      d.life -= 0.005; // and dries
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

    // stop the loop once the sheet is dry again
    if (dabs.length) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = null;
    }
  }
}

setupInkRoller();
// simulation.js appends its canvas on its own schedule, so look for it after
// the current task rather than racing it
setTimeout(suppressGlobalFluidOverHero, 1200);
