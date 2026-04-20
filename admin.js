const AUTH_SETTINGS_KEY = "mgi_auth_settings";
const DEFAULT_AUTH_SETTINGS = {
  mainUsername: "username",
  mainPassword: "123",
  portfolioUsername: "portfolio",
  portfolioPassword: "123",
  dashboard2Username: "aga",
  dashboard2Password: "123",
  adminPassword: "admin123",
};

const gatePasswordInput = document.getElementById("admin-access-password");
const gateUnlockBtn = document.getElementById("admin-unlock");
const gateMessage = document.getElementById("admin-gate-message");
const gatePanel = document.getElementById("admin-gate-panel");
const settingsPanel = document.getElementById("admin-settings-panel");
const settingsForm = document.getElementById("admin-settings-form");
const settingsMessage = document.getElementById("admin-settings-message");

const mainUsernameInput = document.getElementById("main-username");
const mainPasswordInput = document.getElementById("main-password");
const portfolioUsernameInput = document.getElementById("portfolio-username");
const portfolioPasswordInput = document.getElementById("portfolio-password");
const dashboard2UsernameInput = document.getElementById("dashboard2-username");
const dashboard2PasswordInput = document.getElementById("dashboard2-password");
const adminPasswordInput = document.getElementById("admin-password");
const resetDefaultsBtn = document.getElementById("admin-reset-defaults");
const officersPanel = document.getElementById("admin-officers-panel");
const officersListEl = document.getElementById("officers-list");
const newOfficerNameInput = document.getElementById("new-officer-name");
const addOfficerBtn = document.getElementById("add-officer-btn");
const resetOfficersBtn = document.getElementById("reset-officers-btn");
const officersMessage = document.getElementById("officers-message");
const officerAuthModal = document.getElementById("officer-auth-modal");
const officerAuthSubtitle = document.getElementById("officer-auth-subtitle");
const officerAuthPasswordInput = document.getElementById("officer-auth-password");
const officerAuthMessage = document.getElementById("officer-auth-message");
const officerAuthCancelBtn = document.getElementById("officer-auth-cancel");
const officerAuthConfirmBtn = document.getElementById("officer-auth-confirm");

const OFFICER_NAMES_STORAGE_KEY = "mgi_officer_names";
const OFFICER_NAMES_DEFAULT_LIST = ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"];
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";

function getStoredOfficerNames() {
  try {
    const raw = localStorage.getItem(OFFICER_NAMES_STORAGE_KEY);
    if (!raw) return [...OFFICER_NAMES_DEFAULT_LIST];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...OFFICER_NAMES_DEFAULT_LIST];
  } catch {
    return [...OFFICER_NAMES_DEFAULT_LIST];
  }
}

function saveStoredOfficerNames(names) {
  localStorage.setItem(OFFICER_NAMES_STORAGE_KEY, JSON.stringify(names));
  saveOfficerNamesToServer(names);
}

async function loadOfficerNamesFromServer() {
  try {
    const urls = [
      `/api/state/${encodeURIComponent(OFFICER_NAMES_STORAGE_KEY)}?t=${Date.now()}`,
      `${API_FALLBACK_ORIGIN}/api/state/${encodeURIComponent(OFFICER_NAMES_STORAGE_KEY)}?t=${Date.now()}`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data?.payload) && data.payload.length > 0 ? data.payload : null;
        if (list) {
          localStorage.setItem(OFFICER_NAMES_STORAGE_KEY, JSON.stringify(list));
          return list;
        }
      } catch { /* try next */ }
    }
  } catch { /* ignore */ }
  return null;
}

async function saveOfficerNamesToServer(names) {
  try {
    const urls = [
      `/api/state/${encodeURIComponent(OFFICER_NAMES_STORAGE_KEY)}`,
      `${API_FALLBACK_ORIGIN}/api/state/${encodeURIComponent(OFFICER_NAMES_STORAGE_KEY)}`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: names }),
        });
        if (res.ok) return true;
      } catch { /* try next */ }
    }
  } catch { /* ignore */ }
  return false;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderOfficersList() {
  if (!officersListEl) return;
  const names = getStoredOfficerNames();
  if (names.length === 0) {
    officersListEl.innerHTML = '<p style="color:#c4d1df;font-size:0.8rem;">No officers added yet.</p>';
    return;
  }
  officersListEl.innerHTML = names.map((name, i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(108,145,177,0.2);">
      <span style="flex:1;color:#eef4fb;font-size:0.85rem;">${escapeHtml(name)}</span>
      <button type="button" class="btn-danger remove-officer-btn" data-index="${i}" style="padding:3px 10px;font-size:0.75rem;">Remove</button>
    </div>`
  ).join("");
}

function getAuthSettings() {
  try {
    const raw = localStorage.getItem(AUTH_SETTINGS_KEY);
    if (!raw) {
      return { ...DEFAULT_AUTH_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_AUTH_SETTINGS };
    }
    const merged = {
      ...DEFAULT_AUTH_SETTINGS,
      ...parsed,
    };

    const dashboard2User = String(merged.dashboard2Username || DEFAULT_AUTH_SETTINGS.dashboard2Username);
    const dashboard2Pass = String(merged.dashboard2Password || DEFAULT_AUTH_SETTINGS.dashboard2Password);
    const leakedMainFromDashboard2 =
      String(merged.mainUsername || "") === dashboard2User &&
      String(merged.mainPassword || "") === dashboard2Pass;

    if (leakedMainFromDashboard2) {
      merged.mainUsername = DEFAULT_AUTH_SETTINGS.mainUsername;
      merged.mainPassword = DEFAULT_AUTH_SETTINGS.mainPassword;
      localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch {
    return { ...DEFAULT_AUTH_SETTINGS };
  }
}

function saveAuthSettings(nextSettings) {
  localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(nextSettings));
}

function setMessage(element, text, isSuccess) {
  if (!element) {
    return;
  }
  element.textContent = text;
  element.classList.toggle("success", Boolean(isSuccess));
}

function fillSettingsForm(settings) {
  if (mainUsernameInput) mainUsernameInput.value = settings.mainUsername;
  if (mainPasswordInput) mainPasswordInput.value = settings.mainPassword;
  if (portfolioUsernameInput) portfolioUsernameInput.value = settings.portfolioUsername;
  if (portfolioPasswordInput) portfolioPasswordInput.value = settings.portfolioPassword;
  if (dashboard2UsernameInput) dashboard2UsernameInput.value = settings.dashboard2Username;
  if (dashboard2PasswordInput) dashboard2PasswordInput.value = settings.dashboard2Password;
  if (adminPasswordInput) adminPasswordInput.value = settings.adminPassword;
}

function setUnlocked(unlocked) {
  gatePanel?.classList.toggle("admin-hidden", Boolean(unlocked));
  settingsPanel?.classList.toggle("admin-hidden", !unlocked);
  officersPanel?.classList.toggle("admin-hidden", !unlocked);
  if (unlocked) {
    // Load from server first so the admin always sees the latest list
    loadOfficerNamesFromServer().then(() => renderOfficersList());
  }
}

let resolveOfficerAuthRequest = null;

function closeOfficerAuthModal() {
  officerAuthModal?.classList.remove("is-open");
  officerAuthModal?.setAttribute("aria-hidden", "true");
  if (officerAuthPasswordInput) {
    officerAuthPasswordInput.value = "";
    officerAuthPasswordInput.type = "password";
  }
  setMessage(officerAuthMessage, "", false);
}

function openOfficerAuthModal(actionLabel) {
  if (officerAuthSubtitle) {
    officerAuthSubtitle.textContent = `Enter admin password to ${actionLabel}.`;
  }
  if (officerAuthPasswordInput) {
    officerAuthPasswordInput.value = "";
    officerAuthPasswordInput.type = "password";
  }
  setMessage(officerAuthMessage, "", false);
  officerAuthModal?.classList.add("is-open");
  officerAuthModal?.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => officerAuthPasswordInput?.focus());
}

function settleOfficerAuth(result) {
  const resolver = resolveOfficerAuthRequest;
  resolveOfficerAuthRequest = null;
  closeOfficerAuthModal();
  if (typeof resolver === "function") {
    resolver(result);
  }
}

function requestAdminPasswordForOfficerChange(actionLabel) {
  return new Promise((resolve) => {
    resolveOfficerAuthRequest = resolve;
    openOfficerAuthModal(actionLabel);
  });
}

function confirmOfficerAuthPassword() {
  const settings = getAuthSettings();
  const candidate = String(officerAuthPasswordInput?.value || "").trim();
  if (!candidate) {
    setMessage(officerAuthMessage, "Admin password is required.", false);
    officerAuthPasswordInput?.focus();
    return;
  }
  if (candidate !== String(settings.adminPassword || "")) {
    setMessage(officerAuthMessage, "Invalid admin password.", false);
    officerAuthPasswordInput?.focus();
    officerAuthPasswordInput?.select();
    return;
  }
  settleOfficerAuth(true);
}

function toggleFieldVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input || !button) {
    return;
  }
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.classList.toggle("is-revealed", show);
  button.setAttribute("aria-label", show ? "Hide value" : "Show value");
}

document.querySelectorAll("[data-toggle-target]").forEach((button) => {
  button.addEventListener("click", () => {
    toggleFieldVisibility(button.getAttribute("data-toggle-target"), button);
  });
});

gateUnlockBtn?.addEventListener("click", () => {
  const settings = getAuthSettings();
  const candidate = String(gatePasswordInput?.value || "").trim();

  if (!candidate) {
    setMessage(gateMessage, "Enter admin password.", false);
    return;
  }

  if (candidate !== settings.adminPassword) {
    setMessage(gateMessage, "Invalid admin password.", false);
    setUnlocked(false);
    return;
  }

  fillSettingsForm(settings);
  setUnlocked(true);
  setMessage(gateMessage, "Unlocked.", true);
  setMessage(settingsMessage, "", false);
});

settingsForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const nextSettings = {
    mainUsername: String(mainUsernameInput?.value || "").trim(),
    mainPassword: String(mainPasswordInput?.value || "").trim(),
    portfolioUsername: String(portfolioUsernameInput?.value || "").trim(),
    portfolioPassword: String(portfolioPasswordInput?.value || "").trim(),
    dashboard2Username: String(dashboard2UsernameInput?.value || "").trim(),
    dashboard2Password: String(dashboard2PasswordInput?.value || "").trim(),
    adminPassword: String(adminPasswordInput?.value || "").trim(),
  };

  const hasEmpty = Object.values(nextSettings).some((value) => !value);
  if (hasEmpty) {
    setMessage(settingsMessage, "All fields are required.", false);
    return;
  }

  saveAuthSettings(nextSettings);
  setMessage(settingsMessage, "Credentials saved successfully.", true);
});

resetDefaultsBtn?.addEventListener("click", () => {
  const ok = window.confirm("Reset all credentials to defaults?");
  if (!ok) {
    return;
  }
  saveAuthSettings({ ...DEFAULT_AUTH_SETTINGS });
  fillSettingsForm(DEFAULT_AUTH_SETTINGS);
  setMessage(settingsMessage, "Credentials reset to defaults.", true);
});

addOfficerBtn?.addEventListener("click", async () => {
  const name = String(newOfficerNameInput?.value || "").trim();
  if (!name) {
    setMessage(officersMessage, "Enter an officer name.", false);
    return;
  }
  const allowed = await requestAdminPasswordForOfficerChange("add this officer");
  if (!allowed) {
    setMessage(officersMessage, "Officer update cancelled.", false);
    return;
  }
  const names = getStoredOfficerNames();
  if (names.some((n) => n.toLowerCase() === name.toLowerCase())) {
    setMessage(officersMessage, `"${name}" already exists.`, false);
    return;
  }
  names.push(name);
  saveStoredOfficerNames(names);
  if (newOfficerNameInput) newOfficerNameInput.value = "";
  renderOfficersList();
  setMessage(officersMessage, `"${name}" added successfully.`, true);
});

newOfficerNameInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addOfficerBtn?.click();
  }
});

officersListEl?.addEventListener("click", async (event) => {
  const btn = event.target instanceof Element ? event.target.closest(".remove-officer-btn") : null;
  if (!btn) return;
  const allowed = await requestAdminPasswordForOfficerChange("remove this officer");
  if (!allowed) {
    setMessage(officersMessage, "Officer update cancelled.", false);
    return;
  }
  const index = Number(btn.getAttribute("data-index"));
  const names = getStoredOfficerNames();
  if (!Number.isFinite(index) || index < 0 || index >= names.length) return;
  const removed = names[index];
  names.splice(index, 1);
  saveStoredOfficerNames(names);
  renderOfficersList();
  setMessage(officersMessage, `"${removed}" removed.`, true);
});

resetOfficersBtn?.addEventListener("click", async () => {
  const ok = window.confirm("Reset officer list to defaults?");
  if (!ok) return;
  const allowed = await requestAdminPasswordForOfficerChange("reset officers to defaults");
  if (!allowed) {
    setMessage(officersMessage, "Officer update cancelled.", false);
    return;
  }
  saveStoredOfficerNames([...OFFICER_NAMES_DEFAULT_LIST]);
  renderOfficersList();
  setMessage(officersMessage, "Officer list reset to defaults.", true);
});

officerAuthCancelBtn?.addEventListener("click", () => {
  settleOfficerAuth(false);
});

officerAuthConfirmBtn?.addEventListener("click", () => {
  confirmOfficerAuthPassword();
});

officerAuthModal?.addEventListener("click", (event) => {
  if (event.target === officerAuthModal) {
    settleOfficerAuth(false);
  }
});

officerAuthPasswordInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    confirmOfficerAuthPassword();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    settleOfficerAuth(false);
  }
});

setUnlocked(false);
setMessage(gateMessage, "", false);
setMessage(settingsMessage, "", false);
