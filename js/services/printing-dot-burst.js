// CTA gets a small halftone dot-burst on click - the page's ambient dot
// texture echoed at button scale - before navigating.
import gsap from "gsap";

function init() {
  const btn = document.getElementById("inkCtaBtn");
  if (!btn) return;
  const href = btn.getAttribute("href");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let animating = false;
  btn.addEventListener("click", (e) => {
    if (animating) return;
    e.preventDefault();
    animating = true;

    const rect = btn.getBoundingClientRect();
    const burst = document.createElement("div");
    burst.className = "ink-dot-burst";
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;

    const dotCount = 12;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement("span");
      const angle = (i / dotCount) * Math.PI * 2;
      const dist = 26 + Math.random() * 34;
      dot.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      dot.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      burst.appendChild(dot);
    }
    document.body.appendChild(burst);

    gsap.fromTo(
      burst.querySelectorAll("span"),
      { x: 0, y: 0, opacity: 1, scale: 0.4 },
      {
        x: (i, t) => t.style.getPropertyValue("--dx"),
        y: (i, t) => t.style.getPropertyValue("--dy"),
        opacity: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete() {
          burst.remove();
          window.location.href = href;
        },
      },
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
