// CTA gets a quick ink-stamp impression on click before navigating — the
// button compresses and throws a faint misaligned "ghost" of its own
// label for one frame, like a stamp landing slightly off-register.
import gsap from "gsap";

function init() {
  const btn = document.getElementById("pressStampBtn");
  const label = btn ? btn.querySelector(".press-stamp-label") : null;
  if (!btn || !label) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const href = btn.getAttribute("href");
  let stamping = false;

  btn.addEventListener("click", (e) => {
    if (stamping) return;
    e.preventDefault();
    stamping = true;

    const ghost = label.cloneNode(true);
    ghost.classList.remove("press-stamp-label");
    ghost.classList.add("press-stamp-ghost");
    btn.appendChild(ghost);

    const tl = gsap.timeline({
      onComplete() {
        window.location.href = href;
      },
    });

    tl.to(btn, { scale: 0.94, duration: 0.09, ease: "power1.out" });
    tl.set(ghost, { opacity: 0.5, x: 3, y: 2 }, "<");
    tl.to(ghost, { opacity: 0, x: 7, y: 4, duration: 0.22, ease: "power1.out" }, "<");
    tl.to(btn, { scale: 1, duration: 0.18, ease: "back.out(2)" }, "-=0.12");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
