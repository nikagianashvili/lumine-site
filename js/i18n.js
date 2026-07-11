// i18n.js — selector-based text swap for static markup.
//
// IMPORTANT: values in i18n-data.js are [english, georgian] pairs (or an
// array of pairs, one per matched element, for selectors that match several
// elements). We never read "the original" back out of the DOM — several
// other scripts (animated-copy.js's SplitText, nav.js's menu-overlay split)
// mutate these same elements' innerHTML for scroll/hover animations, and if
// that happens before this script's first pass, a DOM-cached "original"
// would already be the mangled, animation-wrapped markup. Restoring THAT
// on switching back to English produced invisible/broken text instead of
// the real copy. Always writing a known value from data sidesteps the
// whole class of bug regardless of what any animation library did in
// between.
import { translations } from "/js/i18n-data.js";

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

function entries(pageKey) {
  const common = translations.common || {};
  const page = (pageKey && translations[pageKey]) || {};
  return { ...common, ...page };
}

function pick(pair, lang) {
  if (!pair) return undefined;
  // { attr: "placeholder", en: "...", ka: "..." } targets an attribute.
  if (typeof pair === "object" && !Array.isArray(pair) && pair.attr) {
    return pair;
  }
  return lang === "ka" ? pair[1] : pair[0];
}

function apply(lang) {
  const pageKey = currentPageKey();
  const dict = entries(pageKey);

  Object.keys(dict).forEach((selector) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const isMultiEntry = Array.isArray(dict[selector]) && Array.isArray(dict[selector][0]);

    els.forEach((el, i) => {
      const raw = isMultiEntry ? dict[selector][i] : dict[selector];
      const value = pick(raw, lang);
      if (value === undefined) return;

      if (value && typeof value === "object" && value.attr) {
        el.setAttribute(value.attr, lang === "ka" ? value.ka : value.en);
        return;
      }

      el.innerHTML = value;
    });
  });

  document.documentElement.lang = lang === "ka" ? "ka" : "en";
  document.dispatchEvent(new CustomEvent("lumine:i18napplied", { detail: { lang } }));
}

function init() {
  apply(currentLang());
  document.documentElement.addEventListener("lumine:langchange", (e) => {
    apply(e.detail.lang);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export { currentLang, LANG_KEY };
