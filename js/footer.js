// footer.js — the sign-off's motion layer.
//
// This replaces the old WebGL fluid simulation. That sim had gravity, so its
// particles settled to the bottom of the footer — directly on top of the link
// index — and no amount of tuning fixes a settling field sitting over
// navigation. Everything here is deliberately incapable of obscuring content:
// the ink roller *inverts* type rather than covering it, the marquee lives in
// its own strip, and the floor wordmark sits behind nothing.
//
// Four moments:
//   1. ink roller  — a spark disc tracks the cursor across the CTA band and
//                    the headline reads spark inside it, paper outside
//   2. marquee     — the rule between CTA and colophon shifts with scroll velocity
//   3. floor mark  — the giant LUMINE wordmark fills with spark as you land
//   4. magnetic    — the primary action leans toward the cursor
//
// No WebGL, no readback, no per-frame allocation.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Builds the colophon (link index, marquee, floor mark) on every page. Its
// DOMContentLoaded handler registers first because imports evaluate before
// this module's body, so the markup exists by the time init() runs.
import "./footer-links.js";

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = window.matchMedia("(pointer: fine)").matches;

/* ── 1 · the ink roller ──────────────────────────────────────────────────
   A duplicate of the headline in Spark sits exactly over the paper original
   and is clipped to a circle that follows the cursor — so the type flips
   colour under the roller instead of being hidden behind anything. The
   duplicate is built from plain text captured before SplitText runs, so the
   two layers can never disagree about their markup. */
function initInkRoller(footer) {
  if (!FINE || REDUCED) return;

  const band = footer.querySelector(".footer-inner");
  const heading = footer.querySelector(".footer-cta-heading");
  if (!band || !heading) return;

  const fill = document.createElement("span");
  fill.className = "footer-cta-heading--fill";
  fill.setAttribute("aria-hidden", "true");
  fill.textContent = heading.textContent.trim();
  heading.insertAdjacentElement("afterend", fill);

  // The fill is a sibling of the heading (inserting it *inside* would feed
  // its text to SplitText and duplicate the headline), so it has to be
  // parked over the heading's box by hand and re-parked whenever the type
  // reflows.
  const align = () => {
    fill.style.top = `${heading.offsetTop}px`;
    fill.style.left = `${heading.offsetLeft}px`;
    fill.style.width = `${heading.offsetWidth}px`;
  };
  align();
  window.addEventListener("resize", align);
  if (document.fonts?.ready) document.fonts.ready.then(align);

  let r = 0;
  const pos = { x: -9999, y: -9999 };
  const target = { x: -9999, y: -9999 };
  let raf = null;

  const paint = () => {
    pos.x += (target.x - pos.x) * 0.16;
    pos.y += (target.y - pos.y) * 0.16;
    fill.style.clipPath = `circle(${r}px at ${pos.x}px ${pos.y}px)`;
    raf = requestAnimationFrame(paint);
  };

  // Driven by mousemove rather than mouseenter: enter fires only on a real
  // pointer boundary crossing, so a cursor that starts inside the band (or
  // arrives during a scroll) would never open the roller.
  const proxy = { v: 0 };
  let open = false;

  const grow = () => {
    if (open) return;
    open = true;
    gsap.to(proxy, {
      v: 190,
      duration: 0.55,
      ease: "power3.out",
      onUpdate: () => { r = proxy.v; },
    });
  };

  band.addEventListener("mousemove", (e) => {
    const box = fill.getBoundingClientRect();
    target.x = e.clientX - box.left;
    target.y = e.clientY - box.top;
    if (pos.x < -999) {
      pos.x = target.x;
      pos.y = target.y;
    }
    grow();
    if (!raf) raf = requestAnimationFrame(paint);
  });

  band.addEventListener("mouseleave", () => {
    open = false;
    gsap.to(proxy, {
      v: 0,
      duration: 0.4,
      ease: "power3.in",
      onUpdate: () => { r = proxy.v; },
      onComplete: () => {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        pos.x = -9999;
        fill.style.clipPath = "circle(0px at -9999px -9999px)";
      },
    });
  });
}

/* ── 2 · marquee ─────────────────────────────────────────────────────────
   Runs at a constant creep and speeds up with scroll velocity, so the strip
   registers movement through the page without ever demanding attention. */
function initMarquee(footer) {
  const track = footer.querySelector(".footer-marquee-track");
  if (!track || REDUCED) return;

  const loop = gsap.to(track, {
    xPercent: -50,
    ease: "none",
    duration: 26,
    repeat: -1,
  });

  let idle;
  window.addEventListener(
    "scroll",
    () => {
      loop.timeScale(3.2);
      clearTimeout(idle);
      idle = setTimeout(() => gsap.to(loop, { timeScale: 1, duration: 0.8 }), 120);
    },
    { passive: true },
  );
}

/* ── 3 · the floor mark ──────────────────────────────────────────────────
   The wordmark is drawn as an outline and inks in from the left as the last
   screen arrives — the page finishing its own print run. */
function initFloorMark(footer) {
  const fill = footer.querySelector(".footer-mark-fill");
  if (!fill) return;

  if (REDUCED) {
    fill.style.clipPath = "inset(0 0 0 0)";
    return;
  }

  gsap.fromTo(
    fill,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      ease: "none",
      scrollTrigger: {
        trigger: footer.querySelector(".footer-mark"),
        start: "top 95%",
        end: "bottom bottom",
        scrub: 0.6,
      },
    },
  );
}

/* ── 4 · magnetic primary action ─────────────────────────────────────── */
function initMagnetic(footer) {
  if (!FINE || REDUCED) return;
  const btn = footer.querySelector(".footer-cta-actions .btn");
  if (!btn) return;

  const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
  const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });

  btn.addEventListener("mousemove", (e) => {
    const b = btn.getBoundingClientRect();
    xTo(((e.clientX - b.left) / b.width - 0.5) * 26);
    yTo(((e.clientY - b.top) / b.height - 0.5) * 16);
  });
  btn.addEventListener("mouseleave", () => {
    xTo(0);
    yTo(0);
  });
}

function init() {
  const footer = document.querySelector("footer");
  if (!footer) return;
  initInkRoller(footer);
  initMarquee(footer);
  initFloorMark(footer);
  initMagnetic(footer);
}

// footer-links.js injects the marquee and floor mark, so wait for it rather
// than racing it.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(init));
} else {
  requestAnimationFrame(init);
}
