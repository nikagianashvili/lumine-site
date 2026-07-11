import gsap from "gsap";

function init() {
  const entries = document.querySelectorAll(".journal-entry");
  if (!entries.length) return;

  entries.forEach((entry) => {
    const head = entry.querySelector(".journal-entry-head");
    const body = entry.querySelector(".journal-entry-body");
    const text = entry.querySelector(".journal-entry-text");

    head.addEventListener("click", () => {
      const isOpen = entry.classList.contains("is-open");

      entries.forEach((other) => {
        if (other === entry) return;
        if (other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          other
            .querySelector(".journal-entry-head")
            .setAttribute("aria-expanded", "false");
          gsap.to(other.querySelector(".journal-entry-body"), {
            height: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        }
      });

      entry.classList.toggle("is-open", !isOpen);
      head.setAttribute("aria-expanded", String(!isOpen));
      gsap.to(body, {
        height: isOpen ? 0 : text.offsetHeight,
        duration: 0.6,
        ease: "power3.inOut",
      });
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
