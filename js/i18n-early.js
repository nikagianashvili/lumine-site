// i18n-early.js — must be the FIRST script tag on every page, before
// wrappedgl.js/simulator.js and well before animated-copy.js.
//
// animated-copy.js waits on an async document.fonts.ready promise, then
// runs SplitText on every [data-animate-variant] element (including ones
// this translation system never touches, like the bare "Lumine" wordmark).
// If that races against translating text AFTER SplitText has already
// wrapped it, either script can end up mutating DOM nodes the other one
// is mid-animation on — one reported symptom was the untouched hero
// headline failing to reveal at all, collateral damage from SplitText
// choking on a sibling whose text got swapped out from under it.
//
// Fix: translate every selector that's already present in the raw
// server-rendered HTML as early as physically possible — a deferred
// module's top-level code runs only after the document is fully parsed,
// so this is synchronous and guaranteed to finish before any other
// deferred script (including animated-copy.js) gets a turn, no waiting
// on DOMContentLoaded needed. What's left for js/i18n.js (loaded last)
// is only the handful of `common` selectors that don't exist yet at this
// point — the nav menu overlay and footer link grid, both built later by
// nav.js / footer-links.js.
import { translations, STATIC_COMMON_KEYS } from "/js/i18n-data.js";

const LANG_KEY = "lumine-lang";

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

function currentLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}

function applyDict(dict, lang) {
  // One bad/unmatchable selector must never take the rest of the batch
  // down with it — querySelectorAll on an invalid selector throws, and an
  // uncaught throw here would silently abort every selector still queued
  // after it in iteration order (this is exactly what happened: whatever
  // ran before the failure translated fine, everything after it didn't).
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
}

const lang = currentLang();
const pageKey = currentPageKey();
const pageDict = (pageKey && translations[pageKey]) || {};
const staticCommon = {};
STATIC_COMMON_KEYS.forEach((k) => {
  if (translations.common[k]) staticCommon[k] = translations.common[k];
});

applyDict({ ...staticCommon, ...pageDict }, lang);
document.documentElement.lang = lang === "ka" ? "ka" : "en";
