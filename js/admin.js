import { getSession, clearSession, adminFetch } from "/js/admin-session.js";

const session = getSession();
if (!session) window.location.href = "/admin-login";

document.getElementById("userEmail").textContent = session?.user?.email || "";

function logout() {
  clearSession();
  window.location.href = "/admin-login";
}
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("dropdownLogout").addEventListener("click", logout);

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// stable placeholder attach/comment counts per task (mock data by design for
// this stage — derived from the id so they don't reshuffle on every render)
function pseudoCounts(id) {
  let h = 0;
  for (const ch of String(id)) h = (h + ch.charCodeAt(0)) % 997;
  return { attachments: h % 4, comments: h % 7 };
}

// ── toast ────────────────────────────────────────────────────────────────

const toastEl = document.getElementById("toast");
let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

// ── theme (light / dark / system) ────────────────────────────────────────

const shell = document.getElementById("adminShell");
const THEME_KEY = "lumine_admin_theme";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function themePref() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function applyThemePref(pref) {
  localStorage.setItem(THEME_KEY, pref);
  const dark = pref === "dark" || (pref === "system" && systemDark.matches);
  if (dark) shell.dataset.theme = "dark";
  else delete shell.dataset.theme;
  document.getElementById("lightModeBtn").classList.toggle("is-active", pref === "light");
  document.getElementById("darkModeBtn").classList.toggle("is-active", pref === "dark");
  document.querySelectorAll('input[name="themePref"]').forEach((r) => {
    r.checked = r.value === pref;
  });
}

applyThemePref(themePref());
systemDark.addEventListener("change", () => {
  if (themePref() === "system") applyThemePref("system");
});
document.getElementById("lightModeBtn").addEventListener("click", () => applyThemePref("light"));
document.getElementById("darkModeBtn").addEventListener("click", () => applyThemePref("dark"));
document.getElementById("themeChoice").addEventListener("change", (e) => {
  if (e.target.name === "themePref") applyThemePref(e.target.value);
});

// ── page navigation ──────────────────────────────────────────────────────

function goToPage(page) {
  document.querySelectorAll("[data-page]").forEach((el) => el.classList.toggle("is-active", el.dataset.page === page));
  document.querySelectorAll(".admin-page").forEach((p) => {
    p.hidden = p.id !== `page-${page}`;
  });
  closeAllPopovers();
}

document.querySelectorAll("[data-page]").forEach((el) => {
  el.addEventListener("click", () => goToPage(el.dataset.page));
});

// ── popovers (user menu, bell, search, ai) ───────────────────────────────

const userDropdown = document.getElementById("userDropdown");
const bellDropdown = document.getElementById("bellDropdown");
const searchPopover = document.getElementById("searchPopover");
const aiPopover = document.getElementById("aiPopover");

function closeAllPopovers(except) {
  [userDropdown, bellDropdown, searchPopover, aiPopover].forEach((p) => {
    if (p !== except) p.hidden = true;
  });
  closeContextMenu();
}

function wirePopover(btnId, popover, onOpen) {
  document.getElementById(btnId).addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = popover.hidden;
    closeAllPopovers(popover);
    popover.hidden = !willOpen;
    if (willOpen && onOpen) onOpen();
  });
  popover.addEventListener("click", (e) => e.stopPropagation());
}

wirePopover("userMenuBtn", userDropdown);
wirePopover("bellBtn", bellDropdown, renderNotifications);
wirePopover("searchBtn", searchPopover, () => document.getElementById("searchInput").focus());
wirePopover("askAiBtn", aiPopover);
document.addEventListener("click", () => closeAllPopovers());

// ── notifications (placeholder items, real read/unread state) ───────────

const NOTIF_KEY = "lumine_admin_notif_read";
const NOTIFICATIONS = [
  { id: "n1", text: "Welcome to Lumine Admin — your workspace is live." },
  { id: "n2", text: "Vantage Clinic — Booking Site is due 28 Jul." },
  { id: "n3", text: "Lumine AI joins this dashboard soon — watch this space." },
];

function readSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function renderNotifications() {
  const read = readSet();
  const list = document.getElementById("bellList");
  list.innerHTML = "";
  NOTIFICATIONS.forEach((n) => {
    const item = document.createElement("button");
    item.className = "bell-item" + (read.has(n.id) ? " is-read" : "");
    item.innerHTML = `<span class="unread-dot"></span><span>${n.text}</span>`;
    item.addEventListener("click", () => {
      const set = readSet();
      set.has(n.id) ? set.delete(n.id) : set.add(n.id);
      localStorage.setItem(NOTIF_KEY, JSON.stringify([...set]));
      renderNotifications();
    });
    list.appendChild(item);
  });
  document.getElementById("bellDot").hidden = NOTIFICATIONS.every((n) => read.has(n.id));
}
renderNotifications();

// ── AI banner ────────────────────────────────────────────────────────────

const BANNER_KEY = "lumine_admin_ai_banner_dismissed";
const aiBanner = document.getElementById("aiBanner");
if (localStorage.getItem(BANNER_KEY)) aiBanner.hidden = true;
document.getElementById("aiBannerDismiss").addEventListener("click", () => {
  aiBanner.hidden = true;
  localStorage.setItem(BANNER_KEY, "1");
});
document.getElementById("aiBannerDetails").addEventListener("click", () => {
  toast("Lumine AI arrives with the AI front office — it will chat with visitors and qualify leads.");
});

// ── greeting ─────────────────────────────────────────────────────────────

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── context menu helper (columns + folders) ──────────────────────────────

let contextMenuEl = null;
function closeContextMenu() {
  if (contextMenuEl) {
    contextMenuEl.remove();
    contextMenuEl = null;
  }
}

function openContextMenu(anchor, items) {
  closeAllPopovers();
  const menu = document.createElement("div");
  menu.className = "context-menu";
  items.forEach(({ label, action }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      closeContextMenu();
      action();
    });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const rect = anchor.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.left = `${Math.min(rect.left, window.innerWidth - menu.offsetWidth - 12)}px`;
  menu.addEventListener("click", (e) => e.stopPropagation());
  contextMenuEl = menu;
}

// ── folders (client-side state, persisted locally) ───────────────────────

const FOLDER_KEY = "lumine_admin_folders";
const DEFAULT_FOLDERS = [
  { name: "My Portfolio", count: 9, icon: "folder" },
  { name: "Client Projects", count: 0, icon: "folder" },
  { name: "Web Development Assets", count: 0, icon: "code" },
  { name: "Photo & Video Assets", count: 0, icon: "image" },
  { name: "Graphic Design Assets", count: 0, icon: "pen" },
  { name: "Brand Guidelines", count: 0, icon: "book" },
  { name: "Contracts & Invoices", count: 0, icon: "doc" },
  { name: "Legal Documents", count: 0, icon: "doc" },
];

function loadFolders() {
  try {
    const stored = JSON.parse(localStorage.getItem(FOLDER_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {}
  return structuredClone(DEFAULT_FOLDERS);
}

let folders = loadFolders();
function saveFolders() {
  localStorage.setItem(FOLDER_KEY, JSON.stringify(folders));
}

const FOLDER_ICONS = {
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-9 9"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
  book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/>',
  doc: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/>',
};

function folderIconSvg(icon) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${FOLDER_ICONS[icon] || FOLDER_ICONS.folder}</svg>`;
}

// folder modal serves add + rename
const folderModal = document.getElementById("folderModalOverlay");
const folderNameInput = document.getElementById("folderNameInput");
let folderEditIndex = null;

function openFolderModal(index = null) {
  folderEditIndex = index;
  document.getElementById("folderModalTitle").textContent = index === null ? "New Folder" : "Rename Folder";
  document.getElementById("folderModalSubmit").textContent = index === null ? "Add Folder" : "Rename";
  folderNameInput.value = index === null ? "" : folders[index].name;
  folderModal.hidden = false;
  folderNameInput.focus();
}

document.getElementById("closeFolderModal").addEventListener("click", () => (folderModal.hidden = true));
folderModal.addEventListener("click", (e) => {
  if (e.target === folderModal) folderModal.hidden = true;
});
document.getElementById("folderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = folderNameInput.value.trim();
  if (!name) return;
  if (folderEditIndex === null) {
    folders.push({ name, count: 0, icon: "folder" });
    toast(`Folder "${name}" added`);
  } else {
    folders[folderEditIndex].name = name;
    toast("Folder renamed");
  }
  saveFolders();
  folderModal.hidden = true;
  renderFolderGrids();
});

function folderCard(folder, index, revealIndex) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "folder-card rv";
  card.style.setProperty("--rv", revealIndex);
  card.innerHTML = `
    <span class="folder-card-icon">${folderIconSvg(folder.icon)}</span>
    <span>
      <span class="folder-card-count">${folder.count} File${folder.count === 1 ? "" : "s"}</span><br />
      <span class="folder-card-name">${folder.name}</span>
    </span>
    <span class="icon-btn folder-menu-btn" data-folder-menu="${index}" role="button" aria-label="Folder options">⋯</span>
  `;
  card.addEventListener("click", (e) => {
    if (e.target.closest("[data-folder-menu]")) {
      e.stopPropagation();
      openContextMenu(e.target.closest("[data-folder-menu]"), [
        { label: "Rename", action: () => openFolderModal(index) },
        {
          label: "Delete",
          action: () => {
            const removed = folders.splice(index, 1)[0];
            saveFolders();
            renderFolderGrids();
            toast(`Folder "${removed.name}" deleted`);
          },
        },
      ]);
      return;
    }
    openFolder(folder);
  });
  return card;
}

function addFolderCard(revealIndex) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "folder-card is-add rv";
  card.style.setProperty("--rv", revealIndex);
  card.innerHTML = `<span class="folder-card-icon">+</span><span>Add New Folder</span>`;
  card.addEventListener("click", () => openFolderModal(null));
  return card;
}

function openFolder(folder) {
  goToPage("folders");
  const list = document.getElementById("folderFileList");
  list.hidden = false;
  list.textContent =
    folder.count > 0
      ? `"${folder.name}" holds ${folder.count} portfolio entries — file browsing arrives with document management.`
      : `No files in "${folder.name}" yet — this folder is ready for when you upload real project files.`;
}

function renderFolderGrids() {
  ["folderGrid", "folderGridFull"].forEach((id) => {
    const grid = document.getElementById(id);
    grid.innerHTML = "";
    grid.appendChild(addFolderCard(2));
    folders.forEach((f, i) => grid.appendChild(folderCard(f, i, 2 + Math.min(i, 6) * 0.5)));
  });
}

// ── clients ──────────────────────────────────────────────────────────────

const CLIENT_STATUSES = ["new", "hot", "warm", "cold", "client", "lost"];

function clientRow(client) {
  const tr = document.createElement("tr");
  const statusOptions = CLIENT_STATUSES.map(
    (s) => `<option value="${s}" ${s === client.status ? "selected" : ""}>${s}</option>`,
  ).join("");

  tr.innerHTML = `
    <td>${client.name || "—"}</td>
    <td>${client.email || "—"}</td>
    <td>${client.company || "—"}</td>
    <td>${client.source}</td>
    <td><select data-id="${client.id}" class="client-status">${statusOptions}</select></td>
    <td>${formatDate(client.created_at)}</td>
  `;
  return tr;
}

async function loadClients() {
  const res = await adminFetch("/api/admin/clients");
  const { clients } = await res.json();

  const body = document.getElementById("clientsBody");
  const empty = document.getElementById("clientsEmpty");
  body.innerHTML = "";
  empty.hidden = clients.length !== 0;
  clients.forEach((c) => body.appendChild(clientRow(c)));

  body.querySelectorAll(".client-status").forEach((select) => {
    select.addEventListener("change", async () => {
      await adminFetch("/api/admin/clients", {
        method: "PATCH",
        body: JSON.stringify({ id: select.dataset.id, status: select.value }),
      });
      toast("Client status updated");
    });
  });
}

document.getElementById("addClientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  await adminFetch("/api/admin/clients", {
    method: "POST",
    body: JSON.stringify({
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      status: form.status.value,
      source: "manual",
    }),
  });
  form.reset();
  toast("Client added");
  loadClients();
});

// ── tasks: shared data, search filter, 4 views ───────────────────────────

const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
const STATUS_STAGE = { todo: 0, in_progress: 2, review: 3, done: 4 };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const SERVICE_LABELS = { web: "Web Development", "photo-video": "Photo & Video", design: "Graphic Design" };

let teamMembers = [];
let tasksCache = [];
let currentView = "board";
let calendarCursor = new Date();
let searchQuery = "";
const columnSort = {};

function filteredTasks() {
  if (!searchQuery) return tasksCache;
  const q = searchQuery.toLowerCase();
  return tasksCache.filter((t) => t.title.toLowerCase().includes(q));
}

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim();
  renderCurrentView();
});
document.getElementById("searchClear").addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  renderCurrentView();
  searchInput.focus();
});

async function loadTeamMembers() {
  const res = await adminFetch("/api/admin/team-members");
  const { teamMembers: members } = await res.json();
  teamMembers = members;

  const select = document.getElementById("taskAssignee");
  select.innerHTML =
    `<option value="">Unassigned</option>` +
    teamMembers.map((m) => `<option value="${m.id}">${m.name || m.role}</option>`).join("");

  renderAvatars();

  const me = teamMembers.find((m) => m.id === session?.user?.id);
  document.getElementById("greetingText").textContent = `${greetingWord()}${me?.name ? `, ${me.name.split(" ")[0]}` : ""}`;
  populateProfile();
}

// avatar photo (client-side, per this browser)
const AVATAR_KEY = "lumine_admin_avatar";

function avatarHTML(member, self) {
  const photo = self ? localStorage.getItem(AVATAR_KEY) : null;
  if (photo) return `<img src="${photo}" alt="${member?.name || "You"}" />`;
  return initials(member?.name);
}

function renderAvatars() {
  const me = teamMembers.find((m) => m.id === session?.user?.id);
  const stack = document.getElementById("avatarStack");
  const MAX = 4;
  const shown = teamMembers.slice(0, MAX);
  const extra = teamMembers.length - shown.length;
  stack.innerHTML =
    shown
      .map(
        (m) =>
          `<span class="avatar-circle" title="${m.name || m.role}">${avatarHTML(m, m.id === session?.user?.id)}</span>`,
      )
      .join("") + (extra > 0 ? `<span class="avatar-circle" title="${extra} more">+${extra}</span>` : "");

  document.getElementById("userAvatar").innerHTML = avatarHTML(me, true);
  document.getElementById("profileAvatarPreview").innerHTML = avatarHTML(me, true);
}

function taskCard(task, revealIndex) {
  const card = document.createElement("div");
  card.className = "task-card rv";
  card.style.setProperty("--rv", revealIndex);
  card.draggable = true;
  card.dataset.id = task.id;

  const assignee = teamMembers.find((m) => m.id === task.assignee);
  const stage = STATUS_STAGE[task.status];
  const counts = pseudoCounts(task.id);

  card.innerHTML = `
    <span class="task-priority priority-${task.priority}">${task.priority}</span>
    <span class="task-category">${task.service_type ? SERVICE_LABELS[task.service_type] || task.service_type : "General"}</span>
    <span class="task-title">${task.title}</span>
    <div class="task-progress-row">
      <span>Progress</span>
      <span>${stage}/4</span>
    </div>
    <div class="task-progress-track">
      <div class="task-progress-fill status-${task.status}" style="width:${(stage / 4) * 100}%"></div>
    </div>
    <div class="task-meta-row">
      <span class="task-due">${task.due_date ? `Due ${formatDate(task.due_date)}` : ""}</span>
      <span class="task-attach-row">
        <span title="Attachments">📎 ${counts.attachments}</span>
        <span title="Comments">💬 ${counts.comments}</span>
        ${assignee ? `<span class="task-assignee" data-tooltip="${assignee.name}${assignee.role ? ` — ${assignee.role}` : ""}">${initials(assignee.name)}</span>` : ""}
      </span>
    </div>
  `;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    card.classList.add("is-dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("is-dragging"));

  return card;
}

function sortColumn(tasks, status) {
  const mode = columnSort[status];
  if (!mode) return tasks;
  const sorted = [...tasks];
  if (mode === "due") sorted.sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));
  if (mode === "priority") sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  return sorted;
}

function renderBoard() {
  const tasks = filteredTasks();
  document.getElementById("tasksEmpty").hidden = tasks.length !== 0;
  TASK_STATUSES.forEach((status) => {
    const container = document.querySelector(`[data-cards="${status}"]`);
    const countEl = document.querySelector(`[data-count="${status}"]`);
    container.innerHTML = "";
    const inColumn = sortColumn(
      tasks.filter((t) => t.status === status),
      status,
    );
    countEl.textContent = inColumn.length;
    inColumn.forEach((t, i) => container.appendChild(taskCard(t, i * 0.7)));
  });
}

document.querySelectorAll(".col-menu-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const status = btn.dataset.menu;
    openContextMenu(btn, [
      { label: "Sort by due date", action: () => ((columnSort[status] = "due"), renderBoard()) },
      { label: "Sort by priority", action: () => ((columnSort[status] = "priority"), renderBoard()) },
      { label: "Clear sorting", action: () => ((columnSort[status] = null), renderBoard()) },
    ]);
  });
});

function renderTimeline() {
  const wrap = document.getElementById("timelineWrap");
  wrap.innerHTML = "";

  const dated = filteredTasks().filter((t) => t.due_date);
  if (dated.length === 0) {
    wrap.innerHTML = `<p class="admin-empty">No due dates set yet.</p>`;
    return;
  }

  const dates = dated.map((t) => new Date(t.due_date).getTime());
  const min = Math.min(...dates, Date.now());
  const max = Math.max(...dates, Date.now()) + 1000 * 60 * 60 * 24;
  const span = Math.max(max - min, 1);

  dated.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "timeline-row rv";
    row.style.setProperty("--rv", i * 0.5);
    const pos = ((new Date(t.due_date).getTime() - min) / span) * 100;
    row.innerHTML = `
      <span class="timeline-row-label">${t.title}</span>
      <div class="timeline-track">
        <span class="timeline-bar priority-${t.priority}" style="left:${Math.min(pos, 92)}%">${formatDate(t.due_date)}</span>
      </div>
    `;
    wrap.appendChild(row);
  });
}

function renderSpreadsheet() {
  const body = document.getElementById("sheetBody");
  body.innerHTML = "";
  filteredTasks().forEach((t) => {
    const assignee = teamMembers.find((m) => m.id === t.assignee);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.title}</td>
      <td>${t.service_type ? SERVICE_LABELS[t.service_type] || t.service_type : "General"}</td>
      <td>${t.priority}</td>
      <td>${t.status.replace("_", " ")}</td>
      <td>${t.due_date ? formatDate(t.due_date) : "—"}</td>
      <td>${assignee ? assignee.name : "Unassigned"}</td>
    `;
    body.appendChild(tr);
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  document.getElementById("calLabel").textContent = calendarCursor.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = {};
  filteredTasks().forEach((t) => {
    if (!t.due_date) return;
    const key = t.due_date.slice(0, 10);
    (byDate[key] ||= []).push(t);
  });

  for (let i = 0; i < startOffset; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell is-outside";
    grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayTasks = byDate[key] || [];
    cell.innerHTML =
      `<div class="calendar-date">${d}</div>` +
      dayTasks.map((t) => `<div class="calendar-task">${t.title}</div>`).join("");
    grid.appendChild(cell);
  }
}

function renderCurrentView() {
  if (currentView === "board") renderBoard();
  if (currentView === "timeline") renderTimeline();
  if (currentView === "spreadsheet") renderSpreadsheet();
  if (currentView === "calendar") renderCalendar();
}

async function loadTasks() {
  const res = await adminFetch("/api/admin/tasks");
  const { tasks } = await res.json();
  tasksCache = tasks;
  renderCurrentView();
}

document.getElementById("viewSwitcher").addEventListener("click", (e) => {
  const tab = e.target.closest(".view-tab");
  if (!tab) return;
  currentView = tab.dataset.view;
  document.querySelectorAll(".view-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
  document.querySelectorAll(".admin-view").forEach((v) => {
    const show = v.id === `view-${currentView}`;
    v.hidden = !show;
    v.classList.toggle("view-entering", show);
    if (show) v.addEventListener("animationend", () => v.classList.remove("view-entering"), { once: true });
  });
  renderCurrentView();
});

document.getElementById("calPrev").addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() - 1);
  renderCalendar();
});
document.getElementById("calNext").addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() + 1);
  renderCalendar();
});

document.querySelectorAll(".admin-board-col").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add("is-drag-over");
  });
  col.addEventListener("dragleave", () => col.classList.remove("is-drag-over"));
  col.addEventListener("drop", async (e) => {
    e.preventDefault();
    col.classList.remove("is-drag-over");
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    await adminFetch("/api/admin/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id: taskId, status: col.dataset.status }),
    });
    loadTasks();
  });
});

// ── create task modal ────────────────────────────────────────────────────

const taskModal = document.getElementById("taskModalOverlay");
document.getElementById("openTaskModal").addEventListener("click", () => {
  taskModal.hidden = false;
});
document.getElementById("closeTaskModal").addEventListener("click", () => (taskModal.hidden = true));
taskModal.addEventListener("click", (e) => {
  if (e.target === taskModal) taskModal.hidden = true;
});

document.getElementById("addTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    title: form.title.value.trim(),
    service_type: form.service_type.value || null,
    priority: form.priority.value,
    due_date: form.due_date.value || null,
    assignee: form.assignee.value || null,
  };
  let res = await adminFetch("/api/admin/tasks", { method: "POST", body: JSON.stringify(payload) });
  if (!res.ok) {
    const { error } = await res.json();
    // service_type column may not exist yet (manual migration pending) —
    // retry without it rather than losing the task
    if (error && error.includes("service_type")) {
      delete payload.service_type;
      res = await adminFetch("/api/admin/tasks", { method: "POST", body: JSON.stringify(payload) });
      if (res.ok) toast("Task added (category will save once the database update runs)");
    } else {
      toast(error || "Could not add task");
      return;
    }
  } else {
    toast("Task added");
  }
  form.reset();
  taskModal.hidden = true;
  loadTasks();
});

// ── profile settings ─────────────────────────────────────────────────────

function me() {
  return teamMembers.find((m) => m.id === session?.user?.id);
}

function populateProfile() {
  const member = me();
  const [first = "", ...rest] = (member?.name || "").split(" ");
  document.getElementById("profileFirst").value = first;
  document.getElementById("profileLast").value = rest.join(" ");
  document.getElementById("profileRole").value = member?.role || "";
  document.getElementById("profileEmail").value = session?.user?.email || "";
  document.getElementById("emailVerifyBanner").hidden = true;
}

document.getElementById("profileEmail").addEventListener("input", (e) => {
  document.getElementById("emailVerifyBanner").hidden = e.target.value.trim() === (session?.user?.email || "");
});

document.getElementById("profileSave").addEventListener("click", async () => {
  const name = `${document.getElementById("profileFirst").value.trim()} ${document.getElementById("profileLast").value.trim()}`.trim();
  const role = document.getElementById("profileRole").value.trim();
  const res = await adminFetch("/api/admin/profile", {
    method: "PATCH",
    body: JSON.stringify({ name, role }),
  });
  if (res.ok) {
    toast("Profile updated");
    await loadTeamMembers();
    renderCurrentView();
  } else {
    const { error } = await res.json();
    toast(error || "Could not save profile");
  }
});

document.getElementById("profileCancel").addEventListener("click", () => {
  populateProfile();
  toast("Changes discarded");
});

document.getElementById("passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("pwError");
  errEl.hidden = true;
  const current = document.getElementById("pwCurrent").value;
  const next = document.getElementById("pwNew").value;
  const confirm = document.getElementById("pwConfirm").value;

  if (next !== confirm) {
    errEl.textContent = "New passwords don't match.";
    errEl.hidden = false;
    return;
  }
  if (next.length < 8) {
    errEl.textContent = "New password needs at least 8 characters.";
    errEl.hidden = false;
    return;
  }

  const res = await adminFetch("/api/admin/profile", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword: current, newPassword: next }),
  });
  if (res.ok) {
    e.target.reset();
    toast("Password changed");
  } else {
    const { error } = await res.json();
    errEl.textContent = error || "Could not change password.";
    errEl.hidden = false;
  }
});

// avatar upload
const avatarDrop = document.getElementById("avatarDrop");
const avatarFile = document.getElementById("avatarFile");

function setAvatarFromFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(AVATAR_KEY, reader.result);
    renderAvatars();
    toast("Photo updated");
  };
  reader.readAsDataURL(file);
}

avatarFile.addEventListener("change", () => setAvatarFromFile(avatarFile.files[0]));
avatarDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
  avatarDrop.classList.add("is-drag-over");
});
avatarDrop.addEventListener("dragleave", () => avatarDrop.classList.remove("is-drag-over"));
avatarDrop.addEventListener("drop", (e) => {
  e.preventDefault();
  avatarDrop.classList.remove("is-drag-over");
  setAvatarFromFile(e.dataTransfer.files[0]);
});
document.getElementById("avatarRemove").addEventListener("click", () => {
  localStorage.removeItem(AVATAR_KEY);
  renderAvatars();
  toast("Photo removed");
});

// notification preference toggles (client-side state)
const PREF_KEY = "lumine_admin_prefs";
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  } catch {
    return {};
  }
}
const prefs = loadPrefs();
document.querySelectorAll(".pref-toggle").forEach((input) => {
  input.checked = Boolean(prefs[input.dataset.pref]);
  input.addEventListener("change", () => {
    prefs[input.dataset.pref] = input.checked;
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    toast(input.checked ? "Notification enabled" : "Notification disabled");
  });
});

// ── init ─────────────────────────────────────────────────────────────────

renderFolderGrids();
loadClients();
loadTeamMembers().then(loadTasks);
