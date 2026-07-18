import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services, getService } from "/js/services-data.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const L = isKa
  ? {
      theProblem: "პრობლემა",
      whatWeDo: "რას ვაკეთებთ",
      howItRuns: "როგორ მუშაობს",
      whatYouGet: "რას იღებთ",
      nextService: "შემდეგი სერვისი",
      seeWork: "იხილეთ ნამუშევრები",
    }
  : {
      theProblem: "The Problem",
      whatWeDo: "What We Do",
      howItRuns: "How It Runs",
      whatYouGet: "What You Walk Away With",
      nextService: "Next Service",
      seeWork: "See The Work",
    };

// Picks `${field}_ka` when present (non-empty) and the page is under /ka/,
// otherwise falls back to the English field — same convention as project.js.
function t(service, field) {
  if (isKa && service[`${field}_ka`]) return service[`${field}_ka`];
  return service[field];
}

function heroSection(service) {
  const chips = (service.chips || [])
    .map((c) => `<span class="cs-chip">${c}</span>`)
    .join("");
  return `
    <section class="svcd-hero">
      <div class="container">
        <p class="svcd-hero-index pd-reveal">${service.index}</p>
        <h1 class="pd-reveal">${t(service, "title")}</h1>
        <p class="pd-hero-tagline pd-reveal">${t(service, "heroTagline")}</p>
        <div class="pd-hero-tech pd-reveal">${chips}</div>
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
                <a href="${p("/work")}?service=${service.workFilter}" class="btn btn-outline pd-reveal">${L.seeWork}</a>
              </div>`
            : ""
        }
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
        <h3>${t(next, "title")}</h3>
        <span class="cs-next-arrow">↗</span>
      </div>
    </a>
  `;
}

function buildTemplate(service) {
  return [
    heroSection(service),
    twoColSection(L.theProblem, `<h6 class="pd-reveal">${t(service, "problem")}</h6>`),
    twoColSection(L.whatWeDo, `<p class="svcd-problem-copy pd-reveal">${t(service, "whatWeDo")}</p>`),
    processSection(service),
    deliverablesSection(service),
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
    ScrollTrigger.refresh();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
