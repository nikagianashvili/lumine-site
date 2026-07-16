import { FAQ } from "/js/faq-data.js";

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

function buildItem(entry, index) {
  const question = isKa ? entry.question_ka : entry.question;
  const answer = isKa ? entry.answer_ka : entry.answer;
  const item = document.createElement("div");
  item.className = "faq-item";
  item.innerHTML = `
    <button class="faq-question">
      <span class="faq-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="faq-question-text">${question}</span>
      <span class="faq-plus"></span>
    </button>
    <div class="faq-answer">
      <p>${answer}</p>
    </div>
  `;
  return item;
}

function init() {
  const list = document.querySelector(".faq-list");
  if (!list) return;
  list.innerHTML = "";
  FAQ.forEach((entry, i) => list.appendChild(buildItem(entry, i)));
  // js/faq.js wires up the accordion on DOMContentLoaded and queries
  // .faq-item fresh at that point, so as long as this runs first (script
  // order in the HTML), the freshly-built items get the same behavior
  // static ones used to.
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
