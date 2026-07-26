// Trusted By — a register of the studio's real clients.
//
// This was a logo marquee, which is the section every agency site ships and
// which says nothing: five marks sliding past, no name you can read, no way
// to find out what was actually made. It is now a signed register — one row
// per client, carrying the work and the year, and every row opens the
// project it came from. The logo stops being the content and becomes the
// stamp at the end of the line.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProject, projectHref } from "/js/projects-data.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// Each entry points at a real project in the registry — name, year and link
// are read from there so this list can never drift out of sync with the
// portfolio. Only the mark and the short deliverable live here.
const REGISTER = [
  {
    slug: "tbilisi-zoo",
    mark: "/clients/tbzoo.png",
    work: "Identity & merchandise",
    work_ka: "იდენტობა და სუვენირები",
  },
  {
    slug: "tene",
    mark: "/clients/tene.png",
    work: "Product launch campaign",
    work_ka: "პროდუქტის გაშვების კამპანია",
  },
  {
    slug: "tera-leasing",
    mark: "/clients/tera-leasing.png",
    work: "Social content system",
    work_ka: "სოციალური კონტენტის სისტემა",
  },
  {
    slug: "fit-rock",
    mark: "/clients/fitrock.png",
    work: "Packaging & product identity",
    work_ka: "შეფუთვა და პროდუქტის იდენტობა",
  },
  {
    slug: "4pets",
    mark: "/clients/4pets.png",
    work: "Catalog content system",
    work_ka: "კატალოგის კონტენტის სისტემა",
  },
];

function buildRow(entry, i) {
  const project = getProject(entry.slug);
  if (!project) return null;

  const row = document.createElement("a");
  row.className = "register-row";
  row.href = projectHref(project, isKa);

  const index = String(i + 1).padStart(2, "0");
  const work = isKa ? entry.work_ka : entry.work;

  row.innerHTML = `
    <span class="register-band" aria-hidden="true"></span>
    <span class="register-index">${index}</span>
    <span class="register-name">${project.client}</span>
    <span class="register-rule" aria-hidden="true"></span>
    <span class="register-work">${work}</span>
    <span class="register-year">${project.year}</span>
    <span class="register-mark"><img src="${entry.mark}" alt="${project.client}" draggable="false" /></span>
  `;

  return row;
}

function init() {
  const mount = document.querySelector("[data-register]");
  if (!mount) return;

  const rows = REGISTER.map(buildRow).filter(Boolean);
  rows.forEach((row) => mount.appendChild(row));
  if (!rows.length) return;

  // The rules draw themselves in left-to-right as the register scrolls up,
  // the same gesture the process route uses further down the page — so the
  // section reads as part of the same drawing, not a new idea.
  gsap.from(
    rows.map((row) => row.querySelector(".register-rule")),
    {
      scaleX: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: mount, start: "top 80%", once: true },
    },
  );

  gsap.from(rows, {
    y: 18,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: { trigger: mount, start: "top 80%", once: true },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
