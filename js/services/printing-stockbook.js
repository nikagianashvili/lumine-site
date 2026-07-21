// The page's one signature mechanism: the sticky stock sample book's
// active tab flips to match whichever sub-service section is in view,
// the same IntersectionObserver pattern strategy.js uses for its
// masthead rail counter - cheap, no canvas or shader, load-bearing
// rather than decorative since the book is the page's actual structure.
function init() {
  const pages = document.querySelectorAll(".stbk-page");
  const targets = document.querySelectorAll("[data-stbk-target]");
  if (!pages.length || !targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const key = entry.target.getAttribute("data-stbk-target");
        pages.forEach((page) => page.classList.toggle("is-active", page.dataset.page === key));
      });
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
