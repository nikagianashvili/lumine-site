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

// ── tasks ────────────────────────────────────────────────────────────────

const TASK_STATUSES = ["todo", "in_progress", "review", "done"];

function taskRow(task) {
  const tr = document.createElement("tr");
  const statusOptions = TASK_STATUSES.map(
    (s) => `<option value="${s}" ${s === task.status ? "selected" : ""}>${s.replace("_", " ")}</option>`,
  ).join("");

  tr.innerHTML = `
    <td>${task.title}</td>
    <td>${task.priority}</td>
    <td>${task.due_date ? formatDate(task.due_date) : "—"}</td>
    <td><select data-id="${task.id}" class="task-status">${statusOptions}</select></td>
    <td>${formatDate(task.created_at)}</td>
  `;
  return tr;
}

async function loadTasks() {
  const res = await adminFetch("/api/admin/tasks");
  const { tasks } = await res.json();

  const body = document.getElementById("tasksBody");
  const empty = document.getElementById("tasksEmpty");
  body.innerHTML = "";
  empty.hidden = tasks.length !== 0;
  tasks.forEach((t) => body.appendChild(taskRow(t)));

  body.querySelectorAll(".task-status").forEach((select) => {
    select.addEventListener("change", async () => {
      await adminFetch("/api/admin/tasks", {
        method: "PATCH",
        body: JSON.stringify({ id: select.dataset.id, status: select.value }),
      });
    });
  });
}

document.getElementById("addTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  await adminFetch("/api/admin/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: form.title.value.trim(),
      priority: form.priority.value,
      due_date: form.due_date.value || null,
    }),
  });
  form.reset();
  loadTasks();
});

// ── init ─────────────────────────────────────────────────────────────────

loadClients();
loadTasks();
