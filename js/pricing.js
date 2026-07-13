import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchPricing } from "/js/api-client.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const UI = isKa
  ? { mostBooked: "ყველაზე პოპულარული", perMonth: " / თვეში", startWith: "დაწყება" }
  : { mostBooked: "Most Booked", perMonth: " / month", startWith: "Start With" };

function buildPackage(pkg) {
  const name = isKa ? pkg.name_ka : pkg.name;
  const includes = isKa ? pkg.includes_ka : pkg.includes;

  const card = document.createElement("div");
  card.className = "price-card" + (pkg.featured ? " is-featured" : "");
  card.innerHTML = `
    ${pkg.featured ? `<span class="price-flag">${UI.mostBooked}</span>` : ""}
    <span class="price-numeral">${pkg.numeral}</span>
    <div class="price-card-head">
      <h6>${name}</h6>
      <p class="price-amount">${pkg.price}<span>${UI.perMonth}</span></p>
    </div>
    <div class="price-counts">
      ${pkg.perMonth
        .map(
          (item) => `
        <div class="price-count">
          <span class="price-count-num">${item.count}</span>
          <span class="price-count-label">${isKa ? item.label_ka : item.label}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <ul class="price-includes">
      ${includes.map((line) => `<li>${line}</li>`).join("")}
    </ul>
    <p class="price-addon">${isKa ? pkg.addon_ka : pkg.addon}</p>
    <a href="${p("/contact")}" class="btn ${pkg.featured ? "btn-invert" : "btn-outline"}">${UI.startWith} ${pkg.numeral}</a>
  `;
  return card;
}

function buildSingle(item, index) {
  const row = document.createElement("div");
  row.className = "price-single";
  row.innerHTML = `
    <span class="price-single-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="price-single-name">${isKa ? item.name_ka : item.name}</span>
    <span class="price-single-price">${item.price}</span>
  `;
  return row;
}

async function init() {
  const grid = document.getElementById("priceGrid");
  const noteEl = document.getElementById("priceNote");
  const singlesList = document.getElementById("singlesList");
  if (!grid) return;

  const { packages, singles, pricingNote, pricingNote_ka } = await fetchPricing();

  packages.forEach((pkg) => grid.appendChild(buildPackage(pkg)));
  noteEl.textContent = isKa ? pricingNote_ka : pricingNote;
  singles.forEach((item, i) => singlesList.appendChild(buildSingle(item, i)));

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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
