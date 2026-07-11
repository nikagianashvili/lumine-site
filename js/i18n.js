// i18n.js — selector-based text swap for static markup. Dynamic content
// (work grid, pricing cards, project pages) is handled separately by each
// module reading the same LANG_KEY and picking a `_ka` field at render time.
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

function apply(lang) {
  const pageKey = currentPageKey();
  const dict = entries(pageKey);

  Object.keys(dict).forEach((selector) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    els.forEach((el, i) => {
      const raw = Array.isArray(dict[selector]) ? dict[selector][i] : dict[selector];
      if (raw === undefined) return;

      // { attr: "placeholder", text: "..." } targets an attribute instead
      // of innerHTML — used for form inputs.
      if (raw && typeof raw === "object" && raw.attr) {
        const origKey = `i18nOrig${raw.attr[0].toUpperCase()}${raw.attr.slice(1)}`;
        if (el.dataset[origKey] === undefined) {
          el.dataset[origKey] = el.getAttribute(raw.attr) || "";
        }
        el.setAttribute(raw.attr, lang === "ka" ? raw.text : el.dataset[origKey]);
        return;
      }

      if (el.dataset.i18nOrig === undefined) {
        el.dataset.i18nOrig = el.innerHTML;
      }

      el.innerHTML = lang === "ka" ? raw : el.dataset.i18nOrig;
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
