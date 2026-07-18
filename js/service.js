import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services, getService } from "/js/services-data.js";
import { initAnimatedCopy } from "/js/animated-copy.js";
import { initMagneticButtons } from "/js/home-extras.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const L = isKa
  ? {
      theProblem: "პრობლემა",
      whatWeDo: "რას ვაკეთებთ",
      subservices: "დეტალურად",
      howItRuns: "როგორ მუშაობს",
      whatYouGet: "რას იღებთ",
      faq: "ხშირად დასმული კითხვები",
      nextService: "შემდეგი სერვისი",
      seeWork: "იხილეთ ნამუშევრები",
      startingAt: "ღირებულება",
      ctaEyebrow: "მზად ხართ?",
      ctaHeading: "მოდით ვისაუბროთ ამ სერვისზე",
      ctaButton: "დაგვიკავშირდით",
    }
  : {
      theProblem: "The Problem",
      whatWeDo: "What We Do",
      subservices: "In Detail",
      howItRuns: "How It Runs",
      whatYouGet: "What You Walk Away With",
      faq: "Frequently Asked Questions",
      nextService: "Next Service",
      seeWork: "See The Work",
      startingAt: "Investment",
      ctaEyebrow: "Ready?",
      ctaHeading: "Let's talk about this service",
      ctaButton: "Get In Touch",
    };

// Picks `${field}_ka` when present (non-empty) and the page is under /ka/,
// otherwise falls back to the English field — same convention as project.js.
function t(service, field) {
  if (isKa && service[`${field}_ka`]) return service[`${field}_ka`];
  return service[field];
}

// Wraps the final word of a title in .accent for the two-tone display
// treatment - a small, consistent rule instead of a hand-picked word per
// service, so every hero gets the same punchline emphasis.
function accentLastWord(title) {
  const words = title.trim().split(" ");
  const last = words.pop();
  return `${words.join(" ")} <span class="accent">${last}</span>`;
}

// One SVG/CSS motif per service, sitting behind the title on the right
// half of the hero - never behind the reading column on the left.
const MOTIFS = {
  strategy: () => `
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      <line class="draw" x1="40" y1="260" x2="360" y2="40" stroke="var(--accent)" stroke-width="1.5" />
      <line class="draw draw2" x1="60" y1="60" x2="340" y2="220" stroke="var(--l)" stroke-width="1" />
      <line class="draw draw3" x1="30" y1="150" x2="370" y2="150" stroke="var(--accent-pastel)" stroke-width="1" />
    </svg>`,
  photography: () => `
    <div class="frame" tabindex="0"></div><div class="frame" tabindex="0"></div><div class="frame" tabindex="0"></div>`,
  video: () => `
    <span class="scrub"></span>
    ${Array.from({ length: 10 }, (_, i) => `<span class="frame-tick" style="left:${i * 11}%"></span>`).join("")}`,
  brand: () => `<span></span><span></span><span></span><span></span><span></span>`,
  smm: () => `<span></span><span></span><span></span><span></span>`,
  marketing: () => `<span class="ring"></span><span class="ring"></span><span class="ring"></span>`,
  web: () => Array.from({ length: 16 }, () => `<span></span>`).join(""),
  printing: () => `<span class="sweep"></span>`,
};

function aiDemoMarkup() {
  return `
    <div class="motif-ai-demo pd-reveal">
      <div class="motif-ai-demo-head"><span class="motif-ai-demo-dot"></span> Lumine AI Front Office — live</div>
      <div id="aiDemoThread"></div>
    </div>`;
}

function heroSection(service) {
  const chips = (service.chips || [])
    .map((c) => `<span class="cs-chip">${c}</span>`)
    .join("");
  const motifBody = service.slug === "ai" ? aiDemoMarkup() : MOTIFS[service.slug] ? MOTIFS[service.slug]() : "";
  const motifWrap = service.slug === "ai" ? motifBody : motifBody ? `<div class="svcd-motif motif-${service.slug}">${motifBody}</div>` : "";
  return `
    <section class="svcd-hero">
      ${motifWrap}
      <div class="container svcd-hero-inner">
        <p class="svcd-hero-index pd-reveal">${service.index}</p>
        <h1
          data-animate-variant="slide-words"
          data-animate-on-scroll="false"
          data-animate-delay="0.15"
        >${accentLastWord(t(service, "title"))}</h1>
        <p class="pd-hero-tagline pd-reveal">${t(service, "heroTagline")}</p>
        <div class="pd-hero-tech pd-reveal">${chips}</div>
        <p class="svcd-hero-price pd-reveal">
          <span>${L.startingAt}</span> ${t(service, "price")}
        </p>
      </div>
    </section>
  `;
}

function subservicesSection(service) {
  const items = service.subservices || [];
  return `
    <section class="svcd-subservices">
      <div class="container">
        <p class="cs-phase pd-reveal">${L.subservices}</p>
        <div class="svcd-subgrid">
          ${items
            .map(
              (s, i) => `
            <div class="svcd-subcard pd-reveal">
              <span class="svcd-subcard-num">${String(i + 1).padStart(2, "0")}</span>
              <h5>${isKa && s.name_ka ? s.name_ka : s.name}</h5>
              <p>${isKa && s.desc_ka ? s.desc_ka : s.desc}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function twoColSection(label, bodyHtml) {
  return `
    <section class="sample-project-details svcd-problem">
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

function processSection(service) {
  const steps = (isKa && service.process_ka ? service.process_ka : service.process) || [];
  return `
    <section class="svcd-process">
      <div class="container">
        <p class="cs-phase pd-reveal">${L.howItRuns}</p>
        <div class="svcd-process-grid">
          ${steps
            .map(
              (s) => `
            <div class="svcd-step pd-reveal">
              <h5>${s.title}</h5>
              <p>${s.body}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function deliverablesSection(service) {
  const items = (isKa && service.deliverables_ka ? service.deliverables_ka : service.deliverables) || [];
  return `
    <section class="cs-deliverables">
      <div class="container">
        <p class="cs-phase pd-reveal">${L.whatYouGet}</p>
        <div class="cs-chips">
          ${items.map((i) => `<span class="cs-chip pd-reveal">${i}</span>`).join("")}
        </div>
        ${
          service.workFilter
            ? `<div style="margin-top:2.5rem;">
                <a href="${p("/work")}?service=${service.workFilter}" class="btn btn-outline pd-reveal" data-magnetic>${L.seeWork}</a>
              </div>`
            : ""
        }
      </div>
    </section>
  `;
}

function faqSection(service) {
  const items = (isKa && service.faq_ka ? service.faq_ka : service.faq) || [];
  if (!items.length) return "";
  return `
    <section class="svcd-faq">
      <div class="container">
        <p class="cs-phase pd-reveal">${L.faq}</p>
        <div class="svcd-faq-list">
          ${items
            .map(
              (item, i) => `
            <div class="svcd-faq-item pd-reveal">
              <button type="button" class="svcd-faq-head" aria-expanded="false" data-faq-index="${i}">
                <span class="svcd-faq-q">${item.q}</span>
                <span class="svcd-faq-plus" aria-hidden="true"></span>
              </button>
              <div class="svcd-faq-body">
                <p class="svcd-faq-a">${item.a}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function ctaSection(service) {
  return `
    <section class="svcd-cta grain">
      <div class="container">
        <p class="svcd-cta-eyebrow pd-reveal">${L.ctaEyebrow}</p>
        <h3 data-animate-variant="slide" data-animate-on-scroll="true">${L.ctaHeading}</h3>
        <a href="${p("/contact")}?service=${encodeURIComponent(service.slug)}" class="btn btn-solid pd-reveal" data-magnetic>${L.ctaButton}</a>
      </div>
    </section>
  `;
}

function nextSection(current) {
  const idx = services.findIndex((s) => s.slug === current.slug);
  const next = services[(idx + 1) % services.length];
  return `
    <a href="${p("/service")}?slug=${next.slug}" class="cs-next grain">
      <div class="container">
        <span class="cs-next-label">${L.nextService}</span>
        <h3 data-animate-variant="slide" data-animate-on-scroll="true">${t(next, "title")}</h3>
        <span class="cs-next-arrow">↗</span>
      </div>
    </a>
  `;
}

function buildTemplate(service) {
  return [
    heroSection(service),
    twoColSection(
      L.theProblem,
      `<h6 data-animate-variant="slide" data-animate-on-scroll="true">${t(service, "problem")}</h6>`,
    ),
    twoColSection(L.whatWeDo, `<p class="svcd-problem-copy pd-reveal">${t(service, "whatWeDo")}</p>`),
    subservicesSection(service),
    processSection(service),
    deliverablesSection(service),
    faqSection(service),
    ctaSection(service),
    nextSection(service),
  ].join("");
}

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

// Same single-open-at-a-time, measured-height accordion as journal.js -
// reimplemented locally rather than imported, since journal.js self-inits
// on its own DOMContentLoaded pass against markup that doesn't exist yet
// on this page (same timing issue as animated-copy.js/home-extras.js above).
function initFaqAccordion(root) {
  const items = root.querySelectorAll(".svcd-faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const head = item.querySelector(".svcd-faq-head");
    const body = item.querySelector(".svcd-faq-body");
    const answer = item.querySelector(".svcd-faq-a");

    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        if (other === item) return;
        if (other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          other.querySelector(".svcd-faq-head").setAttribute("aria-expanded", "false");
          gsap.to(other.querySelector(".svcd-faq-body"), { height: 0, duration: 0.5, ease: "power2.inOut" });
        }
      });

      item.classList.toggle("is-open", !isOpen);
      head.setAttribute("aria-expanded", String(!isOpen));
      gsap.to(body, {
        height: isOpen ? 0 : answer.offsetHeight,
        duration: 0.6,
        ease: "power3.inOut",
      });
    });
  });
}

// AI page only: a small live-looking demo thread in the hero, auto-cycling
// between a couple of illustrative exchanges. Dummy conversation content,
// not a real transcript - it's a UX demo, not a claimed metric.
function initAiDemo(root) {
  const thread = root.querySelector("#aiDemoThread");
  if (!thread) return;

  const exchanges = isKa
    ? [
        [
          { from: "user", text: "ხუთშაბათს ნაშუადღევს თავისუფალი გაქვთ?" },
          { from: "bot", text: "დიახ — 14:00 ან 16:30. დაგიჯავშნოთ?" },
        ],
        [
          { from: "user", text: "რა ღირს საწყისი პაკეტი?" },
          { from: "bot", text: "1,000–1,500₾ თვეში. გამოგიგზავნოთ სრული დეტალები?" },
        ],
      ]
    : [
        [
          { from: "user", text: "Do you have anything free Thursday afternoon?" },
          { from: "bot", text: "Yes — 2:00 PM or 4:30 PM are open. Book one for you?" },
        ],
        [
          { from: "user", text: "How much is the Starter package?" },
          { from: "bot", text: "1,000–1,500₾ a month. Want the full breakdown by email?" },
        ],
      ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    thread.innerHTML = exchanges[0]
      .map((m) => `<p class="motif-ai-demo-msg from-${m.from}" style="opacity:1">${m.text}</p>`)
      .join("");
    return;
  }

  let i = 0;
  function playExchange() {
    thread.innerHTML = "";
    const pair = exchanges[i % exchanges.length];
    i++;
    const bubbles = pair.map((m) => {
      const el = document.createElement("p");
      el.className = `motif-ai-demo-msg from-${m.from}`;
      el.textContent = m.text;
      thread.appendChild(el);
      return el;
    });
    gsap.set(bubbles, { opacity: 0, y: 10 });
    gsap.to(bubbles, { opacity: 1, y: 0, duration: 0.5, stagger: 0.4, ease: "power2.out" });
    setTimeout(() => {
      gsap.to(bubbles, {
        opacity: 0,
        y: -8,
        duration: 0.4,
        ease: "power2.in",
        onComplete: playExchange,
      });
    }, 3600);
  }
  playExchange();
}

function init() {
  const main = document.getElementById("svcMain");
  const notFound = document.getElementById("svcNotFound");
  if (!main) return;

  const langLink = document.getElementById("navLangKa") || document.getElementById("navLangEn");
  if (langLink) langLink.href += window.location.search;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const service = slug ? getService(slug) : null;

  if (!service) {
    main.hidden = true;
    notFound.hidden = false;
    document.title = isKa ? "სერვისი ვერ მოიძებნა | Lumine" : "Service Not Found | Lumine";
    return;
  }

  main.classList.add("svcd");
  main.innerHTML = buildTemplate(service);
  document.title = `${t(service, "title")} | Lumine`;

  gsap.set(main.querySelectorAll(".pd-reveal"), { opacity: 0, y: 30 });
  requestAnimationFrame(() => {
    initReveals(main);
    initMagneticButtons();
    initFaqAccordion(main);
    initAiDemo(main);
    ScrollTrigger.refresh();
  });

  // The hero title and problem statement use the site's real SplitText
  // line-mask reveal (animated-copy.js) instead of the simpler block fade
  // above - initAnimatedCopy() only auto-runs once at initial page load, so
  // it has to be called again explicitly now that this content exists.
  const fontsReady = document.fonts?.ready;
  const runAnimatedCopy = () => {
    initAnimatedCopy(main);
    ScrollTrigger.refresh();
  };
  if (fontsReady && typeof fontsReady.then === "function") {
    fontsReady.then(runAnimatedCopy);
  } else {
    runAnimatedCopy();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
