import { getSession, clearSession, adminFetch } from "/js/admin-session.js";

const session = getSession();
if (!session) window.location.href = "/admin-login";

document.getElementById("userEmail").textContent = session?.user?.email || "";
document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "/admin-login";
});

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

// ── theme (light/dark) ───────────────────────────────────────────────────

const shell = document.getElementById("adminShell");
const THEME_KEY = "lumine_admin_theme";

function applyTheme(theme) {
  if (theme === "dark") shell.dataset.theme = "dark";
  else delete shell.dataset.theme;
  document.getElementById("lightModeBtn").classList.toggle("is-active", theme !== "dark");
  document.getElementById("darkModeBtn").classList.toggle("is-active", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
}

applyTheme(localStorage.getItem(THEME_KEY) || "light");
document.getElementById("lightModeBtn").addEventListener("click", () => applyTheme("light"));
document.getElementById("darkModeBtn").addEventListener("click", () => applyTheme("dark"));

// ── page navigation (rail icons + top nav tabs share data-page) ─────────

function goToPage(page) {
  document.querySelectorAll("[data-page]").forEach((el) => el.classList.toggle("is-active", el.dataset.page === page));
  document.querySelectorAll(".admin-page").forEach((p) => {
    p.hidden = p.id !== `page-${page}`;
  });
}

document.querySelectorAll("[data-page]").forEach((el) => {
  el.addEventListener("click", () => goToPage(el.dataset.page));
});

// ── user menu dropdown ───────────────────────────────────────────────────

const userMenuBtn = document.getElementById("userMenuBtn");
const userDropdown = document.getElementById("userDropdown");
userMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown.hidden = !userDropdown.hidden;
});
document.addEventListener("click", () => {
  userDropdown.hidden = true;
});

// ── greeting ─────────────────────────────────────────────────────────────

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── folders (placeholder counts, honest empty-state on click) ───────────

const FOLDERS = [
  { name: "My Portfolio", count: 9, icon: "folder" },
  { name: "Client Projects", count: 0, icon: "folder" },
  { name: "Web Development Assets", count: 0, icon: "code" },
  { name: "Photo & Video Assets", count: 0, icon: "image" },
  { name: "Graphic Design Assets", count: 0, icon: "pen" },
  { name: "Brand Guidelines", count: 0, icon: "book" },
  { name: "Contracts & Invoices", count: 0, icon: "doc" },
  { name: "Legal Documents", count: 0, icon: "doc" },
];

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

function folderCard(folder) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "folder-card";
  card.innerHTML = `
    <span class="folder-card-icon">${folderIconSvg(folder.icon)}</span>
    <span>
      <span class="folder-card-count">${folder.count} File${folder.count === 1 ? "" : "s"}</span><br />
      <span class="folder-card-name">${folder.name}</span>
    </span>
  `;
  card.addEventListener("click", () => openFolder(folder));
  return card;
}

function addFolderCard() {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "folder-card is-add";
  card.innerHTML = `<span class="folder-card-icon">+</span><span>Add New Folder</span>`;
  return card;
}

function openFolder(folder) {
  goToPage("folders");
  const list = document.getElementById("folderFileList");
  list.hidden = false;
  list.textContent = `No files in "${folder.name}" yet — this folder is ready for when you upload real project files.`;
}

function renderFolderGrids() {
  ["folderGrid", "folderGridFull"].forEach((id) => {
    const grid = document.getElementById(id);
    grid.innerHTML = "";
    grid.appendChild(addFolderCard());
    FOLDERS.forEach((f) => grid.appendChild(folderCard(f)));
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
  loadClients();
});

// ── tasks: shared data + 4 views ─────────────────────────────────────────

const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
const STATUS_PROGRESS = { todo: 0, in_progress: 50, review: 75, done: 100 };
const SERVICE_LABELS = { web: "Web Development", "photo-video": "Photo & Video", design: "Graphic Design" };

let teamMembers = [];
let tasksCache = [];
let currentView = "board";
let calendarCursor = new Date();

async function loadTeamMembers() {
  const res = await adminFetch("/api/admin/team-members");
  const { teamMembers: members } = await res.json();
  teamMembers = members;

  const select = document.getElementById("taskAssignee");
  select.innerHTML =
    `<option value="">Unassigned</option>` +
    teamMembers.map((m) => `<option value="${m.id}">${m.name || m.role}</option>`).join("");

  const stack = document.getElementById("avatarStack");
  stack.innerHTML = teamMembers
    .map((m) => `<span class="avatar-circle" title="${m.name || m.role}">${initials(m.name)}</span>`)
    .join("");

  document.getElementById("userAvatarInitials").textContent = initials(
    teamMembers.find((m) => m.id === session?.user?.id)?.name,
  );

  const me = teamMembers.find((m) => m.id === session?.user?.id);
  document.getElementById("greetingText").textContent = `${greetingWord()}${me?.name ? `, ${me.name}` : ""}`;
}

function taskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.dataset.id = task.id;

  const assignee = teamMembers.find((m) => m.id === task.assignee);
  const progress = STATUS_PROGRESS[task.status];

  card.innerHTML = `
    <span class="task-priority priority-${task.priority}">${task.priority}</span>
    <span class="task-category">${task.service_type ? SERVICE_LABELS[task.service_type] || task.service_type : "General"}</span>
    <span class="task-title">${task.title}</span>
    <div class="task-progress-row">
      <span>Progress</span>
      <span>${progress}%</span>
    </div>
    <div class="task-progress-track">
      <div class="task-progress-fill status-${task.status}" style="width:${progress}%"></div>
    </div>
    <div class="task-meta-row">
      <span class="task-due">${task.due_date ? `Due ${formatDate(task.due_date)}` : ""}</span>
      ${assignee ? `<span class="task-assignee" title="${assignee.name}">${initials(assignee.name)}</span>` : ""}
    </div>
  `;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    card.classList.add("is-dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("is-dragging"));

  return card;
}

function renderBoard() {
  document.getElementById("tasksEmpty").hidden = tasksCache.length !== 0;
  TASK_STATUSES.forEach((status) => {
    const container = document.querySelector(`[data-cards="${status}"]`);
    const countEl = document.querySelector(`[data-count="${status}"]`);
    container.innerHTML = "";
    const inColumn = tasksCache.filter((t) => t.status === status);
    countEl.textContent = inColumn.length;
    inColumn.forEach((t) => container.appendChild(taskCard(t)));
  });
}

function renderTimeline() {
  const wrap = document.getElementById("timelineWrap");
  wrap.innerHTML = "";

  const dated = tasksCache.filter((t) => t.due_date);
  if (dated.length === 0) {
    wrap.innerHTML = `<p class="admin-empty">No due dates set yet.</p>`;
    return;
  }

  const dates = dated.map((t) => new Date(t.due_date).getTime());
  const min = Math.min(...dates, Date.now());
  const max = Math.max(...dates, Date.now()) + 1000 * 60 * 60 * 24;
  const span = Math.max(max - min, 1);

  dated.forEach((t) => {
    const row = document.createElement("div");
    row.className = "timeline-row";
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
  tasksCache.forEach((t) => {
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
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = {};
  tasksCache.forEach((t) => {
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
    v.hidden = v.id !== `view-${currentView}`;
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

// drag-and-drop between board columns
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
document.getElementById("closeTaskModal").addEventListener("click", () => {
  taskModal.hidden = true;
});
taskModal.addEventListener("click", (e) => {
  if (e.target === taskModal) taskModal.hidden = true;
});

document.getElementById("addTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  await adminFetch("/api/admin/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: form.title.value.trim(),
      service_type: form.service_type.value || null,
      priority: form.priority.value,
      due_date: form.due_date.value || null,
      assignee: form.assignee.value || null,
    }),
  });
  form.reset();
  taskModal.hidden = true;
  loadTasks();
});

document.getElementById("askAiBtn").addEventListener("click", () => {
  alert("Lumine AI is coming soon — this will open a chat to help plan and qualify work.");
});

// ── init ─────────────────────────────────────────────────────────────────

renderFolderGrids();
loadClients();
loadTeamMembers().then(loadTasks);
