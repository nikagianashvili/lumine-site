// Questions page — renders js/questions-data.js as a dossier: a sticky
// section index on the left, expandable question rows on the right, and a
// filter that narrows the whole page as you type.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTIONS } from "/js/questions-data.js";
import { packages } from "/js/pricing-data.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (href) => (isKa ? `/ka${href}` : href);

const T = {
  filter: isKa ? "მოძებნე კითხვა" : "Filter questions",
  none: isKa
    ? "ამ სიტყვაზე პასუხი ვერ მოიძებნა. სცადე სხვა, ან პირდაპირ გვკითხე."
    : "Nothing matches that. Try another word, or just ask us directly.",
  count: (n) => (isKa ? `${n} პასუხი` : `${n} answers`),
  more: isKa ? "დეტალურად" : "In detail",
};

// ── numbers come from the rate card, never retyped ──────────────────────
const [starter, growth, full] = packages;
const volume = (pkg, label) =>
  pkg.perMonth.find((m) => m.label === label)?.count ?? "";

const TOKENS = {
  "{starter.price}": starter.price,
  "{growth.price}": growth.price,
  "{full.price}": full.price,
  "{starter.posters}": volume(starter, "Posters"),
  "{growth.posters}": volume(growth, "Posters"),
  "{full.posters}": volume(full, "Posters"),
  "{starter.videos}": volume(starter, "Videos"),
  "{growth.videos}": volume(growth, "Videos"),
  "{full.videos}": volume(full, "Videos"),
  // "Site management +300–500₾" → "+300–500₾"; the copy supplies the rest of
  // the sentence, so only the figure is worth pulling through
  "{addon}": starter.addon.replace(/^[^+]*/, ""),
};

function fill(text) {
  return Object.entries(TOKENS).reduce(
    (out, [token, value]) => out.split(token).join(value),
    text,
  );
}

// ── build ────────────────────────────────────────────────────────────────

function buildItem(item, n) {
  const row = document.createElement("div");
  row.className = "qa-item";

  const question = fill(isKa ? item.q_ka : item.q);
  const answer = fill(isKa ? item.a_ka : item.a);
  const detail = (isKa ? item.detail_ka : item.detail) || [];
  const link = item.link;

  row.dataset.search = `${question} ${answer} ${detail.join(" ")}`.toLowerCase();

  const detailHtml = detail.length
    ? `<div class="qa-detail">
         <span class="qa-detail-label">${T.more}</span>
         <ul>${detail.map((d) => `<li>${fill(d)}</li>`).join("")}</ul>
       </div>`
    : "";

  const linkHtml = link
    ? `<a class="qa-link" href="${p(link.href)}">${isKa ? link.label_ka : link.label}</a>`
    : "";

  row.innerHTML = `
    <button class="qa-question" type="button" aria-expanded="false">
      <span class="qa-num">${String(n).padStart(2, "0")}</span>
      <span class="qa-question-text">${question}</span>
      <span class="qa-sign" aria-hidden="true"></span>
    </button>
    <div class="qa-answer">
      <div class="qa-answer-inner">
        <p>${answer}</p>
        ${detailHtml}
        ${linkHtml}
      </div>
    </div>
  `;

  return row;
}

function buildSection(section, startNumber) {
  const el = document.createElement("section");
  el.className = "qa-section";
  el.id = section.id;

  const head = document.createElement("div");
  head.className = "qa-section-head";
  head.innerHTML = `
    <h2>${isKa ? section.title_ka : section.title}</h2>
    <p>${isKa ? section.lede_ka : section.lede}</p>
  `;
  el.appendChild(head);

  const list = document.createElement("div");
  list.className = "qa-list";
  section.items.forEach((item, i) =>
    list.appendChild(buildItem(item, startNumber + i)),
  );
  el.appendChild(list);

  return el;
}

// ── accordion ────────────────────────────────────────────────────────────

function openRow(row) {
  const answer = row.querySelector(".qa-answer");
  const inner = row.querySelector(".qa-answer-inner");
  row.classList.add("is-open");
  row.querySelector(".qa-question").setAttribute("aria-expanded", "true");
  gsap.to(answer, {
    height: inner.offsetHeight,
    duration: 0.5,
    ease: "power3.out",
    // back to auto once open, so a window resize or a font swap cannot leave
    // the panel measured to a height that no longer fits its text
    onComplete: () => gsap.set(answer, { height: "auto" }),
  });
}

function closeRow(row) {
  const answer = row.querySelector(".qa-answer");
  row.classList.remove("is-open");
  row.querySelector(".qa-question").setAttribute("aria-expanded", "false");
  gsap.to(answer, { height: 0, duration: 0.4, ease: "power3.inOut" });
}

function wireAccordion(root) {
  root.querySelectorAll(".qa-item").forEach((row) => {
    row.querySelector(".qa-question").addEventListener("click", () => {
      if (row.classList.contains("is-open")) closeRow(row);
      else openRow(row);
      ScrollTrigger.refresh();
    });
  });
}

// ── section index with scroll-spy ────────────────────────────────────────

function buildIndex(rail, sections, counts) {
  rail.innerHTML = sections
    .map(
      (s, i) => `
      <a class="qa-nav-item" href="#${s.id}" data-target="${s.id}">
        <span class="qa-nav-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="qa-nav-title">${isKa ? s.title_ka : s.title}</span>
        <span class="qa-nav-count">${counts[i]}</span>
      </a>`,
    )
    .join("");

  const links = [...rail.querySelectorAll(".qa-nav-item")];

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.target);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 120;
      if (window.lenis) window.lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    const setActive = () => {
      links.forEach((l) =>
        l.classList.toggle("is-active", l.dataset.target === s.id),
      );
    };
    ScrollTrigger.create({
      trigger: el,
      start: "top 45%",
      end: "bottom 45%",
      onEnter: setActive,
      onEnterBack: setActive,
    });
  });
}

// ── filter ───────────────────────────────────────────────────────────────

function wireFilter(input, root, empty) {
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    let shown = 0;

    root.querySelectorAll(".qa-section").forEach((section) => {
      let sectionShown = 0;
      section.querySelectorAll(".qa-item").forEach((row) => {
        const hit = !term || row.dataset.search.includes(term);
        row.hidden = !hit;
        if (hit) sectionShown++;
      });
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    });

    empty.hidden = shown > 0;
    ScrollTrigger.refresh();
  });
}

// ── init ─────────────────────────────────────────────────────────────────

function init() {
  const root = document.querySelector("#qaSections");
  const rail = document.querySelector("#qaIndex");
  if (!root) return;

  let n = 1;
  const counts = [];
  SECTIONS.forEach((section) => {
    root.appendChild(buildSection(section, n));
    counts.push(section.items.length);
    n += section.items.length;
  });

  const total = n - 1;
  const countEl = document.querySelector("#qaCount");
  if (countEl) countEl.textContent = T.count(total);

  wireAccordion(root);
  if (rail) buildIndex(rail, SECTIONS, counts);

  const input = document.querySelector("#qaFilter");
  const empty = document.querySelector("#qaEmpty");
  if (input && empty) {
    input.placeholder = T.filter;
    empty.textContent = T.none;
    empty.hidden = true;
    wireFilter(input, root, empty);
  }

  // Deep links: /questions#packages, and the chat widget pointing a user at
  // a specific answer.
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(() => {
        const y = target.getBoundingClientRect().top + window.scrollY - 120;
        if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
