import gsap from "gsap";

function initFaq() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const inner = answer.querySelector("p");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        gsap.to(other.querySelector(".faq-answer"), {
          height: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
      });

      item.classList.toggle("is-open", !isOpen);
      gsap.to(answer, {
        height: isOpen ? 0 : inner.offsetHeight,
        duration: 0.4,
        ease: "power2.inOut",
      });
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFaq);
} else {
  initFaq();
}
