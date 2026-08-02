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
  const LAST = RULES.length - 1;
  const SPAN_K = RULES[LAST].k - RULES[0].k;
  const pctOfRule = (i) => (RULES[i].k - RULES[0].k) / SPAN_K;

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

  function setTint(k) {
    mount.style.setProperty("--k-rgb", rgbOf(k));
  }

  function paintText(i) {
    const r = RULES[i];
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

  function showRule(i, animate = true) {
    if (i === active) return;
    active = i;

    /* The text is written synchronously, before any tween, and the animation
       only ever moves it. The obvious version fades out, swaps on complete,
       fades back in — but under a scrub the reader can cross three stops in
       one flick, so that tween gets killed mid-fade and leaves the readout
       stranded at opacity 0 showing the previous rule. Painting first means
       the worst a killed tween can do is skip an animation. */
    paintText(i);

    if (!animate || reduced) {
      gsap.set(stage, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      stage,
      { opacity: 0.2, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power3.out",
        // rapid crossings restart the swap rather than stacking six of them
        overwrite: true,
      },
    );
  }

  paintText(0);
  setTint(RULES[0].k);
  active = 0;
  gsap.set(lamp, { x: lampX(0) });

  const mm = gsap.matchMedia();

  /* — desktop: the rail is driven by the page, not by the pointer —
     Hovering six buttons made the section a thing you had to discover and
     then operate. Pinned and scrubbed, the reader just keeps scrolling and
     the lamp walks the scale for them: the lamp position and the colour
     temperature are continuous, and only the name snaps, at the moment the
     lamp actually crosses that stop. Held for 1.6 screens, which is enough
     for six rules to each get a beat without adding another long pin to a
     page that already has two. */
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const st = ScrollTrigger.create({
      trigger: mount,
      start: "top top",
      end: () => `+=${window.innerHeight * 1.6}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const a = lampX(0);
        const b = lampX(LAST);

        gsap.set(lamp, { x: a + (b - a) * p });
        setTint(RULES[0].k + SPAN_K * p);

        // the last stop whose mark the lamp has actually reached
        let i = 0;
        for (let n = 0; n <= LAST; n++) if (p >= pctOfRule(n) - 0.001) i = n;
        showRule(i);
      },
    });

    /* The stops stay real buttons for keyboard and for anyone who wants to
       jump — but they move the page rather than setting state behind its
       back, so the scroll position and the lit rule can never disagree. */
    const jump = (i) => {
      const y = st.start + (st.end - st.start) * pctOfRule(i);
      if (window.lenis?.scrollTo) window.lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: "smooth" });
    };
    const onClick = buttons.map((b, i) => {
      const fn = () => jump(i);
      b.addEventListener("click", fn);
      return fn;
    });

    return () => {
      st.kill();
      buttons.forEach((b, i) => b.removeEventListener("click", onClick[i]));
    };
  });

  /* — phone, and anything under reduced motion —
     No pin here: hijacking the scroll on a touch device to run a six-step
     animation is the thing that makes people close the tab. The rail is
     vertical and every rule is already legible, so tapping one lights it. */
  mm.add("(max-width: 900px), (prefers-reduced-motion: reduce)", () => {
    const handlers = buttons.map((b, i) => {
      const fn = () => {
        showRule(i, !reduced);
        setTint(RULES[i].k);
        gsap.set(lamp, { x: lampX(i) });
      };
      b.addEventListener("click", fn);
      return fn;
    });

    return () => {
      buttons.forEach((b, i) => b.removeEventListener("click", handlers[i]));
    };
  });

  window.addEventListener(
    "resize",
    () => {
      if (active >= 0) gsap.set(lamp, { x: lampX(active) });
    },
    { passive: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
