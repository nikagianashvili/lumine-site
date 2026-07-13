import { getSession, clearSession, adminFetch } from "/js/admin-session.js";

const session = getSession();
if (!session) window.location.href = "/admin-login";

document.getElementById("userEmail").textContent = session?.user?.email || "";

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "/admin-login";
});

// ── tabs ─────────────────────────────────────────────────────────────────

document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    document.querySelectorAll(".admin-panel").forEach((p) => {
      p.hidden = p.id !== `panel-${tab.dataset.tab}`;
    });
  });
});

// ── clients ──────────────────────────────────────────────────────────────

const CLIENT_STATUSES = ["new", "hot", "warm", "cold", "client", "lost"];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

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

// ── tasks (kanban board) ─────────────────────────────────────────────────

const TASK_STATUSES = ["todo", "in_progress", "review", "done"];
let teamMembers = [];

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

async function loadTeamMembers() {
  const res = await adminFetch("/api/admin/team-members");
  const { teamMembers: members } = await res.json();
  teamMembers = members;

  const select = document.getElementById("taskAssignee");
  select.innerHTML =
    `<option value="">Unassigned</option>` +
    teamMembers.map((m) => `<option value="${m.id}">${m.name || m.role}</option>`).join("");
}

function taskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.dataset.id = task.id;

  const assignee = teamMembers.find((m) => m.id === task.assignee);

  card.innerHTML = `
    <span class="task-priority priority-${task.priority}">${task.priority}</span>
    <span class="task-title">${task.title}</span>
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

async function loadTasks() {
  const res = await adminFetch("/api/admin/tasks");
  const { tasks } = await res.json();

  document.getElementById("tasksEmpty").hidden = tasks.length !== 0;

  TASK_STATUSES.forEach((status) => {
    const container = document.querySelector(`[data-cards="${status}"]`);
    const countEl = document.querySelector(`[data-count="${status}"]`);
    container.innerHTML = "";
    const inColumn = tasks.filter((t) => t.status === status);
    countEl.textContent = inColumn.length;
    inColumn.forEach((t) => container.appendChild(taskCard(t)));
  });
}

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

document.getElementById("toggleAddTask").addEventListener("click", () => {
  const form = document.getElementById("addTaskForm");
  form.hidden = !form.hidden;
});

document.getElementById("addTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  await adminFetch("/api/admin/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: form.title.value.trim(),
      priority: form.priority.value,
      due_date: form.due_date.value || null,
      assignee: form.assignee.value || null,
    }),
  });
  form.reset();
  form.hidden = true;
  loadTasks();
});

// ── init ─────────────────────────────────────────────────────────────────

loadClients();
loadTeamMembers().then(loadTasks);
