// i18n.js — must be the LAST script tag on every page.
//
// js/i18n-early.js (first script tag) already translated every selector
// present in the raw server-rendered HTML, before any animation script
// touched the page — see its header comment. This file has two jobs:
// (1) on load, translate the handful of `common` selectors that don't
// exist yet at that early point — the nav menu overlay and footer link
// grid, both built at runtime by nav.js / footer-links.js, both of
// which load before this script; (2) on every later `lumine:langchange`
// (the user clicking EN/GE), re-apply everything in one pass — safe at
// that point since initial entrance animations have long settled.
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
  Object.keys(dict).forEach((selector) => {
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
  });

  document.documentElement.lang = lang === "ka" ? "ka" : "en";
  document.dispatchEvent(new CustomEvent("lumine:i18napplied", { detail: { lang } }));
}

function dynamicCommon() {
  const dict = {};
  Object.keys(translations.common).forEach((k) => {
    if (!STATIC_COMMON_KEYS.includes(k)) dict[k] = translations.common[k];
  });
  return dict;
}

function fullDict() {
  const pageKey = currentPageKey();
  const page = (pageKey && translations[pageKey]) || {};
  return { ...translations.common, ...page };
}

function init() {
  applyDict(dynamicCommon(), currentLang());

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    applyDict(fullDict(), e.detail.lang);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export { currentLang, LANG_KEY };
