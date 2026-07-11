// i18n.js — loaded last on every page.
//
// js/i18n-early.js (first script tag) already translated everything
// present in the raw server-rendered HTML on load, before any animation
// script touched the page. The nav menu overlay and footer link grid
// translate themselves directly in js/nav.js / js/footer-links.js. So
// this file has one job left: on `lumine:langchange` (the user clicking
// EN/GE), re-apply the full static dict in one pass — safe at that point
// since entrance animations have long settled.
import { translations } from "/js/i18n-data.js";

const PAGE_MAP = {
  "/": "index",
  "/index.html": "index",
  "/studio": "studio",
  "/studio.html": "studio",
  "/services": "services",
  "/services.html": "services",
  "/work": "work",
  "/work.html": "work",
  "/pricing": "pricing",
  "/pricing.html": "pricing",
  "/journal": "journal",
  "/journal.html": "journal",
  "/contact": "contact",
  "/contact.html": "contact",
  "/legal": "legal",
  "/legal.html": "legal",
  "/sample-project": "sampleProject",
  "/sample-project.html": "sampleProject",
  "/project": "project",
  "/project.html": "project",
};

function currentPageKey() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return PAGE_MAP[path] || null;
}

function fullDict() {
  const pageKey = currentPageKey();
  const page = (pageKey && translations[pageKey]) || {};
  return { ...translations.common, ...page };
}

function applyDict(dict, lang) {
  // One bad/unmatchable selector must never take the rest of the batch
  // down with it — querySelectorAll on an invalid selector throws, and an
  // uncaught throw here would silently abort every selector still queued
  // after it in iteration order.
  Object.keys(dict).forEach((selector) => {
    try {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      const isMultiEntry = Array.isArray(dict[selector]) && Array.isArray(dict[selector][0]);

      els.forEach((el, i) => {
        const raw = isMultiEntry ? dict[selector][i] : dict[selector];
        if (raw === undefined) return;

        if (typeof raw === "object" && !Array.isArray(raw) && raw.attr) {
          el.setAttribute(raw.attr, lang === "ka" ? raw.ka : raw.en);
          return;
        }

        el.innerHTML = lang === "ka" ? raw[1] : raw[0];
      });
    } catch (err) {
      console.error(`[i18n] failed applying selector "${selector}"`, err);
    }
  });

  document.documentElement.lang = lang === "ka" ? "ka" : "en";
}

document.documentElement.addEventListener("lumine:langchange", (e) => {
  applyDict(fullDict(), e.detail.lang);
});
