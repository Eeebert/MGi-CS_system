const AUTH_SETTINGS_KEY = "mgi_auth_settings";
const DEFAULT_AUTH_SETTINGS = {
  mainUsername: "username",
  mainPassword: "123",
  portfolioUsername: "portfolio",
  portfolioPassword: "123",
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
const adminPasswordInput = document.getElementById("admin-password");
const resetDefaultsBtn = document.getElementById("admin-reset-defaults");

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
    return {
      ...DEFAULT_AUTH_SETTINGS,
      ...parsed,
    };
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
  if (adminPasswordInput) adminPasswordInput.value = settings.adminPassword;
}

function setUnlocked(unlocked) {
  gatePanel?.classList.toggle("admin-hidden", Boolean(unlocked));
  settingsPanel?.classList.toggle("admin-hidden", !unlocked);
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

setUnlocked(false);
setMessage(gateMessage, "", false);
setMessage(settingsMessage, "", false);
