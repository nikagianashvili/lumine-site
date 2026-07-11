// Booking form — no backend yet.
// Submits by composing a prefilled email draft to the studio inbox.
// To switch to a real endpoint later (Formspree, own API, etc.):
// replace the mailto block inside onSubmit with a fetch() POST.

const INBOX = "hello@lumine.ge";

function initChips(container) {
  if (!container) return;
  const single = container.hasAttribute("data-single");
  container.querySelectorAll(".form-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (single) {
        container
          .querySelectorAll(".form-chip.is-active")
          .forEach((c) => c !== chip && c.classList.remove("is-active"));
      }
      chip.classList.toggle("is-active");
    });
  });
}

function activeChips(container) {
  return Array.from(
    container?.querySelectorAll(".form-chip.is-active") || [],
  ).map((c) => c.textContent.trim());
}

function init() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const serviceChips = document.getElementById("serviceChips");
  const budgetChips = document.getElementById("budgetChips");
  const status = document.getElementById("formStatus");

  initChips(serviceChips);
  initChips(budgetChips);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const reach = (data.get("reach") || "").toString().trim();

    if (!name || !reach) {
      status.textContent = "Add your name and a way to reach you.";
      return;
    }

    const brand = (data.get("brand") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const services = activeChips(serviceChips);
    const budget = activeChips(budgetChips);

    const subject = `Project inquiry — ${name}${brand ? ` (${brand})` : ""}`;
    const bodyLines = [
      `Name: ${name}`,
      brand && `Brand: ${brand}`,
      `Reach me at: ${reach}`,
      services.length && `Services: ${services.join(", ")}`,
      budget.length && `Budget: ${budget.join(", ")}`,
      message && `\n${message}`,
    ].filter(Boolean);

    window.location.href = `mailto:${INBOX}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    status.textContent =
      "A draft opened in your mail app — hit send there and we'll reply within 48h.";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
