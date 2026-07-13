// Site-wide "Ask Lumine AI" chat widget — floating bubble + live chat panel.
// Requires name + email before chatting (creates a clients row immediately
// via /api/ai/chat/start), then a multi-turn conversation via
// /api/ai/chat/message. Conversation state persists in sessionStorage so
// navigating between pages doesn't reset an in-progress chat.

const STORAGE_KEY = "lumine_chat_conversation";
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

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

function buildWidget() {
  const wrap = document.createElement("div");
  wrap.className = "chat-widget";
  wrap.innerHTML = `
    <button class="chat-bubble" type="button" aria-label="${MSG.bubbleLabel}">✦</button>
    <div class="chat-panel" role="dialog" aria-label="${MSG.title}">
      <div class="chat-panel-head">
        <span class="chat-panel-head-title"><span class="sparkle">✦</span> ${MSG.title}</span>
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

function messageEl(role, content) {
  const el = document.createElement("div");
  el.className = `chat-msg role-${role}`;
  el.textContent = content;
  return el;
}

function typingEl() {
  const el = document.createElement("div");
  el.className = "chat-msg role-assistant is-typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  return el;
}

function renderThread(body, getState, persist) {
  body.innerHTML = "";
  const messages = document.createElement("div");
  messages.className = "chat-messages";
  const state = getState();
  if (state.messages.length === 0) {
    messages.appendChild(messageEl("assistant", MSG.greeting));
  } else {
    state.messages.forEach((m) => messages.appendChild(messageEl(m.role, m.content)));
  }
  body.appendChild(messages);

  const inputRow = document.createElement("div");
  inputRow.className = "chat-input-row";
  inputRow.innerHTML = `
    <input type="text" placeholder="${MSG.placeholder}" autocomplete="off" />
    <button class="chat-send-btn" type="button" aria-label="${MSG.send}">➤</button>
  `;
  body.appendChild(inputRow);

  const input = inputRow.querySelector("input");
  const sendBtn = inputRow.querySelector(".chat-send-btn");

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }
  scrollToBottom();

  async function send() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = "";
    sendBtn.disabled = true;

    const current = getState();
    messages.appendChild(messageEl("user", text));
    current.messages.push({ role: "user", content: text });
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
      typing.remove();
      messages.appendChild(messageEl("assistant", reply));
      current.messages.push({ role: "assistant", content: reply });
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
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
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
    panel.querySelector("input")?.focus();
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
