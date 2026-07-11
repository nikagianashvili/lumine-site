import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { packages, singles, pricingNote, pricingNote_ka } from "/js/pricing-data.js";

gsap.registerPlugin(ScrollTrigger);

const LANG_KEY = "lumine-lang";
const currentLang = () => localStorage.getItem(LANG_KEY) || "en";

const UI = {
  en: { mostBooked: "Most Booked", perMonth: " / month", startWith: "Start With" },
  ka: { mostBooked: "ყველაზე პოპულარული", perMonth: " / თვეში", startWith: "დაწყება" },
};

function packageInnerHTML(pkg, lang) {
  const t = UI[lang];
  const name = lang === "ka" ? pkg.name_ka : pkg.name;
  const includes = lang === "ka" ? pkg.includes_ka : pkg.includes;

  return `
    ${pkg.featured ? `<span class="price-flag">${t.mostBooked}</span>` : ""}
    <span class="price-numeral">${pkg.numeral}</span>
    <div class="price-card-head">
      <h6>${name}</h6>
      <p class="price-amount">${pkg.price}<span>${t.perMonth}</span></p>
    </div>
    <div class="price-counts">
      ${pkg.perMonth
        .map(
          (item) => `
        <div class="price-count">
          <span class="price-count-num">${item.count}</span>
          <span class="price-count-label">${lang === "ka" ? item.label_ka : item.label}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <ul class="price-includes">
      ${includes.map((line) => `<li>${line}</li>`).join("")}
    </ul>
    <p class="price-addon">${lang === "ka" ? pkg.addon_ka : pkg.addon}</p>
    <a href="/contact" class="btn ${pkg.featured ? "btn-invert" : "btn-outline"}">${t.startWith} ${pkg.numeral}</a>
  `;
}

function singleInnerHTML(item, index, lang) {
  return `
    <span class="price-single-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="price-single-name">${lang === "ka" ? item.name_ka : item.name}</span>
    <span class="price-single-price">${item.price}</span>
  `;
}

function buildPackage(pkg, lang) {
  const card = document.createElement("div");
  card.className = "price-card" + (pkg.featured ? " is-featured" : "");
  card.innerHTML = packageInnerHTML(pkg, lang);
  return card;
}

function buildSingle(item, index, lang) {
  const row = document.createElement("div");
  row.className = "price-single";
  row.innerHTML = singleInnerHTML(item, index, lang);
  return row;
}

function applyLang(lang) {
  const grid = document.getElementById("priceGrid");
  const noteEl = document.getElementById("priceNote");
  const singlesList = document.getElementById("singlesList");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".price-card"));
  cards.forEach((card, i) => {
    if (packages[i]) card.innerHTML = packageInnerHTML(packages[i], lang);
  });

  if (noteEl) noteEl.textContent = lang === "ka" ? pricingNote_ka : pricingNote;

  const rows = Array.from(singlesList.querySelectorAll(".price-single"));
  rows.forEach((row, i) => {
    if (singles[i]) row.innerHTML = singleInnerHTML(singles[i], i, lang);
  });
}

function init() {
  const grid = document.getElementById("priceGrid");
  const noteEl = document.getElementById("priceNote");
  const singlesList = document.getElementById("singlesList");
  if (!grid) return;

  const lang = currentLang();

  packages.forEach((pkg) => grid.appendChild(buildPackage(pkg, lang)));
  noteEl.textContent = lang === "ka" ? pricingNote_ka : pricingNote;
  singles.forEach((item, i) => singlesList.appendChild(buildSingle(item, i, lang)));

  gsap.fromTo(
    grid.querySelectorAll(".price-card"),
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.4 },
  );

  gsap.fromTo(
    singlesList.querySelectorAll(".price-single"),
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: singlesList, start: "top 80%" },
    },
  );

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    applyLang(e.detail.lang);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
