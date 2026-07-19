// Photography page signature: frames "develop" from grayscale into color
// as they enter view, ambiently — the site's real hover mechanic promoted
// to a passive reveal for frames nobody's actively pointing at.
function initEarnColor() {
  const frames = document.querySelectorAll("[data-photo-earn]");
  if (!frames.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-color"), i * 90);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );

  frames.forEach((frame) => observer.observe(frame));
}

function init() {
  initEarnColor();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
