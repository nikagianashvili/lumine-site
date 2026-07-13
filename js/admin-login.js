import { saveSession, getSession } from "/js/admin-session.js";

// Already logged in — skip straight to the dashboard.
if (getSession()) window.location.href = "/admin";

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");
const submitBtn = document.getElementById("loginSubmit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  submitBtn.disabled = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "Login failed.";
      errorEl.hidden = false;
      submitBtn.disabled = false;
      return;
    }

    saveSession(data);
    window.location.href = "/admin";
  } catch (err) {
    errorEl.textContent = "Could not reach the server. Try again.";
    errorEl.hidden = false;
    submitBtn.disabled = false;
  }
});
