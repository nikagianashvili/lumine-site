// Site-wide "Ask Lumine AI" chat widget — floating bubble + live chat panel.
// Requires name + email before chatting (creates a clients row immediately
// via /api/ai/chat/start), then a multi-turn conversation via
// /api/ai/chat/message. Conversation state persists in sessionStorage so
// navigating between pages doesn't reset an in-progress chat.

const STORAGE_KEY = "lumine_chat_conversation";
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// The reticle/viewfinder mark (public/logo/lumine-mark-2.svg) - deliberately
// NOT the sparkle glyph used everywhere else on the site (nav, hero, footer,
// CTA panel). Inlined with fill="currentColor" so it inherits ink/paper like
// every other on-brand mark; no accent color anywhere in this widget.
const RETICLE_SVG = `<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M229.91,145.323v-26.593c0-2.227-1.805-4.033-4.033-4.033h-20.288c-11.221,0-20.318-9.097-20.318-20.318V17.154c0-2.227-1.805-4.033-4.033-4.033h-27.483c-2.227,0-4.033,1.805-4.033,4.033v48.506c0,2.431-1.971,4.402-4.402,4.402h-26.592c-2.227,0-4.033,1.805-4.033,4.033v20.287c0,11.221-9.096,20.317-20.317,20.317H17.153c-2.227,0-4.033,1.805-4.033,4.033v27.512c0,2.227,1.805,4.033,4.033,4.033h48.506c2.431,0,4.402,1.971,4.402,4.402v26.564c0,2.227,1.805,4.033,4.033,4.033h20.288c11.221,0,20.318,9.097,20.318,20.318v77.256c0,2.227,1.805,4.033,4.033,4.033h27.512c2.227,0,4.033-1.805,4.033-4.033v-48.506c0-2.431,1.971-4.402,4.402-4.402h26.563c2.227,0,4.033-1.805,4.033-4.033v-20.287c0-11.237,9.109-20.346,20.346-20.346h77.228c2.227,0,4.033-1.805,4.033-4.033v-27.482c0-2.227-1.805-4.033-4.033-4.033h-48.535c-2.431,0-4.402-1.971-4.402-4.402ZM147.57,189.133c-5.598-17.367-19.343-31.114-36.694-36.69-2.398-.771-2.4-4.095-.002-4.868,17.352-5.59,31.098-19.34,36.696-36.709.773-2.397,4.098-2.395,4.867.004,5.57,17.367,19.31,31.115,36.66,36.705,2.398.773,2.396,4.097-.002,4.868-17.349,5.576-31.088,19.321-36.658,36.687-.769,2.398-4.095,2.401-4.867.004Z" fill="currentColor"/></svg>`;

const MSG = isKa
  ? {
      bubbleLabel: "Lumine AI-სთან საუბარი",
      title: "Lumine AI",
      intakeIntro: "მიიღეთ პასუხი მყისიერად — მიუთითეთ სახელი და ელფოსტა საუბრის დასაწყებად.",
      name: "სახელი",
      email: "ელფოსტა",
      start: "საუბრის დაწყება",
      missing: "შეავსეთ სახელი და ელფოსტა.",
      placeholder: "დაწერეთ შეტყობინება…",
      greeting: "გამარჯობა! მე ვარ Lumine AI — მკითხეთ სერვისების ან ფასების შესახებ.",
      error: "რაღაც არ გამოვიდა — სცადეთ თავიდან ან მოგვწერეთ hello@lumine.ge-ზე.",
      close: "დახურვა",
      send: "გაგზავნა",
    }
  : {
      bubbleLabel: "Chat with Lumine AI",
      title: "Lumine AI",
      intakeIntro: "Get an instant answer — tell us your name and email to start chatting.",
      name: "Name",
      email: "Email",
      start: "Start chatting",
      missing: "Add your name and email.",
      placeholder: "Type a message…",
      greeting: "Hi! I'm Lumine AI — ask me anything about services or pricing.",
      error: "Something went wrong — try again, or email hello@lumine.ge.",
      close: "Close",
      send: "Send",
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
      out.push(`<${list.type}>${list.items.map((li) => `<li>${li}</li>`).join("")}</${list.type}>`);
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
    return new Date(ts).toLocaleTimeString(isKa ? "ka-GE" : "en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function buildWidget() {
  const wrap = document.createElement("div");
  wrap.className = "chat-widget";
  wrap.innerHTML = `
    <button class="chat-bubble" type="button" aria-label="${MSG.bubbleLabel}">${RETICLE_SVG}</button>
    <div class="chat-panel" role="dialog" aria-label="${MSG.title}">
      <div class="chat-panel-head">
        <span class="chat-panel-head-title"><span class="chat-mark">${RETICLE_SVG}</span> ${MSG.title}</span>
        <button class="chat-panel-close" type="button" aria-label="${MSG.close}">✕</button>
      </div>
      <div class="chat-panel-body"></div>
    </div>
  `;
  document.body.appendChild(wrap);
  return wrap;
}

function renderIntake(body, onStart) {
  body.innerHTML = "";
  const form = document.createElement("form");
  form.className = "chat-intake";
  form.innerHTML = `
    <p>${MSG.intakeIntro}</p>
    <input type="text" name="name" placeholder="${MSG.name}" autocomplete="name" required />
    <input type="email" name="email" placeholder="${MSG.email}" autocomplete="email" required />
    <span class="chat-intake-error"></span>
    <button class="btn btn-solid" type="submit">${MSG.start}</button>
  `;
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
      onStart({ conversationId, name, messages: [] });
    } catch {
      errorEl.textContent = MSG.error;
      submitBtn.disabled = false;
    }
  });
  body.appendChild(form);
}

function messageEl(role, content, ts) {
  const el = document.createElement("div");
  el.className = `chat-msg role-${role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-msg-bubble";
  bubble.innerHTML = formatContent(content);
  el.appendChild(bubble);
  const time = document.createElement("span");
  time.className = "chat-msg-time";
  time.textContent = formatTime(ts || new Date().toISOString());
  el.appendChild(time);
  return el;
}

function typingEl() {
  const el = document.createElement("div");
  el.className = "chat-msg role-assistant is-typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  return el;
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function renderThread(body, getState, persist) {
  body.innerHTML = "";
  const messages = document.createElement("div");
  messages.className = "chat-messages";
  const state = getState();
  if (state.messages.length === 0) {
    messages.appendChild(messageEl("assistant", MSG.greeting));
  } else {
    state.messages.forEach((m) => messages.appendChild(messageEl(m.role, m.content, m.ts)));
  }
  body.appendChild(messages);

  const inputRow = document.createElement("div");
  inputRow.className = "chat-input-row";
  inputRow.innerHTML = `
    <textarea rows="1" placeholder="${MSG.placeholder}" autocomplete="off"></textarea>
    <button class="chat-send-btn" type="button" aria-label="${MSG.send}">➤</button>
  `;
  body.appendChild(inputRow);

  const input = inputRow.querySelector("textarea");
  const sendBtn = inputRow.querySelector(".chat-send-btn");

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }
  scrollToBottom();

  async function send() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = "";
    autoResize(input);
    sendBtn.disabled = true;

    const current = getState();
    const userTs = new Date().toISOString();
    messages.appendChild(messageEl("user", text, userTs));
    current.messages.push({ role: "user", content: text, ts: userTs });
    persist(current);
    scrollToBottom();

    const typing = typingEl();
    messages.appendChild(typing);
    scrollToBottom();

    try {
      const res = await fetch("/api/ai/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: current.conversationId, message: text }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { reply } = await res.json();
      const replyTs = new Date().toISOString();
      typing.remove();
      messages.appendChild(messageEl("assistant", reply, replyTs));
      current.messages.push({ role: "assistant", content: reply, ts: replyTs });
      persist(current);
    } catch {
      typing.remove();
      messages.appendChild(messageEl("assistant", MSG.error));
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
      input.focus();
    }
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("input", () => autoResize(input));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
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

  if (state?.conversationId) {
    renderThread(body, getState, persist);
  } else {
    renderIntake(body, (newState) => {
      persist(newState);
      renderThread(body, getState, persist);
    });
  }

  bubble.addEventListener("click", () => {
    wrap.classList.add("is-open");
    panel.querySelector("textarea, input")?.focus();
  });
  closeBtn.addEventListener("click", () => {
    wrap.classList.remove("is-open");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
