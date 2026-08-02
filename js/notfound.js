// Locale swap for the 404 page.
//
// Vercel serves one /404.html for every miss on the deployment, including
// /ka/* — there is no per-locale 404 to route to. So the English copy is what
// ships in the markup, which means the page still works with no JavaScript at
// all, and this rewrites it when the URL that missed was a Georgian one.
//
// Load order matters and is the whole reason this is a module rather than
// more of the inline script in the head. Deferred modules run in document
// order after parsing, so this must sit BEFORE js/mtavruli.js: it puts
// Mkhedruli into the heading, and mtavruli then converts that heading to
// Mtavruli on its normal pass. Doing the swap later instead — which is what
// the first version did, from a DOMContentLoaded handler — leaves the heading
// in Mkhedruli forever, because conversion is one-shot per element
// (data-mtavruli="done") and the observer watches for added nodes rather than
// changed text. mtavruli.js says exactly this in its own comment.

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

if (isKa) {
  const KA = {
    code: "შეცდომა 404",
    head: "აქ არაფერია",
    copy: "გვერდი, რომელსაც ეძებდით, გადავიდა ან არასდროს არსებობდა. აი, სამი მიმართულება, რომელსაც ყველაზე ხშირად ეძებენ.",
    waysLabel: "შემოთავაზებული გვერდები",
    ways: [
      ["ნამუშევრები", "პროექტები"],
      ["სერვისები", "9 მიმართულება"],
      ["კონტაქტი", "მოგვწერეთ"],
    ],
  };

  const set = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  set(".notfound-code", KA.code);
  set(".notfound h1", KA.head);
  set(".notfound-copy", KA.copy);

  const wayList = document.querySelector(".notfound-ways");
  if (wayList) wayList.setAttribute("aria-label", KA.waysLabel);

  document.querySelectorAll(".notfound-way").forEach((a, i) => {
    const copy = KA.ways[i];
    if (!copy) return;
    // /work -> /ka/work, and guard against running twice
    const href = a.getAttribute("href");
    if (href && !href.startsWith("/ka")) a.setAttribute("href", `/ka${href}`);
    const label = a.querySelector(".notfound-way-label");
    const desc = a.querySelector(".notfound-way-desc");
    if (label) label.textContent = copy[0];
    if (desc) desc.textContent = copy[1];
  });

  const logo = document.querySelector(".nav-logo a");
  if (logo) logo.setAttribute("href", "/ka");

  /* The switcher ships with EN active because the markup is English. On a
     Georgian miss the two swap roles: Georgian becomes the current language
     and English becomes the link out. */
  const group = document.querySelector(".nav-lang");
  if (group) {
    group.innerHTML =
      '<a href="/" class="nav-lang-btn">EN</a>' +
      '<span class="nav-lang-sep">/</span>' +
      '<span class="nav-lang-btn is-active">GE</span>';
  }
}
