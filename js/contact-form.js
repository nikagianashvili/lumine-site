// Booking form. Submits to /api/ai/intake, which answers the message
// instantly (grounded in real pricing/service data) and logs the lead.
// If that request fails outright (offline, endpoint down), falls back to
// the original mailto compose so a submission is never silently lost.

const INBOX = "hello@lumine.ge";
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

const MSG = isKa
  ? {
      missing: "áƒ›áƒ˜áƒ£áƒ—áƒ˜áƒ—áƒ”áƒ— áƒ¡áƒáƒ®áƒ”áƒšáƒ˜ áƒ“áƒ áƒ¡áƒáƒ™áƒáƒœáƒ¢áƒáƒ¥áƒ¢áƒ áƒ˜áƒœáƒ¤áƒáƒ áƒ›áƒáƒªáƒ˜áƒ.",
      thinking: "áƒ•áƒáƒ›áƒ–áƒáƒ“áƒ”áƒ‘áƒ— áƒžáƒáƒ¡áƒ£áƒ®áƒ¡",
      aiLabel: "áƒ›áƒ§áƒ˜áƒ¡áƒ˜áƒ”áƒ áƒ˜ áƒžáƒáƒ¡áƒ£áƒ®áƒ˜",
      sent: "áƒ›áƒáƒ“áƒšáƒáƒ‘áƒ â€” áƒ’áƒ£áƒœáƒ“áƒ˜ áƒ›áƒáƒšáƒ” áƒ“áƒáƒ’áƒ˜áƒ™áƒáƒ•áƒ¨áƒ˜áƒ áƒ“áƒ”áƒ‘áƒáƒ—.",
      fallback: "áƒ áƒáƒ¦áƒáƒª áƒáƒ  áƒ’áƒáƒ›áƒáƒ•áƒ˜áƒ“áƒ â€” áƒ“áƒ áƒáƒ¤áƒ¢áƒ˜ áƒ’áƒáƒ˜áƒ®áƒ¡áƒœáƒ áƒ—áƒ¥áƒ•áƒ”áƒœáƒ¡ áƒ›áƒ”áƒ˜áƒš áƒáƒžáƒšáƒ˜áƒ™áƒáƒªáƒ˜áƒáƒ¨áƒ˜, áƒ’áƒáƒáƒ’áƒ–áƒáƒ•áƒœáƒ”áƒ— áƒ˜áƒ¥áƒ˜áƒ“áƒáƒœ.",
    }
  : {
      missing: "Add your name and a way to reach you.",
      thinking: "Thinking",
      aiLabel: "Instant reply",
      sent: "Thanks â€” a team member will follow up shortly.",
      fallback: "Something went wrong on our end â€” a draft opened in your mail app instead, send it from there.",
    };

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

  // Deep link from a service detail page (service.html's Get In Touch
  // button links here with ?service=<slug>) - pre-select the matching
  // chip so a visitor never lands on a blank form after already telling
  // us what they're interested in.
  const wantedSlug = new URLSearchParams(window.location.search).get("service");
  if (wantedSlug && serviceChips) {
    const match = serviceChips.querySelector(`.form-chip[data-slug="${wantedSlug}"]`);
    if (match) match.classList.add("is-active");
  }

  function sendMailtoFallback({ name, brand, reach, message, services, budget }) {
    const subject = `Project inquiry â€” ${name}${brand ? ` (${brand})` : ""}`;
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
  }

  function showReply(text) {
    status.classList.remove("is-typing");
    status.innerHTML = "";

    const label = document.createElement("span");
    label.className = "ai-reply-label";
    label.textContent = MSG.aiLabel;

    const card = document.createElement("span");
    card.className = "ai-reply-card";
    card.append(label, document.createTextNode(text));

    const note = document.createElement("span");
    note.className = "form-status-note";
    note.textContent = MSG.sent;

    status.append(card, note);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const reach = (data.get("reach") || "").toString().trim();
    const brand = (data.get("brand") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const services = activeChips(serviceChips);
    const budget = activeChips(budgetChips);

    if (!name || !reach || !message) {
      status.classList.remove("is-typing");
      status.textContent = MSG.missing;
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.classList.add("is-typing");
    status.textContent = MSG.thinking;

    try {
      const res = await fetch("/api/ai/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company: brand || undefined,
          email: reach.includes("@") ? reach : undefined,
          phone: reach.includes("@") ? undefined : reach,
          message,
          services,
          budget,
          language: isKa ? "ka" : "en",
        }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { reply } = await res.json();
      showReply(reply);
      form.reset();
    } catch {
      sendMailtoFallback({ name, brand, reach, message, services, budget });
      status.classList.remove("is-typing");
      status.textContent = MSG.fallback;
    } finally {
      submitBtn.disabled = false;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
