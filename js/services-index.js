// services — fixed "Sheet N / 09" marker that tracks which of the nine
// sheets is in view. Plain IntersectionObserver: no animation library to
// fail, nothing to configure.

function initSheetMarker() {
  const marker = document.querySelector(".svc-marker");
  const numEl = marker?.querySelector(".svc-marker-num");
  const sections = Array.from(document.querySelectorAll(".svc[id]"));
  if (!marker || !numEl || !sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = sections.indexOf(entry.target);
        numEl.textContent = String(i + 1).padStart(2, "0");
        marker.classList.add("is-visible");
      });
    },
    // a sheet "owns" the marker while it crosses the middle band of the screen
    { rootMargin: "-40% 0px -40% 0px" },
  );
  sections.forEach((s) => io.observe(s));

  // hide the marker while the cover (hero + index) or the page tail is on
  // screen — it only makes sense while reading the sheets themselves
  const hide = ([entry]) => {
    if (entry.isIntersecting) marker.classList.remove("is-visible");
  };
  const hero = document.querySelector(".svc-hero");
  if (hero) new IntersectionObserver(hide, { threshold: 0.15 }).observe(hero);
  const industries = document.querySelector(".svc-industries");
  if (industries)
    new IntersectionObserver(hide, { threshold: 0.3 }).observe(industries);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSheetMarker);
} else {
  initSheetMarker();
}
