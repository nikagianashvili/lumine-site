// Site-wide "Lumine AI" chat widget — front-desk launcher + conversation panel.
//
// Flow note: this used to open on a name + email form. A visitor who wanted
// to know what a logo costs had to hand over contact details before they were
// allowed to ask, which is the point most people close the panel. The order is
// now question first — openers, then their own words, and only then "where do
// we send the answer", with the question they already wrote held in view so it
// is visibly not lost. The API contract is unchanged: /api/ai/chat/start still
// creates the clients row from name + email, it just happens one step later
// and the pending question is sent the moment it returns.
//
// Conversation state persists in sessionStorage so navigating between pages
// doesn't reset an in-progress chat.

const STORAGE_KEY = "lumine_chat_conversation";
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// The reticle/viewfinder mark (public/logo/lumine-mark-2.svg) - deliberately
// NOT the sparkle glyph used everywhere else on the site (nav, hero, footer,
// CTA panel). Inlined with fill="currentColor" so it inherits ink/paper like
// every other on-brand mark.
const RETICLE_SVG = `<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M229.91,145.323v-26.593c0-2.227-1.805-4.033-4.033-4.033h-20.288c-11.221,0-20.318-9.097-20.318-20.318V17.154c0-2.227-1.805-4.033-4.033-4.033h-27.483c-2.227,0-4.033,1.805-4.033,4.033v48.506c0,2.431-1.971,4.402-4.402,4.402h-26.592c-2.227,0-4.033,1.805-4.033,4.033v20.287c0,11.221-9.096,20.317-20.317,20.317H17.153c-2.227,0-4.033,1.805-4.033,4.033v27.512c0,2.227,1.805,4.033,4.033,4.033h48.506c2.431,0,4.402,1.971,4.402,4.402v26.564c0,2.227,1.805,4.033,4.033,4.033h20.288c11.221,0,20.318,9.097,20.318,20.318v77.256c0,2.227,1.805,4.033,4.033,4.033h27.512c2.227,0,4.033-1.805,4.033-4.033v-48.506c0-2.431,1.971-4.402,4.402-4.402h26.563c2.227,0,4.033-1.805,4.033-4.033v-20.287c0-11.237,9.109-20.346,20.346-20.346h77.228c2.227,0,4.033-1.805,4.033-4.033v-27.482c0-2.227-1.805-4.033-4.033-4.033h-48.535c-2.431,0-4.402-1.971-4.402-4.402ZM147.57,189.133c-5.598-17.367-19.343-31.114-36.694-36.69-2.398-.771-2.4-4.095-.002-4.868,17.352-5.59,31.098-19.34,36.696-36.709.773-2.397,4.098-2.395,4.867.004,5.57,17.367,19.31,31.115,36.66,36.705,2.398.773,2.396,4.097-.002,4.868-17.349,5.576-31.088,19.321-36.658,36.687-.769,2.398-4.095,2.401-4.867.004Z" fill="currentColor"/></svg>`;

// A drawn arrow rather than the "➤" character, which picks up a different
// glyph on every platform and does not inherit the brand faces.
const SEND_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;

const MSG = isKa
  ? {
      bubbleLabel: "Lumine AI-სთან საუბარი",
      title: "Lumine AI",
      status: "ხაზზე",
      you: "თქვენ",
      studio: "Lumine",
      intakeLabel: "სად გამოგიგზავნოთ პასუხი",
      intakeIntro:
        "თქვენი კითხვა შენახულია. მიუთითეთ სახელი და ელფოსტა — პასუხს მაშინვე მიიღებთ.",
      name: "სახელი",
      email: "ელფოსტა",
      start: "კითხვის გაგზავნა",
      back: "← კითხვის შეცვლა",
      missing: "შეავსეთ სახელი და ელფოსტა.",
      placeholder: "დაწერეთ შეტყობინება…",
      greeting:
        "გამარჯობა — მე ვარ Lumine AI. მკითხეთ სერვისების, ფასების ან ვადების შესახებ.",
      error: "რაღაც არ გამოვიდა — სცადეთ თავიდან ან მოგვწერეთ hello@lumine.ge-ზე.",
      close: "დახურვა",
      send: "გაგზავნა",
      openers: [
        "რა ღირს ბრენდის იდენტობა?",
        "რამდენ ხანს გრძელდება პროექტი?",
        "რა სერვისები გაქვთ?",
      ],
    }
  : {
      bubbleLabel: "Chat with Lumine AI",
      title: "Lumine AI",
      status: "Online",
      you: "You",
      studio: "Lumine",
      intakeLabel: "Where do we send the answer",
      intakeIntro:
        "Your question is saved. Add your name and email and you'll get the answer straight away.",
      name: "Name",
      email: "Email",
      start: "Send question",
      back: "← Change question",
      missing: "Add your name and email.",
      placeholder: "Type a message…",
      greeting:
        "Hi — I'm Lumine AI. Ask me about services, pricing, or how long a project takes.",
      error: "Something went wrong — try again, or email hello@lumine.ge.",
      close: "Close",
      send: "Send",
      // Three things the desk can actually answer. An empty box and a blinking
      // cursor tells a visitor nothing about what this knows.
      openers: [
        "What does a brand identity cost?",
        "How long does a project take?",
        "What do you actually do?",
      ],
    };

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — chat still works, just won't persist across pages
  }
}

// — markdown-lite: bold, bullet/numbered lists, paragraphs. Escapes HTML
// first so neither the model's output nor a visitor's own message (echoed
// back into the thread) can inject markup. Intentionally not a full
// markdown parser — just the handful of shapes a pricing/services answer
// actually needs. —
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineFormat(str) {
  return str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function formatContent(text) {
  const lines = escapeHtml(text).split("\n");
  const out = [];
  let list = null; // { type: "ul"|"ol", items: [] }

  const flush = () => {
    if (list) {
      out.push(
        `<${list.type}>${list.items.map((li) => `<li>${li}</li>`).join("")}</${list.type}>`,
      );
      list = null;
    }
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet) {
      if (!list || list.type !== "ul") {
        flush();
        list = { type: "ul", items: [] };
      }
      list.items.push(inlineFormat(bullet[1]));
    } else if (numbered) {
      if (!list || list.type !== "ol") {
        flush();
        list = { type: "ol", items: [] };
      }
      list.items.push(inlineFormat(numbered[1]));
    } else {
      flush();
      if (line.trim() !== "") out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }
  flush();
  return out.join("") || "<p></p>";
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString(isKa ? "ka-GE" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function buildWidget() {
  const wrap = document.createElement("div");
  wrap.className = "chat-widget";
  wrap.innerHTML = `
    <button class="chat-bubble" type="button" aria-label="${MSG.bubbleLabel}" aria-expanded="false">${RETICLE_SVG}<span class="chat-bubble-label">${MSG.title}</span></button>
    <div class="chat-panel" role="dialog" aria-modal="false" aria-label="${MSG.title}">
      <div class="chat-panel-head">
        <span class="chat-panel-head-title"><span class="chat-mark">${RETICLE_SVG}</span> ${MSG.title}</span>
        <span class="chat-status">${MSG.status}</span>
        <button class="chat-panel-close" type="button" aria-label="${MSG.close}">✕</button>
      </div>
      <div class="chat-panel-body"></div>
    </div>
  `;
  document.body.appendChild(wrap);
  return wrap;
}

function messageEl(role, content, ts) {
  const el = document.createElement("div");
  el.className = `chat-msg role-${role}`;

  const meta = document.createElement("div");
  meta.className = "chat-msg-meta";
  meta.innerHTML = `<span class="chat-msg-who">${role === "user" ? MSG.you : MSG.studio}</span><span class="chat-msg-time">${formatTime(ts || new Date().toISOString())}</span>`;
  el.appendChild(meta);

  const bubble = document.createElement("div");
  bubble.className = "chat-msg-bubble";
  bubble.innerHTML = formatContent(content);
  el.appendChild(bubble);

  return el;
}

function typingEl() {
  const el = document.createElement("div");
  el.className = "chat-msg role-assistant is-typing";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = "<span></span><span></span><span></span>";
  return el;
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function inputRowEl(onSend) {
  const row = document.createElement("div");
  row.className = "chat-input-row";
  row.innerHTML = `
    <textarea rows="1" placeholder="${MSG.placeholder}" autocomplete="off" aria-label="${MSG.placeholder}"></textarea>
    <button class="chat-send-btn" type="button" aria-label="${MSG.send}">${SEND_SVG}</button>
  `;
  const input = row.querySelector("textarea");
  const btn = row.querySelector(".chat-send-btn");

  const fire = () => {
    const text = input.value.trim();
    if (!text || btn.disabled) return;
    input.value = "";
    autoResize(input);
    onSend(text, { input, btn });
  };

  btn.addEventListener("click", fire);
  input.addEventListener("input", () => autoResize(input));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fire();
    }
  });

  return { row, input, btn };
}

/* — step one: the greeting, three openers, and a box you can actually type in
   without having identified yourself first — */
function renderCompose(body, onAsk) {
  body.innerHTML = "";

  const messages = document.createElement("div");
  messages.className = "chat-messages";
  // Lenis hijacks wheel events for the whole document, so without this the
  // message log could not be scrolled with a wheel or trackpad at all — the
  // page scrolled behind the open panel instead.
  messages.setAttribute("data-lenis-prevent", "");
  messages.appendChild(messageEl("assistant", MSG.greeting));
  body.appendChild(messages);

  const openers = document.createElement("div");
  openers.className = "chat-openers";
  MSG.openers.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chat-opener";
    b.textContent = q;
    b.addEventListener("click", () => onAsk(q));
    openers.appendChild(b);
  });
  body.appendChild(openers);

  const { row } = inputRowEl((text) => onAsk(text));
  body.appendChild(row);
}

/* — step two: name and email, with their question quoted above it — */
function renderIntake(body, question, onStarted, onBack) {
  body.innerHTML = "";
  const form = document.createElement("form");
  form.className = "chat-intake";
  form.innerHTML = `
    <span class="chat-intake-label">${MSG.intakeLabel}</span>
    <blockquote class="chat-intake-quote"></blockquote>
    <p>${MSG.intakeIntro}</p>
    <input type="text" name="name" placeholder="${MSG.name}" autocomplete="name" aria-label="${MSG.name}" required />
    <input type="email" name="email" placeholder="${MSG.email}" autocomplete="email" aria-label="${MSG.email}" required />
    <span class="chat-intake-error" role="alert"></span>
    <button class="btn btn-solid" type="submit">${MSG.start}</button>
    <button class="chat-intake-back" type="button">${MSG.back}</button>
  `;
  // textContent, not innerHTML — the question is visitor input
  form.querySelector(".chat-intake-quote").textContent = question;
  form.querySelector(".chat-intake-back").addEventListener("click", onBack);

  const errorEl = form.querySelector(".chat-intake-error");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    if (!name || !email) {
      errorEl.textContent = MSG.missing;
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    errorEl.textContent = "";
    try {
      const res = await fetch("/api/ai/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, language: isKa ? "ka" : "en" }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { conversationId } = await res.json();
      onStarted({ conversationId, name, messages: [] });
    } catch {
      errorEl.textContent = MSG.error;
      submitBtn.disabled = false;
    }
  });
  body.appendChild(form);
  form.querySelector('input[name="name"]').focus();
}

/* — step three: the live thread — */
function renderThread(body, getState, persist, pending) {
  body.innerHTML = "";
  const messages = document.createElement("div");
  messages.className = "chat-messages";
  messages.setAttribute("data-lenis-prevent", "");
  // replies arrive asynchronously, so a screen reader needs telling
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("role", "log");

  const state = getState();
  if (state.messages.length === 0 && !pending) {
    messages.appendChild(messageEl("assistant", MSG.greeting));
  } else {
    state.messages.forEach((m) =>
      messages.appendChild(messageEl(m.role, m.content, m.ts)),
    );
  }
  body.appendChild(messages);

  const scrollToBottom = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  async function send(text, ctrl) {
    const current = getState();
    const userTs = new Date().toISOString();
    messages.appendChild(messageEl("user", text, userTs));
    current.messages.push({ role: "user", content: text, ts: userTs });
    persist(current);
    scrollToBottom();

    const typing = typingEl();
    messages.appendChild(typing);
    scrollToBottom();
    if (ctrl) ctrl.btn.disabled = true;

    try {
      const res = await fetch("/api/ai/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: current.conversationId,
          message: text,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { reply } = await res.json();
      const replyTs = new Date().toISOString();
      typing.remove();
      messages.appendChild(messageEl("assistant", reply, replyTs));
      current.messages.push({
        role: "assistant",
        content: reply,
        ts: replyTs,
      });
      persist(current);
    } catch {
      typing.remove();
      messages.appendChild(messageEl("assistant", MSG.error));
    } finally {
      if (ctrl) {
        ctrl.btn.disabled = false;
        ctrl.input.focus();
      }
      scrollToBottom();
    }
  }

  const { row, input, btn } = inputRowEl((text) => send(text, { input, btn }));
  body.appendChild(row);

  scrollToBottom();

  // the question they wrote before identifying themselves goes out now
  if (pending) send(pending, { input, btn });

  return input;
}

function init() {
  const wrap = buildWidget();
  const bubble = wrap.querySelector(".chat-bubble");
  const panel = wrap.querySelector(".chat-panel");
  const closeBtn = wrap.querySelector(".chat-panel-close");
  const body = wrap.querySelector(".chat-panel-body");

  let state = loadState();
  const getState = () => state;
  const persist = (next) => {
    state = next;
    saveState(state);
  };

  function mountForState(pending) {
    if (state?.conversationId) return renderThread(body, getState, persist, pending);
    renderCompose(body, (question) => {
      renderIntake(
        body,
        question,
        (newState) => {
          persist(newState);
          const input = renderThread(body, getState, persist, question);
          input?.focus();
        },
        () => mountForState(),
      );
    });
  }

  mountForState();

  /* Sealed when closed. The panel keeps its whole form in the DOM, so without
     this a keyboard user tabbing across the page walks straight into an
     invisible name field. Same treatment the nav menu uses. */
  function seal(closed) {
    panel.inert = closed;
    panel.setAttribute("aria-hidden", String(closed));
  }
  seal(true);

  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    wrap.classList.add("is-open");
    bubble.setAttribute("aria-expanded", "true");
    seal(false);
    panel.querySelector("textarea, input")?.focus();
  }

  function close() {
    wrap.classList.remove("is-open");
    bubble.setAttribute("aria-expanded", "false");
    seal(true);
    // send focus back where it came from rather than to the top of the page
    (lastFocus instanceof HTMLElement ? lastFocus : bubble).focus();
  }

  bubble.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wrap.classList.contains("is-open")) close();
  });

  // clicking off the panel closes it, the way every other overlay behaves
  document.addEventListener("pointerdown", (e) => {
    if (!wrap.classList.contains("is-open")) return;
    if (!wrap.contains(e.target)) close();
  });

  /* The launcher is the only fixed element on the site, so on a page this
     tall it is guaranteed to sit on somebody's last line of copy. It steps
     back while the page is moving and returns when it stops — present when
     you want it, out of the composition while you are reading it. */
  let scrollTimer = null;
  window.addEventListener(
    "scroll",
    () => {
      if (wrap.classList.contains("is-open")) return;
      wrap.classList.add("is-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(
        () => wrap.classList.remove("is-scrolling"),
        420,
      );
    },
    { passive: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
