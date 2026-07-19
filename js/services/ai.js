// AI page hero demo: a small auto-cycling illustrative exchange. Dummy
// conversation content, not a real transcript — a UX demo, not a claimed
// metric.
import gsap from "gsap";

function initAiDemo() {
  const thread = document.getElementById("aiDemoThread");
  if (!thread) return;

  const exchanges = [
    [
      { from: "user", text: "Do you have anything free Thursday afternoon?" },
      { from: "bot", text: "Yes — 2:00 PM or 4:30 PM are open. Book one for you?" },
    ],
    [
      { from: "user", text: "How much is the Starter package?" },
      { from: "bot", text: "1,000–1,500₾ a month. Want the full breakdown by email?" },
    ],
    [
      { from: "user", text: "Can I speak to someone about a custom quote?" },
      { from: "bot", text: "Flagging this for the team now — expect a reply within the hour." },
    ],
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    thread.innerHTML = exchanges[0]
      .map((m) => `<p class="from-${m.from}" style="opacity:1">${m.text}</p>`)
      .join("");
    return;
  }

  let i = 0;
  function playExchange() {
    thread.innerHTML = "";
    const pair = exchanges[i % exchanges.length];
    i++;
    const bubbles = pair.map((m) => {
      const el = document.createElement("p");
      el.className = `from-${m.from}`;
      el.textContent = m.text;
      thread.appendChild(el);
      return el;
    });
    gsap.set(bubbles, { opacity: 0, y: 10 });
    gsap.to(bubbles, { opacity: 1, y: 0, duration: 0.5, stagger: 0.4, ease: "power2.out" });
    setTimeout(() => {
      gsap.to(bubbles, {
        opacity: 0,
        y: -8,
        duration: 0.4,
        ease: "power2.in",
        onComplete: playExchange,
      });
    }, 3600);
  }
  playExchange();
}

function init() {
  initAiDemo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
