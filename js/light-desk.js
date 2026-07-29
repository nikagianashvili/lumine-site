// The Light Desk — the studio's working rules, plotted on a colour-temperature rail.
//
// This replaced a three-column grid of six value cards: an icon-less box, a
// two-word virtue, one line of copy, times six. It is the section every
// agency site ships, and six interchangeable adjectives in six identical
// boxes give a reader no reason to look at the second one.
//
// The studio is called Lumine and its people actually shoot and grade, so
// the instrument that sorts these rules is one they already own: a Kelvin
// scale. The axis carries real information rather than decorating the list —
// it runs from how we treat the client (2400K, candlelight, a promise) to
// how we measure the work (7000K, cold overcast daylight, measurement). Read
// left to right it is a single sentence about the studio, which six boxes in
// a grid could never be.
//
// "Balanced" sits at the neutral hinge on purpose. That joke only lands if
// the scale underneath it is honest, which is why the rail's colours are
// computed blackbody values (Tanner Helland's approximation) rather than a
// gradient somebody picked to look warm-to-cool.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toMtavruli } from "/js/mtavruli.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const RULES_EN = [
  {
    k: 2400,
    name: "Trustworthy",
    line: "Deadlines and prices mean what they say.",
  },
  {
    k: 3000,
    name: "Communicative",
    line: "You always know where your project stands.",
  },
  {
    k: 3800,
    name: "Balanced",
    line: "Humor and seriousness, each where it belongs.",
  },
  {
    k: 4600,
    name: "Creatively Free",
    line: "Bold ideas welcome — from our side and yours.",
  },
  {
    k: 5600,
    name: "Curious",
    line: "Always learning — new tools, new formats, on purpose.",
  },
  {
    k: 7000,
    name: "Results-Oriented",
    line: "Pretty that doesn't perform is just expensive.",
  },
];

const RULES_KA = [
  {
    k: 2400,
    name: "სანდო",
    line: "ვადები და ფასები ნიშნავს იმას, რასაც ამბობს.",
  },
  {
    k: 3000,
    name: "კომუნიკაბელური",
    line: "ყოველთვის იცით, სად დგას თქვენი პროექტი.",
  },
  {
    k: 3800,
    name: "დაბალანსებული",
    line: "იუმორი და სერიოზულობა, თითოეული თავის ადგილას.",
  },
  {
    k: 4600,
    name: "შემოქმედებითად თავისუფალი",
    line: "თამამი იდეები მისასალმებელია — ჩვენი მხრიდანაც და თქვენიდანაც.",
  },
  {
    k: 5600,
    name: "ცნობისმოყვარე",
    line: "მუდამ ვსწავლობთ — ახალი ხელსაწყოები, ახალი ფორმატები, განზრახ.",
  },
  {
    k: 7000,
    name: "შედეგზე ორიენტირებული",
    line: "ლამაზი, რომელიც არ მუშაობს, უბრალოდ ძვირია.",
  },
];

const RULES = isKa ? RULES_KA : RULES_EN;

const COPY = isKa
  ? {
      head: "სახლის წესები",
      warm: "როგორ გექცევით",
      cool: "როგორ ვზომავთ სამუშაოს",
      group: "სახლის წესები ფერის ტემპერატურის მიხედვით",
    }
  : {
      head: "House Rules",
      warm: "How we treat you",
      cool: "How we measure the work",
      group: "House rules by colour temperature",
    };

/* Tanner Helland's blackbody approximation. The point is that nobody chose
   these colours — 2400K really is that orange and 7000K really is that blue,
   so the rail is a measurement rather than a mood. */
function kelvinToRgb(k) {
  const t = k / 100;
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);

  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492);

  const b =
    t >= 66
      ? 255
      : t <= 19
        ? 0
        : 138.5177312231 * Math.log(t - 10) - 305.0447927307;

  return [clamp(r), clamp(g), clamp(b)];
}

const rgbOf = (k) => kelvinToRgb(k).join(" ");

function build(mount) {
  mount.innerHTML = `
    <div class="container">
      <div class="lightdesk-head">
        <p class="eyebrow">${RULES[0].k}K — ${RULES[RULES.length - 1].k}K</p>
        <h2 data-animate-variant="slide" data-animate-on-scroll="true">${COPY.head}</h2>
      </div>

      <div class="lightdesk-stage" aria-live="polite">
        <div class="lightdesk-readout">
          <p class="lightdesk-k"></p>
          <p class="lightdesk-name"></p>
        </div>
        <p class="lightdesk-line"></p>
      </div>

      <div class="lightdesk-rail">
        <div class="lightdesk-beam" aria-hidden="true"></div>
        <div class="lightdesk-lamp" aria-hidden="true"></div>
        <div class="lightdesk-stops" role="group" aria-label="${COPY.group}">
          ${RULES.map(
            (r, i) => `
            <button type="button" class="lightdesk-stop" data-i="${i}" aria-pressed="${i === 0}">
              <span class="lightdesk-dot" aria-hidden="true"></span>
              <span class="lightdesk-stop-k">${r.k}K</span>
              <span class="lightdesk-stop-name">${r.name}</span>
            </button>`,
          ).join("")}
        </div>
      </div>

      <div class="lightdesk-axis">
        <span>${COPY.warm}</span>
        <span>${COPY.cool}</span>
      </div>
    </div>
  `;

  /* One number drives both the gradient and the stop placement, so a dot can
     never drift off the colour it names. Change a rule's kelvin and the whole
     instrument re-scales itself. */
  const span = RULES[RULES.length - 1].k - RULES[0].k;
  const pctOf = (k) => ((k - RULES[0].k) / span) * 100;

  const stopColours = RULES.map(
    (r) => `rgb(${kelvinToRgb(r.k).join(",")}) ${pctOf(r.k).toFixed(2)}%`,
  ).join(", ");
  mount.querySelector(".lightdesk-beam").style.backgroundImage =
    `linear-gradient(90deg, ${stopColours})`;

  mount.querySelectorAll(".lightdesk-stop").forEach((btn, i) => {
    btn.style.left = `${pctOf(RULES[i].k).toFixed(2)}%`;
  });
}

function init() {
  const mount = document.querySelector("[data-lightdesk]");
  if (!mount) return;

  build(mount);

  const stage = mount.querySelector(".lightdesk-stage");
  const kEl = mount.querySelector(".lightdesk-k");
  const nameEl = mount.querySelector(".lightdesk-name");
  const lineEl = mount.querySelector(".lightdesk-line");
  const lamp = mount.querySelector(".lightdesk-lamp");
  const rail = mount.querySelector(".lightdesk-rail");
  const buttons = [...mount.querySelectorAll(".lightdesk-stop")];

  let active = -1;

  /* Measured off the rendered dot rather than offsetLeft: the stops carry a
     translateX (-50% in the middle, -100% at the cool end) which offsetLeft
     does not account for, so offsets would put the lamp beside its mark
     instead of on it. Rects include the transform. */
  function lampX(i) {
    const dot = buttons[i]
      .querySelector(".lightdesk-dot")
      .getBoundingClientRect();
    const railBox = rail.getBoundingClientRect();
    return dot.left + dot.width / 2 - railBox.left;
  }

  function paint(i) {
    const r = RULES[i];
    mount.style.setProperty("--k-rgb", rgbOf(r.k));
    kEl.textContent = `${r.k}K`;
    /* The readout is display type, so on /ka/ it has to be Mtavruli like
       every heading around it — and it is re-set on every stop change, so it
       cannot be left to the one-shot pass in mtavruli.js. */
    nameEl.textContent = isKa ? toMtavruli(r.name) : r.name;
    lineEl.textContent = r.line;
    buttons.forEach((b, n) => {
      b.setAttribute("aria-pressed", String(n === i));
      b.classList.toggle("is-on", n === i);
    });
  }

  function select(i, animate = true) {
    if (i === active) return;
    active = i;

    if (reduced || !animate) {
      paint(i);
      gsap.set(lamp, { x: lampX(i) });
      return;
    }

    // the readout swaps under the lamp's arrival, not before it
    gsap.to(stage, {
      opacity: 0,
      y: -6,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        paint(i);
        gsap.fromTo(
          stage,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" },
        );
      },
    });

    gsap.to(lamp, { x: lampX(i), duration: 0.55, ease: "power3.inOut" });
  }

  buttons.forEach((b, i) => {
    b.addEventListener("click", () => select(i));
    b.addEventListener("mouseenter", () => select(i));
    b.addEventListener("focus", () => select(i));
  });

  // start lit at the warm end
  paint(0);
  active = 0;
  gsap.set(lamp, { x: lampX(0) });

  window.addEventListener(
    "resize",
    () => {
      if (active >= 0) gsap.set(lamp, { x: lampX(active) });
    },
    { passive: true },
  );

  if (reduced) return;

  /* One sweep the length of the rail when the section arrives, then it
     settles back on the warm end — the desk being switched on and checked,
     which is also the only way a first-time reader learns the rail is live. */
  ScrollTrigger.create({
    trigger: mount,
    start: "top 70%",
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      tl.to(lamp, {
        x: lampX(RULES.length - 1),
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          // tint tracks the lamp across the sweep instead of jumping at the end
          const x = gsap.getProperty(lamp, "x");
          const a = lampX(0);
          const b = lampX(RULES.length - 1);
          const p = gsap.utils.clamp(0, 1, (x - a) / (b - a));
          mount.style.setProperty(
            "--k-rgb",
            rgbOf(RULES[0].k + (RULES[RULES.length - 1].k - RULES[0].k) * p),
          );
        },
      }).to(lamp, {
        x: lampX(0),
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => paint(0),
      });
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
