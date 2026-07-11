import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { packages, singles, pricingNote } from "/js/pricing-data.js";

gsap.registerPlugin(ScrollTrigger);

function buildPackage(pkg) {
  const card = document.createElement("div");
  card.className = "price-card" + (pkg.featured ? " is-featured" : "");
  card.innerHTML = `
    ${pkg.featured ? '<span class="price-flag">Most Booked</span>' : ""}
    <span class="price-numeral">${pkg.numeral}</span>
    <div class="price-card-head">
      <h6>${pkg.name}</h6>
      <p class="price-amount">${pkg.price}<span> / month</span></p>
    </div>
    <div class="price-counts">
      ${pkg.perMonth
        .map(
          (item) => `
        <div class="price-count">
          <span class="price-count-num">${item.count}</span>
          <span class="price-count-label">${item.label}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <ul class="price-includes">
      ${pkg.includes.map((line) => `<li>${line}</li>`).join("")}
    </ul>
    <p class="price-addon">${pkg.addon}</p>
    <a href="/contact" class="btn ${pkg.featured ? "btn-invert" : "btn-outline"}">Start With ${pkg.numeral}</a>
  `;
  return card;
}

function buildSingle(item, index) {
  const row = document.createElement("div");
  row.className = "price-single";
  row.innerHTML = `
    <span class="price-single-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="price-single-name">${item.name}</span>
    <span class="price-single-price">${item.price}</span>
  `;
  return row;
}

function init() {
  const grid = document.getElementById("priceGrid");
  const noteEl = document.getElementById("priceNote");
  const singlesList = document.getElementById("singlesList");
  if (!grid) return;

  packages.forEach((pkg) => grid.appendChild(buildPackage(pkg)));
  noteEl.textContent = pricingNote;
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
