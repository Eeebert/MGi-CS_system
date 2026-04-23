const THEME_KEY = "mgi_dashboard_theme";
const DEVICE_LOCAL_KEYS = new Set([THEME_KEY]);
const LOGIN_SESSION_KEY = "mgi_logged_in";
const LOAN_TYPE_MONTHLY_FIXED_60 = "monthly_60_fixed";
const LOAN_TYPE_EMERGENCY_FIXED = "emergency_fixed";
const AUTH_SETTINGS_KEY = "mgi_auth_settings";
const DEFAULT_AUTH_SETTINGS = {
  mainUsername: "username",
  mainPassword: "123",
  portfolioUsername: "portfolio",
  portfolioPassword: "123",
  adminPassword: "admin123",
};

let currentOfficer = "";
const OFFICER_VIEW_ACTIVE = "active";
const OFFICER_VIEW_SETTLED = "settled";
let currentOfficerView = OFFICER_VIEW_ACTIVE;

function hasStoredLogin() {
  return sessionStorage.getItem(LOGIN_SESSION_KEY) === "1" || localStorage.getItem(LOGIN_SESSION_KEY) === "1";
}

function restoreStoredLogin() {
  if (localStorage.getItem(LOGIN_SESSION_KEY) === "1") {
    sessionStorage.setItem(LOGIN_SESSION_KEY, "1");
  }
}

function clearStoredLogin() {
  sessionStorage.removeItem(LOGIN_SESSION_KEY);
  localStorage.removeItem(LOGIN_SESSION_KEY);
}

const form = document.getElementById("loan-form");
const message = document.getElementById("form-message");
const body = document.getElementById("records-body");
const clearBtn = document.getElementById("clear-records");
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const contactNumberInput = document.getElementById("contactNumber");
const purposeOfLoanInput = document.getElementById("purposeOfLoan");
const modeOfPaymentSelect = document.getElementById("modeOfPayment");
const payableWithinSelect = document.getElementById("payableWithin");
const amountInput = document.getElementById("amount");
const dateGrantedInput = document.getElementById("dateGranted");
const interestRateInput = document.getElementById("interestRate");
const filterNameInput = document.getElementById("filter-name");
const filterDateGrantedInput = document.getElementById("filter-date-granted");
const filterSearchDateInput = document.getElementById("filter-search-date");
const sortBySelect = document.getElementById("sort-by");
const filterPayableSelect = document.getElementById("filter-payable");
const testDateInput = document.getElementById("test-date");
const useTodayBtn = document.getElementById("use-today");
const exportWordOfficerBtn = document.getElementById("export-word-officer");
const toast = document.getElementById("toast");
const writeOffModal = document.getElementById("write-off-modal");
const writeOffPasswordInput = document.getElementById("write-off-password");
const writeOffError = document.getElementById("write-off-error");
const writeOffConfirmBtn = document.getElementById("write-off-confirm");
const writeOffCancelBtn = document.getElementById("write-off-cancel");
const restoreAuthModal = document.getElementById("restore-auth-modal");
const restoreAuthTitle = document.getElementById("restore-auth-title");
const restoreAuthText = restoreAuthModal?.querySelector(".restore-auth-text") || null;
const restoreAuthPasswordInput = document.getElementById("restore-auth-password");
const restoreAuthError = document.getElementById("restore-auth-error");
const restoreAuthConfirmBtn = document.getElementById("restore-auth-confirm");
const restoreAuthCancelBtn = document.getElementById("restore-auth-cancel");
const paymentHistoryModal = document.getElementById("payment-history-modal");
const paymentHistoryTitle = document.getElementById("payment-history-title");
const paymentHistoryContent = document.getElementById("payment-history-content");
const paymentHistoryCloseBtn = document.getElementById("payment-history-close");
const paymentEntryModal = document.getElementById("payment-entry-modal");
const paymentEntrySubtitle = document.getElementById("payment-entry-subtitle");
const paymentEntryInput = document.getElementById("payment-entry-input");
const paymentEntryPreview = document.getElementById("payment-entry-preview");
const paymentEntryError = document.getElementById("payment-entry-error");
const paymentEntryCancelBtn = document.getElementById("payment-entry-cancel");
const paymentEntryConfirmBtn = document.getElementById("payment-entry-confirm");
const deletePaymentConfirmModal = document.getElementById("delete-payment-confirm-modal");
const deletePaymentConfirmText = document.getElementById("delete-payment-confirm-text");
const deletePaymentConfirmCancelBtn = document.getElementById("delete-payment-confirm-cancel");
const deletePaymentConfirmYesBtn = document.getElementById("delete-payment-confirm-yes");
const pageTitle = document.getElementById("page-title");
const officerDashboardBtn = document.getElementById("officer-dashboard-btn");
const toggleLoanEntryBtn = document.getElementById("toggle-loan-entry");
const loanEntryPanel = document.getElementById("loan-entry-panel");
const officerMain = document.getElementById("officer-main");
const hamburgerBtn = document.getElementById("officer-hamburger");
const sideDrawer = document.getElementById("side-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerCloseBtn = document.getElementById("drawer-close");
const drawerLogoutBtn = document.getElementById("drawer-logout");
const backupDataBtn = document.getElementById("backup-data");
const restoreBackupBtn = document.getElementById("restore-backup");
const restoreBackupInput = document.getElementById("restore-backup-input");
const backupToExcelBtn = document.getElementById("backup-to-excel");
const backupStatusNote = document.getElementById("backup-status-note");
const themeOptions = document.querySelectorAll('input[name="theme-choice"]');
const dashboardTotalLoans = document.getElementById("dashboard-total-loans");
const dashboardTotalAmount = document.getElementById("dashboard-total-amount");
const dashboardTotalOutstanding = document.getElementById("dashboard-total-outstanding");
const dashboardPastDueCount = document.getElementById("dashboard-past-due-count");
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";
const OFFICER_NAMES_FALLBACK = ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"];
let OFFICER_NAMES = (() => {
  try {
    const raw = localStorage.getItem("mgi_officer_names");
    if (!raw) return [...OFFICER_NAMES_FALLBACK];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...OFFICER_NAMES_FALLBACK];
  } catch { return [...OFFICER_NAMES_FALLBACK]; }
})();

async function refreshOfficerNamesFromServer() {
  try {
    const res = await fetchStateApi("mgi_officer_names", {}, true);
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data?.payload) && data.payload.length > 0 ? data.payload : null;
    if (list) {
      OFFICER_NAMES = list;
      localStorage.setItem("mgi_officer_names", JSON.stringify(list));
    }
  } catch { /* ignore */ }
}
const ADDRESS_SUGGESTIONS_KEY = "mgi_saved_addresses";
const MAX_ADDRESS_SUGGESTIONS = 20;
const MAX_VISIBLE_ADDRESS_SUGGESTIONS = 6;
const addressAutocompleteFields = Array.from(document.querySelectorAll("[data-address-autocomplete]"));
const purposeLoanSelects = Array.from(document.querySelectorAll(".purpose-of-loan-select"));

function getOfficerViewFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === OFFICER_VIEW_SETTLED ? OFFICER_VIEW_SETTLED : OFFICER_VIEW_ACTIVE;
  } catch {
    return OFFICER_VIEW_ACTIVE;
  }
}

function isSettledOfficerView() {
  return currentOfficerView === OFFICER_VIEW_SETTLED;
}

function initPurposeLoanSelects() {
  purposeLoanSelects.forEach((select) => {
    if (!(select instanceof HTMLSelectElement) || select.dataset.enhanced === "true") {
      return;
    }

    select.dataset.enhanced = "true";
    select.classList.add("purpose-select-native");

    const wrapper = document.createElement("div");
    wrapper.className = "purpose-select-wrap";
    select.parentNode?.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "purpose-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "purpose-select-menu";
    menu.setAttribute("role", "listbox");

    wrapper.append(trigger, menu);

    function closeMenu() {
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      wrapper.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }

    function buildMenu() {
      menu.innerHTML = "";

      Array.from(select.options).forEach((option) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "purpose-select-option";
        optionButton.textContent = option.textContent || "";

        if (!option.value) {
          optionButton.classList.add("is-placeholder");
          optionButton.disabled = true;
        } else {
          optionButton.dataset.value = option.value;
        }

        if (option.value === select.value) {
          optionButton.classList.add("is-selected");
        }

        menu.appendChild(optionButton);
      });
    }

    function syncFromSelect() {
      const selectedOption = select.options[select.selectedIndex];
      trigger.textContent = selectedOption?.textContent?.trim() || "Select type";
      trigger.classList.toggle("is-placeholder", !select.value);

      menu.querySelectorAll(".purpose-select-option").forEach((node) => {
        node.classList.toggle("is-selected", node instanceof HTMLElement && node.dataset.value === select.value);
      });
    }

    trigger.addEventListener("click", () => {
      if (wrapper.classList.contains("is-open")) {
        closeMenu();
        return;
      }
      openMenu();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMenu();
      }
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    menu.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest(".purpose-select-option") : null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const value = target.dataset.value || "";
      if (!value) {
        return;
      }

      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncFromSelect();
      closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node) || !wrapper.contains(event.target)) {
        closeMenu();
      }
    });

    select.addEventListener("change", syncFromSelect);
    select.form?.addEventListener("reset", () => {
      setTimeout(syncFromSelect, 0);
    });

    buildMenu();
    syncFromSelect();
  });
}

function normalizeAddressSuggestion(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function getSavedAddressSuggestions() {
  try {
    const raw = localStorage.getItem(ADDRESS_SUGGESTIONS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const seen = new Set();
    return parsed
      .map(normalizeAddressSuggestion)
      .filter((value) => {
        if (!value || seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      })
      .slice(0, MAX_ADDRESS_SUGGESTIONS);
  } catch {
    return [];
  }
}

function setSavedAddressSuggestions(values) {
  try {
    localStorage.setItem(ADDRESS_SUGGESTIONS_KEY, JSON.stringify(values));
  } catch {
    return;
  }

  renderAddressSuggestions();
}

function removeAddressSuggestion(valueToRemove) {
  const normalizedValue = normalizeAddressSuggestion(valueToRemove);
  const nextSuggestions = getSavedAddressSuggestions().filter((value) => value !== normalizedValue);
  setSavedAddressSuggestions(nextSuggestions);
}

function buildAddressSuggestionOption(value, isActive) {
  return `
    <div class="address-suggestion-option${isActive ? " is-active" : ""}">
      <button type="button" class="address-suggestion-fill" data-address-value="${sanitize(value)}">
        <span class="address-suggestion-text">${sanitize(value)}</span>
      </button>
      <button type="button" class="address-suggestion-remove" data-remove-address="${sanitize(value)}" aria-label="Remove saved address" title="Remove saved address">
        <span class="address-suggestion-remove-icon" aria-hidden="true">-</span>
      </button>
    </div>
  `;
}

function createAddressAutocompleteController(field) {
  const input = field.querySelector("input");
  const panel = field.querySelector(".address-suggestions-panel");
  const list = field.querySelector(".address-suggestions-list");
  const empty = field.querySelector(".address-suggestions-empty");

  if (!input || !panel || !list || !empty) {
    return null;
  }

  let activeIndex = -1;

  function getFilteredSuggestions() {
    const query = normalizeAddressSuggestion(input.value);
    const allSuggestions = getSavedAddressSuggestions();

    if (!query) {
      return allSuggestions.slice(0, MAX_VISIBLE_ADDRESS_SUGGESTIONS);
    }

    return allSuggestions
      .filter((value) => value.includes(query))
      .slice(0, MAX_VISIBLE_ADDRESS_SUGGESTIONS);
  }

  function render() {
    const suggestions = getFilteredSuggestions();
    const hasSavedAddresses = getSavedAddressSuggestions().length > 0;
    const hasSuggestions = suggestions.length > 0;

    if (activeIndex >= suggestions.length) {
      activeIndex = hasSuggestions ? 0 : -1;
    }

    list.innerHTML = suggestions
      .map((value, index) => buildAddressSuggestionOption(value, index === activeIndex))
      .join("");

    field.classList.toggle("is-empty", !hasSuggestions);
    empty.textContent = hasSavedAddresses
      ? "No saved address matches what you typed yet."
      : "Saved addresses will appear here after you save one.";

    return hasSuggestions;
  }

  function open() {
    field.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");
    render();
  }

  function close() {
    activeIndex = -1;
    field.classList.remove("is-open");
    input.setAttribute("aria-expanded", "false");
  }

  function applyValue(value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    close();
  }

  input.setAttribute("aria-haspopup", "listbox");
  input.setAttribute("aria-expanded", "false");

  input.addEventListener("focus", () => {
    open();
  });

  input.addEventListener("input", () => {
    open();
  });

  input.addEventListener("keydown", (event) => {
    const suggestions = getFilteredSuggestions();
    if (!suggestions.length) {
      if (event.key === "Escape") {
        close();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1 + suggestions.length) % suggestions.length;
      render();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
      render();
      return;
    }

    if (event.key === "Enter" && field.classList.contains("is-open") && activeIndex >= 0) {
      event.preventDefault();
      applyValue(suggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      close();
    }
  });

  panel.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  panel.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const removeButton = event.target.closest("[data-remove-address]");
    if (removeButton) {
      removeAddressSuggestion(removeButton.getAttribute("data-remove-address") || "");
      render();
      return;
    }

    const option = event.target.closest("[data-address-value]");
    if (!option) {
      return;
    }

    applyValue(option.getAttribute("data-address-value") || "");
  });

  return {
    field,
    render,
    close,
  };
}

const addressAutocompleteControllers = addressAutocompleteFields
  .map(createAddressAutocompleteController)
  .filter(Boolean);

function renderAddressSuggestions() {
  addressAutocompleteControllers.forEach((controller) => {
    controller.render();
  });
}

function saveAddressSuggestions(...values) {
  const nextSuggestions = [...values.map(normalizeAddressSuggestion), ...getSavedAddressSuggestions()]
    .filter((value, index, array) => value && array.indexOf(value) === index)
    .slice(0, MAX_ADDRESS_SUGGESTIONS);

  setSavedAddressSuggestions(nextSuggestions);
}

document.addEventListener("click", (event) => {
  addressAutocompleteControllers.forEach((controller) => {
    if (!(event.target instanceof Node) || !controller.field.contains(event.target)) {
      controller.close();
    }
  });
});

function getStateApiCandidates(stateKey, includeCacheBuster) {
  const query = includeCacheBuster ? "?t=" + Date.now() : "";
  const path = "/api/state/" + encodeURIComponent(stateKey) + query;
  const candidates = [path];

  const currentOrigin = String(window.location.origin || "").replace(/\/+$/, "");
  const fallbackOrigin = String(API_FALLBACK_ORIGIN || "").replace(/\/+$/, "");
  if (fallbackOrigin && currentOrigin !== fallbackOrigin) {
    candidates.push(API_FALLBACK_ORIGIN + path);
  }

  return [...new Set(candidates)];
}

function isLocalDevelopmentHost() {
  const host = String(window.location.hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1";
}

function shouldAllowFallbackWriteApi() {
  if (!isLocalDevelopmentHost()) {
    return true;
  }

  return localStorage.getItem("mgi_allow_fallback_write_api") === "1";
}

async function fetchStateApi(stateKey, options, includeCacheBuster) {
  const method = String(options?.method || "GET").toUpperCase();
  const isWriteRequest = method !== "GET";
  const allowFallback = !isWriteRequest || shouldAllowFallbackWriteApi();
  const candidates = allowFallback
    ? getStateApiCandidates(stateKey, includeCacheBuster)
    : ["/api/state/" + encodeURIComponent(stateKey) + (includeCacheBuster ? "?t=" + Date.now() : "")];
  let lastErrorResponse = null;
  let lastNetworkError = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const url = candidates[index];
    try {
      const res = await fetch(url, options);
      if (!res.ok && index < candidates.length - 1) {
        lastErrorResponse = res;
        continue;
      }
      return res;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (lastErrorResponse) {
    return lastErrorResponse;
  }

  throw lastNetworkError || new Error("Failed to reach state API");
}

let toastTimer;
let isLoanFormVisible = true;
let syncStatusElement = null;
let recordsCache = [];
let isServerWritePending = false;
let lastLocalMutationAt = 0;
let lastPaymentAt = 0;
const EMPTY_OVERWRITE_GUARD_MS = 20000;
const PAYMENT_SYNC_GUARD_MS = 3000; // Pause sync for 3 seconds after payment
const RESTORE_BACKUP_AUTH_WINDOW_MS = 30000;
let hasUnsyncedLocalChanges = false;
let pendingRetryTimer = null;
let paymentEntryRowIndex = -1;
let paymentHistoryRowIndex = -1;
const PAYMENT_MODE_STANDARD = "standard";
const PAYMENT_MODE_PRINCIPAL_ONLY = "principal-only";
let paymentEntryMode = PAYMENT_MODE_STANDARD;
let writeOffPasswordResolver = null;
let restoreAuthPasswordResolver = null;
let deletePaymentConfirmResolver = null;
let openRebateEditorRowIndex = -1;
let openRemarksEditorRowIndex = -1;
let openArrearsEditorRowIndex = -1;
let openOtherArrearsEditorRowIndex = -1;
const arrearsInputDrafts = new Map();
const otherArrearsInputDrafts = new Map();
let restoreBackupAuthorizedAt = 0;

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

function setAmountDraftForRecord(record, draftMap, rawValue) {
  if (!record || !(draftMap instanceof Map)) {
    return;
  }
  const key = buildRecordFingerprint(record);
  draftMap.set(key, normalizeAmountInput(rawValue));
}

function clearAmountDraftForRecord(record, draftMap) {
  if (!record || !(draftMap instanceof Map)) {
    return;
  }
  const key = buildRecordFingerprint(record);
  draftMap.delete(key);
}

function getAmountDraftForRecord(record, draftMap, fallbackAmount) {
  if (record && draftMap instanceof Map) {
    const key = buildRecordFingerprint(record);
    if (draftMap.has(key)) {
      return normalizeAmountInput(draftMap.get(key));
    }
  }
  return formatAmountInputOrBlank(fallbackAmount);
}

function formatAmountInputOrBlank(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }
  return normalizeAmountInput(formatPlainAmount(amount));
}
function getWriteOffPassword() {
  return String(getAuthSettings().mainPassword || DEFAULT_AUTH_SETTINGS.mainPassword);
}

function getAdminPassword() {
  return String(getAuthSettings().adminPassword || DEFAULT_AUTH_SETTINGS.adminPassword);
}

function closeRestoreAuthModal(result) {
  if (!restoreAuthModal) {
    if (typeof restoreAuthPasswordResolver === "function") {
      restoreAuthPasswordResolver(result);
      restoreAuthPasswordResolver = null;
    }
    return;
  }

  restoreAuthModal.classList.remove("show");
  restoreAuthModal.setAttribute("aria-hidden", "true");

  if (restoreAuthPasswordInput) {
    restoreAuthPasswordInput.value = "";
  }
  if (restoreAuthError) {
    restoreAuthError.textContent = "";
  }

  if (typeof restoreAuthPasswordResolver === "function") {
    restoreAuthPasswordResolver(result);
    restoreAuthPasswordResolver = null;
  }
}

function requestAdminPassword(options = {}) {
  const title = String(options?.title || "Secure Backup Access");
  const message = String(options?.message || "Enter admin password to continue with this backup action.");
  const confirmLabel = String(options?.confirmLabel || "Continue");
  const fallbackPrompt = String(options?.fallbackPrompt || "Enter admin password:");

  if (!restoreAuthModal || !restoreAuthPasswordInput) {
    const fallback = window.prompt(fallbackPrompt, "");
    return Promise.resolve(fallback);
  }

  if (restoreAuthTitle) {
    restoreAuthTitle.textContent = title;
  }
  if (restoreAuthText) {
    restoreAuthText.textContent = message;
  }
  if (restoreAuthConfirmBtn) {
    restoreAuthConfirmBtn.textContent = confirmLabel;
  }
  if (restoreAuthError) {
    restoreAuthError.textContent = "";
  }

  restoreAuthModal.classList.add("show");
  restoreAuthModal.setAttribute("aria-hidden", "false");
  restoreAuthPasswordInput.value = "";

  setTimeout(() => {
    restoreAuthPasswordInput.focus();
  }, 0);

  return new Promise((resolve) => {
    restoreAuthPasswordResolver = resolve;
  });
}

async function authorizeRestoreBackup() {
  const enteredPassword = await requestAdminPassword({
    title: "Secure Restore Access",
    message: "Enter admin password to restore the full system backup file.",
    confirmLabel: "Continue Restore",
    fallbackPrompt: "Enter admin password to restore full backup:",
  });

  if (enteredPassword === null) {
    return false;
  }

  if (String(enteredPassword).trim() !== getAdminPassword().trim()) {
    showMessage("Invalid admin password. Restore cancelled.", "error");
    showToast("Restore blocked", "error");
    return false;
  }

  restoreBackupAuthorizedAt = Date.now();
  return true;
}

function hasRestoreBackupAuthorization() {
  return Date.now() - restoreBackupAuthorizedAt <= RESTORE_BACKUP_AUTH_WINDOW_MS;
}

function ensureSyncStatusElement() {
  if (syncStatusElement instanceof HTMLElement) {
    return syncStatusElement;
  }

  syncStatusElement = document.getElementById("sync-status-badge");
  return syncStatusElement instanceof HTMLElement ? syncStatusElement : null;
}

function getSyncStatusMessage(state, detail) {
  const normalizedDetail = String(detail || "").trim();

  if (!normalizedDetail) {
    return "Sync: idle";
  }

  if (normalizedDetail === "save pending retry" || normalizedDetail === "waiting server update") {
    return "Sync: Saved locally, waiting for server";
  }

  if (normalizedDetail === "saving..." || normalizedDetail === "save in progress") {
    return "Sync: Saving to server...";
  }

  if (normalizedDetail === "syncing...") {
    return "Sync: Checking server...";
  }

  if (normalizedDetail === "local fallback") {
    return "Sync: Server unavailable, using local data";
  }

  if (normalizedDetail === "offline (server-only mode)") {
    return "Sync: Offline";
  }

  return `Sync: ${normalizedDetail}`;
}

function normalizeOfficerName(rawOfficer) {
  const value = String(rawOfficer || "").trim();
  if (!value) {
    return OFFICER_NAMES[0];
  }

  const matched = OFFICER_NAMES.find((name) => name.toLowerCase() === value.toLowerCase());
  return matched || OFFICER_NAMES[0];
}

function findOfficerName(rawOfficer) {
  const value = String(rawOfficer || "").trim();
  if (!value) {
    return "";
  }

  const matched = OFFICER_NAMES.find((name) => name.toLowerCase() === value.toLowerCase());
  return matched || "";
}

function toOfficerSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "junjun";
}

function getOfficerStorageKeyCandidates() {
  const normalizedOfficer = normalizeOfficerName(currentOfficer);
  const canonicalKey = `mgi_officer_records_${toOfficerSlug(normalizedOfficer)}`;
  const legacyRawKey = `mgi_officer_records_${currentOfficer}`;
  return Array.from(new Set([canonicalKey, legacyRawKey]));
}

function setSyncStatus(state, detail) {
  const badge = ensureSyncStatusElement();
  if (!badge) {
    return;
  }

  badge.classList.remove("is-idle", "is-syncing", "is-ok", "is-error");

  if (state === "syncing") {
    badge.classList.add("is-syncing");
  } else if (state === "ok") {
    badge.classList.add("is-ok");
  } else if (state === "error") {
    badge.classList.add("is-error");
  } else {
    badge.classList.add("is-idle");
  }

  const message = getSyncStatusMessage(state, detail);
  badge.textContent = message;
  badge.title = message;
}

function getOfficerStorageKey() {
  const normalizedOfficer = normalizeOfficerName(currentOfficer);
  return `mgi_officer_records_${toOfficerSlug(normalizedOfficer)}`;
}

function buildRecordFingerprint(record) {
  return [
    String(record?.name || "").trim().toUpperCase(),
    String(record?.dateGranted || "").trim(),
    String(Number(record?.amount || 0)),
    String(record?.payableWithin || "").trim(),
    String(record?.address || "").trim().toUpperCase(),
    String(record?.contactNumber || "").trim(),
  ].join("|");
}

function resolveRecordIndexFromAction(actionElement) {
  const rowIndex = Number(actionElement?.dataset?.index);
  const fingerprint = String(actionElement?.dataset?.fingerprint || "").trim();
  const records = getRecords();

  if (fingerprint) {
    const matchedIndex = records.findIndex((record) => buildRecordFingerprint(record) === fingerprint);
    if (matchedIndex >= 0) {
      return matchedIndex;
    }
  }

  return Number.isInteger(rowIndex) && rowIndex >= 0 ? rowIndex : -1;
}

function dedupeRecords(records) {
  const seen = new Set();
  const merged = [];

  for (const record of Array.isArray(records) ? records : []) {
    const fingerprint = buildRecordFingerprint(record);
    if (seen.has(fingerprint)) {
      continue;
    }
    seen.add(fingerprint);
    merged.push(record);
  }

  return merged;
}

function isMissingUnsyncedLocalRecords(localRecords, serverRecords) {
  const localList = Array.isArray(localRecords) ? localRecords : [];
  const serverFingerprints = new Set(
    (Array.isArray(serverRecords) ? serverRecords : []).map((record) => buildRecordFingerprint(record))
  );

  return localList.some((record) => !serverFingerprints.has(buildRecordFingerprint(record)));
}

async function loadOfficerServerRecords(stateKeys) {
  const keys = Array.isArray(stateKeys) ? stateKeys : [];

  return Promise.all(
    keys.map(async (stateKey) => {
      try {
        const res = await fetchStateApi(stateKey, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, max-age=0",
            Pragma: "no-cache",
          },
        }, true);

        if (!res.ok) {
          return { key: stateKey, ok: false, status: res.status, records: [] };
        }

        const data = await res.json().catch(() => null);
        if (Array.isArray(data?.payload)) {
          return { key: stateKey, ok: true, status: res.status, records: data.payload };
        }

        if (data?.payload === null) {
          return { key: stateKey, ok: true, status: res.status, records: [] };
        }

        return { key: stateKey, ok: false, status: res.status, records: [] };
      } catch {
        return { key: stateKey, ok: false, status: null, records: [] };
      }
    })
  );
}

function getRecords() {
  return (Array.isArray(recordsCache) ? recordsCache : []).filter((record) => record && typeof record === "object");
}

function mirrorOfficerRecordsToLocalStorage(records) {
  const payload = JSON.stringify(Array.isArray(records) ? records : []);
  try {
    getOfficerStorageKeyCandidates().forEach((key) => {
      localStorage.setItem(key, payload);
    });
  } catch {
    // Ignore localStorage quota/availability errors.
  }
}

function readOfficerRecordsFromLocalStorage() {
  try {
    for (const key of getOfficerStorageKeyCandidates()) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}

function setRecords(records) {
  recordsCache = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  mirrorOfficerRecordsToLocalStorage(recordsCache);
  lastLocalMutationAt = Date.now();
  hasUnsyncedLocalChanges = true;
  syncRecordsToServer(recordsCache);
}

function schedulePendingSaveRetry() {
  if (pendingRetryTimer || isServerWritePending || !hasUnsyncedLocalChanges) {
    return;
  }

  pendingRetryTimer = setTimeout(() => {
    pendingRetryTimer = null;
    if (!isServerWritePending && hasUnsyncedLocalChanges) {
      syncRecordsToServer(getRecords());
    }
  }, 3000);
}

async function syncRecordsToServer(records) {
  isServerWritePending = true;
  setSyncStatus("syncing", "saving...");
  try {
    const res = await fetchStateApi(getOfficerStorageKey(), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: records }),
    }, false);
    if (!res.ok) {
      let errorDetail = "";
      try {
        const errBody = await res.json();
        errorDetail = errBody?.detail || errBody?.error || "";
      } catch {}
      throw new Error(`Failed to sync records (${res.status})${errorDetail ? `: ${errorDetail}` : ""}`);
    }
    hasUnsyncedLocalChanges = false;
    if (pendingRetryTimer) {
      clearTimeout(pendingRetryTimer);
      pendingRetryTimer = null;
    }
    const activeSavedCount = (Array.isArray(records) ? records : []).filter((record) => record?.isSettled !== true).length;
    setSyncStatus("ok", `saved (${activeSavedCount} records)`);
  } catch (error) {
    console.error("[sync][officer] Save failed", {
      officer: currentOfficer,
      message: error?.message || "unknown",
    });
    setSyncStatus("error", "save pending retry");
    schedulePendingSaveRetry();
  } finally {
    isServerWritePending = false;
  }
}

async function loadRecordsFromServer() {
  if (!isServerWritePending && hasUnsyncedLocalChanges) {
    syncRecordsToServer(getRecords());
  }

  const storageKeys = getOfficerStorageKeyCandidates();
  setSyncStatus("syncing", "syncing...");
  console.info("[sync][officer] Fetch start", {
    officer: currentOfficer,
    storageKeys,
    online: navigator.onLine,
    time: new Date().toISOString(),
  });

  try {
    const results = await loadOfficerServerRecords(storageKeys);
    const successfulResults = results.filter((result) => result.ok);

    if (successfulResults.length === 0) {
      const firstFailed = results.find((result) => result.status !== null);
      const statusCode = firstFailed?.status || 500;
      console.error("[sync][officer] Fetch failed", { status: statusCode });
      const localRecords = readOfficerRecordsFromLocalStorage();
      if (localRecords.length > 0) {
        recordsCache = localRecords;
      }
      setSyncStatus("error", `server error (${statusCode})`);
      return;
    }

    const normalizedOfficer = normalizeOfficerName(currentOfficer);
    const mergedPayload = dedupeRecords(successfulResults.flatMap((result) => result.records))
      .filter((record) => {
        const taggedOfficer = findOfficerName(record?.accountOfficer);
        return taggedOfficer === "" || taggedOfficer === normalizedOfficer;
      })
      .map((record) => ({
        ...record,
        accountOfficer: normalizedOfficer,
      }));

    // Protect local data whenever there are ANY unsynced changes, not just missing records.
    // The old guard used isMissingUnsyncedLocalRecords which only catches new records —
    // it misses payment/data changes on existing records since fingerprints (name/date/amount)
    // remain identical. This caused payments to be silently overwritten by a stale server fetch
    // when the server PUT was still in-flight or had failed.
    const shouldProtectUnsyncedData = (
      hasUnsyncedLocalChanges &&
      recordsCache.length > 0
    );
    if (shouldProtectUnsyncedData) {
      console.info("[sync][officer] Keeping unsynced local records while server payload is stale", {
        officer: currentOfficer,
        cacheRecords: recordsCache.length,
        serverRecords: mergedPayload.length,
      });
      setSyncStatus("error", "save pending retry");
      schedulePendingSaveRetry();
      return;
    }

    const shouldGuardEmptyOverwrite = (
      mergedPayload.length === 0 &&
      recordsCache.length > 0 &&
      Date.now() - lastLocalMutationAt < EMPTY_OVERWRITE_GUARD_MS
    );
    if (shouldGuardEmptyOverwrite) {
      console.info("[sync][officer] Ignoring empty server payload shortly after local change", {
        officer: currentOfficer,
        cacheRecords: recordsCache.length,
      });
      setSyncStatus("syncing", "waiting server update");
      return;
    }

    if (isServerWritePending) {
      console.info("[sync][officer] Skipping server apply while save is pending", {
        officer: currentOfficer,
      });
      setSyncStatus("syncing", "save in progress");
      return;
    }

    recordsCache = mergedPayload;
    mirrorOfficerRecordsToLocalStorage(recordsCache);
    console.info("[sync][officer] Fetch success", {
      officer: currentOfficer,
      records: mergedPayload.length,
      sourceKeys: successfulResults.map((result) => result.key),
    });
    const activeUpdatedCount = (Array.isArray(mergedPayload) ? mergedPayload : []).filter((record) => record?.isSettled !== true).length;
    setSyncStatus("ok", `updated (${activeUpdatedCount} records)`);
  } catch {
    console.error("[sync][officer] Network error while fetching state", { officer: currentOfficer });
    const localRecords = readOfficerRecordsFromLocalStorage();
    if (localRecords.length > 0) {
      recordsCache = localRecords;
    }
    setSyncStatus("error", "offline (server-only mode)");
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatLongDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) {
    return String(isoDate);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${monthNames[month - 1]} ${day},${year}`;
}

async function getImageDataUrl(src) {
  try {
    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) {
      return "";
    }
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function toUpperInputValue(value) {
  return String(value || "").toUpperCase();
}

function normalizeAmountInput(value) {
  const sanitized = String(value || "").replace(/[^\d.]/g, "");
  const parts = sanitized.split(".");
  const whole = parts[0] || "";
  const decimal = parts.slice(1).join("").slice(0, 2);
  const wholeWithComma = whole ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  if (parts.length > 1) {
    return `${wholeWithComma}.${decimal}`;
  }
  return wholeWithComma;
}

function parseAmountInput(value) {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFileSafeName(value) {
  return String(value || "record")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "record";
}

function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function toIsoDate(dateValue) {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.floor((to - from) / msPerDay);
}

function compareIsoDate(a, b) {
  const aTime = a ? new Date(`${a}T00:00:00`).getTime() : 0;
  const bTime = b ? new Date(`${b}T00:00:00`).getTime() : 0;
  return aTime - bTime;
}

function getReferenceDate() {
  const customDate = String(testDateInput?.value || "").trim();
  if (customDate) {
    const parsed = new Date(`${customDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function toStartOfDayDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return null;
  }
  return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
}

function getWriteOffFreezeDate(record) {
  if (!record || record.isWriteOff !== true) {
    return null;
  }

  const freezeDateIso = String(record.writeOffDate || "").trim();
  if (!freezeDateIso) {
    return null;
  }

  return toStartOfDayDate(new Date(`${freezeDateIso}T00:00:00`));
}

function getHatagHatagFreezeDate(record) {
  if (!record || record.isHatagHatag !== true) {
    return null;
  }

  const freezeDateIso = String(record.hatagHatagDate || "").trim();
  if (!freezeDateIso) {
    return null;
  }

  return toStartOfDayDate(new Date(`${freezeDateIso}T00:00:00`));
}

function getInterestFreezeDate(record) {
  const writeOffDate = getWriteOffFreezeDate(record);
  const hatagHatagDate = getHatagHatagFreezeDate(record);

  if (writeOffDate && hatagHatagDate) {
    return writeOffDate.getTime() <= hatagHatagDate.getTime() ? writeOffDate : hatagHatagDate;
  }

  return writeOffDate || hatagHatagDate;
}

function getInterestReferenceDate(record) {
  const activeReferenceDate = toStartOfDayDate(getReferenceDate());
  if (!activeReferenceDate) {
    return new Date();
  }

  const freezeDate = getInterestFreezeDate(record);
  if (!freezeDate) {
    return activeReferenceDate;
  }

  return freezeDate;
}

function isMonthly60FixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_MONTHLY_FIXED_60;
}

function isEmergencyFixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_EMERGENCY_FIXED || payableWithin === "Emergency Loan";
}

function isWeeklyFixedLoan(payableWithin) {
  return isEmergencyFixedLoan(payableWithin) || payableWithin === "Weekly";
}

function getLoanPeriodDays(payableWithin) {
  if (isMonthly60FixedLoan(payableWithin)) return 60;
  if (isWeeklyFixedLoan(payableWithin)) return 7;
  return 30;
}

function getEffectiveInterestRate(record) {
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return 10;
  }
  return Number(record.interestRate || 0);
}

function computeDueDate(dateGranted, payableWithin) {
  if (!dateGranted) {
    return "";
  }

  const due = new Date(`${dateGranted}T00:00:00`);
  if (Number.isNaN(due.getTime())) {
    return "";
  }

  due.setDate(due.getDate() + getLoanPeriodDays(payableWithin));
  due.setDate(due.getDate() + 1);
  return toIsoDate(due);
}

function getPaymentHistory(record) {
  if (Array.isArray(record.paymentHistory)) {
    return record.paymentHistory;
  }
  return [];
}

function getTotalPaidAmount(record) {
  const totalPaid = Number(record.totalPaidAmount ?? record.paidAmount ?? 0);
  if (!Number.isFinite(totalPaid) || totalPaid < 0) {
    return 0;
  }
  return totalPaid;
}

function getTotalInterestReducedAmount(record) {
  const history = getPaymentHistory(record);
  if (history.length === 0) {
    return 0;
  }

  return history.reduce((sum, item) => {
    const interestReduced = Number(item.interestReduced || 0);
    if (!Number.isFinite(interestReduced) || interestReduced <= 0) {
      return sum;
    }
    return sum + interestReduced;
  }, 0);
}

function getWeeklyInterestPeriodsFromDate(dateGranted, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = referenceDate instanceof Date ? referenceDate : new Date(`${referenceDate}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(referenceDay.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor(diffDays(startDate, referenceDay) / 7));
}

function getEmergencyFixedInterestPeriodsFromDate(dateGranted, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = referenceDate instanceof Date ? referenceDate : new Date(`${referenceDate}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(referenceDay.getTime())) {
    return 1;
  }

  const elapsedDays = Math.max(0, diffDays(startDate, referenceDay));
  return Math.max(1, Math.ceil(elapsedDays / 7));
}

function getWeeklyRunningState(record, referenceDate = getInterestReferenceDate(record)) {
  const effectiveInterestRate = getEffectiveInterestRate(record) / 100;
  const periodsFromDate = isEmergencyFixedLoan(record.payableWithin)
    ? getEmergencyFixedInterestPeriodsFromDate
    : getWeeklyInterestPeriodsFromDate;
  const history = [...getPaymentHistory(record)]
    .filter((item) => item?.date && compareIsoDate(item.date, toIsoDate(referenceDate)) <= 0)
    .sort((a, b) => compareIsoDate(a.date, b.date));

  let principalBalance = Math.max(0, Number(record.amount || 0));
  let outstandingBalance = principalBalance;
  let lastCycle = 0;

  for (const item of history) {
    const paymentDate = new Date(`${item.date}T00:00:00`);
    const paymentCycles = periodsFromDate(record.dateGranted, paymentDate);
    const cyclesSince = Math.max(0, paymentCycles - lastCycle);
    outstandingBalance += principalBalance * effectiveInterestRate * cyclesSince;

    const amountPaid = Math.max(0, Number(item.amount || 0));
    const storedInterestPaid = Math.max(0, Number(item.interestPaid || 0));
    const storedPrincipalPaid = Math.max(0, Number(item.principalPaid || 0));
    const interestOutstanding = Math.max(0, outstandingBalance - principalBalance);
    const interestPaid = Math.min(interestOutstanding, storedInterestPaid || Math.min(amountPaid, interestOutstanding));
    const principalPaid = Math.min(
      principalBalance,
      storedPrincipalPaid || Math.max(0, Math.min(amountPaid, outstandingBalance) - interestPaid)
    );
    const interestReduced = Math.max(0, Number(item.interestReduced || 0));

    outstandingBalance = Math.max(0, outstandingBalance - amountPaid - interestReduced);
    principalBalance = Math.max(0, principalBalance - principalPaid);
    lastCycle = paymentCycles;
  }

  const currentCycles = periodsFromDate(record.dateGranted, referenceDate);
  const cyclesSince = Math.max(0, currentCycles - lastCycle);
  outstandingBalance += principalBalance * effectiveInterestRate * cyclesSince;

  return {
    outstandingBalance: Math.max(0, outstandingBalance),
    principalBalance: Math.max(0, principalBalance),
  };
}

function computeBaseTotalPayable(record) {
  const effectiveInterestRate = getEffectiveInterestRate(record);
  const monthlyInterestAmount = Number(record.amount || 0) * (effectiveInterestRate / 100);
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return Number(record.amount || 0) + monthlyInterestAmount * 2;
  }
  return Number(record.amount || 0) + monthlyInterestAmount;
}

function computeBaseCollectibleAmount(record) {
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record).outstandingBalance;
  }

  const override = Number(record?.collectibleAmountOverride);
  if (Number.isFinite(override) && override > 0) {
    return override;
  }

  if (isMonthly60FixedLoan(record.payableWithin)) {
    return computeBaseTotalPayable(record) / 60;
  }

  const effectiveInterestRate = getEffectiveInterestRate(record);
  const monthlyInterestAmount = Number(record.amount || 0) * (effectiveInterestRate / 100);
  return monthlyInterestAmount;
}

function computeCollectibleAmount(record) {
  const baseCollectible = computeBaseCollectibleAmount(record);
  const arrearsForCollectible = record?.arrearsType === "Principal" ? computeArrearsAmount(record) : 0;
  const otherArrearsForCollectible = record?.otherArrearsType === "Principal" ? computeOtherArrearsAmount(record) : 0;
  return baseCollectible + arrearsForCollectible + otherArrearsForCollectible;
}

function computeArrearsAmount(record) {
  const manualArrears = Number(record?.manualArrearsAmount ?? 0);
  if (!Number.isFinite(manualArrears) || manualArrears < 0) {
    return 0;
  }
  return manualArrears;
}

function computeOtherArrearsAmount(record) {
  const otherArrears = Number(record?.manualOtherArrearsAmount ?? 0);
  if (!Number.isFinite(otherArrears) || otherArrears < 0) {
    return 0;
  }
  return otherArrears;
}

function isPastDueOfficerRecord(record) {
  if (!record || record?.isSettled === true || record?.isWriteOff === true || isHatagHatagActive(record)) {
    return false;
  }

  const referenceIso = toIsoDate(getReferenceDate());
  const effectiveDueDate = String(record?.dueDate || computeDueDate(record?.dateGranted, record?.payableWithin) || "").trim();
  if (!effectiveDueDate) {
    return false;
  }

  return computeRemainingPayable(record) > 0 && effectiveDueDate < referenceIso;
}

function getCollectibleLabelForRecord(record) {
  const overridePeriod = String(record?.collectiblePeriodOverride || "").trim();
  if (overridePeriod) {
    return `${overridePeriod.toLowerCase()} collectible`;
  }

  if (isWeeklyFixedLoan(record.payableWithin)) {
    return "weekly collectible";
  }
  return "daily collectible";
}

function isHatagHatagActive(record) {
  return Boolean(record && record.isHatagHatag === true);
}

function computeRemainingPayable(record) {
  if (isHatagHatagActive(record)) {
    const snapshot = Number(record.hatagHatagOutstanding);
    if (Number.isFinite(snapshot) && snapshot >= 0) {
      return snapshot;
    }
  }

  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record).outstandingBalance;
  }

  const grossPayable = computeBaseTotalPayable(record);
  const totalPaid = getTotalPaidAmount(record);
  const totalInterestReduced = getTotalInterestReducedAmount(record);
  return Math.max(0, grossPayable - totalPaid - totalInterestReduced);
}

function getTotalPrincipalPaidAmount(record) {
  const history = getPaymentHistory(record);
  if (history.length > 0) {
    return history.reduce((sum, item) => {
      const principalPaid = Number(item.principalPaid);
      if (Number.isFinite(principalPaid) && principalPaid >= 0) {
        return sum + principalPaid;
      }

      const fallbackAmount = Number(item.amount || 0);
      return Number.isFinite(fallbackAmount) && fallbackAmount > 0 ? sum + fallbackAmount : sum;
    }, 0);
  }

  return getTotalPaidAmount(record);
}

function getPrincipalOutstandingAmount(record) {
  const principalOutstanding = Number(record.amount || 0) - getTotalPrincipalPaidAmount(record);
  if (!Number.isFinite(principalOutstanding)) {
    return 0;
  }
  return Math.max(0, principalOutstanding);
}

function getRebateAmount(record) {
  const rebateAmount = Number(record?.manualRebateAmount ?? 0);
  if (!Number.isFinite(rebateAmount) || rebateAmount <= 0) {
    return 0;
  }
  return rebateAmount;
}

function getOutstandingBreakdown(record) {
  const rawOutstandingBalance = Math.max(0, computeRemainingPayable(record));
  const principalBase = isWeeklyFixedLoan(record.payableWithin)
    ? getWeeklyRunningState(record).principalBalance
    : getPrincipalOutstandingAmount(record);
  const rawPrincipalOutstanding = Math.min(rawOutstandingBalance, principalBase);
  const rawInterestOutstanding = Math.max(0, rawOutstandingBalance - rawPrincipalOutstanding);
  const paymentTarget = getRebateAmount(record);
  const rebateAmount = paymentTarget > 0 && paymentTarget < rawOutstandingBalance
    ? rawOutstandingBalance - paymentTarget
    : 0;
  const rebateAppliedToInterest = Math.min(rebateAmount, rawInterestOutstanding);
  const rebateAppliedToPrincipal = Math.max(0, rebateAmount - rebateAppliedToInterest);
  const principalOutstanding = Math.max(0, rawPrincipalOutstanding - rebateAppliedToPrincipal);
  const interestOutstanding = Math.max(0, rawInterestOutstanding - rebateAppliedToInterest);
  const outstandingBalance = principalOutstanding + interestOutstanding;

  return {
    outstandingBalance,
    principalOutstanding,
    interestOutstanding,
    rawOutstandingBalance,
    rebateAmount,
  };
}

function splitPaymentAmount(record, paymentAmount) {
  const normalizedPayment = Number.isFinite(paymentAmount) ? Math.max(0, paymentAmount) : 0;
  const { outstandingBalance, principalOutstanding, interestOutstanding } = getOutstandingBreakdown(record);
  const payableAmount = Math.min(normalizedPayment, outstandingBalance);

  if (isHatagHatagActive(record)) {
    const interestPaid = Math.min(payableAmount, interestOutstanding);
    return {
      outstandingBalance,
      principalOutstanding,
      interestOutstanding,
      interestPaid,
      principalPaid: 0,
      appliedAmount: interestPaid,
    };
  }

  const interestPaid = Math.min(payableAmount, interestOutstanding);
  const principalPaid = Math.min(principalOutstanding, Math.max(0, payableAmount - interestPaid));

  return {
    outstandingBalance,
    principalOutstanding,
    interestOutstanding,
    interestPaid,
    principalPaid,
    appliedAmount: interestPaid + principalPaid,
  };
}

function splitPrincipalOnlyPayment(record, paymentAmount) {
  const normalizedPayment = Number.isFinite(paymentAmount) ? Math.max(0, paymentAmount) : 0;
  const { outstandingBalance, principalOutstanding, interestOutstanding } = getOutstandingBreakdown(record);
  const principalPaid = Math.min(normalizedPayment, principalOutstanding);
  const interestReduced = principalOutstanding > 0
    ? Math.min(interestOutstanding, interestOutstanding * (principalPaid / principalOutstanding))
    : 0;

  return {
    outstandingBalance,
    principalOutstanding,
    interestOutstanding,
    interestPaid: 0,
    principalPaid,
    interestReduced,
    appliedAmount: principalPaid,
    outstandingReduction: principalPaid + interestReduced,
  };
}

function getPaymentAllocation(record, paymentAmount, mode = PAYMENT_MODE_STANDARD) {
  if (mode === PAYMENT_MODE_PRINCIPAL_ONLY) {
    return splitPrincipalOnlyPayment(record, paymentAmount);
  }

  return splitPaymentAmount(record, paymentAmount);
}

function getPaymentModeLabel(mode = PAYMENT_MODE_STANDARD) {
  return mode === PAYMENT_MODE_PRINCIPAL_ONLY ? "Principal Only" : "Standard";
}

function showMessage(text, type = "success") {
  if (!message) return;

  message.textContent = text;
  message.className = `form-message show ${type}`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    message.className = "form-message";
  }, 3000);
}

function showToast(text, type = "success") {
  if (toast) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toast.textContent = text;
    toast.className = `toast show ${type}`;
    toastTimer = setTimeout(() => {
      toast.className = "toast";
    }, 1500);
    return;
  }

  showMessage(text, type);
}

function updateDashboardStats() {
  const records = getRecords().filter((record) => record?.isSettled !== true);
  const totalLoans = records.length;
  const totalAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalOutstanding = records.reduce(
    (sum, record) => sum + Number(getOutstandingBreakdown(record).outstandingBalance || 0),
    0
  );
  const pastDueCount = records.filter((record) => isPastDueOfficerRecord(record)).length;
  
  if (dashboardTotalLoans) {
    dashboardTotalLoans.textContent = String(totalLoans);
  }
  if (dashboardTotalAmount) {
    dashboardTotalAmount.textContent = formatCurrency(totalAmount);
  }
  if (dashboardTotalOutstanding) {
    dashboardTotalOutstanding.textContent = formatCurrency(totalOutstanding);
  }
  if (dashboardPastDueCount) {
    dashboardPastDueCount.textContent = String(pastDueCount);
  }
}

function setLoanFormVisibility(isVisible) {
  isLoanFormVisible = Boolean(isVisible);

  if (loanEntryPanel) {
    loanEntryPanel.style.display = isLoanFormVisible ? "block" : "none";
  }

  if (officerMain) {
    officerMain.classList.toggle("loan-form-hidden", !isLoanFormVisible);
  }

  if (toggleLoanEntryBtn) {
    toggleLoanEntryBtn.textContent = isLoanFormVisible ? "Hide Loan Application" : "Show Loan Application";
    toggleLoanEntryBtn.setAttribute("aria-expanded", isLoanFormVisible ? "true" : "false");
  }
}

function renderRecords() {
  const filtered = getVisibleRecords();
  console.debug("[render][officer] Rendering records", {
    officer: currentOfficer,
    totalRecords: getRecords().length,
    visibleRecords: filtered.length,
    time: new Date().toISOString(),
  });

  if (filtered.length === 0) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${isSettledOfficerView() ? "No settled accounts yet." : "No records yet."}</td></tr>`;
    updateDashboardStats();
    return;
  }

  body.innerHTML = filtered
    .map(({ record, index }) => {
      const recordFingerprint = buildRecordFingerprint(record);
      const dueDate = String(record.dueDate || computeDueDate(record.dateGranted, record.payableWithin));
      const payDate = String(record.payDate || dueDate);
      const isPastDue = isPastDueOfficerRecord(record);
      const collectibleAmount = computeCollectibleAmount(record);
      const arrearsAmount = computeArrearsAmount(record);
      const otherArrearsAmount = computeOtherArrearsAmount(record);
      const paymentBreakdown = getOutstandingBreakdown(record);
      const outstandingBalance = paymentBreakdown.outstandingBalance;
      const totalPaidAmount = getTotalPaidAmount(record);
      const paymentCount = getPaymentHistory(record).length;
      const effectiveInterestRate = getEffectiveInterestRate(record);
      const arrearsType = record.arrearsType === "Principal" ? "Principal" : "Interest";
      const otherArrearsType = record.otherArrearsType === "Principal" ? "Principal" : "Interest";
      const escapedRemarks = sanitize(String(record.remarks || ""));
      const settledActive = record?.isSettled === true;
      const settledDate = String(record?.settledDate || "").trim();
      const isWriteOffActive = record.isWriteOff === true;
      const writeOffFreezeDate = String(record.writeOffDate || "").trim();
      const hatagHatagActive = isHatagHatagActive(record);
      const hatagHatagDate = String(record.hatagHatagDate || "").trim();
      const arrearsInputValue = openArrearsEditorRowIndex === index
        ? getAmountDraftForRecord(record, arrearsInputDrafts, arrearsAmount)
        : formatAmountInputOrBlank(arrearsAmount);
      const otherArrearsInputValue = openOtherArrearsEditorRowIndex === index
        ? getAmountDraftForRecord(record, otherArrearsInputDrafts, otherArrearsAmount)
        : formatAmountInputOrBlank(otherArrearsAmount);
      return `
        <tr class="${isPastDue ? "past-due-row" : ""}">
          <td>
            <div class="borrower-name-row">
              <div class="borrower-name">${sanitize(String(record.name || ""))}</div>
              <button type="button" class="btn-secondary borrower-edit-btn edit-name-btn" data-index="${index}">Edit</button>
            </div>
            <div class="borrower-contact-row">
              <div class="borrower-contact"><svg class="borrower-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.6 3C7 4.5 7.5 5.9 8.2 7.1L6.8 8.5c.7 1.4 1.8 2.5 3.2 3.2l1.4-1.4c1.2.7 2.6 1.2 4.1 1.4v2.8C12.1 15 6 8.9 3 5.6V3h3.6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>${sanitize(String(record.contactNumber || "-"))}</div>
              <button type="button" class="btn-secondary borrower-edit-btn edit-contact-btn" data-index="${index}">Edit</button>
            </div>
            <div class="borrower-address-row">
              <div class="borrower-address"><svg class="borrower-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>${sanitize(String(record.address || "-"))}</div>
              <button type="button" class="btn-secondary borrower-edit-btn edit-address-btn" data-index="${index}">Edit</button>
            </div>
          </td>
          <td>
            <div class="loan-info-purpose"><b>Purpose of Loan:</b> ${sanitize(String(record.purposeOfLoan || "-"))}</div>
            <div class="loan-info-mode"><b>Mode of Payment:</b> ${sanitize(String(record.modeOfPayment || "-"))}</div>
            <div class="loan-info-type"><b>Type of Loan:</b> ${sanitize(getTypeLabel(record.payableWithin))}</div>
          </td>
          <td>
            <div class="amount-info-rate">Interest rate: <span class="amount-info-rate-value">${Math.round(effectiveInterestRate)}%</span></div>
            <div class="amount-info-line"><b>Grant Amount:</b> ${formatCurrency(record.amount)}</div>
            <div class="amount-info-line"><b>Date Granted:</b> ${formatLongDate(record.dateGranted)}</div>
            <button type="button" class="btn-secondary due-date-display-btn" data-index="${index}">Due Date: ${formatLongDate(dueDate)}</button>
            <input type="date" class="due-date-input due-date-input-hidden" data-index="${index}" value="${sanitize(dueDate)}" />
            <button type="button" class="btn-secondary collectible-display-btn" data-index="${index}">${formatCurrency(collectibleAmount)}/${getCollectibleLabelForRecord(record)}</button>
            <div class="paid-controls collectible-editor collectible-editor-hidden" data-index="${index}">
              <input type="text" class="collectible-edit-input" data-index="${index}" value="${normalizeAmountInput(formatPlainAmount(collectibleAmount))}" inputmode="decimal" autocomplete="off" />
              <select class="collectible-period-select" data-index="${index}">
                <option value="Daily" ${record.collectiblePeriodOverride === "Daily" ? "selected" : ""}>Daily</option>
                <option value="Weekly" ${record.collectiblePeriodOverride === "Weekly" ? "selected" : ""}>Weekly</option>
                <option value="Bi-Monthly" ${record.collectiblePeriodOverride === "Bi-Monthly" ? "selected" : ""}>Bi-Monthly</option>
                <option value="Monthly" ${record.collectiblePeriodOverride === "Monthly" ? "selected" : ""}>Monthly</option>
              </select>
              <button type="button" class="btn-secondary save-collectible-btn" data-index="${index}">Save</button>
            </div>
          </td>
          <td>
            ${formatCurrency(outstandingBalance)}
            <br />
            <small class="mini-note">Interest: ${formatCurrency(paymentBreakdown.interestOutstanding)}</small>
          </td>
          <td>
            <button type="button" class="btn-secondary move-pay-date-display-btn" data-index="${index}">Move Pay Date: ${formatLongDate(payDate)}</button>
            <input type="date" class="move-pay-date-input due-date-input-hidden" data-index="${index}" value="${sanitize(payDate)}" />
            <button type="button" class="btn-secondary arrears-display-btn" data-index="${index}">Arrears: ${formatCurrency(arrearsAmount)} (${arrearsType})</button>
            <div class="paid-controls arrears-editor ${openArrearsEditorRowIndex === index ? "" : "arrears-editor-hidden"}" data-index="${index}">
              <small class="mini-note">${arrearsType}</small>
              <input type="text" class="arrears-input" data-index="${index}" value="${arrearsInputValue}" inputmode="decimal" autocomplete="off" />
              <select class="arrears-type-select" data-index="${index}">
                <option value="Principal" ${arrearsType === "Principal" ? "selected" : ""}>Principal</option>
                <option value="Interest" ${arrearsType === "Interest" ? "selected" : ""}>Interest</option>
              </select>
              <button type="button" class="btn-secondary save-arrears-btn" data-index="${index}">Save</button>
            </div>
            <button type="button" class="btn-secondary other-arrears-display-btn" data-index="${index}">Other Arrears: ${formatCurrency(otherArrearsAmount)} (${otherArrearsType})</button>
            <div class="paid-controls other-arrears-editor ${openOtherArrearsEditorRowIndex === index ? "" : "other-arrears-editor-hidden"}" data-index="${index}">
              <small class="mini-note">${otherArrearsType}</small>
              <input type="text" class="other-arrears-input" data-index="${index}" value="${otherArrearsInputValue}" inputmode="decimal" autocomplete="off" />
              <select class="other-arrears-type-select" data-index="${index}">
                <option value="Principal" ${otherArrearsType === "Principal" ? "selected" : ""}>Principal</option>
                <option value="Interest" ${otherArrearsType === "Interest" ? "selected" : ""}>Interest</option>
              </select>
              <button type="button" class="btn-secondary save-other-arrears-btn" data-index="${index}">Save</button>
            </div>
          </td>
          <td>
            <div class="remarks-controls">
              ${settledActive ? "" : `<button type="button" class="btn-pay pay-loan-btn" data-index="${index}">Pay</button>`}
              <button type="button" class="btn-secondary show-payment-history-btn" data-index="${index}" data-fingerprint="${sanitize(recordFingerprint)}">Show Payment History</button>
              <button type="button" class="btn-secondary open-remarks-btn" data-index="${index}">Remarks: ${escapedRemarks || "-"}</button>
              <div class="remarks-editor ${openRemarksEditorRowIndex === index ? "" : "remarks-editor-hidden"}" data-index="${index}">
                <input type="text" class="remarks-input" data-index="${index}" value="${escapedRemarks}" placeholder="Add remarks..." autocomplete="off" />
                <button type="button" class="btn-secondary save-remarks-btn" data-index="${index}">Save</button>
              </div>
              <button type="button" class="statement-btn" data-index="${index}" data-fingerprint="${sanitize(recordFingerprint)}">Statement of Account</button>
              ${settledActive ? "" : `<button type="button" class="btn-danger write-off-btn" data-index="${index}" ${isWriteOffActive || hatagHatagActive ? "disabled" : ""}>${isWriteOffActive ? "Write-Off Active" : "Write-Off"}</button>`}
              ${settledActive ? "" : `<button type="button" class="btn-hatag-hatag hatag-hatag-btn" data-index="${index}" ${hatagHatagActive || isWriteOffActive ? "disabled" : ""}>${hatagHatagActive ? "Hatag-Hatag Active" : "Hatag-Hatag"}</button>`}
              ${settledActive ? "" : `<button type="button" class="btn-secondary settle-btn" data-index="${index}">Settle</button>`}
            </div>
            ${settledActive
              ? `<small class="mini-note settled-note">Settled on ${sanitize(formatLongDate(settledDate || toIsoDate(getReferenceDate())))}</small>`
              : isWriteOffActive
              ? `<small class="mini-note">Write-Off active since ${sanitize(formatLongDate(writeOffFreezeDate))}</small>`
              : hatagHatagActive
                ? `<small class="mini-note">Hatag-Hatag active since ${sanitize(formatLongDate(hatagHatagDate))}</small>`
                : ""}
          </td>
        </tr>
      `;
    })
    .join("");
  
  updateDashboardStats();
}

function getVisibleRecords() {
  const records = getRecords();
  const nameFilter = String(filterNameInput?.value || "").toLowerCase().trim();
  const dateFilter = String(filterDateGrantedInput?.value || "").trim();
  const searchDateFilter = String(filterSearchDateInput?.value || "").trim();
  const payableFilter = String(filterPayableSelect?.value || "").trim();
  const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => {
    const matchesView = isSettledOfficerView() ? record?.isSettled === true : record?.isSettled !== true;
    const matchesName = nameFilter === "" || String(record.name || "").toLowerCase().includes(nameFilter);
    const matchesDate = dateFilter === "" || String(record.dateGranted || "") === dateFilter;
    const effectiveDueDate = String(record.dueDate || computeDueDate(record.dateGranted, record.payableWithin));
    const effectivePayDate = String(record.payDate || effectiveDueDate);
    const matchesSearchDate =
      searchDateFilter === "" ||
      String(record.dateGranted || "") === searchDateFilter ||
      effectiveDueDate === searchDateFilter ||
      effectivePayDate === searchDateFilter;
    const matchesPayable = payableFilter === "" || String(record.payableWithin || "") === payableFilter;
    return matchesView && matchesName && matchesDate && matchesSearchDate && matchesPayable;
  });

  const sortBy = sortBySelect?.value || "nameAsc";
  if (sortBy === "nameAsc") {
    filtered.sort((a, b) => String(a.record.name || "").localeCompare(String(b.record.name || "")));
  } else if (sortBy === "nameDesc") {
    filtered.sort((a, b) => String(b.record.name || "").localeCompare(String(a.record.name || "")));
  } else if (sortBy === "dateGrantedDesc") {
    filtered.sort((a, b) => String(b.record.dateGranted || "").localeCompare(String(a.record.dateGranted || "")));
  } else if (sortBy === "dateGrantedAsc") {
    filtered.sort((a, b) => String(a.record.dateGranted || "").localeCompare(String(b.record.dateGranted || "")));
  }

  return filtered;
}

function formatUpperDate(isoDate) {
  return String(formatLongDate(isoDate) || isoDate || "").toUpperCase();
}

function formatPlainAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? String(Math.round(amount)) : "0";
}

function formatBackupTimestamp(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return toIsoDate(new Date()).replace(/-/g, "") + "_000000";
  }

  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}${sec}`;
}

function toggleCollectibleEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const editor = body?.querySelector(`.collectible-editor[data-index="${rowIndex}"]`);
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const currentlyOpen = !editor.classList.contains("collectible-editor-hidden");
  const shouldOpen = forceOpen ? true : !currentlyOpen;
  editor.classList.toggle("collectible-editor-hidden", !shouldOpen);
}

function toggleRebateEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const shouldOpen = forceOpen ? true : openRebateEditorRowIndex !== rowIndex;
  openRebateEditorRowIndex = shouldOpen ? rowIndex : -1;
  renderRecords();

  if (shouldOpen) {
    const rebateInputEl = body?.querySelector(`.rebate-input[data-index="${rowIndex}"]`);
    if (rebateInputEl instanceof HTMLInputElement) {
      rebateInputEl.focus();
      rebateInputEl.select();
    }
  }
}

function toggleArrearsEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const shouldOpen = forceOpen ? true : openArrearsEditorRowIndex !== rowIndex;
  openArrearsEditorRowIndex = shouldOpen ? rowIndex : -1;
  if (shouldOpen) {
    openOtherArrearsEditorRowIndex = -1;
  } else {
    const record = getRecords()[rowIndex];
    clearAmountDraftForRecord(record, arrearsInputDrafts);
  }
  renderRecords();

  if (shouldOpen) {
    const arrearsInputEl = body?.querySelector(`.arrears-input[data-index="${rowIndex}"]`);
    if (arrearsInputEl instanceof HTMLInputElement) {
      arrearsInputEl.focus();
    }
  }
}

function toggleOtherArrearsEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const shouldOpen = forceOpen ? true : openOtherArrearsEditorRowIndex !== rowIndex;
  openOtherArrearsEditorRowIndex = shouldOpen ? rowIndex : -1;
  if (shouldOpen) {
    openArrearsEditorRowIndex = -1;
  } else {
    const record = getRecords()[rowIndex];
    clearAmountDraftForRecord(record, otherArrearsInputDrafts);
  }
  renderRecords();

  if (shouldOpen) {
    const otherArrearsInputEl = body?.querySelector(`.other-arrears-input[data-index="${rowIndex}"]`);
    if (otherArrearsInputEl instanceof HTMLInputElement) {
      otherArrearsInputEl.focus();
    }
  }
}

function toggleRemarksEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const shouldOpen = forceOpen ? true : openRemarksEditorRowIndex !== rowIndex;
  openRemarksEditorRowIndex = shouldOpen ? rowIndex : -1;
  renderRecords();

  if (shouldOpen) {
    const remarksInputEl = body?.querySelector(`.remarks-input[data-index="${rowIndex}"]`);
    if (remarksInputEl instanceof HTMLInputElement) {
      remarksInputEl.focus();
    }
  }
}

function closePaymentHistoryModal() {
  if (!paymentHistoryModal) {
    return;
  }
  paymentHistoryModal.classList.remove("show");
  paymentHistoryModal.setAttribute("aria-hidden", "true");
  paymentHistoryRowIndex = -1;
}

function closeDeletePaymentConfirmModal(result = false) {
  deletePaymentConfirmModal?.classList.remove("show");
  deletePaymentConfirmModal?.setAttribute("aria-hidden", "true");
  if (deletePaymentConfirmText) {
    deletePaymentConfirmText.textContent = "Delete this payment entry? This action cannot be undone.";
  }

  if (typeof deletePaymentConfirmResolver === "function") {
    deletePaymentConfirmResolver(Boolean(result));
    deletePaymentConfirmResolver = null;
  }
}

function requestDeletePaymentConfirmation(message = "Delete this payment entry? This action cannot be undone.") {
  if (!deletePaymentConfirmModal || !deletePaymentConfirmText) {
    return Promise.resolve(window.confirm(message));
  }

  deletePaymentConfirmText.textContent = String(message || "Delete this payment entry? This action cannot be undone.");
  deletePaymentConfirmModal.classList.add("show");
  deletePaymentConfirmModal.setAttribute("aria-hidden", "false");

  return new Promise((resolve) => {
    deletePaymentConfirmResolver = resolve;
  });
}

function openPaymentHistoryModal(record, history, rowIndex = -1) {
  if (!paymentHistoryModal || !paymentHistoryContent) {
    return;
  }

  paymentHistoryRowIndex = Number.isInteger(rowIndex) && rowIndex >= 0 ? rowIndex : -1;
  if (paymentHistoryTitle) {
    paymentHistoryTitle.textContent = `Payment History - ${record.name || "Borrower"}`;
  }

  if (!Array.isArray(history) || history.length === 0) {
    paymentHistoryContent.innerHTML = '<p class="payment-history-empty">No payment history yet.</p>';
    paymentHistoryModal.classList.add("show");
    paymentHistoryModal.setAttribute("aria-hidden", "false");
    return;
  }

  const isHatagMode = isHatagHatagActive(record);
  let totalPaid = 0;
  let totalRebate = 0;
  const rows = history
    .map((item, historyIndex) => ({ item, historyIndex }))
    .reverse()
    .map(({ item, historyIndex }, idx) => {
      const amountPaid = Number(item.amount || 0);
      const storedPrincipalPaid = Number(item.principalPaid || 0);
      const storedInterestPaid = Number(item.interestPaid || 0);
      const principalPaid = isHatagMode ? 0 : storedPrincipalPaid;
      const interestPaid = isHatagMode
        ? (Number.isFinite(amountPaid) && amountPaid > 0 ? amountPaid : 0)
        : storedInterestPaid;
      const itemRebateApplied = Math.max(0, Number(item.rebateApplied || 0));
      totalPaid += amountPaid;
      totalRebate += itemRebateApplied;

      const amountDisplay = itemRebateApplied > 0
        ? `${formatCurrency(amountPaid)} <small class="rebate-note">Rebate: ${formatCurrency(itemRebateApplied)}</small>`
        : formatCurrency(amountPaid);

      return `
        <div class="payment-history-row">
          <span><span class="pill">#${idx + 1}</span></span>
          <span>${sanitize(formatLongDate(item.date) || String(item.date || "-"))}</span>
          <span>${amountDisplay}</span>
          <span>P: ${formatCurrency(principalPaid)}</span>
          <span>I: ${formatCurrency(interestPaid)}</span>
          <span>
            <button type="button" class="btn-danger payment-history-delete-btn" data-history-index="${historyIndex}">Delete</button>
          </span>
        </div>
      `;
    })
    .join("");

  paymentHistoryContent.innerHTML = `
    <div class="payment-history-grid">
      <div class="payment-history-row payment-history-row--head">
        <span>No.</span>
        <span>Date</span>
        <span>Amount</span>
        <span>P (Principal)</span>
        <span>I (Interest)</span>
        <span>Actions</span>
      </div>
      ${rows}
    </div>
    <div class="payment-history-total">Total Paid: <strong>${formatCurrency(totalPaid)}</strong><br />Total Rebate: <strong>${formatCurrency(totalRebate)}</strong></div>
  `;

  paymentHistoryModal.classList.add("show");
  paymentHistoryModal.setAttribute("aria-hidden", "false");
}

function isHistoryOnlyHatagPayment(record, entry) {
  if (!isHatagHatagActive(record)) {
    return false;
  }

  const hatagDate = String(record?.hatagHatagDate || "").trim();
  if (!hatagDate) {
    return false;
  }

  const entryDate = String(entry?.date || "").trim();
  if (!entryDate || compareIsoDate(entryDate, hatagDate) < 0) {
    return false;
  }

  const principalPaid = Number(entry?.principalPaid || 0);
  const interestReduced = Number(entry?.interestReduced || 0);
  const rebateApplied = Number(entry?.rebateApplied || 0);
  return principalPaid <= 0 && interestReduced <= 0 && rebateApplied <= 0;
}

function recomputeRecordTotalPaidAmount(record) {
  const history = getPaymentHistory(record);
  const totalPaid = history.reduce((sum, entry) => {
    const amount = Number(entry?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return sum;
    }
    if (isHistoryOnlyHatagPayment(record, entry)) {
      return sum;
    }
    return sum + amount;
  }, 0);
  record.totalPaidAmount = Math.max(0, totalPaid);
}

function refreshHatagOutstandingSnapshot(record) {
  if (!isHatagHatagActive(record)) {
    return;
  }

  const freezeDate = getHatagHatagFreezeDate(record);
  if (!freezeDate) {
    return;
  }

  const freezeIso = toIsoDate(freezeDate);
  if (isWeeklyFixedLoan(record.payableWithin)) {
    record.hatagHatagOutstanding = getWeeklyRunningState(record, freezeDate).outstandingBalance;
    return;
  }

  const history = getPaymentHistory(record);
  const totalPaidBeforeFreeze = history.reduce((sum, entry) => {
    if (!entry?.date || compareIsoDate(entry.date, freezeIso) > 0) {
      return sum;
    }
    if (isHistoryOnlyHatagPayment(record, entry)) {
      return sum;
    }

    const amount = Number(entry.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return sum;
    }
    return sum + amount;
  }, 0);

  const totalInterestReducedBeforeFreeze = history.reduce((sum, entry) => {
    if (!entry?.date || compareIsoDate(entry.date, freezeIso) > 0) {
      return sum;
    }
    const interestReduced = Number(entry.interestReduced || 0);
    if (!Number.isFinite(interestReduced) || interestReduced <= 0) {
      return sum;
    }
    return sum + interestReduced;
  }, 0);

  const grossPayable = computeBaseTotalPayable(record);
  record.hatagHatagOutstanding = Math.max(0, grossPayable - totalPaidBeforeFreeze - totalInterestReducedBeforeFreeze);
}

async function deletePaymentHistoryEntry(rowIndex, historyIndex) {
  const records = getRecords();
  const record = records[rowIndex];
  if (!record) {
    showMessage("Record not found.", "error");
    return;
  }

  const history = getPaymentHistory(record);
  if (!history[historyIndex]) {
    showMessage("Payment history entry not found.", "error");
    return;
  }

  const confirmed = await requestDeletePaymentConfirmation("Delete this payment entry? This action cannot be undone.");
  if (!confirmed) {
    return;
  }

  history.splice(historyIndex, 1);
  record.paymentHistory = history;
  recomputeRecordTotalPaidAmount(record);
  refreshHatagOutstandingSnapshot(record);
  setRecords(records);
  renderRecords();
  openPaymentHistoryModal(records[rowIndex], getPaymentHistory(records[rowIndex]), rowIndex);
  showMessage("Payment history entry deleted.", "success");
  showToast("Payment history deleted", "success");
}

function closePaymentEntryModal() {
  if (!paymentEntryModal) {
    return;
  }

  paymentEntryModal.classList.remove("show");
  paymentEntryModal.setAttribute("aria-hidden", "true");
  paymentEntryRowIndex = -1;
  paymentEntryMode = PAYMENT_MODE_STANDARD;
  if (paymentEntryInput) {
    paymentEntryInput.value = "";
  }
  if (paymentEntryError) {
    paymentEntryError.textContent = "";
  }
  if (paymentEntryPreview) {
    paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(0)} | Principal ${formatCurrency(0)}`;
  }
}

function updatePaymentEntryPreview() {
  if (!paymentEntryPreview) {
    return;
  }

  const amount = parseAmountInput(paymentEntryInput?.value || "0");
  const records = getRecords();
  const record = records[paymentEntryRowIndex];
  if (!record) {
    paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(0)} | Principal ${formatCurrency(0)}`;
    return;
  }

  const allocation = getPaymentAllocation(record, amount, paymentEntryMode);
  paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(allocation.interestPaid)} | Principal ${formatCurrency(allocation.principalPaid)}`;
}

function openPaymentEntryModal(rowIndex, record, mode = PAYMENT_MODE_STANDARD) {
  if (!paymentEntryModal || !paymentEntryInput) {
    return;
  }

  paymentEntryRowIndex = rowIndex;
  paymentEntryMode = mode;
  if (paymentEntrySubtitle) {
    const statusNote = record.isWriteOff === true
      ? " | Write-Off Active"
      : isHatagHatagActive(record)
        ? " | Hatag-Hatag Active"
        : "";
    paymentEntrySubtitle.textContent = `Borrower: ${record.name || ""}${statusNote} | Mode: ${getPaymentModeLabel(mode)}`;
  }
  paymentEntryInput.value = "";
  if (paymentEntryError) {
    paymentEntryError.textContent = "";
  }
  updatePaymentEntryPreview();

  paymentEntryModal.classList.add("show");
  paymentEntryModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    paymentEntryInput.focus();
  }, 0);
}

function applyPaymentForRow(rowIndex, paidAmount, mode = PAYMENT_MODE_STANDARD) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Unable to process payment.", "error");
    return false;
  }

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    showMessage("Please enter a valid payment amount.", "error");
    return false;
  }

  const records = getRecords();
  const record = records[rowIndex];
  if (!record) {
    showMessage("Record not found.", "error");
    return false;
  }

  const allocation = getPaymentAllocation(record, paidAmount, mode);
  const isHatagMode = isHatagHatagActive(record);
  if (mode === PAYMENT_MODE_PRINCIPAL_ONLY && isHatagMode) {
    showMessage("Principal-only payment is not available in Hatag-Hatag mode.", "error");
    return false;
  }
  if (allocation.outstandingBalance <= 0) {
    showMessage("There is no outstanding balance to pay.", "error");
    return false;
  }
  if (!isHatagMode && allocation.appliedAmount <= 0) {
    showMessage(mode === PAYMENT_MODE_PRINCIPAL_ONLY ? "There is no principal balance to pay." : "There is no outstanding balance to pay.", "error");
    return false;
  }

  if (!isHatagMode && mode === PAYMENT_MODE_PRINCIPAL_ONLY && paidAmount > allocation.principalOutstanding) {
    showMessage("Payment cannot exceed the principal balance.", "error");
    return false;
  }

  if (!isHatagMode && mode !== PAYMENT_MODE_PRINCIPAL_ONLY && paidAmount > allocation.outstandingBalance) {
    showMessage("Payment cannot exceed the outstanding balance.", "error");
    return false;
  }

  const principalPaid = isHatagMode ? 0 : allocation.principalPaid;
  const interestPaid = isHatagMode ? paidAmount : allocation.interestPaid;
  const interestReduced = isHatagMode ? 0 : Math.max(0, Number(allocation.interestReduced || 0));
  const rebateApplied = isHatagMode ? 0 : getOutstandingBreakdown(record).rebateAmount;

  record.totalPaidAmount = getTotalPaidAmount(record) + (isHatagMode ? 0 : paidAmount);
  const history = getPaymentHistory(record);
  history.unshift({
    date: toIsoDate(getReferenceDate()),
    amount: paidAmount,
    principalPaid,
    interestPaid,
    interestReduced,
    rebateApplied,
  });
  record.paymentHistory = history;

  if (!isHatagMode && isMonthly60FixedLoan(record.payableWithin)) {
    if (record.arrearsType !== "Principal" && record.arrearsType !== "Interest") {
      record.arrearsType = "Interest";
    }
    if (record.arrearsType === "Interest") {
      // Track remaining unpaid interest directly so arrears decreases as interest is paid.
      const remainingInterestAfterPayment = Math.max(0, allocation.interestOutstanding - interestPaid);
      const currentArrears = computeArrearsAmount(record);
      if (currentArrears > 0 || remainingInterestAfterPayment > 0) {
        record.manualArrearsAmount = remainingInterestAfterPayment;
      }
    } else if (record.arrearsType === "Principal") {
      const currentArrears = computeArrearsAmount(record);
      record.manualArrearsAmount = Math.max(0, currentArrears - principalPaid);
    }
  }

  setRecords(records);
  lastPaymentAt = Date.now(); // Record timestamp to prevent sync race condition
  renderRecords();
  showMessage(mode === PAYMENT_MODE_PRINCIPAL_ONLY ? "Principal-only payment applied successfully." : "Payment applied successfully.", "success");
  return true;
}

async function exportVisibleRecordsToWord() {
  const rows = getVisibleRecords();
  if (rows.length === 0) {
    showMessage("No records to export.", "error");
    return;
  }

  const logoDataUrl = await getImageDataUrl("images/mgi_logo.png");
  const todayText = formatUpperDate(toIsoDate(new Date()));
  const officerName = String(currentOfficer || "").trim() || "Unknown";
  const safeOfficerSlug = officerName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";
  const isJamesOfficer = officerName.toLowerCase() === "james";

  const headerRow = isJamesOfficer
    ? `
      <tr>
        <th>Name of the Borrower</th>
        <th>Outstanding Balance</th>
        <th>Amount Collectible</th>
        <th>Interest</th>
        <th>Amount Collected</th>
        <th>Remarks</th>
      </tr>
    `
    : `
      <tr>
        <th>Name of the Borrower</th>
        <th>Amount</th>
        <th>Date Granted</th>
        <th>Due Date</th>
        <th>Outstanding Balance</th>
        <th>Amount Collectible</th>
        <th>Amount Collected</th>
        <th>Amount Remaining</th>
        <th>Remarks</th>
      </tr>
    `;

  const bodyRows = rows
    .map(({ record }) => {
      const { outstandingBalance, interestOutstanding } = getOutstandingBreakdown(record);
      const collectibleAmount = computeCollectibleAmount(record);
      if (isJamesOfficer) {
        return `
          <tr>
            <td>
              <div class="borrower-name">${sanitize(String(record.name || ""))}</div>
            </td>
            <td>${formatCurrency(outstandingBalance)}</td>
            <td>${formatCurrency(collectibleAmount)}</td>
            <td>${formatCurrency(interestOutstanding)}</td>
            <td>&nbsp;</td>
            <td>${sanitize(String(record.remarks || ""))}</td>
          </tr>
        `;
      }

      const dueDate = String(record.dueDate || computeDueDate(record.dateGranted, record.payableWithin));
      return `
        <tr>
          <td>
            <div class="borrower-name">${sanitize(String(record.name || ""))}</div>
          </td>
          <td>${formatCurrency(record.amount)}</td>
          <td>${sanitize(formatLongDate(record.dateGranted))}</td>
          <td>${sanitize(formatLongDate(dueDate))}</td>
          <td>${formatCurrency(outstandingBalance)}</td>
          <td>${formatCurrency(collectibleAmount)}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>${sanitize(String(record.remarks || ""))}</td>
        </tr>
      `;
    })
    .join("");

  const wordHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            margin: 0.5in;
          }
          body {
            font-family: Calibri, "Segoe UI", sans-serif;
            font-size: 11pt;
            color: #1a1a1a;
            margin: 0;
            background: #ffffff;
          }
          .sheet {
            padding: 0;
          }
          .doc-header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px solid #6f8f83;
            padding-bottom: 8px;
          }
          .logo {
            width: 72px;
            height: 72px;
            object-fit: contain;
            display: block;
            margin: 0 auto 8px;
          }
          .title {
            font-size: 12pt;
            font-weight: 700;
            letter-spacing: 0.3px;
            margin: 0;
            text-transform: uppercase;
          }
          .meta {
            margin-top: 2px;
            font-size: 11pt;
            line-height: 1.2;
            text-transform: uppercase;
          }
          .doc-subtitle {
            margin: 7px 0 0;
            font-size: 11pt;
            font-weight: 700;
            letter-spacing: 0.4px;
            text-transform: uppercase;
          }
          .records-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .records-table th, .records-table td {
            border: 1px solid #9eb6ce;
            padding: 4px 5px;
            font-size: 11pt;
            vertical-align: top;
            word-wrap: break-word;
          }
          .records-table th {
            background: #d7e6de;
            color: #163b2c;
            text-align: left;
            font-weight: 700;
          }
          .records-table tr:nth-child(even) td {
            background: #fbfcfb;
          }
          .records-table td {
            line-height: 1.2;
          }
          .borrower-name {
            font-weight: 400;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="doc-header">
            ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="MGI logo" width="72" height="72" style="width:72px;height:72px;display:block;margin:0 auto 8px;" />` : ""}
            <p class="title">Morris Gilbert Inso - Credit Services</p>
            <div class="meta">${sanitize(todayText)}</div>
            <div class="meta">Account Officer: ${sanitize(officerName)}</div>
            <p class="doc-subtitle">Officer Loan Records Summary</p>
          </div>
          <table class="records-table" border="1">${headerRow}${bodyRows}</table>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `officer_${safeOfficerSlug}_records_${toIsoDate(new Date())}.doc`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage("Word export created.", "success");
}

async function exportToExcel() {
  try {
    const visibleRows = getVisibleRecords();
    if (visibleRows.length === 0) {
      showMessage("No records to export.", "error");
      showToast("Backup failed", "error");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Name of the Borrower",
      "Address",
      "Contact Number",
      "Co-Maker",
      "Loan Type",
      "Purpose",
      "Amount",
      "Interest Rate",
      "Mode of Payment",
      "Date Granted",
      "Due Date",
      "Moved Pay Date",
      "Outstanding Balance",
      "Arrears",
      "Other Arrears",
      "Payment History",
    ];

    const formatWholeAmount = (value) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return "0";
      }
      return String(Math.round(numericValue));
    };

    const csvRows = visibleRows.map(({ record }) => {
      const normalizedRecord = {
        ...record,
        accountOfficer: String(record?.accountOfficer || currentOfficer || "").trim(),
      };
      const paymentHistory = getPaymentHistory(record) || [];
      const paymentSummary = paymentHistory.length > 0
        ? paymentHistory.map((p) => `${formatUpperDate(toIsoDate(new Date(p.date || "")))}: ${formatWholeAmount(p.amount || 0)}`).join("; ")
        : "No payments";

      // Extract numeric values without formatting for proper CSV handling
      const amount = Number(normalizedRecord.amount || 0);
      const interest = Number(normalizedRecord.interestRate || 0);
      const outstanding = getOutstandingBreakdown(record).outstandingBalance;
      const rawArrears = Number(normalizedRecord.manualArrearsAmount ?? 0);
      const arrears = Number.isFinite(rawArrears) && rawArrears > 0 ? rawArrears : 0;
      const rawOtherArrears = Number(normalizedRecord.manualOtherArrearsAmount ?? 0);
      const otherArrears = Number.isFinite(rawOtherArrears) && rawOtherArrears > 0 ? rawOtherArrears : 0;

      return [
        escapeCSV(normalizedRecord.name || ""),
        escapeCSV(normalizedRecord.address || ""),
        escapeCSV(normalizedRecord.contactNumber || ""),
        escapeCSV(normalizedRecord.coMaker || ""),
        escapeCSV(normalizedRecord.payableWithin || ""),
        escapeCSV(normalizedRecord.purposeOfLoan || ""),
        formatWholeAmount(amount),
        formatWholeAmount(interest),
        escapeCSV(normalizedRecord.modeOfPayment || ""),
        escapeCSV(formatUpperDate(toIsoDate(new Date(normalizedRecord.dateGranted || "")))),
        escapeCSV(formatUpperDate(toIsoDate(new Date(normalizedRecord.dueDate || "")))),
        escapeCSV(formatUpperDate(toIsoDate(new Date(normalizedRecord.payDate || normalizedRecord.dueDate || "")))),
        formatWholeAmount(outstanding),
        formatWholeAmount(arrears),
        formatWholeAmount(otherArrears),
        escapeCSV(paymentSummary),
      ];
    });

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const officerSlug = toOfficerSlug(currentOfficer || "officer");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `officer_${officerSlug}_backup_${formatBackupTimestamp(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exported to Excel", "success");
  } catch (error) {
    console.error("[excel-backup] export failed", error);
    showMessage("Unable to export Excel backup right now.", "error");
    showToast("Backup failed", "error");
  }
}

// Helper function to escape CSV values
function escapeCSV(value) {
  if (!value) return '""';
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportStatementOfAccount(record) {
  const logoDataUrl = await getImageDataUrl("images/mgi_logo.png");
  const dueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const outstandingBalance = getOutstandingBreakdown(record).outstandingBalance;
  const totalPaidAmount = getTotalPaidAmount(record);
  const totalPayable = outstandingBalance + totalPaidAmount;
  const paymentHistory = getPaymentHistory(record);

  let runningBalanceAfterPayment = outstandingBalance;
  const transactionHistoryRows = paymentHistory.length
    ? [...paymentHistory]
        .map((item) => {
          const amountPaid = Number(item.amount || 0);
          const soaRebateApplied = Math.max(0, Number(item.rebateApplied || 0));
          const balanceAfterPayment = runningBalanceAfterPayment;
          const balanceBeforePayment = Math.max(0, balanceAfterPayment + amountPaid);
          runningBalanceAfterPayment = balanceBeforePayment;
          return {
            date: item.date,
            amountPaid,
            soaRebateApplied,
            balanceBeforePayment,
            balanceAfterPayment,
          };
        })
        .reverse()
        .map(
          (item) => `
            <tr>
              <td>${sanitize(formatLongDate(item.date))}</td>
              <td>${formatCurrency(item.balanceBeforePayment)}</td>
              <td>${formatCurrency(item.amountPaid)}${item.soaRebateApplied > 0 ? ` <small>Rebate: ${formatCurrency(item.soaRebateApplied)}</small>` : ""}</td>
              <td>${formatCurrency(item.balanceAfterPayment)}</td>
            </tr>
          `
        )
        .join("")
    : `
        <tr>
          <td>${sanitize(formatLongDate(record.dateGranted))}</td>
          <td>${formatCurrency(totalPayable)}</td>
          <td>${formatCurrency(0)}</td>
          <td>${formatCurrency(outstandingBalance)}</td>
        </tr>
      `;

  const wordHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: "Aptos Display", "Aptos", "Times New Roman", serif; font-size: 8pt; color: #1a1a1a; margin: 0; }
          .sheet { padding: 20px 24px; }
          .doc-header { text-align: center; margin-bottom: 14px; border-bottom: 1px solid #6f8f83; padding-bottom: 10px; }
          .logo { width: 44px; height: 44px; display: block; margin: 0 auto 4px; }
          .title, .meta, .doc-name { margin: 0; text-transform: uppercase; }
          .title { font-weight: 700; letter-spacing: 0.3px; }
          .meta { line-height: 1.2; }
          .doc-name { margin-top: 9px; font-weight: 700; letter-spacing: 0.4px; }
          .summary-table, .details-table, .transaction-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .summary-table td, .details-table td, .transaction-table th, .transaction-table td { border: 1px solid #9eb6ce; padding: 6px 7px; }
          .details-label { width: 22%; font-weight: 700; background: #d7e6de; }
          .transaction-table th { background: #d7e6de; text-align: left; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="doc-header">
            ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="MGI logo" width="44" height="44" style="width:44px;height:44px;display:block;margin:0 auto 4px;" />` : ""}
            <p class="title">Morris Gilbert Inso - Credit Services</p>
            <p class="meta">ACCOUNT OFFICER: ${sanitize(currentOfficer)}</p>
            <p class="meta">${sanitize(formatUpperDate(toIsoDate(new Date())))}</p>
            <p class="doc-name">Statement of Account</p>
          </div>

          <table class="summary-table">
            <tr>
              <td><strong>Total Payable</strong><br />${formatCurrency(totalPayable)}</td>
              <td><strong>Outstanding Balance</strong><br />${formatCurrency(outstandingBalance)}</td>
            </tr>
          </table>

          <table class="details-table">
            <tr><td class="details-label">Client Name</td><td>${sanitize(String(record.name || ""))}</td><td class="details-label">Type</td><td>${sanitize(getTypeLabel(record.payableWithin))}</td></tr>
            <tr><td class="details-label">Address</td><td>${sanitize(String(record.address || "-"))}</td><td class="details-label">Contact Number</td><td>${sanitize(String(record.contactNumber || "-"))}</td></tr>
            <tr><td class="details-label">Loan Amount</td><td>${formatPlainAmount(record.amount)}</td><td class="details-label">Due Date</td><td>${sanitize(formatLongDate(dueDate))}</td></tr>
            <tr><td class="details-label">Purpose of Loan</td><td>${sanitize(String(record.purposeOfLoan || "-"))}</td><td class="details-label">Mode of Payment</td><td>${sanitize(String(record.modeOfPayment || "-"))}</td></tr>
            <tr><td class="details-label">Status</td><td>${record.isWriteOff ? "Write-Off" : isHatagHatagActive(record) ? "Hatag-Hatag" : "Active"}</td><td class="details-label">Payment Count</td><td>${paymentHistory.length}</td></tr>
            <tr><td class="details-label">Remarks</td><td colspan="3">${sanitize(String(record.remarks || "No remarks"))}</td></tr>
          </table>

          <table class="transaction-table">
            <tr><th>Date</th><th>Amount</th><th>Payment</th><th>Remaining</th></tr>
            ${transactionHistoryRows}
          </table>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `statement_of_account_${toFileSafeName(record.name)}_${toIsoDate(new Date())}.doc`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage("Statement of account exported.", "success");
}

function closeWriteOffModal(result) {
  if (!writeOffModal) {
    if (typeof writeOffPasswordResolver === "function") {
      writeOffPasswordResolver(result);
      writeOffPasswordResolver = null;
    }
    return;
  }

  writeOffModal.classList.remove("show");
  writeOffModal.setAttribute("aria-hidden", "true");

  if (writeOffPasswordInput) {
    writeOffPasswordInput.value = "";
  }
  if (writeOffError) {
    writeOffError.textContent = "";
  }

  if (typeof writeOffPasswordResolver === "function") {
    writeOffPasswordResolver(result);
    writeOffPasswordResolver = null;
  }
}

function requestWriteOffPassword() {
  if (!writeOffModal || !writeOffPasswordInput) {
    const fallback = window.prompt("Enter password to confirm action:");
    return Promise.resolve(fallback);
  }

  if (writeOffError) {
    writeOffError.textContent = "";
  }

  writeOffModal.classList.add("show");
  writeOffModal.setAttribute("aria-hidden", "false");
  writeOffPasswordInput.value = "";

  setTimeout(() => {
    writeOffPasswordInput.focus();
  }, 0);

  return new Promise((resolve) => {
    writeOffPasswordResolver = resolve;
  });
}

function getTypeLabel(payableWithin) {
  if (payableWithin === "monthly_open" || payableWithin === "Monthly") {
    return "Monthly - Open";
  }
  if (payableWithin === "bi_monthly_open") {
    return "Bi - Monthly";
  }
  if (payableWithin === "cash_advance_fixed_15") {
    return "Cash Advance (15 days)";
  }
  if (payableWithin === "emergency_fixed") {
    return "Emergency Loan - Fixed";
  }
  if (payableWithin === "monthly_60_fixed") {
    return "Monthly (60 days) - Fixed";
  }
  if (payableWithin === "monthly_100_fixed") {
    return "Monthly (14 weeks)";
  }
  if (payableWithin === "no_listed") {
    return "Not Listed";
  }
  return payableWithin || "";
}

function syncModeOfPaymentWithLoanType() {
  const loanType = String(payableWithinSelect?.value || "").trim();
  if (!modeOfPaymentSelect) {
    return;
  }

  const applyModeValue = (nextValue) => {
    const changed = modeOfPaymentSelect.value !== nextValue;
    modeOfPaymentSelect.value = nextValue;
    if (changed) {
      modeOfPaymentSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  if (loanType === "emergency_fixed") {
    applyModeValue("Weekly");
    return;
  }

  if (loanType === "monthly_60_fixed") {
    applyModeValue("Daily");
    return;
  }

  applyModeValue("");
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const records = getRecords();
  const newRecord = {
    name: toUpperInputValue(nameInput.value).trim(),
    address: toUpperInputValue(addressInput.value).trim(),
    contactNumber: toUpperInputValue(contactNumberInput.value).trim(),
    accountOfficer: normalizeOfficerName(currentOfficer),
    purposeOfLoan: String(purposeOfLoanInput.value || "").trim(),
    modeOfPayment: String(modeOfPaymentSelect.value || "").trim(),
    payableWithin: String(payableWithinSelect.value || "").trim(),
    amount: parseAmountInput(amountInput.value),
    dateGranted: String(dateGrantedInput.value || "").trim(),
    dueDate: "",
    payDate: "",
    interestRate: Number(interestRateInput.value || 0),
    totalPaidAmount: 0,
    paidAmount: 0,
    paymentHistory: [],
    remarks: "",
    isSettled: false,
    settledDate: "",
    isWriteOff: false,
    writeOffDate: "",
    isHatagHatag: false,
    hatagHatagDate: "",
    frozenOutstandingBalance: null,
    frozenPaidBase: 0,
  };

  newRecord.dueDate = computeDueDate(newRecord.dateGranted, newRecord.payableWithin);
  newRecord.payDate = newRecord.dueDate;

  if (!newRecord.name || !newRecord.payableWithin || newRecord.amount <= 0) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  records.push(newRecord);
  setRecords(records);
  saveAddressSuggestions(newRecord.address);
  showMessage("Loan record saved successfully.", "success");
  form.reset();
  renderRecords();
});

filterNameInput?.addEventListener("input", renderRecords);
filterDateGrantedInput?.addEventListener("change", renderRecords);
filterSearchDateInput?.addEventListener("change", renderRecords);
sortBySelect?.addEventListener("change", renderRecords);
filterPayableSelect?.addEventListener("change", renderRecords);
payableWithinSelect?.addEventListener("change", syncModeOfPaymentWithLoanType);
testDateInput?.addEventListener("change", renderRecords);

nameInput?.addEventListener("input", () => {
  nameInput.value = toUpperInputValue(nameInput.value);
});

addressInput?.addEventListener("input", () => {
  addressInput.value = toUpperInputValue(addressInput.value);
});

contactNumberInput?.addEventListener("input", () => {
  contactNumberInput.value = toUpperInputValue(contactNumberInput.value);
});

amountInput?.addEventListener("input", () => {
  amountInput.value = normalizeAmountInput(amountInput.value);
});

paymentEntryInput?.addEventListener("input", () => {
  paymentEntryInput.value = normalizeAmountInput(paymentEntryInput.value);
  updatePaymentEntryPreview();
});

body?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.classList.contains("remarks-input")) {
    target.value = toUpperInputValue(target.value);
    return;
  }

  if (
    target.classList.contains("collectible-edit-input") ||
    target.classList.contains("rebate-input") ||
    target.classList.contains("arrears-input") ||
    target.classList.contains("other-arrears-input")
  ) {
    target.value = normalizeAmountInput(target.value);
    const rowIndex = Number(target.dataset.index);
    if (Number.isInteger(rowIndex) && rowIndex >= 0) {
      const record = getRecords()[rowIndex];
      if (target.classList.contains("arrears-input")) {
        setAmountDraftForRecord(record, arrearsInputDrafts, target.value);
      } else if (target.classList.contains("other-arrears-input")) {
        setAmountDraftForRecord(record, otherArrearsInputDrafts, target.value);
      }
    }
  }
});

useTodayBtn?.addEventListener("click", () => {
  if (testDateInput) {
    testDateInput.value = toIsoDate(new Date());
  }
  renderRecords();
});

exportWordOfficerBtn?.addEventListener("click", exportVisibleRecordsToWord);
backupToExcelBtn?.addEventListener("click", exportToExcel);

initPurposeLoanSelects();
renderAddressSuggestions();

paymentHistoryCloseBtn?.addEventListener("click", closePaymentHistoryModal);
paymentHistoryModal?.addEventListener("click", (event) => {
  if (event.target === paymentHistoryModal) {
    closePaymentHistoryModal();
  }
});

deletePaymentConfirmCancelBtn?.addEventListener("click", () => {
  closeDeletePaymentConfirmModal(false);
});

deletePaymentConfirmYesBtn?.addEventListener("click", () => {
  closeDeletePaymentConfirmModal(true);
});

deletePaymentConfirmModal?.addEventListener("click", (event) => {
  if (event.target === deletePaymentConfirmModal) {
    closeDeletePaymentConfirmModal(false);
  }
});

paymentHistoryContent?.addEventListener("click", (event) => {
  const actionBtn = event.target.closest(".payment-history-delete-btn");

  if (!actionBtn) {
    return;
  }

  if (!Number.isInteger(paymentHistoryRowIndex) || paymentHistoryRowIndex < 0) {
    showMessage("Unable to update payment history.", "error");
    return;
  }

  const historyIndex = Number(actionBtn.dataset.historyIndex);
  if (!Number.isInteger(historyIndex) || historyIndex < 0) {
    showMessage("Invalid payment history entry.", "error");
    return;
  }

  void deletePaymentHistoryEntry(paymentHistoryRowIndex, historyIndex);
});

paymentEntryCancelBtn?.addEventListener("click", closePaymentEntryModal);
paymentEntryModal?.addEventListener("click", (event) => {
  if (event.target === paymentEntryModal) {
    closePaymentEntryModal();
  }
});

paymentEntryConfirmBtn?.addEventListener("click", () => {
  const rowIndex = paymentEntryRowIndex;
  const amount = parseAmountInput(paymentEntryInput?.value || "0");

  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    if (paymentEntryError) {
      paymentEntryError.textContent = "Invalid record selected.";
    }
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    if (paymentEntryError) {
      paymentEntryError.textContent = "Enter a paid amount greater than 0.";
    }
    return;
  }

  if (paymentEntryError) {
    paymentEntryError.textContent = "";
  }

  const success = applyPaymentForRow(rowIndex, amount, paymentEntryMode);
  if (success) {
    closePaymentEntryModal();
  }
});

writeOffConfirmBtn?.addEventListener("click", () => {
  const password = (writeOffPasswordInput?.value || "").trim();
  if (!password) {
    if (writeOffError) {
      writeOffError.textContent = "Password is required.";
    }
    writeOffPasswordInput?.focus();
    return;
  }
  closeWriteOffModal(password);
});

writeOffCancelBtn?.addEventListener("click", () => {
  closeWriteOffModal(null);
});

restoreAuthConfirmBtn?.addEventListener("click", () => {
  const password = (restoreAuthPasswordInput?.value || "").trim();
  if (!password) {
    if (restoreAuthError) {
      restoreAuthError.textContent = "Password is required.";
    }
    restoreAuthPasswordInput?.focus();
    return;
  }
  closeRestoreAuthModal(password);
});

restoreAuthCancelBtn?.addEventListener("click", () => {
  closeRestoreAuthModal(null);
});

restoreAuthModal?.addEventListener("click", (event) => {
  if (event.target === restoreAuthModal) {
    closeRestoreAuthModal(null);
  }
});

writeOffModal?.addEventListener("click", (event) => {
  if (event.target === writeOffModal) {
    closeWriteOffModal(null);
  }
});

clearBtn?.addEventListener("click", () => {
  if (confirm("Delete all records? This cannot be undone.")) {
    setRecords([]);
    renderRecords();
    showMessage("All records deleted.", "success");
  }
});

body?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.classList.contains("move-pay-date-input")) {
    const rowIndex = Number(target.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update pay date.", "error");
      return;
    }

    const nextPayDate = String(target.value || "").trim();
    if (!nextPayDate) {
      showMessage("Please choose a valid pay date.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    records[rowIndex].payDate = nextPayDate;
    setRecords(records);
    renderRecords();
    showMessage("Pay date updated.", "success");
    return;
  }

  if (!target.classList.contains("due-date-input")) {
    return;
  }

  const rowIndex = Number(target.dataset.index);
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Unable to update due date.", "error");
    return;
  }

  const nextDueDate = String(target.value || "").trim();
  if (!nextDueDate) {
    showMessage("Please choose a valid due date.", "error");
    return;
  }

  const records = getRecords();
  if (!records[rowIndex]) {
    showMessage("Record not found.", "error");
    return;
  }

  records[rowIndex].dueDate = nextDueDate;
  setRecords(records);
  renderRecords();
  showMessage("Due date updated.", "success");
});

body?.addEventListener("click", async (event) => {
  const saveRebateFromEditor = event.target.closest(".save-rebate-btn");
  if (event.target.closest(".rebate-editor") && !saveRebateFromEditor) {
    return;
  }

  const editNameBtn = event.target.closest(".edit-name-btn");
  if (editNameBtn) {
    const rowIndex = Number(editNameBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    const currentName = String(record.name || "").trim();
    const updatedName = window.prompt("Edit borrower name:", currentName);
    if (updatedName === null) {
      return;
    }

    const nextName = toUpperInputValue(updatedName).trim();
    if (!nextName) {
      showMessage("Borrower name cannot be empty.", "error");
      return;
    }

    record.name = nextName;
    setRecords(records);
    renderRecords();
    showMessage("Borrower name updated.", "success");
    return;
  }

  const editContactBtn = event.target.closest(".edit-contact-btn");
  if (editContactBtn) {
    const rowIndex = Number(editContactBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    const currentContact = String(record.contactNumber || "").trim();
    const updatedContact = window.prompt("Edit contact number:", currentContact);
    if (updatedContact === null) {
      return;
    }

    record.contactNumber = toUpperInputValue(updatedContact).trim();
    setRecords(records);
    renderRecords();
    showMessage("Contact number updated.", "success");
    return;
  }

  const editAddressBtn = event.target.closest(".edit-address-btn");
  if (editAddressBtn) {
    const rowIndex = Number(editAddressBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    const currentAddress = String(record.address || "").trim();
    const updatedAddress = window.prompt("Edit address:", currentAddress);
    if (updatedAddress === null) {
      return;
    }

    const nextAddress = toUpperInputValue(updatedAddress).trim();
    record.address = nextAddress;
    saveAddressSuggestions(nextAddress);
    setRecords(records);
    renderRecords();
    showMessage("Address updated.", "success");
    return;
  }

  const collectibleDisplayBtn = event.target.closest(".collectible-display-btn");
  if (collectibleDisplayBtn) {
    const rowIndex = Number(collectibleDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update collectible.", "error");
      return;
    }

    toggleCollectibleEditor(rowIndex);
    return;
  }

  const rebateDisplayBtn = event.target.closest(".rebate-display-btn");
  if (rebateDisplayBtn) {
    const rowIndex = Number(rebateDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to edit rebate.", "error");
      return;
    }

    toggleRebateEditor(rowIndex);
    return;
  }

  const saveRebateBtn = event.target.closest(".save-rebate-btn");
  if (saveRebateBtn) {
    const rowIndex = Number(saveRebateBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to save rebate.", "error");
      return;
    }

    const rebateInputEl = body?.querySelector(`.rebate-input[data-index="${rowIndex}"]`);
    const updatedRebate = parseAmountInput(rebateInputEl instanceof HTMLInputElement ? rebateInputEl.value : "0");
    if (!Number.isFinite(updatedRebate) || updatedRebate < 0) {
      showMessage("Rebate amount cannot be negative.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    const maxRebate = Math.max(0, computeRemainingPayable(records[rowIndex]));
    if (updatedRebate > maxRebate) {
      showMessage("Rebate cannot exceed the raw outstanding balance.", "error");
      return;
    }

    const previousRebate = getRebateAmount(records[rowIndex]);
    records[rowIndex].manualRebateAmount = updatedRebate;
    const rebateChanged = Math.abs(updatedRebate - previousRebate) > 0.0001;
    if (rebateChanged && updatedRebate > 0) {
      const rebateApplied = Math.max(0, getOutstandingBreakdown(records[rowIndex]).rebateAmount);
      const history = getPaymentHistory(records[rowIndex]);
      history.unshift({
        date: toIsoDate(getReferenceDate()),
        amount: updatedRebate,
        principalPaid: 0,
        interestPaid: 0,
        interestReduced: 0,
        rebateApplied,
        isRebateOnly: true,
      });
      records[rowIndex].paymentHistory = history;
    }
    setRecords(records);
    openRebateEditorRowIndex = -1;
    renderRecords();
    showMessage("Rebate updated.", "success");
    return;
  }

  const saveCollectibleBtn = event.target.closest(".save-collectible-btn");
  if (saveCollectibleBtn) {
    const rowIndex = Number(saveCollectibleBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update collectible.", "error");
      return;
    }

    const collectibleInputEl = body?.querySelector(`.collectible-edit-input[data-index="${rowIndex}"]`);
    const periodSelectEl = body?.querySelector(`.collectible-period-select[data-index="${rowIndex}"]`);
    const updatedCollectible = parseAmountInput(collectibleInputEl instanceof HTMLInputElement ? collectibleInputEl.value : "0");
    const selectedPeriod = periodSelectEl instanceof HTMLSelectElement ? periodSelectEl.value : "Daily";

    if (!Number.isFinite(updatedCollectible) || updatedCollectible < 0) {
      showMessage("Collectible amount cannot be negative.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    records[rowIndex].collectibleAmountOverride = updatedCollectible;
    records[rowIndex].collectiblePeriodOverride = selectedPeriod;
    setRecords(records);
    renderRecords();
    showMessage("Collectible updated.", "success");
    toggleCollectibleEditor(rowIndex, false);
    return;
  }

  const arrearsDisplayBtn = event.target.closest(".arrears-display-btn");
  if (arrearsDisplayBtn) {
    const rowIndex = Number(arrearsDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to edit arrears.", "error");
      return;
    }

    toggleArrearsEditor(rowIndex);
    return;
  }

  const saveArrearsBtn = event.target.closest(".save-arrears-btn");
  if (saveArrearsBtn) {
    const rowIndex = Number(saveArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to save arrears.", "error");
      return;
    }

    const arrearsInputEl = body?.querySelector(`.arrears-input[data-index="${rowIndex}"]`);
    const arrearsTypeSelectEl = body?.querySelector(`.arrears-type-select[data-index="${rowIndex}"]`);
    const updatedArrears = parseAmountInput(arrearsInputEl instanceof HTMLInputElement ? arrearsInputEl.value : "0");
    const selectedType = arrearsTypeSelectEl instanceof HTMLSelectElement ? arrearsTypeSelectEl.value : "Interest";

    if (!Number.isFinite(updatedArrears) || updatedArrears < 0) {
      showMessage("Arrears amount cannot be negative.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    records[rowIndex].manualArrearsAmount = updatedArrears;
    records[rowIndex].arrearsType = selectedType === "Principal" ? "Principal" : "Interest";
    clearAmountDraftForRecord(records[rowIndex], arrearsInputDrafts);
    setRecords(records);
    openArrearsEditorRowIndex = -1;
    renderRecords();
    showMessage("Arrears updated.", "success");
    return;
  }

  const otherArrearsDisplayBtn = event.target.closest(".other-arrears-display-btn");
  if (otherArrearsDisplayBtn) {
    const rowIndex = Number(otherArrearsDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to edit other arrears.", "error");
      return;
    }

    toggleOtherArrearsEditor(rowIndex);
    return;
  }

  const saveOtherArrearsBtn = event.target.closest(".save-other-arrears-btn");
  if (saveOtherArrearsBtn) {
    const rowIndex = Number(saveOtherArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to save other arrears.", "error");
      return;
    }

    const otherArrearsInputEl = body?.querySelector(`.other-arrears-input[data-index="${rowIndex}"]`);
    const otherArrearsTypeSelectEl = body?.querySelector(`.other-arrears-type-select[data-index="${rowIndex}"]`);
    const updatedOtherArrears = parseAmountInput(otherArrearsInputEl instanceof HTMLInputElement ? otherArrearsInputEl.value : "0");
    const selectedType = otherArrearsTypeSelectEl instanceof HTMLSelectElement ? otherArrearsTypeSelectEl.value : "Interest";

    if (!Number.isFinite(updatedOtherArrears) || updatedOtherArrears < 0) {
      showMessage("Other arrears amount cannot be negative.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    records[rowIndex].manualOtherArrearsAmount = updatedOtherArrears;
    records[rowIndex].otherArrearsType = selectedType === "Principal" ? "Principal" : "Interest";
    clearAmountDraftForRecord(records[rowIndex], otherArrearsInputDrafts);
    setRecords(records);
    openOtherArrearsEditorRowIndex = -1;
    renderRecords();
    showMessage("Other arrears updated.", "success");
    return;
  }

  const dueDateDisplayBtn = event.target.closest(".due-date-display-btn");
  if (dueDateDisplayBtn) {
    const rowIndex = Number(dueDateDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update due date.", "error");
      return;
    }

    const dueDateInputEl = body.querySelector(`.due-date-input[data-index="${rowIndex}"]`);
    if (!(dueDateInputEl instanceof HTMLInputElement)) {
      showMessage("Unable to open due date picker.", "error");
      return;
    }

    if (typeof dueDateInputEl.showPicker === "function") {
      dueDateInputEl.showPicker();
    } else {
      dueDateInputEl.click();
    }
    return;
  }

  const movePayDateDisplayBtn = event.target.closest(".move-pay-date-display-btn");
  if (movePayDateDisplayBtn) {
    const rowIndex = Number(movePayDateDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update pay date.", "error");
      return;
    }

    const movePayDateInputEl = body.querySelector(`.move-pay-date-input[data-index="${rowIndex}"]`);
    if (!(movePayDateInputEl instanceof HTMLInputElement)) {
      showMessage("Unable to open pay date picker.", "error");
      return;
    }

    if (typeof movePayDateInputEl.showPicker === "function") {
      movePayDateInputEl.showPicker();
    } else {
      movePayDateInputEl.click();
    }
    return;
  }

  const saveRemarksBtn = event.target.closest(".save-remarks-btn");
  if (saveRemarksBtn) {
    const rowIndex = Number(saveRemarksBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to save remarks.", "error");
      return;
    }

    const remarksInputEl = body.querySelector(`.remarks-input[data-index="${rowIndex}"]`);
    const nextRemarks = String(remarksInputEl?.value || "").trim();
    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record not found.", "error");
      return;
    }

    records[rowIndex].remarks = nextRemarks;
    setRecords(records);
    openRemarksEditorRowIndex = -1;
    renderRecords();
    showMessage("Remarks saved.", "success");
    return;
  }

  const openRemarksBtn = event.target.closest(".open-remarks-btn");
  if (openRemarksBtn) {
    const rowIndex = Number(openRemarksBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to open remarks editor.", "error");
      return;
    }

    toggleRemarksEditor(rowIndex);
    return;
  }

  const payLoanBtn = event.target.closest(".pay-loan-btn");
  if (payLoanBtn) {
    const rowIndex = Number(payLoanBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to process payment.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    if (getOutstandingBreakdown(record).outstandingBalance <= 0) {
      showMessage("There is no outstanding balance to pay.", "error");
      return;
    }

    openPaymentEntryModal(rowIndex, record, PAYMENT_MODE_STANDARD);
    return;
  }

  const payPrincipalOnlyBtn = event.target.closest(".pay-principal-only-btn");
  if (payPrincipalOnlyBtn) {
    const rowIndex = Number(payPrincipalOnlyBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to process principal-only payment.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    const paymentBreakdown = getOutstandingBreakdown(record);
    if (isHatagHatagActive(record)) {
      showMessage("Principal-only payment is not available in Hatag-Hatag mode.", "error");
      return;
    }
    if (paymentBreakdown.principalOutstanding <= 0) {
      showMessage("There is no principal balance to pay.", "error");
      return;
    }

    openPaymentEntryModal(rowIndex, record, PAYMENT_MODE_PRINCIPAL_ONLY);
    return;
  }

  const showPaymentHistoryBtn = event.target.closest(".show-payment-history-btn");
  if (showPaymentHistoryBtn) {
    const rowIndex = resolveRecordIndexFromAction(showPaymentHistoryBtn);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to show payment history.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    openPaymentHistoryModal(record, getPaymentHistory(record), rowIndex);
    return;
  }

  const statementBtn = event.target.closest(".statement-btn");
  if (statementBtn) {
    const rowIndex = resolveRecordIndexFromAction(statementBtn);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to export statement.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    exportStatementOfAccount(record);
    return;
  }

  const writeOffBtn = event.target.closest(".write-off-btn");
  if (writeOffBtn) {
    const rowIndex = Number(writeOffBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to activate Write-Off.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    if (record.isWriteOff === true) {
      showMessage("Write-Off is already active for this record.", "success");
      return;
    }

    if (isHatagHatagActive(record)) {
      showMessage("Hatag-Hatag is already active for this record.", "error");
      return;
    }

    const password = await requestWriteOffPassword();
    if (password === null) {
      return;
    }

    if (String(password).trim() !== getWriteOffPassword()) {
      showMessage("Invalid password. Write-Off cancelled.", "error");
      return;
    }

    record.isWriteOff = true;
    record.writeOffDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Write-Off activated. Interest growth is now stopped for this account.", "success");
    return;
  }

  const hatagHatagBtn = event.target.closest(".hatag-hatag-btn");
  if (hatagHatagBtn) {
    const rowIndex = Number(hatagHatagBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to activate Hatag-Hatag.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    if (isHatagHatagActive(record)) {
      showMessage("Hatag-Hatag is already active for this record.", "success");
      return;
    }

    if (record.isWriteOff === true) {
      showMessage("Write-Off is already active for this record.", "error");
      return;
    }

    const password = await requestWriteOffPassword();
    if (password === null) {
      return;
    }

    if (String(password).trim() !== getWriteOffPassword()) {
      showMessage("Invalid password. Hatag-Hatag cancelled.", "error");
      return;
    }

    record.hatagHatagOutstanding = computeRemainingPayable(record);
    record.isHatagHatag = true;
    record.hatagHatagDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Hatag-Hatag activated. Interest growth is stopped and payments are logged in history only.", "success");
    return;
  }

  const settleBtn = event.target.closest(".settle-btn");
  if (settleBtn) {
    const rowIndex = Number(settleBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to settle account.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record not found.", "error");
      return;
    }

    if (record.isSettled === true) {
      showMessage("This account is already settled.", "success");
      return;
    }

    const password = await requestWriteOffPassword();
    if (password === null) {
      return;
    }

    if (String(password).trim() !== getWriteOffPassword()) {
      showMessage("Invalid password. Settle cancelled.", "error");
      return;
    }

    record.isSettled = true;
    record.settledDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Account settled.", "success");
    return;
  }
});

window.addEventListener("keydown", (event) => {
  if (restoreAuthModal?.classList.contains("show")) {
    if (event.key === "Escape") {
      closeRestoreAuthModal(null);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      restoreAuthConfirmBtn?.click();
      return;
    }
  }

  if (paymentEntryModal?.classList.contains("show")) {
    if (event.key === "Escape") {
      closePaymentEntryModal();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      paymentEntryConfirmBtn?.click();
      return;
    }
  }

  if (paymentHistoryModal?.classList.contains("show") && event.key === "Escape") {
    closePaymentHistoryModal();
    return;
  }

  if (deletePaymentConfirmModal?.classList.contains("show")) {
    if (event.key === "Escape") {
      closeDeletePaymentConfirmModal(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      closeDeletePaymentConfirmModal(true);
      return;
    }
  }

  if (!writeOffModal || !writeOffModal.classList.contains("show")) {
    return;
  }

  if (event.key === "Escape") {
    closeWriteOffModal(null);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    writeOffConfirmBtn?.click();
  }
});

toggleLoanEntryBtn?.addEventListener("click", () => {
  setLoanFormVisibility(!isLoanFormVisible);
});

officerDashboardBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

function setBackupStatusNote(state, text) {
  if (!backupStatusNote) {
    return;
  }
  backupStatusNote.classList.remove("is-ok", "is-warning", "is-loading");
  if (state === "ok") {
    backupStatusNote.classList.add("is-ok");
  } else if (state === "warning") {
    backupStatusNote.classList.add("is-warning");
  } else {
    backupStatusNote.classList.add("is-loading");
  }
  backupStatusNote.textContent = text;
}

function getBackupApiCandidates() {
  const path = "/api/backup/export";
  const candidates = [path];
  const currentOrigin = String(window.location.origin || "").replace(/\/+$/, "");
  const fallbackOrigin = String(API_FALLBACK_ORIGIN || "").replace(/\/+$/, "");
  if (fallbackOrigin && currentOrigin !== fallbackOrigin) {
    candidates.push(`${fallbackOrigin}${path}`);
  }
  return [...new Set(candidates)];
}

async function fetchBackupApi() {
  const candidates = getBackupApiCandidates();
  let lastErrorResponse = null;
  let lastNetworkError = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const url = candidates[index];
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
      });
      if (!res.ok && index < candidates.length - 1) {
        lastErrorResponse = res;
        continue;
      }
      return res;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (lastErrorResponse) {
    return lastErrorResponse;
  }

  throw lastNetworkError || new Error("Failed to reach backup API");
}

async function refreshBackupHealthStatus() {
  setBackupStatusNote("loading", "Backup status: checking...");
  try {
    const res = await fetchBackupApi();
    if (res.ok) {
      setBackupStatusNote("ok", "Backup status: full backup available");
      return;
    }

    if (res.status === 503 || res.status === 404) {
      setBackupStatusNote("warning", "Backup status: local-only fallback mode");
      return;
    }

    setBackupStatusNote("warning", `Backup status: server issue (${res.status})`);
  } catch {
    setBackupStatusNote("warning", "Backup status: local-only fallback mode");
  }
}

backupDataBtn?.addEventListener("click", async () => {
  const enteredPassword = await requestAdminPassword({
    title: "Secure Backup Access",
    message: "Enter admin password to download the full system backup file.",
    confirmLabel: "Download Backup",
    fallbackPrompt: "Enter admin password to download full backup:",
  });

  if (enteredPassword === null) {
    return;
  }

  if (String(enteredPassword).trim() !== getAdminPassword().trim()) {
    showMessage("Invalid admin password. Backup download cancelled.", "error");
    showToast("Backup download blocked", "error");
    return;
  }

  const allData = {
    meta: {
      source: "mgi-cs-system-officer",
      exportedAt: new Date().toISOString(),
      officer: currentOfficer,
    },
    data: {},
  };

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = String(localStorage.key(index) || "");
    if (!key.startsWith("mgi_")) {
      continue;
    }
    if (DEVICE_LOCAL_KEYS.has(key)) {
      continue;
    }

    const rawValue = localStorage.getItem(key);
    if (rawValue === null) {
      continue;
    }

    try {
      allData.data[key] = JSON.parse(rawValue);
    } catch {
      allData.data[key] = rawValue;
    }
  }

  const jsonBlob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(jsonBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mgi-backup-${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  setBackupStatusNote("ok", "Backup status: full system backup available");
});

restoreBackupBtn?.addEventListener("click", async () => {
  const authorized = await authorizeRestoreBackup();
  if (!authorized) {
    restoreBackupAuthorizedAt = 0;
    return;
  }

  restoreBackupInput?.click();
});

restoreBackupInput?.addEventListener("change", (e) => {
  if (!hasRestoreBackupAuthorization()) {
    showMessage("Admin password required before restoring backup.", "error");
    showToast("Restore blocked", "error");
    e.target.value = "";
    return;
  }

  restoreBackupAuthorizedAt = 0;
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const backupData = JSON.parse(event.target?.result || "{}");
      
      if (!backupData.data || typeof backupData.data !== "object") {
        setBackupStatusNote("warning", "Backup status: invalid backup file format");
        return;
      }

      Object.entries(backupData.data).forEach(([key, value]) => {
        if (!key.startsWith("mgi_")) {
          return;
        }
        if (DEVICE_LOCAL_KEYS.has(key)) {
          return;
        }

        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      });

      setBackupStatusNote("ok", "Backup status: full system backup restored successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Restore error:", error);
      setBackupStatusNote("warning", "Backup status: error reading file");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

function applyTheme(theme) {
  const selectedTheme = ["white", "black", "pink", "redwhite"].includes(theme) ? theme : "white";
  document.body.classList.remove("theme-white", "theme-black", "theme-pink", "theme-redwhite");
  document.body.classList.add(`theme-${selectedTheme}`);
  localStorage.setItem(THEME_KEY, selectedTheme);
  themeOptions.forEach((option) => {
    option.checked = option.value === selectedTheme;
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "black";
  applyTheme(savedTheme);
}

themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

function openDrawer() {
  sideDrawer?.classList.add("is-open");
  drawerOverlay?.classList.add("is-open");
  sideDrawer?.setAttribute("aria-hidden", "false");
  hamburgerBtn?.classList.add("is-open");
}

function closeDrawer() {
  sideDrawer?.classList.remove("is-open");
  drawerOverlay?.classList.remove("is-open");
  sideDrawer?.setAttribute("aria-hidden", "true");
  hamburgerBtn?.classList.remove("is-open");
}

function shouldPauseAutoRefreshSync() {
  // Pause sync if payment modal is open to prevent race conditions
  if (paymentEntryModal?.classList.contains("is-open")) {
    return true;
  }

  // Pause sync briefly after a payment is made to allow server sync to complete
  if (Date.now() - lastPaymentAt < PAYMENT_SYNC_GUARD_MS) {
    return true;
  }

  if (
    openRebateEditorRowIndex >= 0 ||
    openArrearsEditorRowIndex >= 0 ||
    openOtherArrearsEditorRowIndex >= 0 ||
    openRemarksEditorRowIndex >= 0
  ) {
    return true;
  }

  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
    return false;
  }

  return (
    activeElement.classList.contains("collectible-edit-input") ||
    activeElement.classList.contains("rebate-input") ||
    activeElement.classList.contains("arrears-input") ||
    activeElement.classList.contains("other-arrears-input") ||
    activeElement.classList.contains("remarks-input")
  );
}

hamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

drawerLogoutBtn?.addEventListener("click", () => {
  clearStoredLogin();
  sessionStorage.clear();
  window.location.href = "index.html";
});

// Initialize on page load
restoreStoredLogin();

if (!hasStoredLogin()) {
  window.location.href = "index.html";
} else {
  // Get officer name from URL parameter
  const params = new URLSearchParams(window.location.search);
  const requestedOfficer = params.get("officer") || "";
  currentOfficer = normalizeOfficerName(requestedOfficer);
  currentOfficerView = getOfficerViewFromLocation();

  if (requestedOfficer !== currentOfficer) {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("officer", currentOfficer);
    const nextUrl = `${window.location.pathname}?${nextParams.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }
  
  if (pageTitle) {
    pageTitle.textContent = `${currentOfficer} DASHBOARD`;
  }

  initializeTheme();
  ensureSyncStatusElement();
  refreshBackupHealthStatus();
  console.info("[session][officer] Startup", {
    officer: currentOfficer,
    loggedIn: hasStoredLogin(),
    online: navigator.onLine,
    userAgent: navigator.userAgent,
  });
  setLoanFormVisibility(true);
  syncModeOfPaymentWithLoanType();

  // Pull latest officer list and records from server then render
  refreshOfficerNamesFromServer();
  loadRecordsFromServer().then(() => renderRecords());

  // Keep synced with server every 5 seconds so all devices stay in sync
  setInterval(() => {
    if (shouldPauseAutoRefreshSync()) {
      return;
    }
    loadRecordsFromServer().then(() => renderRecords());
  }, 5000);

  window.addEventListener("online", () => {
    if (!isServerWritePending && hasUnsyncedLocalChanges) {
      syncRecordsToServer(getRecords());
    }
    refreshBackupHealthStatus();
    if (shouldPauseAutoRefreshSync()) {
      return;
    }
    loadRecordsFromServer().then(() => renderRecords());
  });
}
