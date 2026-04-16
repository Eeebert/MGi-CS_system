// DOM element assignments (move to top for hoisting)
const form = document.getElementById("loan-form");
const message = document.getElementById("form-message");
const body = document.getElementById("records-body");
const clearBtn = document.getElementById("clear-records");
const amountInput = document.getElementById("amount");
const payableWithinSelect = document.getElementById("payableWithin");
const modeOfPaymentSelect = document.getElementById("modeOfPayment");
const interestRateInput = document.getElementById("interestRate");
const coMakerInput = document.getElementById("coMaker");
const coMakerContactWrap = document.getElementById("coMakerContactWrap");
const coMakerAddressWrap = document.getElementById("coMakerAddressWrap");
const coMakerContactNumberInput = document.getElementById("coMakerContactNumber");
const coMakerAddressInput = document.getElementById("coMakerAddress");
const testDateInput = document.getElementById("test-date");
const useTodayBtn = document.getElementById("use-today");
const filterNameInput = document.getElementById("filter-name");
const filterDateGrantedInput = document.getElementById("filter-date-granted");
const filterDueDateInput = document.getElementById("filter-due-date");
const filterPayableSelect = document.getElementById("filter-payable");
const sortBySelect = document.getElementById("sort-by");
const exportWordBtn = document.getElementById("export-word");
const backupDataBtn = document.getElementById("backup-data");
const restoreBackupBtn = document.getElementById("restore-backup");
const restoreBackupInput = document.getElementById("restore-backup-input");
const backupToExcelBtn = document.getElementById("backup-to-excel");
const backupStatusNote = document.getElementById("backup-status-note");
const toast = document.getElementById("toast");
const writeOffModal = document.getElementById("write-off-modal");
const writeOffTitle = document.getElementById("write-off-title");
const writeOffDescription = document.getElementById("write-off-description");
const writeOffPasswordInput = document.getElementById("write-off-password");
const writeOffError = document.getElementById("write-off-error");
const writeOffConfirmBtn = document.getElementById("write-off-confirm");
const writeOffCancelBtn = document.getElementById("write-off-cancel");
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
const paymentConfirmModal = document.getElementById("payment-confirm-modal");
const paymentConfirmText = document.getElementById("payment-confirm-text");
const paymentConfirmAmount = document.getElementById("payment-confirm-amount");
const paymentConfirmCancelBtn = document.getElementById("payment-confirm-cancel");
const paymentConfirmYesBtn = document.getElementById("payment-confirm-yes");
const loadingScreen = document.getElementById("loading-screen");
const loginForm = document.getElementById("login-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const togglePasswordBtn = document.getElementById("toggle-password");
const loginMessage = document.getElementById("login-message");
const loginLogoTrigger = document.getElementById("login-logo-trigger");
const adminLoginButton = document.getElementById("admin-login-button");
const loanEntryPanel = document.getElementById("loan-entry-panel");
const mainContainer = document.querySelector(".container");
const toggleLoanEntryBtn = document.getElementById("toggle-loan-entry");
const releaseSummaryPanel = document.getElementById("release-summary-panel");
const toggleReleaseSummaryBtn = document.getElementById("toggle-release-summary");
const releaseSummaryAmount = document.getElementById("release-summary-amount");
const releaseSummaryCount = document.getElementById("release-summary-count");
const logoutBtn = document.getElementById("logout-btn");
const logoutConfirmModal = document.getElementById("logout-confirm-modal");
const logoutConfirmCancelBtn = document.getElementById("logout-confirm-cancel");
const logoutConfirmYesBtn = document.getElementById("logout-confirm-yes");
const restoreAuthModal = document.getElementById("restore-auth-modal");
const restoreAuthTitle = document.getElementById("restore-auth-title");
const restoreAuthText = restoreAuthModal?.querySelector(".restore-auth-text") || null;
const restoreAuthPasswordInput = document.getElementById("restore-auth-password");
const restoreAuthError = document.getElementById("restore-auth-error");
const restoreAuthConfirmBtn = document.getElementById("restore-auth-confirm");
const restoreAuthCancelBtn = document.getElementById("restore-auth-cancel");
const editRecordModal = document.getElementById("edit-record-modal");
const editRecordTitle = document.getElementById("edit-record-title");
const editRecordLabel = document.getElementById("edit-record-label");
const editRecordInput = document.getElementById("edit-record-input");
const editRecordError = document.getElementById("edit-record-error");
const editRecordConfirmBtn = document.getElementById("edit-record-confirm");
const editRecordCancelBtn = document.getElementById("edit-record-cancel");
const recordsSectionTitle = document.getElementById("records-section-title");
const dashboardViewLinks = Array.from(document.querySelectorAll("[data-dashboard-view]"));
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";
const ADDRESS_SUGGESTIONS_KEY = "mgi_saved_addresses";
const MAX_ADDRESS_SUGGESTIONS = 20;
const MAX_VISIBLE_ADDRESS_SUGGESTIONS = 6;
const addressAutocompleteFields = Array.from(document.querySelectorAll("[data-address-autocomplete]"));
const purposeLoanSelects = Array.from(document.querySelectorAll(".purpose-of-loan-select"));

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
  // Safety guard: prevent local/dev sessions from mutating deployed data.
  // You can opt in manually by setting localStorage.mgi_allow_fallback_write_api = "1".
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

function getBackupImportApiCandidates() {
  const path = "/api/backup/import";
  const candidates = [path];
  if (!shouldAllowFallbackWriteApi()) {
    return candidates;
  }
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

async function postBackupImportApi(payload) {
  const candidates = getBackupImportApiCandidates();
  let lastErrorResponse = null;
  let lastNetworkError = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const url = candidates[index];
    try {
      const res = await fetch(url, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
        body: JSON.stringify(payload),
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

  throw lastNetworkError || new Error("Failed to reach backup import API");
}

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

const STORAGE_KEY = "mgi_loan_records";
const OFFICER_STORAGE_KEY_PREFIX = "mgi_officer_records_";
const DEFAULT_OFFICER_NAMES = ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"];
const LOGIN_SESSION_KEY = "mgi_logged_in";
const PORTFOLIO_SESSION_KEY = "mgi_portfolio_logged_in";
const THEME_KEY = "mgi_dashboard_theme";
const DEVICE_LOCAL_KEYS = new Set([THEME_KEY]);
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
const AUTO_REFRESH_MS = 5 * 1000;
const EXPORT_ADDRESS_TEXT = "TALISAY, SANTANDER, CEBU";
const LOAN_TYPE_MONTHLY_OPEN = "monthly_open";
const LOAN_TYPE_BI_MONTHLY_OPEN = "bi_monthly_open";
const LOAN_TYPE_CASH_ADVANCE_FIXED_15 = "cash_advance_fixed_15";
const LOAN_TYPE_MONTHLY_FIXED_60 = "monthly_60_fixed";
const LOAN_TYPE_MONTHLY_FIXED_100 = "monthly_100_fixed";
const LOAN_TYPE_EMERGENCY_FIXED = "emergency_fixed";
const LOAN_TYPE_NO_LISTED = "no_listed";
const DASHBOARD_VIEW_ACTIVE = "active";
const DASHBOARD_VIEW_SETTLED = "settled";
let toastTimer;
let isLoanEntryOpen = false;
let isReleaseSummaryOpen = false;
let writeOffPasswordResolver = null;
let restoreAuthPasswordResolver = null;
let editRecordResolver = null;
let paymentEntryRowIndex = -1;
let pendingPaymentConfirm = null;
const PAYMENT_MODE_STANDARD = "standard";
const PAYMENT_MODE_PRINCIPAL_ONLY = "principal-only";
let paymentEntryMode = PAYMENT_MODE_STANDARD;
let openRebateEditorRowIndex = -1;
let openArrearsEditorRowIndex = -1;
let openOtherArrearsEditorRowIndex = -1;
let openRemarksEditorRowIndex = -1;
let syncStatusElement = null;
let diagnosticsPanelElement = null;
let diagnosticsTextElement = null;
let diagnosticsMetaElement = null;
let diagnosticsDebugElement = null;
let latestSyncIssue = "";
let recordsCache = [];
const selectedSettledRecordFingerprints = new Set();
let isServerWritePending = false;
let lastLocalMutationAt = 0;
const EMPTY_OVERWRITE_GUARD_MS = 20000;
let hasUnsyncedLocalChanges = false;
const currentDashboardView = getDashboardViewFromLocation();
const isSettledDashboardView = currentDashboardView === DASHBOARD_VIEW_SETTLED;
let syncDebugState = {
  save: "idle",
  fetch: "idle",
  guard: "no",
};

function getDashboardViewFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === DASHBOARD_VIEW_SETTLED ? DASHBOARD_VIEW_SETTLED : DASHBOARD_VIEW_ACTIVE;
  } catch {
    return DASHBOARD_VIEW_ACTIVE;
  }
}

function isSettledRecord(record) {
  return record?.isSettled === true;
}

function getActiveDashboardRecords(records) {
  return (Array.isArray(records) ? records : []).filter((record) => !isSettledRecord(record));
}

function getSettledDashboardRecords(records) {
  return (Array.isArray(records) ? records : []).filter((record) => isSettledRecord(record));
}

function getRecordsForCurrentDashboardView(records) {
  if (isSettledDashboardView) {
    const mainSettled = getSettledDashboardRecords(records);
    const officerSettled = getSettledDashboardRecords(getLocalOfficerRecords());
    return dedupeRecords([...mainSettled, ...officerSettled]);
  }

  return getActiveDashboardRecords(records);
}

function toOfficerSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeOfficerName(rawOfficer) {
  const value = String(rawOfficer || "").trim();
  if (!value) {
    return "";
  }

  const directMatch = DEFAULT_OFFICER_NAMES.find((name) => name.toLowerCase() === value.toLowerCase());
  if (directMatch) {
    return directMatch;
  }

  const slugMatch = DEFAULT_OFFICER_NAMES.find((name) => toOfficerSlug(name) === toOfficerSlug(value));
  return slugMatch || value;
}

function getOfficerStorageKeys(officerName) {
  const normalized = normalizeOfficerName(officerName) || String(officerName || "").trim();
  const canonical = `${OFFICER_STORAGE_KEY_PREFIX}${toOfficerSlug(normalized)}`;
  const legacy = `${OFFICER_STORAGE_KEY_PREFIX}${normalized}`;
  return Array.from(new Set([canonical, legacy]));
}

function getOfficerStorageKey(officerName) {
  return getOfficerStorageKeys(officerName)[0];
}

function getKnownOfficerNames() {
  const officerNames = new Set(DEFAULT_OFFICER_NAMES);
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = String(localStorage.key(index) || "");
      if (!key.startsWith(OFFICER_STORAGE_KEY_PREFIX)) {
        continue;
      }
      const officerName = normalizeOfficerName(key.slice(OFFICER_STORAGE_KEY_PREFIX.length).trim());
      if (officerName) {
        officerNames.add(officerName);
      }
    }
  } catch {
    // Ignore localStorage access errors.
  }
  return Array.from(officerNames);
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

function dedupeRecords(records) {
  const seen = new Set();
  const merged = [];

  for (const record of records) {
    const fingerprint = buildRecordFingerprint(record);
    if (seen.has(fingerprint)) {
      continue;
    }
    seen.add(fingerprint);
    merged.push(record);
  }

  return merged;
}

function setSettledRecordChecked(record, checked) {
  const fingerprint = buildRecordFingerprint(record);
  if (!fingerprint) {
    return;
  }

  if (checked) {
    selectedSettledRecordFingerprints.add(fingerprint);
  } else {
    selectedSettledRecordFingerprints.delete(fingerprint);
  }

  updateSettledDeleteButtonState();
}

function pruneSettledRecordSelection(records) {
  if (!isSettledDashboardView) {
    selectedSettledRecordFingerprints.clear();
    updateSettledDeleteButtonState();
    return;
  }

  const visibleFingerprints = new Set((Array.isArray(records) ? records : []).map((record) => buildRecordFingerprint(record)));
  Array.from(selectedSettledRecordFingerprints).forEach((fingerprint) => {
    if (!visibleFingerprints.has(fingerprint)) {
      selectedSettledRecordFingerprints.delete(fingerprint);
    }
  });

  updateSettledDeleteButtonState();
}

function updateSettledDeleteButtonState() {
  if (!clearBtn) {
    return;
  }

  clearBtn.textContent = isSettledDashboardView ? "Delete Checked" : "Delete All";
  clearBtn.classList.toggle("is-hidden", !isSettledDashboardView);
  clearBtn.disabled = isSettledDashboardView && selectedSettledRecordFingerprints.size === 0;
}

function readCachedStateRecords(stateKey) {
  try {
    const raw = localStorage.getItem(stateKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mirrorStateRecordsToLocalStorage(stateKey, records) {
  try {
    localStorage.setItem(stateKey, JSON.stringify(Array.isArray(records) ? records : []));
  } catch {
    // Ignore localStorage quota/availability errors.
  }
}

async function syncStateRecordsByKey(stateKey, records) {
  const payload = Array.isArray(records) ? records : [];
  try {
    const res = await fetchStateApi(stateKey, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    }, false);

    if (!res.ok) {
      let errorDetail = "";
      try {
        const errBody = await res.json();
        errorDetail = errBody?.detail || errBody?.error || "";
      } catch {}
      throw new Error(`Failed to sync records (${res.status})${errorDetail ? `: ${errorDetail}` : ""}`);
    }

    return { ok: true, message: "" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Cannot save to server right now.",
    };
  }
}

async function deleteSelectedSettledRecords() {
  const selectedFingerprints = new Set(selectedSettledRecordFingerprints);
  if (selectedFingerprints.size === 0) {
    showMessage("Select at least one settled account to delete.", "error");
    return;
  }

  const confirmed = window.confirm("Delete the checked settled accounts?");
  if (!confirmed) {
    return;
  }

  const nextMainRecords = recordsCache.filter(
    (record) => !(isSettledRecord(record) && selectedFingerprints.has(buildRecordFingerprint(record)))
  );

  const officerUpdates = [];
  getKnownOfficerNames().forEach((officerName) => {
    getOfficerStorageKeys(officerName).forEach((stateKey) => {
      const currentRecords = readCachedStateRecords(stateKey);
      if (currentRecords.length === 0) {
        return;
      }

      const nextOfficerRecords = currentRecords.filter((record) => {
        const normalizedRecord = {
          ...record,
          accountOfficer: normalizeOfficerName(String(record?.accountOfficer || "").trim()) || officerName,
        };

        return !(isSettledRecord(normalizedRecord) && selectedFingerprints.has(buildRecordFingerprint(normalizedRecord)));
      });

      if (nextOfficerRecords.length === currentRecords.length) {
        return;
      }

      mirrorStateRecordsToLocalStorage(stateKey, nextOfficerRecords);
      officerUpdates.push({ stateKey, records: nextOfficerRecords });
    });
  });

  setRecords(nextMainRecords);

  const syncResults = await Promise.all(
    officerUpdates.map(({ stateKey, records }) => syncStateRecordsByKey(stateKey, records))
  );

  selectedSettledRecordFingerprints.clear();
  renderRecords();

  const failedSync = syncResults.find((result) => !result.ok);
  if (failedSync) {
    showMessage(`Checked settled accounts deleted locally, but some officer sync updates failed: ${failedSync.message}`, "error");
    return;
  }

  showMessage("Checked settled accounts deleted.", "success");
  showToast("Settled accounts deleted", "success");
}

function getLocalOfficerRecords() {
  const merged = getKnownOfficerNames().flatMap((officerName) => {
    const records = getOfficerStorageKeys(officerName).flatMap((key) => readCachedStateRecords(key));
    return dedupeRecords(records).map((record) => ({
      ...record,
      accountOfficer: normalizeOfficerName(String(record?.accountOfficer || "").trim()) || officerName,
    }));
  });

  return dedupeRecords(merged);
}

async function loadStateRecords(stateKey, includeCacheBuster = true) {
  try {
    const res = await fetchStateApi(stateKey, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    }, includeCacheBuster);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        records: [],
      };
    }

    const data = await res.json().catch(() => null);
    return {
      ok: true,
      status: res.status,
      records: Array.isArray(data?.payload) ? data.payload : [],
    };
  } catch {
    return {
      ok: false,
      status: null,
      records: [],
    };
  }
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

function requestRestoreAdminPassword(options = {}) {
  const title = String(options?.title || "Secure Restore Access");
  const message = String(options?.message || "Enter admin password to restore backup data.");
  const confirmLabel = String(options?.confirmLabel || "Continue Restore");
  const fallbackPrompt = String(options?.fallbackPrompt || "Enter admin password to restore backup:");

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

function closeEditRecordModal(result) {
  if (!editRecordModal) {
    if (typeof editRecordResolver === "function") {
      editRecordResolver(result);
      editRecordResolver = null;
    }
    return;
  }

  editRecordModal.classList.remove("show");
  editRecordModal.setAttribute("aria-hidden", "true");

  if (editRecordInput) {
    editRecordInput.value = "";
  }
  if (editRecordError) {
    editRecordError.textContent = "";
  }

  if (typeof editRecordResolver === "function") {
    editRecordResolver(result);
    editRecordResolver = null;
  }
}

function requestRecordFieldEdit(config) {
  const titleText = String(config?.title || "Edit value:");
  const labelText = String(config?.label || "Value");
  const initialValue = String(config?.value || "");

  if (!editRecordModal || !editRecordInput) {
    const fallback = window.prompt(titleText, initialValue);
    return Promise.resolve(fallback);
  }

  if (editRecordTitle) {
    editRecordTitle.textContent = titleText;
  }
  if (editRecordLabel) {
    editRecordLabel.textContent = labelText;
  }
  if (editRecordError) {
    editRecordError.textContent = "";
  }

  editRecordInput.value = initialValue;
  editRecordModal.classList.add("show");
  editRecordModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    editRecordInput.focus();
    editRecordInput.select();
  }, 0);

  return new Promise((resolve) => {
    editRecordResolver = resolve;
  });
}

function ensureSyncStatusElement() {
  return null;
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

  badge.textContent = detail ? `Sync: ${detail}` : "Sync: idle";
}

function getActiveFilterSnapshot() {
  return {
    name: String(filterNameInput?.value || "").trim(),
    dateGranted: normalizeDateSearchValue(getDateFilterValue(filterDateGrantedInput)),
    dueDate: normalizeDateSearchValue(getDateFilterValue(filterDueDateInput)),
    payable: String(filterPayableSelect?.value || "").trim(),
    sortBy: String(sortBySelect?.value || "nameAsc").trim(),
  };
}

function hasActiveFilters(filters) {
  return (
    Boolean(filters.name) ||
    Boolean(filters.dateGranted) ||
    Boolean(filters.dueDate) ||
    Boolean(filters.payable) ||
    filters.sortBy === "pastDue"
  );
}

function clearAllRecordFilters() {
  if (filterNameInput) {
    filterNameInput.value = "";
  }
  if (filterDateGrantedInput) {
    filterDateGrantedInput.value = "";
    filterDateGrantedInput._flatpickr?.clear();
  }
  if (filterDueDateInput) {
    filterDueDateInput.value = "";
    filterDueDateInput._flatpickr?.clear();
  }
  if (filterPayableSelect) {
    filterPayableSelect.value = "";
  }
  if (sortBySelect) {
    sortBySelect.value = "nameAsc";
  }
  renderRecords();
}

function ensureDiagnosticsPanelElement() {
  return null;
}

function setDiagnosticsPanel(type, text, metaText) {
  const panel = ensureDiagnosticsPanelElement();
  if (!panel || !diagnosticsTextElement || !diagnosticsMetaElement) {
    return;
  }

  panel.classList.remove("is-info", "is-ok", "is-warning", "is-error");
  if (type === "ok") {
    panel.classList.add("is-ok");
  } else if (type === "warning") {
    panel.classList.add("is-warning");
  } else if (type === "error") {
    panel.classList.add("is-error");
  } else {
    panel.classList.add("is-info");
  }

  diagnosticsTextElement.textContent = text || "";
  diagnosticsMetaElement.textContent = metaText || "";
}

function setSyncDebug(partial) {
  syncDebugState = {
    ...syncDebugState,
    ...partial,
  };
  ensureDiagnosticsPanelElement();
  if (!diagnosticsDebugElement) {
    return;
  }
  diagnosticsDebugElement.textContent = `Debug: save=${syncDebugState.save} | fetch=${syncDebugState.fetch} | guard=${syncDebugState.guard}`;
}

function getRecords() {
  const baseRecords = Array.isArray(recordsCache) ? recordsCache : [];
  if (!isSettledDashboardView) {
    return baseRecords;
  }

  const officerSettledRecords = getSettledDashboardRecords(getLocalOfficerRecords());
  return dedupeRecords([...baseRecords, ...officerSettledRecords]);
}

function mirrorRecordsToLocalStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(records) ? records : []));
  } catch {
    // Ignore localStorage quota/availability errors.
  }
}

function readRecordsFromLocalStorage() {
  return readCachedStateRecords(STORAGE_KEY);
}

// Strip records that leaked from officer dashboards (they have accountOfficer set).
// Main dashboard records are never assigned an accountOfficer.
function filterMainDashboardRecords(records) {
  return (Array.isArray(records) ? records : []).filter(
    (r) => !String(r?.accountOfficer || "").trim()
  );
}

function setRecords(records) {
  recordsCache = filterMainDashboardRecords(Array.isArray(records) ? records : []);
  mirrorRecordsToLocalStorage(recordsCache);
  lastLocalMutationAt = Date.now();
  hasUnsyncedLocalChanges = true;
  setSyncDebug({ save: `queued(${recordsCache.length})` });
  syncRecordsToServer(recordsCache);
}

async function syncRecordsToServer(records) {
  isServerWritePending = true;
  setSyncDebug({ save: "pending" });
  const cleanRecords = filterMainDashboardRecords(records);
  try {
    const res = await fetchStateApi(STORAGE_KEY, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: cleanRecords }),
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
    setSyncDebug({ save: `ok(${cleanRecords.length})` });
  } catch (error) {
    // Server-only mode: keep in-memory data for current session and show sync error.
    latestSyncIssue = error?.message || "Cannot save to server right now.";
    setSyncStatus("error", "save failed");
    setSyncDebug({ save: "failed" });
  } finally {
    isServerWritePending = false;
  }
}

async function loadRecordsFromServer() {
  setSyncStatus("syncing", "syncing...");
  setSyncDebug({ fetch: "start", guard: "no" });
  console.info("[sync][main] Fetch start", {
    storageKey: STORAGE_KEY,
    online: navigator.onLine,
    time: new Date().toISOString(),
  });

  try {
    const globalResult = await loadStateRecords(STORAGE_KEY);

    if (!globalResult.ok) {
      const localRecords = filterMainDashboardRecords(readCachedStateRecords(STORAGE_KEY));
      if (localRecords.length > 0) {
        recordsCache = localRecords;
        mirrorRecordsToLocalStorage(recordsCache);
      }
      latestSyncIssue = "Cannot load latest records from server. Using local cached data.";
      setDiagnosticsPanel("warning", "Using local cached records.", latestSyncIssue);
      setSyncStatus("error", "local fallback");
      setSyncDebug({ fetch: "fallback-local", guard: "yes" });
      return;
    }

    const rawServerRecords = Array.isArray(globalResult.records) ? globalResult.records : [];
    const serverRecords = filterMainDashboardRecords(rawServerRecords);
    const serverWasContaminated = rawServerRecords.length !== serverRecords.length;

    if (Array.isArray(serverRecords)) {
      const shouldProtectUnsyncedData = (
        hasUnsyncedLocalChanges &&
        serverRecords.length === 0 &&
        recordsCache.length > 0
      );
      if (shouldProtectUnsyncedData) {
        console.info("[sync][main] Keeping unsynced local records while server save is failing", {
          cacheRecords: recordsCache.length,
        });
        setSyncStatus("error", "save pending retry");
        setSyncDebug({ fetch: `count(${serverRecords.length})`, guard: "unsynced-local" });
        return;
      }
      const shouldGuardEmptyOverwrite = (
        serverRecords.length === 0 &&
        recordsCache.length > 0 &&
        Date.now() - lastLocalMutationAt < EMPTY_OVERWRITE_GUARD_MS
      );
      if (shouldGuardEmptyOverwrite) {
        console.info("[sync][main] Ignoring empty server payload shortly after local change", {
          cacheRecords: recordsCache.length,
        });
        setSyncStatus("syncing", "waiting server update");
        setSyncDebug({ fetch: `count(${serverRecords.length})`, guard: "yes" });
        return;
      }
      if (isServerWritePending) {
        console.info("[sync][main] Skipping server apply while save is pending");
        setSyncStatus("syncing", "save in progress");
        setSyncDebug({ fetch: `count(${serverRecords.length})`, guard: "write-pending" });
        return;
      }
      recordsCache = serverRecords;
      mirrorRecordsToLocalStorage(recordsCache);
      console.info("[sync][main] Fetch success", { records: serverRecords.length });
      latestSyncIssue = "";
      setSyncStatus("ok", `updated (${serverRecords.length} records)`);
      setSyncDebug({ fetch: `ok(${serverRecords.length})`, guard: "no" });
      // Server DB had officer records leaked in — push clean data back to fix it.
      if (serverWasContaminated) {
        console.info("[sync][main] Purging contaminated officer records from server DB", {
          before: rawServerRecords.length,
          after: serverRecords.length,
        });
        syncRecordsToServer(recordsCache);
      }
      return;
    }
  } catch {
    // Network issue in server-only mode.
    console.error("[sync][main] Network error while fetching state");
    const localRecords = filterMainDashboardRecords(readCachedStateRecords(STORAGE_KEY));
    if (localRecords.length > 0) {
      recordsCache = localRecords;
      mirrorRecordsToLocalStorage(recordsCache);
    }
    latestSyncIssue = "Network error while loading server data.";
    setDiagnosticsPanel("error", "Network problem while syncing.", latestSyncIssue);
    setSyncStatus("error", "offline (server-only mode)");
    setSyncDebug({ fetch: "network-error" });
  }
}

function updateReleasedSummaryStats() {
  if (!releaseSummaryAmount || !releaseSummaryCount) {
    return;
  }

  const records = getRecords();
  const totalReleasedAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  releaseSummaryAmount.textContent = formatCurrency(totalReleasedAmount);
  releaseSummaryCount.textContent = `${records.length} released loan${records.length === 1 ? "" : "s"}`;
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

function addCommas(value) {
  const [whole, decimal = ""] = value.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal ? `${withCommas}.${decimal}` : withCommas;
}

function normalizeAmountInput(raw) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) {
    return cleaned;
  }

  const beforeDot = cleaned.slice(0, firstDot + 1);
  const afterDot = cleaned.slice(firstDot + 1).replace(/\./g, "");
  // Preserve up to 2 decimal digits; keep trailing dot so user can keep typing after "."
  return `${beforeDot}${afterDot.slice(0, 2)}`;
}

function normalizeAmountInputLive(raw) {
  // Like normalizeAmountInput but preserves a trailing dot while the user is still typing
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) {
    return cleaned;
  }

  const beforeDot = cleaned.slice(0, firstDot);
  const afterDot = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  return `${beforeDot}.${afterDot}`;
}

function parseAmount(value) {
  return Number(value.replaceAll(",", ""));
}

function formatLongDate(isoDate) {
  if (!isoDate) {
    return "";
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return isoDate;
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
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

function formatUpperDate(isoDate) {
  return formatLongDate(isoDate).toUpperCase();
}

function formatPlainAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return "0";
  }
  return String(Math.round(amount));
}

function toFileSafeName(value) {
  return String(value || "record")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "record";
}

function formatBackupTimestamp(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}_${h}${min}${s}`;
}

function parseStoredBackupValue(rawValue) {
  if (typeof rawValue !== "string") {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
}

function buildBackupRowsFromLocalData(data) {
  const backupTimestamp = new Date().toISOString();

  return Object.entries(data || {}).flatMap(([key, value]) => {
    if ((key === STORAGE_KEY || key.startsWith(OFFICER_STORAGE_KEY_PREFIX)) && Array.isArray(value)) {
      return [{
        id: key,
        payload: value,
        updatedAt: backupTimestamp,
      }];
    }
    return [];
  });
}

function collectComprehensiveLocalBackup() {
  const data = {};

  try {
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

      data[key] = parseStoredBackupValue(rawValue);
    }
  } catch {
    return { data: {}, rows: [] };
  }

  return {
    data,
    rows: buildBackupRowsFromLocalData(data),
  };
}

function restoreComprehensiveLocalBackup(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return 0;
  }

  let restoredCount = 0;

  Object.entries(data).forEach(([key, value]) => {
    if (!key.startsWith("mgi_")) {
      return;
    }
    if (DEVICE_LOCAL_KEYS.has(key)) {
      return;
    }

    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      restoredCount += 1;
    } catch {
      return;
    }
  });

  renderAddressSuggestions();

  return restoredCount;
}

function downloadJsonFile(fileName, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toIsoDate(dateValue) {
  const y = dateValue.getFullYear();
  const m = String(dateValue.getMonth() + 1).padStart(2, "0");
  const d = String(dateValue.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function initializeDatePickers() {
  if (typeof window.flatpickr !== "function") {
    return;
  }

  const dateInputs = document.querySelectorAll(
    "#dateGranted, #filter-date-granted, #filter-due-date, #test-date"
  );

  dateInputs.forEach((input) => {
    if (!(input instanceof HTMLInputElement) || input._flatpickr) {
      return;
    }

    window.flatpickr(input, {
      dateFormat: "Y-m-d",
      altInput: true,
      altInputClass: "compact-date-input",
      altFormat: "F j, Y",
      disableMobile: true,
      onChange: (_selectedDates, _dateStr, instance) => {
        instance.input.dispatchEvent(new Event("input", { bubbles: true }));
      },
    });
  });
}

function addDaysToIsoDate(isoDate, days) {
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return toIsoDate(new Date());
  }
  base.setDate(base.getDate() + days);
  return toIsoDate(base);
}

function getReferenceDate() {
  const selected = (testDateInput.value || "").trim();
  if (selected) {
    return new Date(`${selected}T00:00:00`);
  }
  return new Date();
}

function toStartOfDayDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return null;
  }
  return startOfDay(dateValue);
}

function getWriteOffFreezeDate(record) {
  if (!record || record.isWriteOff !== true) {
    return null;
  }

  const freezeDateIso = String(record.writeOffDate || "").trim();
  if (!freezeDateIso) {
    return null;
  }

  const freezeDate = new Date(`${freezeDateIso}T00:00:00`);
  return toStartOfDayDate(freezeDate);
}

function getHatagHatagFreezeDate(record) {
  if (!record || record.isHatagHatag !== true) {
    return null;
  }

  const freezeDateIso = String(record.hatagHatagDate || "").trim();
  if (!freezeDateIso) {
    return null;
  }

  const freezeDate = new Date(`${freezeDateIso}T00:00:00`);
  return toStartOfDayDate(freezeDate);
}

function getInterestFreezeDate(record) {
  const writeOffDate = getWriteOffFreezeDate(record);
  const hatagHatagDate = getHatagHatagFreezeDate(record);

  if (writeOffDate && hatagHatagDate) {
    return startOfDay(writeOffDate) <= startOfDay(hatagHatagDate) ? writeOffDate : hatagHatagDate;
  }

  return writeOffDate || hatagHatagDate;
}

function isHatagHatagActive(record) {
  return Boolean(record && record.isHatagHatag === true);
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

  // Keep interest fixed at the activation date of Write-Off or Hatag-Hatag.
  return freezeDate;
}

function isMonthly60FixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_MONTHLY_FIXED_60;
}

function isMonthlyOpenLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_MONTHLY_OPEN || payableWithin === "Monthly";
}

function isMonthly100FixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_MONTHLY_FIXED_100;
}

function isEmergencyFixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_EMERGENCY_FIXED || payableWithin === "Emergency Loan";
}

function isWeeklyFixedLoan(payableWithin) {
  return isEmergencyFixedLoan(payableWithin) || payableWithin === "Weekly";
}

function isCashAdvanceFixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_CASH_ADVANCE_FIXED_15;
}

function isBiMonthlyAutoLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN || isCashAdvanceFixedLoan(payableWithin);
}

function getEffectiveInterestRate(record) {
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return 10;
  }
  return Number(record.interestRate || 0);
}

function getTypeLabel(payableWithin) {
  if (isMonthlyOpenLoan(payableWithin)) {
    return "Monthly - Open";
  }
  if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    return "Bi - Monthly (Others)";
  }
  if (isCashAdvanceFixedLoan(payableWithin)) {
    return "Cash Advance (15 days) - Fixed";
  }
  if (isMonthly60FixedLoan(payableWithin)) {
    return "Monthly (60 days) - Fixed";
  }
  if (isMonthly100FixedLoan(payableWithin)) {
    return "Monthly (100 days) - Fixed";
  }
  if (payableWithin === LOAN_TYPE_EMERGENCY_FIXED || payableWithin === "Emergency Loan") {
    return "Emergency Loan - Fixed";
  }
  if (payableWithin === LOAN_TYPE_NO_LISTED) {
    return "No Listed";
  }
  return payableWithin || "";
}

function getTypeSortLabel(record) {
  const baseTypeLabel = getTypeLabel(record.payableWithin);
  if (record.isWriteOff === true) {
    return `${baseTypeLabel} - Write-Off`;
  }
  if (isHatagHatagActive(record)) {
    return `${baseTypeLabel} - Hatag-Hatag`;
  }
  return baseTypeLabel;
}

function getCollectibleLabel(payableWithin) {
  if (isMonthly60FixedLoan(payableWithin) || isMonthly100FixedLoan(payableWithin) || isMonthlyOpenLoan(payableWithin)) {
    return "daily collectible";
  }
  if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    return "bi-monthly collectible";
  }
  if (isCashAdvanceFixedLoan(payableWithin)) {
    return "bi-monthly collectible";
  }
  if (isWeeklyFixedLoan(payableWithin)) {
    return "weekly collectible";
  }
  if (payableWithin === "Daily") {
    return "daily collectible";
  }
  return "per period";
}

function getDefaultCollectiblePeriod(payableWithin) {
  if (isWeeklyFixedLoan(payableWithin)) {
    return "Weekly";
  }
  if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN || isCashAdvanceFixedLoan(payableWithin)) {
    return "Bi-Monthly";
  }
  if (payableWithin === "Monthly") {
    return "Monthly";
  }
  return "Daily";
}

function getCollectibleLabelFromPeriod(period) {
  if (period === "Monthly") {
    return "monthly collectible";
  }
  if (period === "Weekly") {
    return "weekly collectible";
  }
  if (period === "Bi-Monthly") {
    return "bi-monthly collectible";
  }
  return "daily collectible";
}

function getCollectiblePeriodForRecord(record) {
  const override = String(record.collectiblePeriodOverride || "").trim();
  if (override === "Monthly" || override === "Weekly" || override === "Bi-Monthly" || override === "Daily") {
    return override;
  }
  return getDefaultCollectiblePeriod(record.payableWithin);
}

function getCollectibleLabelForRecord(record) {
  return getCollectibleLabelFromPeriod(getCollectiblePeriodForRecord(record));
}

function getLoanPeriodDays(payableWithin) {
  if (isMonthly60FixedLoan(payableWithin)) return 60;
  if (isMonthlyOpenLoan(payableWithin)) return 30;
  if (isMonthly100FixedLoan(payableWithin)) return 100;
  if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) return 30;
  if (isCashAdvanceFixedLoan(payableWithin)) return 15;
  if (isWeeklyFixedLoan(payableWithin)) return 7;
  if (payableWithin === "Daily") return 1;
  return 30;
}

function computeDueDate(dateGranted, payableWithin) {
  if (!dateGranted) {
    return "";
  }

  const due = new Date(`${dateGranted}T00:00:00`);
  if (Number.isNaN(due.getTime())) {
    return "";
  }

  if (isMonthly60FixedLoan(payableWithin)) {
    due.setDate(due.getDate() + 60);
  } else if (isMonthlyOpenLoan(payableWithin)) {
    due.setDate(due.getDate() + 30);
  } else if (isMonthly100FixedLoan(payableWithin)) {
    due.setDate(due.getDate() + 100);
  } else if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    due.setDate(due.getDate() + 30);
  } else if (isCashAdvanceFixedLoan(payableWithin)) {
    due.setDate(due.getDate() + 15);
  } else if (isWeeklyFixedLoan(payableWithin)) {
    due.setDate(due.getDate() + 7);
  } else if (payableWithin === "Daily") {
    due.setDate(due.getDate() + 1);
  }

  // Add 1-day buffer so the due date is inclusive (e.g. Apr 2 → May 3 for a 30-day term)
  due.setDate(due.getDate() + 1);

  return toIsoDate(due);
}

function startOfDay(dateValue) {
  return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
}

function diffDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(toDate) - startOfDay(fromDate)) / msPerDay);
}

function getEffectiveLoanEndDate(record) {
  const storedDueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const movedPayDate = String(record.payDate || "").trim();
  return movedPayDate || storedDueDate;
}

function getMonthlyOpenTermDays(record) {
  const startDate = new Date(`${record.dateGranted}T00:00:00`);
  // Use the original dueDate (not the advanced payDate) so scheduledPeriods stays
  // stable (always 1) regardless of how many times payDate has been advanced.
  // Subtract 1 to cancel the +1 buffer baked into computeDueDate.
  const originalDue = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const endDate = new Date(`${originalDue}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 30;
  }

  return Math.max(1, diffDays(startDate, endDate) - 1);
}

function getMonthlyOpenInterestPeriods(record) {
  return Math.max(1, Math.ceil(getMonthlyOpenTermDays(record) / 30));
}

function getInclusiveInterestPeriodsFromReferenceDate(dateGranted, cycleDays, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = toStartOfDayDate(referenceDate);

  if (Number.isNaN(startDate.getTime()) || !referenceDay) {
    return 0;
  }

  const elapsedDays = Math.max(0, diffDays(startDate, referenceDay));
  const cycleStepDays = cycleDays + 1;
  return 1 + Math.floor(Math.max(0, elapsedDays - 1) / cycleStepDays);
}

function getOpenLoanInterestPeriodsFromReferenceDate(dateGranted, payableWithin, referenceDate) {
  return getInclusiveInterestPeriodsFromReferenceDate(
    dateGranted,
    getLoanPeriodDays(payableWithin),
    referenceDate
  );
}

function getMonthlyOpenTotalInterestPeriods(record) {
  return getOpenLoanInterestPeriodsFromReferenceDate(
    record.dateGranted,
    record.payableWithin,
    getInterestReferenceDate(record)
  );
}

function getBiMonthlyOpenTermDays(record) {
  const startDate = new Date(`${record.dateGranted}T00:00:00`);
  // Same fix as getMonthlyOpenTermDays: use original dueDate, subtract 1 for buffer.
  const originalDue = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const endDate = new Date(`${originalDue}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 30;
  }

  return Math.max(1, diffDays(startDate, endDate) - 1);
}

function getBiMonthlyOpenInterestPeriods(record) {
  return Math.max(1, Math.ceil(getBiMonthlyOpenTermDays(record) / 15));
}

function getElapsedPeriodsFromReferenceDate(dateGranted, payableWithin, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = toStartOfDayDate(referenceDate);

  if (Number.isNaN(startDate.getTime()) || !referenceDay) {
    return 0;
  }

  const cycleStepDays = getLoanPeriodDays(payableWithin) + 1;
  return Math.max(0, Math.floor(diffDays(startDate, referenceDay) / cycleStepDays));
}

function getMonthly100InterestPeriods(record) {
  return getInclusiveInterestPeriodsFromReferenceDate(
    record.dateGranted,
    30,
    getInterestReferenceDate(record)
  );
}

function getCashAdvanceInterestPeriods(record) {
  return getInclusiveInterestPeriodsFromReferenceDate(
    record.dateGranted,
    15,
    getInterestReferenceDate(record)
  );
}

function getWeeklyInterestPeriodsFromDate(dateGranted, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = toStartOfDayDate(referenceDate);

  if (Number.isNaN(startDate.getTime()) || !referenceDay) {
    return 0;
  }

  return Math.max(0, Math.floor(diffDays(startDate, referenceDay) / 7));
}

function getEmergencyFixedInterestPeriodsFromDate(dateGranted, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = toStartOfDayDate(referenceDate);

  if (Number.isNaN(startDate.getTime()) || !referenceDay) {
    return 1;
  }

  const elapsedDays = Math.max(0, diffDays(startDate, referenceDay));
  return Math.max(1, Math.ceil(elapsedDays / 7));
}

function getWeeklyInterestPeriods(record) {
  const periodsFromDate = isEmergencyFixedLoan(record.payableWithin)
    ? getEmergencyFixedInterestPeriodsFromDate
    : getWeeklyInterestPeriodsFromDate;
  return periodsFromDate(record.dateGranted, getInterestReferenceDate(record));
}

function getWeeklyRunningState(record, referenceDate = getInterestReferenceDate(record)) {
  const effectiveInterestRate = getEffectiveInterestRate(record) / 100;
  const periodsFromDate = isEmergencyFixedLoan(record.payableWithin)
    ? getEmergencyFixedInterestPeriodsFromDate
    : getWeeklyInterestPeriodsFromDate;
  const history = [...getPaymentHistory(record)]
    .filter((item) => {
      if (!item?.date) {
        return false;
      }
      return compareIsoDate(item.date, toIsoDate(referenceDate)) <= 0;
    })
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
    currentCycles,
  };
}

function getBiMonthlyOpenTotalInterestMultiplier(record) {
  return getOpenLoanInterestPeriodsFromReferenceDate(
    record.dateGranted,
    LOAN_TYPE_BI_MONTHLY_OPEN,
    getInterestReferenceDate(record)
  );
}

function getOverduePeriods(dueDateIso, payableWithin) {
  if (!dueDateIso) {
    return 0;
  }

  const dueDate = new Date(`${dueDateIso}T00:00:00`);
  const today = getReferenceDate();

  if (Number.isNaN(dueDate.getTime()) || startOfDay(today) <= startOfDay(dueDate)) {
    return 0;
  }

  if (isMonthly60FixedLoan(payableWithin) || isMonthly100FixedLoan(payableWithin) || payableWithin === "Daily") {
    return diffDays(dueDate, today);
  }

  if (isMonthlyOpenLoan(payableWithin)) {
    // Once overdue by at least 1 day, apply one overdue monthly period.
    return Math.ceil(diffDays(dueDate, today) / 30);
  }

  if (payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    // Keep the same overdue behavior as monthly open loans.
    return Math.ceil(diffDays(dueDate, today) / 30);
  }

  if (isCashAdvanceFixedLoan(payableWithin)) {
    return Math.floor(diffDays(dueDate, today) / 15);
  }

  if (isWeeklyFixedLoan(payableWithin)) {
    return Math.floor(diffDays(dueDate, today) / 7);
  }

  return 0;
}

function computeBaseTotalPayable(record) {
  const effectiveInterestRate = getEffectiveInterestRate(record);
  const monthlyInterestAmount = record.amount * (effectiveInterestRate / 100);
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return record.amount + monthlyInterestAmount * 2;
  }
  if (isMonthlyOpenLoan(record.payableWithin)) {
    return applyCompoundedPeriodicInterest(
      record.amount,
      effectiveInterestRate / 100,
      getMonthlyOpenTotalInterestPeriods(record)
    );
  }
  if (record.payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    return record.amount + monthlyInterestAmount * getBiMonthlyOpenTotalInterestMultiplier(record);
  }
  if (isCashAdvanceFixedLoan(record.payableWithin)) {
    // Cash Advance accrues every 15 days.
    return applyCompoundedPeriodicInterest(record.amount, effectiveInterestRate / 100, getCashAdvanceInterestPeriods(record));
  }
  if (isMonthly100FixedLoan(record.payableWithin)) {
    return applyCompoundedPeriodicInterest(record.amount, effectiveInterestRate / 100, getMonthly100InterestPeriods(record));
  }
  return record.amount + monthlyInterestAmount;
}

function getWeeklyRunningBalance(record) {
  return getWeeklyRunningState(record).outstandingBalance;
}

function computeBaseCollectibleAmount(record) {
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningBalance(record);
  }

  const collectibleOverride = Number(record.collectibleAmountOverride);
  if (Number.isFinite(collectibleOverride) && collectibleOverride > 0) {
    return collectibleOverride;
  }

  const effectiveInterestRate = getEffectiveInterestRate(record);
  const monthlyInterestAmount = record.amount * (effectiveInterestRate / 100);
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return (record.amount + monthlyInterestAmount * 2) / 60;
  }
  if (isMonthlyOpenLoan(record.payableWithin)) {
    return computeBaseTotalPayable(record) / getMonthlyOpenTermDays(record);
  }
  if (isMonthly100FixedLoan(record.payableWithin)) {
    return computeBaseTotalPayable(record) / 100;
  }
  return monthlyInterestAmount;
}

function computeCollectibleAmount(record) {
  const baseCollectible = computeBaseCollectibleAmount(record);
  return baseCollectible + computeArrearsAmount(record) + computeOtherArrearsAmount(record);
}

function computeArrearsAmount(record) {
  const manualArrears = Number(record.manualArrearsAmount ?? 0);
  if (!Number.isFinite(manualArrears) || manualArrears < 0) {
    return 0;
  }
  return manualArrears;
}

function computeOtherArrearsAmount(record) {
  const otherArrears = Number(record.manualOtherArrearsAmount ?? 0);
  if (!Number.isFinite(otherArrears) || otherArrears < 0) {
    return 0;
  }
  return otherArrears;
}

function computeCurrentTotalPayable(record) {
  const baseTotal = computeBaseTotalPayable(record);
  return Math.max(0, baseTotal - getTotalInterestReducedAmount(record)) + computeArrearsAmount(record) + computeOtherArrearsAmount(record);
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

function getTotalInterestPaidAmount(record) {
  const history = getPaymentHistory(record);
  if (history.length > 0) {
    return history.reduce((sum, item) => {
      const interestPaid = Number(item.interestPaid);
      if (Number.isFinite(interestPaid) && interestPaid >= 0) {
        return sum + interestPaid;
      }
      return sum;
    }, 0);
  }

  return 0;
}

function getPrincipalOutstandingAmount(record) {
  const principalOutstanding = record.amount - getTotalPrincipalPaidAmount(record);
  if (!Number.isFinite(principalOutstanding)) {
    return 0;
  }
  return Math.max(0, principalOutstanding);
}

function getWeeklyPrincipalBalance(record) {
  return getWeeklyRunningState(record).principalBalance;
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
    ? getWeeklyPrincipalBalance(record)
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

function applyPeriodicInterest(balance, periodicRate, periods) {
  if (!Number.isFinite(balance) || balance <= 0) {
    return 0;
  }

  if (!Number.isFinite(periodicRate) || periodicRate <= 0 || !Number.isFinite(periods) || periods <= 0) {
    return balance;
  }

  return balance + balance * periodicRate * periods;
}

function applyCompoundedPeriodicInterest(balance, periodicRate, periods) {
  if (!Number.isFinite(balance) || balance <= 0) {
    return 0;
  }

  if (!Number.isFinite(periodicRate) || periodicRate <= 0 || !Number.isFinite(periods) || periods <= 0) {
    return balance;
  }

  return balance * Math.pow(1 + periodicRate, periods);
}

function computeRemainingPayable(record) {
  if (isSettledRecord(record)) {
    return 0;
  }

  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningBalance(record);
  }

  if (isMonthlyOpenLoan(record.payableWithin)) {
    const effectiveInterestRate = getEffectiveInterestRate(record);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      record.dateGranted,
      record.payableWithin,
      getInterestReferenceDate(record)
    );
    const storedBalance = Number(record.monthlyOpenCurrentBalance);
    const storedCycles = Number(record.monthlyOpenPaymentCycles ?? -1);

    let outstanding;
    if (Number.isFinite(storedBalance) && storedBalance >= 0 && storedCycles >= 0) {
      const cyclesSince = Math.max(0, currentCycles - storedCycles);
      outstanding = storedBalance * Math.pow(1 + effectiveInterestRate / 100, cyclesSince);
    } else {
      outstanding = record.amount * Math.pow(1 + effectiveInterestRate / 100, currentCycles);
    }

    return Math.max(0, outstanding);
  }

  if (record.payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    // Use stored balance snapshot taken at the time of last payment.
    // This ensures any payment at any cycle deducts correctly and future
    // cycles compound only on the remaining balance.
    // e.g. 11000 - 700 = 10300 stored, then 10300 * 1.10 = 11330 next cycle.
    const effectiveInterestRate = getEffectiveInterestRate(record);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      record.dateGranted,
      record.payableWithin,
      getInterestReferenceDate(record)
    );
    const storedBalance = Number(record.biMonthlyCurrentBalance);
    const storedCycles = Number(record.biMonthlyPaymentCycles ?? -1);

    let outstanding;
    if (Number.isFinite(storedBalance) && storedBalance >= 0 && storedCycles >= 0) {
      // Compound from the last stored post-payment balance
      const cyclesSince = Math.max(0, currentCycles - storedCycles);
      outstanding = storedBalance * Math.pow(1 + effectiveInterestRate / 100, cyclesSince);
    } else {
      // No payment yet — compound from original amount
      outstanding = record.amount * Math.pow(1 + effectiveInterestRate / 100, currentCycles);
    }

    return Math.max(0, outstanding);
  }

  const grossPayable = computeBaseTotalPayable(record);
  const totalPaid = getTotalPaidAmount(record);
  const totalInterestReduced = getTotalInterestReducedAmount(record);
  return Math.max(0, grossPayable - totalPaid - totalInterestReduced);
}

function getPaymentHistory(record) {
  if (Array.isArray(record.paymentHistory)) {
    return record.paymentHistory;
  }
  return [];
}

function compareIsoDate(a, b) {
  const aTime = a ? new Date(`${a}T00:00:00`).getTime() : 0;
  const bTime = b ? new Date(`${b}T00:00:00`).getTime() : 0;
  return aTime - bTime;
}

function amountsDiffer(a, b) {
  return Math.abs(Number(a || 0) - Number(b || 0)) > 0.0001;
}

function setButtonUnsavedState(button, isUnsaved) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }
  button.classList.toggle("btn-unsaved", Boolean(isUnsaved));
}

function updateRowSaveButtonStates(rowIndex) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const records = getRecords();
  const record = records[rowIndex];
  if (!record) {
    return;
  }

  const dueDateInput = body.querySelector(`.due-date-input[data-index="${rowIndex}"]`);
  const dueDateBtn = body.querySelector(`.due-date-display-btn[data-index="${rowIndex}"]`);
  if (dueDateInput instanceof HTMLInputElement && dueDateBtn instanceof HTMLButtonElement) {
    const savedDueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
    setButtonUnsavedState(dueDateBtn, dueDateInput.value !== savedDueDate);
  }

  const moveDateInput = body.querySelector(`.move-date-input[data-index="${rowIndex}"]`);
  const moveDateBtn = body.querySelector(`.move-date-display-btn[data-index="${rowIndex}"]`);
  if (moveDateInput instanceof HTMLInputElement && moveDateBtn instanceof HTMLButtonElement) {
    const savedMoveDate = record.payDate || record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
    setButtonUnsavedState(moveDateBtn, moveDateInput.value !== savedMoveDate);
  }

  const collectibleInput = body.querySelector(`.collectible-edit-input[data-index="${rowIndex}"]`);
  const collectiblePeriodSelect = body.querySelector(`.collectible-period-select[data-index="${rowIndex}"]`);
  const collectibleBtn = body.querySelector(`.save-collectible-btn[data-index="${rowIndex}"]`);
  if (
    collectibleInput instanceof HTMLInputElement &&
    collectiblePeriodSelect instanceof HTMLSelectElement &&
    collectibleBtn instanceof HTMLButtonElement
  ) {
    const inputCollectible = parseAmount(collectibleInput.value || "0");
    const savedCollectible = computeCollectibleAmount(record);
    const savedPeriod = getCollectiblePeriodForRecord(record);
    setButtonUnsavedState(
      collectibleBtn,
      amountsDiffer(inputCollectible, savedCollectible) || collectiblePeriodSelect.value !== savedPeriod
    );
  }

  const weeklyAmountInput = body.querySelector(`.weekly-amount-input[data-index="${rowIndex}"]`);
  const weeklySettingsBtn = body.querySelector(`.save-weekly-settings-btn[data-index="${rowIndex}"]`);
  if (
    weeklyAmountInput instanceof HTMLInputElement &&
    collectibleInput instanceof HTMLInputElement &&
    collectiblePeriodSelect instanceof HTMLSelectElement &&
    weeklySettingsBtn instanceof HTMLButtonElement
  ) {
    const inputAmount = parseAmount(weeklyAmountInput.value || "0");
    const inputCollectible = parseAmount(collectibleInput.value || "0");
    const savedCollectible = computeCollectibleAmount(record);
    const savedPeriod = getCollectiblePeriodForRecord(record);
    setButtonUnsavedState(
      weeklySettingsBtn,
      amountsDiffer(inputAmount, Number(record.amount || 0)) ||
        amountsDiffer(inputCollectible, savedCollectible) ||
        collectiblePeriodSelect.value !== savedPeriod
    );
  }

  const rebateInput = body.querySelector(`.rebate-input[data-index="${rowIndex}"]`);
  const rebateBtn = body.querySelector(`.save-rebate-btn[data-index="${rowIndex}"]`);
  if (rebateInput instanceof HTMLInputElement && rebateBtn instanceof HTMLButtonElement) {
    setButtonUnsavedState(rebateBtn, amountsDiffer(parseAmount(rebateInput.value || "0"), getRebateAmount(record)));
  }

  const arrearsInput = body.querySelector(`.arrears-input[data-index="${rowIndex}"]`);
  const arrearsTypeSelect = body.querySelector(`.arrears-type-select[data-index="${rowIndex}"]`);
  const arrearsBtn = body.querySelector(`.save-arrears-btn[data-index="${rowIndex}"]`);
  if (
    arrearsInput instanceof HTMLInputElement &&
    arrearsTypeSelect instanceof HTMLSelectElement &&
    arrearsBtn instanceof HTMLButtonElement
  ) {
    const savedArrearsType = record.arrearsType === "Principal" ? "Principal" : "Interest";
    setButtonUnsavedState(
      arrearsBtn,
      amountsDiffer(parseAmount(arrearsInput.value || "0"), computeArrearsAmount(record)) ||
        arrearsTypeSelect.value !== savedArrearsType
    );
  }

  const otherArrearsInput = body.querySelector(`.other-arrears-input[data-index="${rowIndex}"]`);
  const otherArrearsTypeSelect = body.querySelector(`.other-arrears-type-select[data-index="${rowIndex}"]`);
  const otherArrearsBtn = body.querySelector(`.save-other-arrears-btn[data-index="${rowIndex}"]`);
  if (
    otherArrearsInput instanceof HTMLInputElement &&
    otherArrearsTypeSelect instanceof HTMLSelectElement &&
    otherArrearsBtn instanceof HTMLButtonElement
  ) {
    const savedOtherArrearsType = record.otherArrearsType === "Principal" ? "Principal" : "Interest";
    setButtonUnsavedState(
      otherArrearsBtn,
      amountsDiffer(parseAmount(otherArrearsInput.value || "0"), computeOtherArrearsAmount(record)) ||
        otherArrearsTypeSelect.value !== savedOtherArrearsType
    );
  }

  const remarksInput = body.querySelector(`.remarks-input[data-index="${rowIndex}"]`);
  const remarksBtn = body.querySelector(`.save-remarks-btn[data-index="${rowIndex}"]`);
  if (remarksInput instanceof HTMLInputElement && remarksBtn instanceof HTMLButtonElement) {
    const savedRemarks = String(record.remarks || "").trim();
    setButtonUnsavedState(remarksBtn, remarksInput.value.trim() !== savedRemarks);
  }
}

function saveDueDateForRow(rowIndex, updatedDueDate) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Invalid record selected.", "error");
    return false;
  }

  if (!updatedDueDate) {
    showMessage("Please select a due date.", "error");
    return false;
  }

  const records = getRecords();
  if (!records[rowIndex]) {
    showMessage("Record no longer exists.", "error");
    return false;
  }

  const previousDueDate = records[rowIndex].dueDate || computeDueDate(records[rowIndex].dateGranted, records[rowIndex].payableWithin);
  if (!records[rowIndex].payDate || records[rowIndex].payDate === previousDueDate) {
    records[rowIndex].payDate = updatedDueDate;
  }
  records[rowIndex].dueDate = updatedDueDate;
  setRecords(records);
  renderRecords();
  showMessage("Due date updated.", "success");
  showToast("Due date updated", "success");
  return true;
}

function saveMoveDateForRow(rowIndex, newDate) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Invalid record selected.", "error");
    return false;
  }

  if (!newDate) {
    showMessage("Please select a new pay date.", "error");
    return false;
  }

  const records = getRecords();
  if (!records[rowIndex]) {
    showMessage("Record no longer exists.", "error");
    return false;
  }

  records[rowIndex].payDate = newDate;
  setRecords(records);
  renderRecords();
  showMessage("Pay date moved.", "success");
  showToast("Pay date moved", "success");
  return true;
}

function toggleCollectibleEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  const editor = body.querySelector(`.collectible-editor[data-index="${rowIndex}"]`);
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

  if (forceOpen && Number.isInteger(openRebateEditorRowIndex) && openRebateEditorRowIndex >= 0 && openRebateEditorRowIndex !== rowIndex) {
    const previousEditor = body.querySelector(`.rebate-editor[data-index="${openRebateEditorRowIndex}"]`);
    if (previousEditor instanceof HTMLElement) {
      previousEditor.classList.add("rebate-editor-hidden");
    }
  }

  const editor = body.querySelector(`.rebate-editor[data-index="${rowIndex}"]`);
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const currentlyOpen = !editor.classList.contains("rebate-editor-hidden");
  const shouldOpen = forceOpen ? true : !currentlyOpen;
  editor.classList.toggle("rebate-editor-hidden", !shouldOpen);
  openRebateEditorRowIndex = shouldOpen ? rowIndex : (openRebateEditorRowIndex === rowIndex ? -1 : openRebateEditorRowIndex);

  if (shouldOpen) {
    const input = editor.querySelector(`.rebate-input[data-index="${rowIndex}"]`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

function toggleArrearsEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  if (forceOpen && Number.isInteger(openArrearsEditorRowIndex) && openArrearsEditorRowIndex >= 0 && openArrearsEditorRowIndex !== rowIndex) {
    const previousEditor = body.querySelector(`.arrears-editor[data-index="${openArrearsEditorRowIndex}"]`);
    if (previousEditor instanceof HTMLElement) {
      previousEditor.classList.add("arrears-editor-hidden");
    }
  }

  const editor = body.querySelector(`.arrears-editor[data-index="${rowIndex}"]`);
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const currentlyOpen = !editor.classList.contains("arrears-editor-hidden");
  const shouldOpen = forceOpen ? true : !currentlyOpen;
  editor.classList.toggle("arrears-editor-hidden", !shouldOpen);
  openArrearsEditorRowIndex = shouldOpen ? rowIndex : (openArrearsEditorRowIndex === rowIndex ? -1 : openArrearsEditorRowIndex);

  if (shouldOpen) {
    const input = editor.querySelector(`.arrears-input[data-index="${rowIndex}"]`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

function toggleOtherArrearsEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  if (forceOpen && Number.isInteger(openOtherArrearsEditorRowIndex) && openOtherArrearsEditorRowIndex >= 0 && openOtherArrearsEditorRowIndex !== rowIndex) {
    const previousEditor = body.querySelector(`.other-arrears-editor[data-index="${openOtherArrearsEditorRowIndex}"]`);
    if (previousEditor instanceof HTMLElement) {
      previousEditor.classList.add("other-arrears-editor-hidden");
    }
  }

  const editor = body.querySelector(`.other-arrears-editor[data-index="${rowIndex}"]`);
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const currentlyOpen = !editor.classList.contains("other-arrears-editor-hidden");
  const shouldOpen = forceOpen ? true : !currentlyOpen;
  editor.classList.toggle("other-arrears-editor-hidden", !shouldOpen);
  openOtherArrearsEditorRowIndex = shouldOpen
    ? rowIndex
    : (openOtherArrearsEditorRowIndex === rowIndex ? -1 : openOtherArrearsEditorRowIndex);

  if (shouldOpen) {
    const input = editor.querySelector(`.other-arrears-input[data-index="${rowIndex}"]`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

function toggleRemarksEditor(rowIndex, forceOpen = false) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return;
  }

  if (forceOpen && Number.isInteger(openRemarksEditorRowIndex) && openRemarksEditorRowIndex >= 0 && openRemarksEditorRowIndex !== rowIndex) {
    const previousEditor = body.querySelector(`.remarks-editor[data-index="${openRemarksEditorRowIndex}"]`);
    if (previousEditor instanceof HTMLElement) {
      previousEditor.classList.add("remarks-editor-hidden");
    }
  }

  const editor = body.querySelector(`.remarks-editor[data-index="${rowIndex}"]`);
  if (!(editor instanceof HTMLElement)) {
    return;
  }

  const currentlyOpen = !editor.classList.contains("remarks-editor-hidden");
  const shouldOpen = forceOpen ? true : !currentlyOpen;
  editor.classList.toggle("remarks-editor-hidden", !shouldOpen);
  openRemarksEditorRowIndex = shouldOpen ? rowIndex : (openRemarksEditorRowIndex === rowIndex ? -1 : openRemarksEditorRowIndex);

  if (shouldOpen) {
    const input = editor.querySelector(`.remarks-input[data-index="${rowIndex}"]`);
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  }
}

function hasOpenInlineEditor() {
  return (
    (Number.isInteger(openRebateEditorRowIndex) && openRebateEditorRowIndex >= 0) ||
    (Number.isInteger(openArrearsEditorRowIndex) && openArrearsEditorRowIndex >= 0) ||
    (Number.isInteger(openOtherArrearsEditorRowIndex) && openOtherArrearsEditorRowIndex >= 0) ||
    (Number.isInteger(openRemarksEditorRowIndex) && openRemarksEditorRowIndex >= 0) ||
    Boolean(body?.querySelector(".collectible-editor:not(.collectible-editor-hidden)"))
  );
}

function normalizeDateSearchValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return toIsoDate(parsed);
  }

  return value.toLowerCase();
}

function getDateFilterValue(inputElement) {
  if (!(inputElement instanceof HTMLInputElement)) {
    return "";
  }

  const fp = inputElement._flatpickr;
  const rawValue = String(inputElement.value || "").trim();
  if (rawValue) {
    return rawValue;
  }

  const selectedDate = fp?.selectedDates?.[0];
  if (selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime())) {
    return toIsoDate(selectedDate);
  }

  return "";
}

async function getImageDataUrl(imagePath) {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) {
      return "";
    }
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function getVisibleRecords(records) {
  const nameFilter = (filterNameInput.value || "").trim().toLowerCase();
  const grantedFilter = normalizeDateSearchValue(getDateFilterValue(filterDateGrantedInput));
  const dueFilter = normalizeDateSearchValue(getDateFilterValue(filterDueDateInput));
  const payableFilter = (filterPayableSelect.value || "").trim();
  const sortBy = (sortBySelect.value || "nameAsc").trim();
  const referenceDateIso = toIsoDate(getReferenceDate());

  let rows = records
    .map((record, index) => {
      const dueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
      const effectiveDueDate = record.payDate || dueDate;
      const hasOutstandingBalance = getOutstandingBreakdown(record).outstandingBalance > 0;
      const isPastDue = Boolean(dueDate && hasOutstandingBalance && compareIsoDate(dueDate, referenceDateIso) < 0);
      const daysPastDue = isPastDue
        ? Math.floor((new Date(`${referenceDateIso}T00:00:00`).getTime() - new Date(`${dueDate}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return { record, index, dueDate, effectiveDueDate, isPastDue, daysPastDue };
    })
    .filter((row) => {
      if (isSettledDashboardView) {
        if (!isSettledRecord(row.record)) {
          return false;
        }
      } else if (isSettledRecord(row.record)) {
        return false;
      }

      const rowName = String(row.record.name || "").toLowerCase();
      if (nameFilter && !rowName.includes(nameFilter)) {
        return false;
      }
      const rowGrantedIso = row.record.dateGranted || "";
      if (grantedFilter && rowGrantedIso !== grantedFilter && formatLongDate(rowGrantedIso).toLowerCase() !== grantedFilter) {
        return false;
      }
      const rowDueIso = row.dueDate || "";
      const rowEffectiveDueIso = row.effectiveDueDate || "";
      if (
        dueFilter &&
        rowDueIso !== dueFilter &&
        rowEffectiveDueIso !== dueFilter &&
        formatLongDate(rowDueIso).toLowerCase() !== dueFilter &&
        formatLongDate(rowEffectiveDueIso).toLowerCase() !== dueFilter
      ) {
        return false;
      }
      if (payableFilter) {
        if (payableFilter === "status_write_off") {
          if (row.record.isWriteOff !== true) {
            return false;
          }
        } else if (payableFilter === "status_hatag_hatag") {
          if (!isHatagHatagActive(row.record)) {
            return false;
          }
        } else if (row.record.payableWithin !== payableFilter) {
          return false;
        }
      }
      return true;
    });

  if (sortBy === "pastDue") {
    rows = rows.filter((row) => row.isPastDue);
  }

  rows.sort((a, b) => {
    if (sortBy === "nameAsc") {
      return String(a.record.name || "").localeCompare(String(b.record.name || ""));
    }
    if (sortBy === "nameDesc") {
      return String(b.record.name || "").localeCompare(String(a.record.name || ""));
    }
    if (sortBy === "dateGrantedAsc") {
      return compareIsoDate(a.record.dateGranted, b.record.dateGranted);
    }
    if (sortBy === "dateGrantedDesc") {
      return compareIsoDate(b.record.dateGranted, a.record.dateGranted);
    }
    if (sortBy === "dueDateAsc") {
      return compareIsoDate(a.effectiveDueDate, b.effectiveDueDate);
    }
    if (sortBy === "dueDateDesc") {
      return compareIsoDate(b.effectiveDueDate, a.effectiveDueDate);
    }
    if (sortBy === "payableAsc") {
      return getTypeSortLabel(a.record).localeCompare(getTypeSortLabel(b.record));
    }
    if (sortBy === "pastDue") {
      return compareIsoDate(a.dueDate, b.dueDate);
    }
    return 0;
  });

  return rows;
}

async function exportVisibleRecords() {
  const rows = getVisibleRecords(getRecords());
  if (rows.length === 0) {
    showMessage("No records to export.", "error");
    return;
  }

  const logoDataUrl = await getImageDataUrl("images/mgi_logo.png");
  const todayText = formatUpperDate(toIsoDate(new Date()));
  const totalArrears = rows.reduce((sum, { record }) => sum + computeArrearsAmount(record), 0);
  const totalPaid = rows.reduce((sum, { record }) => sum + getTotalPaidAmount(record), 0);
  const totalCollectible = rows.reduce((sum, { record }) => sum + computeCollectibleAmount(record), 0);

  const headerRow = `
    <tr>
      <th>Name</th>
      <th>Address</th>
      <th>Contact Number</th>
      <th>Amount Collectible</th>
      <th>Amount Paid</th>
      <th>Arrears</th>
      <th>Other Arrears</th>
      <th>Co-maker</th>
      <th>Remarks</th>
    </tr>
  `;

  const bodyRows = rows
    .map(({ record }) => {
      const collectibleAmount = computeCollectibleAmount(record);
      const arrearsAmount = computeArrearsAmount(record);
      const otherArrearsAmount = computeOtherArrearsAmount(record);
      return `
        <tr>
          <td>${sanitize(String(record.name || ""))}</td>
          <td>${sanitize(String(record.address || ""))}</td>
          <td>${sanitize(String(record.contactNumber || ""))}</td>
          <td>${formatCurrency(collectibleAmount)}</td>
          <td>&nbsp;</td>
          <td>${formatPlainAmount(arrearsAmount)}</td>
          <td>${formatPlainAmount(otherArrearsAmount)}</td>
          <td>${sanitize(String(record.coMaker || ""))}</td>
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
            size: auto;
            margin-top: 0cm;
            margin-right: 0cm;
            margin-bottom: 0cm;
            margin-left: 0cm;
          }
          body {
            font-family: "Aptos Display", "Aptos", "Times New Roman", serif;
            font-size: 5pt;
            color: #1a1a1a;
            margin: 0;
            background: #ffffff;
          }
          .sheet {
            padding: 18px 20px 14px;
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
            font-size: 9pt;
            line-height: 1.2;
            text-transform: uppercase;
          }
          .doc-subtitle {
            margin: 7px 0 0;
            font-size: 10pt;
            font-weight: 700;
            letter-spacing: 0.4px;
            text-transform: uppercase;
          }
          .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 0 0 10px;
          }
          .summary-box {
            border: 1px solid #9eb6ce;
            background: #f4f8f5;
            padding: 7px 8px;
          }
          .summary-label {
            display: block;
            font-size: 9pt;
            text-transform: uppercase;
            color: #426458;
            margin-bottom: 2px;
          }
          .summary-value {
            display: block;
            font-size: 11pt;
            font-weight: 700;
            color: #163b2c;
          }
          .records-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .records-table th, .records-table td {
            border: 1px solid #9eb6ce;
            padding: 4px 5px;
            font-size: 5pt;
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
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="doc-header">
            ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="MGI logo" width="72" height="72" style="width:72px;height:72px;display:block;margin:0 auto 8px;" />` : ""}
            <p class="title">Morris Gilbert Inso - Credit Services</p>
            <div class="meta">${sanitize(todayText)}</div>
            <div class="meta">${sanitize(EXPORT_ADDRESS_TEXT)}</div>
            <p class="doc-subtitle">Daily Collection Summary</p>
          </div>
          <table class="summary-table" role="presentation">
            <tr>
              <td class="summary-box">
                <span class="summary-label">Collectible Total</span>
                <span class="summary-value">${formatCurrency(totalCollectible)}</span>
              </td>
            </tr>
          </table>
          <table class="records-table" border="1">${headerRow}${bodyRows}</table>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `loan_records_${toIsoDate(new Date())}.doc`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Exported Word file", "success");
}

async function exportToExcel() {
  const rows = getVisibleRecords(getRecords());
  if (rows.length === 0) {
    showMessage("No records to export.", "error");
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

  const csvRows = rows.map(({ record }) => {
    const paymentHistory = getPaymentHistory(record) || [];
    const paymentSummary = paymentHistory.length > 0
      ? paymentHistory.map((p) => `${formatUpperDate(toIsoDate(new Date(p.date || "")))}: ${formatWholeAmount(p.amount || 0)}`).join("; ")
      : "No payments";
    
    // Extract numeric values without formatting for proper CSV handling
    const amount = Number(record.amount || 0);
    const interest = Number(record.interestRate || 0);
    const outstanding = getOutstandingBreakdown(record).outstandingBalance;
    const arrears = computeArrearsAmount(record);
    const otherArrears = computeOtherArrearsAmount(record);
    
    return [
      escapeCSV(record.name || ""),
      escapeCSV(record.address || ""),
      escapeCSV(record.contactNumber || ""),
      escapeCSV(record.coMaker || ""),
      escapeCSV(record.payableWithin || ""),
      escapeCSV(record.purposeOfLoan || ""),
      formatWholeAmount(amount),
      formatWholeAmount(interest),
      escapeCSV(record.modeOfPayment || ""),
      escapeCSV(formatUpperDate(toIsoDate(new Date(record.dateGranted || "")))),
      escapeCSV(formatUpperDate(toIsoDate(new Date(record.dueDate || "")))),
      formatWholeAmount(outstanding),
      formatWholeAmount(arrears),
      formatWholeAmount(otherArrears),
      escapeCSV(paymentSummary),
    ];
  });

  // Build CSV content
  const csvContent = [
    headers.join(","),
    ...csvRows.map(row => row.join(",")),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mgi_backup_${formatBackupTimestamp(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Exported to Excel", "success");
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

async function downloadFullBackup() {
  const localBackup = collectComprehensiveLocalBackup();

  try {
    const res = await fetchBackupApi();
    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = body?.detail || body?.error || "";
      } catch {
        try {
          detail = (await res.text()).slice(0, 200);
        } catch {}
      }
      throw new Error(`Backup export failed (${res.status})${detail ? `: ${detail}` : ""}`);
    }

    const payload = await res.json();
    const exportedAt = payload?.exportedAt || new Date().toISOString();
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];
    const backupFile = {
      meta: {
        source: "mgi-cs-system",
        mode: "server-full",
        exportedAt,
        totalKeys: rows.length,
        localKeys: Object.keys(localBackup.data).length,
      },
      backupHash: typeof payload?.backupHash === "string" ? payload.backupHash : "",
      rows,
      data: localBackup.data,
    };

    downloadJsonFile(`mgi_backup_${formatBackupTimestamp(new Date())}.json`, backupFile);
    showToast("Full backup downloaded", "success");
    setBackupStatusNote("ok", "Backup status: full backup available");
  } catch (error) {
    console.error("[backup] export failed", error);

    if (localBackup.rows.length > 0 || Object.keys(localBackup.data).length > 0) {
      const fallbackBackup = {
        meta: {
          source: "mgi-cs-system",
          mode: "client-fallback",
          exportedAt: new Date().toISOString(),
          warning: "Server backup unavailable. This file contains all currently available MGI local data.",
          totalKeys: localBackup.rows.length,
          localKeys: Object.keys(localBackup.data).length,
        },
        rows: localBackup.rows,
        data: localBackup.data,
      };

      downloadJsonFile(`mgi_backup_local_${formatBackupTimestamp(new Date())}.json`, fallbackBackup);
      showMessage("Server backup unavailable. Downloaded full local system backup instead.", "error");
      showToast("Local backup downloaded", "success");
      setBackupStatusNote("warning", "Backup status: local-only fallback mode");
      return;
    }

    showMessage("Backup failed. Server backup is unavailable and no local backup data is available.", "error");
    showToast("Backup failed", "error");
    setBackupStatusNote("warning", "Backup status: backup unavailable");
  }
}

async function readBackupImportError(res) {
  let detail = "";
  try {
    const body = await res.json();
    detail = body?.detail || body?.error || "";
  } catch {
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      detail = "";
    }
  }
  return detail;
}

async function restoreBackupRowsViaStateApi(rows) {
  let restored = 0;
  const failures = [];

  for (const row of rows) {
    const rowId = String(row?.id || "").trim();
    const payload = row?.payload;

    if (!rowId || !Array.isArray(payload)) {
      failures.push(`${rowId || "(missing id)"}: payload must be an array`);
      continue;
    }

    try {
      const res = await fetchStateApi(rowId, {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      }, false);

      if (!res.ok) {
        const detail = await readBackupImportError(res);
        failures.push(`${rowId}: ${res.status}${detail ? ` ${detail}` : ""}`);
        continue;
      }

      restored += 1;
    } catch (error) {
      failures.push(`${rowId}: ${error instanceof Error ? error.message : "network error"}`);
    }
  }

  return {
    restored,
    failures,
  };
}

async function importBackupRows(rows, backupHash) {
  const res = await postBackupImportApi({
    rows,
    replace: true,
    backupHash,
  });

  if (res.ok) {
    return { ok: true, retriedWithoutHash: false };
  }

  const detail = await readBackupImportError(res);
  const detailLower = detail.toLowerCase();
  const canRetryWithoutHash = Boolean(backupHash) && (
    detailLower.includes("integrity") ||
    detailLower.includes("hash") ||
    detailLower.includes("tamper")
  );

  if (canRetryWithoutHash) {
    const retryRes = await postBackupImportApi({
      rows,
      replace: true,
    });

    if (retryRes.ok) {
      return { ok: true, retriedWithoutHash: true };
    }

    const retryDetail = await readBackupImportError(retryRes);
    throw new Error(`Restore failed (${retryRes.status})${retryDetail ? `: ${retryDetail}` : ""}`);
  }

  throw new Error(`Restore failed (${res.status})${detail ? `: ${detail}` : ""}`);
}

async function restoreBackupFromFile(file) {
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const localBackupData = parsed?.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
      ? parsed.data
      : null;
    const rows = Array.isArray(parsed?.rows) ? parsed.rows : buildBackupRowsFromLocalData(localBackupData || {});

    if (rows.length === 0 && !localBackupData) {
      showMessage("Invalid backup file: no restorable data found.", "error");
      showToast("Restore failed", "error");
      return;
    }

    const hasInvalidRow = rows.some((row) => !row || typeof row.id !== "string" || !Object.prototype.hasOwnProperty.call(row, "payload"));
    if (hasInvalidRow) {
      showMessage("Invalid backup file format.", "error");
      showToast("Restore failed", "error");
      return;
    }

    const confirmed = window.confirm(
      `Restore full system backup with ${rows.length} server key(s) and ${Object.keys(localBackupData || {}).length} local key(s)?\n\nThis will replace current server data with the backup snapshot.`
    );
    if (!confirmed) {
      return;
    }

    let serverRestoreMessage = "";
    if (rows.length > 0) {
      try {
        const importResult = await importBackupRows(
          rows,
          typeof parsed?.backupHash === "string" ? parsed.backupHash : undefined
        );
        if (importResult.retriedWithoutHash) {
          serverRestoreMessage = " Server restore succeeded after skipping backup hash verification.";
        }
      } catch (error) {
        const stateFallbackResult = await restoreBackupRowsViaStateApi(rows);
        if (stateFallbackResult.restored > 0) {
          const failureSuffix = stateFallbackResult.failures.length > 0
            ? ` Some keys still failed: ${stateFallbackResult.failures.slice(0, 3).join(" | ")}`
            : "";
          serverRestoreMessage = ` Server restore used per-key fallback for ${stateFallbackResult.restored}/${rows.length} key(s).${failureSuffix}`;
        } else if (!localBackupData) {
          throw error;
        } else {
          serverRestoreMessage = ` Server restore skipped: ${error instanceof Error ? error.message : "unknown error"}.`;
        }
      }
    }

    const restoredLocalKeys = restoreComprehensiveLocalBackup(localBackupData);

    await loadRecordsFromServer();
    renderRecords();
    await refreshBackupHealthStatus();
    if (serverRestoreMessage) {
      const localMessage = restoredLocalKeys > 0 ? ` Local restore applied to ${restoredLocalKeys} key(s).` : "";
      showMessage(`Backup restore completed with fallback.${serverRestoreMessage}${localMessage}`, "success");
      showToast("Restore completed with fallback", "success");
    } else {
      showMessage("Full system backup restored successfully.", "success");
      showToast("Full restore complete", "success");
    }
  } catch (error) {
    console.error("[backup] restore failed", error);
    const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
    showMessage(`Backup restore failed.${detail}`, "error");
    showToast("Restore failed", "error");
  } finally {
    if (restoreBackupInput) {
      restoreBackupInput.value = "";
    }
  }
}

async function exportStatementOfAccount(record) {
  const logoDataUrl = await getImageDataUrl("images/mgi_logo.png");
  const dueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const payDate = record.payDate || dueDate;
  const collectibleAmount = computeCollectibleAmount(record);
  const arrearsAmount = computeArrearsAmount(record);
  const otherArrearsAmount = computeOtherArrearsAmount(record);
  const arrearsType = record.arrearsType === "Principal" ? "Principal" : "Interest";
  const otherArrearsType = record.otherArrearsType === "Principal" ? "Principal" : "Interest";
  const totalPaidAmount = getTotalPaidAmount(record);
  const totalPayable = computeCurrentTotalPayable(record);
  const outstandingBalance = getOutstandingBreakdown(record).outstandingBalance;
  const paymentHistory = getPaymentHistory(record);
  const currentBalance = outstandingBalance;
  const printableRemarks = String(record.remarks || "").trim() || "No remarks";
  const hasCoMaker = Boolean(String(record.coMaker || "").trim());

  let runningBalanceAfterPayment = currentBalance;
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
              <td>${formatCurrency(currentBalance)}</td>
            </tr>
      `;

  const coMakerDetailsRows = hasCoMaker
    ? `
            <tr>
              <td class="details-label">Co-maker</td>
              <td>${sanitize(String(record.coMaker || "-"))}</td>
              <td class="details-label">Interest Rate</td>
              <td>${Math.round(Number(record.interestRate || 0))}%</td>
            </tr>
            <tr>
              <td class="details-label">Co-maker Contact Number</td>
              <td>${sanitize(String(record.coMakerContactNumber || "-"))}</td>
              <td class="details-label">Co-maker Address</td>
              <td>${sanitize(String(record.coMakerAddress || "-"))}</td>
            </tr>
      `
    : `
            <tr>
              <td class="details-label">Interest Rate</td>
              <td>${Math.round(Number(record.interestRate || 0))}%</td>
              <td class="details-label">Date Granted</td>
              <td>${sanitize(formatLongDate(record.dateGranted))}</td>
            </tr>
      `;

  const wordHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: auto;
            margin-top: 0cm;
            margin-right: 0cm;
            margin-bottom: 0cm;
            margin-left: 0cm;
          }
          body {
            font-family: "Aptos Display", "Aptos", "Times New Roman", serif;
            font-size: 7.5pt;
            color: #1a1a1a;
            margin: 0;
            min-height: 100vh;
          }
          .sheet {
            padding: 20px 24px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .doc-header {
            text-align: center;
            margin-bottom: 14px;
            border-bottom: 1px solid #6f8f83;
            padding-bottom: 10px;
          }
          .logo {
            width: 44px;
            height: 44px;
            display: block;
            margin: 0 auto 4px;
          }
          .title,
          .meta,
          .doc-name {
            margin: 0;
            text-transform: uppercase;
          }
          .title {
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.3px;
          }
          .meta {
            font-size: 7.5pt;
            line-height: 1.2;
          }
          .doc-name {
            margin-top: 9px;
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.4px;
          }
          .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 0 0 12px;
          }
          .summary-box {
            border: 1px solid #9eb6ce;
            background: #f4f8f5;
            padding: 8px 10px;
          }
          .summary-label {
            display: block;
            font-size: 7.5pt;
            color: #426458;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .summary-value {
            display: block;
            font-size: 7.5pt;
            font-weight: 700;
            color: #163b2c;
          }
          .transaction-table,
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .transaction-table th,
          .transaction-table td,
          .details-table td {
            border: 1px solid #9eb6ce;
            padding: 6px 7px;
            font-size: 7.5pt;
            vertical-align: top;
          }
          .transaction-table th {
            background: #d7e6de;
            text-align: left;
          }
          .transaction-table td.value {
            font-weight: 700;
            color: #163b2c;
          }
          .details-label {
            width: 22%;
            font-weight: 700;
            background: #d7e6de;
          }
          .remarks-box {
            margin-top: 10px;
            border: 1px solid #9eb6ce;
            background: #fbfcfb;
            padding: 8px 10px;
          }
          .remarks-title {
            margin: 0 0 4px;
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #163b2c;
          }
          .remarks-text {
            margin: 0;
            font-size: 7.5pt;
            line-height: 1.3;
          }
          .section-title {
            margin: 12px 0 4px;
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #163b2c;
          }
          .signature-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 12px 0;
            margin-top: auto;
            padding-top: 18px;
          }
          .signature-cell {
            width: 25%;
            text-align: center;
            vertical-align: top;
            font-size: 7.5pt;
          }
          .signature-line {
            border-top: 1px solid #1a1a1a;
            height: 20px;
            margin-bottom: 4px;
          }
          .signature-name {
            font-weight: 700;
          }
          .signature-role {
            margin-top: 2px;
            text-transform: uppercase;
            color: #426458;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="doc-header">
            ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="MGI logo" width="44" height="44" style="width:44px;height:44px;display:block;margin:0 auto 4px;" />` : ""}
            <p class="title">Morris Gilbert Inso - Credit Services</p>
            <p class="meta">${sanitize(EXPORT_ADDRESS_TEXT)}</p>
            <p class="meta">${sanitize(formatUpperDate(toIsoDate(new Date())))}</p>
            <p class="doc-name">Statement of Account</p>
          </div>

          <table class="summary-table" role="presentation">
            <tr>
              <td class="summary-box">
                <span class="summary-label">Total Payable</span>
                <span class="summary-value">${formatCurrency(totalPayable)}</span>
              </td>
              <td class="summary-box">
                <span class="summary-label">Outstanding Balance</span>
                <span class="summary-value">${formatCurrency(outstandingBalance)}</span>
              </td>
            </tr>
          </table>

          <table class="details-table">
            <tr>
              <td class="details-label">Client Name</td>
              <td>${sanitize(String(record.name || ""))}</td>
              <td class="details-label">Type</td>
              <td>${sanitize(getTypeLabel(record.payableWithin))}</td>
            </tr>
            <tr>
              <td class="details-label">Address</td>
              <td>${sanitize(String(record.address || "-"))}</td>
              <td class="details-label">Contact Number</td>
              <td>${sanitize(String(record.contactNumber || "-"))}</td>
            </tr>
            ${coMakerDetailsRows}
            <tr>
              <td class="details-label">Loan Amount</td>
              <td>${formatPlainAmount(record.amount)}</td>
              <td class="details-label">Due Date</td>
              <td>${sanitize(formatLongDate(dueDate))}</td>
            </tr>
            <tr>
              <td class="details-label">Moved Pay Date</td>
              <td>${sanitize(formatLongDate(payDate))}</td>
              <td class="details-label">Status</td>
              <td>${arrearsAmount > 0 || otherArrearsAmount > 0 ? "With Arrears" : "Updated"}</td>
            </tr>
            <tr>
              <td class="details-label">Collectible</td>
              <td>${formatPlainAmount(collectibleAmount)} (${sanitize(getCollectibleLabelForRecord(record))})</td>
              <td class="details-label">Arrears</td>
              <td>${formatPlainAmount(arrearsAmount)} (${sanitize(arrearsType)})</td>
            </tr>
            <tr>
              <td class="details-label">Other Arrears</td>
              <td>${formatPlainAmount(otherArrearsAmount)} (${sanitize(otherArrearsType)})</td>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td class="details-label">Total Payable</td>
              <td>${formatPlainAmount(totalPayable)}</td>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td class="details-label">Outstanding Balance</td>
              <td>${formatPlainAmount(outstandingBalance)}</td>
              <td class="details-label">Payment Count</td>
              <td>${paymentHistory.length}</td>
            </tr>
            <tr>
              <td class="details-label">Remarks</td>
              <td>${sanitize(printableRemarks)}</td>
              <td class="details-label">Purpose of Loan</td>
              <td>${sanitize(String(record.purposeOfLoan || "-"))}</td>
            </tr>
            <tr>
              <td class="details-label">Mode of Payment</td>
              <td>${sanitize(String(record.modeOfPayment || "-"))}</td>
              <td class="details-label">Loan Type</td>
              <td>${sanitize(getTypeLabel(record.payableWithin))}</td>
            </tr>
          </table>

          <p class="section-title">Payment Transaction</p>
          <table class="transaction-table">
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Remaining</th>
            </tr>
            ${transactionHistoryRows}
          </table>

          <table class="signature-table" role="presentation">
            <tr>
              <td class="signature-cell">
                <div class="signature-line"></div>
                <div class="signature-name">Morris Gilbert Inso</div>
                <div class="signature-role">Certified Correct</div>
              </td>
              <td class="signature-cell">
                <div class="signature-line"></div>
                <div class="signature-name">Kimberly A. Puntual</div>
                <div class="signature-role">Computed</div>
              </td>
              <td class="signature-cell">
                <div class="signature-line"></div>
                <div class="signature-name">Nelly Miramon</div>
                <div class="signature-role">Reviewed</div>
              </td>
              <td class="signature-cell">
                <div class="signature-line"></div>
                <div class="signature-name">Joan Odessa Mae Igno</div>
                <div class="signature-role">Encoded</div>
              </td>
            </tr>
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
  showToast("Statement of account exported", "success");
}

function showToast(text, type) {
  if (!toast) {
    return;
  }

  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.className = `toast show ${type}`;
  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 1500);
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

function requestWriteOffPassword(actionLabel = "Write-Off", customDescription = "") {
  if (!writeOffModal || !writeOffPasswordInput) {
    const fallback = window.prompt(`Enter password to confirm ${actionLabel}:`);
    return Promise.resolve(fallback);
  }

  const mode = String(actionLabel || "Write-Off");
  const isHatag = mode.toLowerCase().includes("hatag");
  if (writeOffTitle) {
    writeOffTitle.textContent = `Confirm ${mode}`;
  }
  if (writeOffConfirmBtn) {
    writeOffConfirmBtn.textContent = `Confirm ${mode}`;
  }
  if (writeOffDescription) {
    writeOffDescription.textContent = customDescription || (isHatag
      ? "Enter password to activate Hatag-Hatag and freeze interest growth."
      : "Enter password to activate write-off and freeze interest growth.");
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

function closePaymentHistoryModal() {
  if (!paymentHistoryModal) {
    return;
  }
  paymentHistoryModal.classList.remove("show");
  paymentHistoryModal.setAttribute("aria-hidden", "true");
}

function openPaymentHistoryModal(record, paymentHistory) {
  if (!paymentHistoryModal || !paymentHistoryContent) {
    return;
  }

  const isHatagMode = isHatagHatagActive(record);
  if (paymentHistoryTitle) {
    paymentHistoryTitle.textContent = `Payment History - ${record.name}`;
  }

  if (paymentHistory.length === 0) {
    paymentHistoryContent.innerHTML = '<p class="payment-history-empty">No payment history yet.</p>';
    paymentHistoryModal.classList.add("show");
    paymentHistoryModal.setAttribute("aria-hidden", "false");
    return;
  }

  let totalPaid = 0;
  let totalRebate = 0;
  const rows = [...paymentHistory]
    .reverse()
    .map((item, idx) => {
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
          <span>${sanitize(formatLongDate(item.date))}</span>
          <span>${amountDisplay}</span>
          <span>P: ${formatCurrency(principalPaid)}</span>
          <span>I: ${formatCurrency(interestPaid)}</span>
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
      </div>
      ${rows}
    </div>
    <div class="payment-history-total">Total Paid: <strong>${formatCurrency(totalPaid)}</strong><br />Total Rebate: <strong>${formatCurrency(totalRebate)}</strong></div>
  `;

  paymentHistoryModal.classList.add("show");
  paymentHistoryModal.setAttribute("aria-hidden", "false");
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
  if (paymentEntryPreview) {
    paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(0)} | Principal ${formatCurrency(0)}`;
  }
  if (paymentEntryError) {
    paymentEntryError.textContent = "";
  }
}

function openPaymentConfirmModal(rowIndex, amount, mode = PAYMENT_MODE_STANDARD) {
  pendingPaymentConfirm = { rowIndex, amount, mode };
  if (paymentConfirmText) {
    const actionLabel = mode === PAYMENT_MODE_PRINCIPAL_ONLY ? "principal-only payment" : "payment";
    paymentConfirmText.textContent = `Confirm ${actionLabel} of ${formatCurrency(amount)}?`;
  }
  if (paymentConfirmAmount) {
    paymentConfirmAmount.textContent = formatCurrency(amount);
  }
  paymentConfirmModal?.classList.add("show");
  paymentConfirmModal?.setAttribute("aria-hidden", "false");
}

function closePaymentConfirmModal() {
  pendingPaymentConfirm = null;
  paymentConfirmModal?.classList.remove("show");
  paymentConfirmModal?.setAttribute("aria-hidden", "true");
}

function updatePaymentEntryPreview() {
  if (!paymentEntryPreview) {
    return;
  }

  const records = getRecords();
  const record = records[paymentEntryRowIndex];
  if (!record) {
    paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(0)} | Principal ${formatCurrency(0)}`;
    return;
  }

  const amount = parseAmount(paymentEntryInput?.value || "0");
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
    paymentEntrySubtitle.textContent = `Borrower: ${record.name} | Mode: ${getPaymentModeLabel(mode)}`;
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

function renderRecords() {
  const records = getRecords();
  const viewRecords = getRecordsForCurrentDashboardView(records);
  const rows = getVisibleRecords(records);
  const activeFilters = getActiveFilterSnapshot();
  updateReleasedSummaryStats();
  console.debug("[render][main] Rendering records", {
    totalRecords: viewRecords.length,
    visibleRows: rows.length,
    filters: {
      name: activeFilters.name,
      dateGranted: activeFilters.dateGranted,
      dueDate: activeFilters.dueDate,
      payable: activeFilters.payable,
      sortBy: activeFilters.sortBy,
    },
    time: new Date().toISOString(),
  });

  const filtersSummary = `name=${activeFilters.name || "(none)"}, granted=${activeFilters.dateGranted || "(none)"}, due=${activeFilters.dueDate || "(none)"}, payable=${activeFilters.payable || "(none)"}, sort=${activeFilters.sortBy}`;

  if (viewRecords.length === 0) {
    setDiagnosticsPanel(
      "warning",
      isSettledDashboardView ? "No settled accounts found yet." : "No records found in server database yet.",
      latestSyncIssue || filtersSummary
    );
  }

  if (rows.length === 0) {
    pruneSettledRecordSelection([]);
    body.innerHTML = `<tr><td colspan="7" class="empty">${isSettledDashboardView ? "No settled accounts yet." : "No records yet."}</td></tr>`;
    const hasActiveFilter = hasActiveFilters(activeFilters);

    if (viewRecords.length > 0 && hasActiveFilter) {
      setDiagnosticsPanel(
        "error",
        "Records exist but current filters hide them.",
        `Tip: click Reset Filters. Active filters: ${filtersSummary}`
      );
    } else if (viewRecords.length > 0) {
      setDiagnosticsPanel(
        "warning",
        "Records exist but nothing is currently visible.",
        latestSyncIssue || filtersSummary
      );
    }

    initializeDatePickers();
    return;
  }

  pruneSettledRecordSelection(viewRecords);

  body.innerHTML = rows
    .map(
      ({ record, index, dueDate, effectiveDueDate, isPastDue, daysPastDue }) => {
        const payDate = effectiveDueDate;
        const totalPaidAmount = getTotalPaidAmount(record);
        const paymentHistory = getPaymentHistory(record);
        const collectibleAmount = computeCollectibleAmount(record);
        const collectiblePeriod = getCollectiblePeriodForRecord(record);
        const arrearsAmount = computeArrearsAmount(record);
        const otherArrearsAmount = computeOtherArrearsAmount(record);
        const paymentBreakdown = getOutstandingBreakdown(record);
        const rebateAmount = getRebateAmount(record);
        const latestRebateHistory = paymentHistory.find((item) => Number(item?.rebateApplied || 0) > 0);
        const rebateDisplayAmount = paymentBreakdown.rebateAmount > 0
          ? paymentBreakdown.rebateAmount
          : Math.max(0, Number(latestRebateHistory?.rebateApplied || 0));
        const arrearsType = record.arrearsType === "Principal" ? "Principal" : "Interest";
        const otherArrearsType = record.otherArrearsType === "Principal" ? "Principal" : "Interest";
        const isWriteOffActive = record.isWriteOff === true;
        const writeOffFreezeDate = String(record.writeOffDate || "").trim();
        const hatagHatagActive = isHatagHatagActive(record);
        const hatagHatagDate = String(record.hatagHatagDate || "").trim();
        const settledActive = isSettledRecord(record);
        const isChecked = selectedSettledRecordFingerprints.has(buildRecordFingerprint(record));
        const settledDate = String(record.settledDate || "").trim();
        const escapedRemarks = sanitize(record.remarks || "");
        const paymentCount = paymentHistory.length;
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
          <div class="amount-info-rate">Interest rate: <span class="amount-info-rate-value">${Math.round(getEffectiveInterestRate(record))}%</span></div>
          <div class="amount-info-line"><b>Grant Amount:</b> <span class="grant-amount-value">${formatCurrency(record.amount)}</span></div>
          <div class="amount-info-line"><b>Date Granted:</b> ${formatLongDate(record.dateGranted)}</div>
          <button type="button" class="btn-secondary due-date-display-btn ${isPastDue ? "past-due-cell" : ""}" data-index="${index}">Due Date: ${formatLongDate(dueDate)}</button>
          <input type="date" class="due-date-input due-date-input-hidden" data-index="${index}" value="${dueDate}" />
          ${
            isWeeklyFixedLoan(record.payableWithin)
              ? `<div class="paid-controls"><input type="text" class="weekly-amount-input" data-index="${index}" value="${addCommas(formatPlainAmount(record.amount))}" inputmode="decimal" autocomplete="off" /><button type="button" class="btn-secondary save-weekly-settings-btn" data-index="${index}">Save Weekly</button></div>`
              : ""
          }
          <button type="button" class="btn-secondary collectible-display-btn" data-index="${index}">${formatCurrency(collectibleAmount)}/${getCollectibleLabelForRecord(record)}</button>
          ${isPastDue ? `<small class="mini-note past-due-note">Past Due (${daysPastDue} day${daysPastDue === 1 ? "" : "s"})</small>` : ""}
          <div class="paid-controls collectible-editor collectible-editor-hidden" data-index="${index}">
            <input type="text" class="collectible-edit-input" data-index="${index}" value="${addCommas(formatPlainAmount(collectibleAmount))}" inputmode="decimal" autocomplete="off" />
            <select class="collectible-period-select" data-index="${index}">
              <option value="Daily" ${collectiblePeriod === "Daily" ? "selected" : ""}>Daily</option>
              <option value="Weekly" ${collectiblePeriod === "Weekly" ? "selected" : ""}>Weekly</option>
              <option value="Bi-Monthly" ${collectiblePeriod === "Bi-Monthly" ? "selected" : ""}>Bi-Monthly</option>
              <option value="Monthly" ${collectiblePeriod === "Monthly" ? "selected" : ""}>Monthly</option>
            </select>
            <button type="button" class="btn-secondary save-collectible-btn" data-index="${index}">Save</button>
          </div>
          ${settledActive
            ? `<small class="mini-note settled-note">Settled on ${sanitize(formatLongDate(settledDate || toIsoDate(getReferenceDate())))}</small>`
            : isWriteOffActive
              ? `<small class="mini-note">Write-Off active since ${sanitize(formatLongDate(writeOffFreezeDate))}</small>`
              : hatagHatagActive
                ? `<small class="mini-note">Hatag-Hatag active since ${sanitize(formatLongDate(hatagHatagDate))}</small>`
                : ""
          }
        </td>
        <td>
          <div class="record-adjustment-controls">
            <button type="button" class="btn-primary move-date-display-btn" data-index="${index}">Moved pay date: ${formatLongDate(payDate)}</button>
            <input type="date" class="move-date-input due-date-input-hidden" data-index="${index}" value="${payDate}" />
            <button type="button" class="btn-secondary arrears-display-btn" data-index="${index}">Arrears: ${formatCurrency(arrearsAmount)} (${arrearsType})</button>
            <div class="paid-controls arrears-editor ${openArrearsEditorRowIndex === index ? "" : "arrears-editor-hidden"}" data-index="${index}">
              <small class="mini-note">${arrearsType}</small>
              <input type="text" class="arrears-input" data-index="${index}" value="${addCommas(formatPlainAmount(arrearsAmount))}" inputmode="decimal" autocomplete="off" />
              <select class="arrears-type-select" data-index="${index}">
                <option value="Principal" ${arrearsType === "Principal" ? "selected" : ""}>Principal</option>
                <option value="Interest" ${arrearsType === "Interest" ? "selected" : ""}>Interest</option>
              </select>
              <button type="button" class="btn-secondary save-arrears-btn" data-index="${index}">Save</button>
            </div>
            <button type="button" class="btn-secondary open-remarks-btn" data-index="${index}">${escapedRemarks ? `Remarks: ${escapedRemarks}` : "Remarks"}</button>
            <button type="button" class="btn-secondary other-arrears-display-btn" data-index="${index}">Other Arrears: ${formatCurrency(otherArrearsAmount)} (${otherArrearsType})</button>
            <div class="paid-controls other-arrears-editor ${openOtherArrearsEditorRowIndex === index ? "" : "other-arrears-editor-hidden"}" data-index="${index}">
              <small class="mini-note">${otherArrearsType}</small>
              <input type="text" class="other-arrears-input" data-index="${index}" value="${addCommas(formatPlainAmount(otherArrearsAmount))}" inputmode="decimal" autocomplete="off" />
              <select class="other-arrears-type-select" data-index="${index}">
                <option value="Principal" ${otherArrearsType === "Principal" ? "selected" : ""}>Principal</option>
                <option value="Interest" ${otherArrearsType === "Interest" ? "selected" : ""}>Interest</option>
              </select>
              <button type="button" class="btn-secondary save-other-arrears-btn" data-index="${index}">Save</button>
            </div>
            <div class="remarks-controls remarks-editor ${openRemarksEditorRowIndex === index ? "" : "remarks-editor-hidden"}" data-index="${index}">
              <input type="text" class="remarks-input" data-index="${index}" value="${escapedRemarks}" placeholder="Add remarks..." autocomplete="off" />
              <button type="button" class="btn-secondary save-remarks-btn" data-index="${index}">Save</button>
            </div>
          </div>
        </td>
        <td class="outstanding-balance-cell">
          <span class="mobile-field-label">Outstanding Balance</span>
          <span class="outstanding-balance-value">${formatCurrency(paymentBreakdown.outstandingBalance)}</span>
          <small class="mini-note">Interest: ${formatCurrency(paymentBreakdown.interestOutstanding)}</small>
          ${rebateDisplayAmount > 0 ? `<small class="mini-note rebate-note">Rebate: ${formatCurrency(rebateDisplayAmount)}</small>` : ""}
          ${settledActive ? "" : `<div class="outstanding-btn-row"><button type="button" class="btn-secondary rebate-display-btn" data-index="${index}">Rebate</button><button type="button" class="pay-principal-only-btn" data-index="${index}" ${paymentBreakdown.principalOutstanding <= 0 || hatagHatagActive ? "disabled" : ""}>Pay Principal Only</button></div>`}
          ${settledActive ? "" : `<div class="paid-controls rebate-editor ${openRebateEditorRowIndex === index ? "" : "rebate-editor-hidden"}" data-index="${index}"><input type="text" class="rebate-input" data-index="${index}" value="${addCommas(formatPlainAmount(rebateAmount))}" inputmode="decimal" autocomplete="off" /><button type="button" class="btn-secondary save-rebate-btn" data-index="${index}">Save</button></div>`}
        </td>
        <td>
          <div class="remarks-controls">
            ${settledActive ? "" : `<button type="button" class="btn-pay save-paid-btn" data-index="${index}">Pay</button>`}
            <button type="button" class="btn-secondary show-payment-history-btn" data-index="${index}">Show Payment History</button>
            <button type="button" class="btn-secondary statement-btn" data-index="${index}">Statement of Account</button>
            ${settledActive ? "" : `<button type="button" class="btn-danger write-off-btn" data-index="${index}" ${isWriteOffActive || hatagHatagActive ? "disabled" : ""}>${
              isWriteOffActive ? "Write-Off Active" : "Write-Off"
            }</button>`}
            ${settledActive ? "" : `<button type="button" class="btn-hatag-hatag hatag-hatag-btn" data-index="${index}" ${hatagHatagActive || isWriteOffActive ? "disabled" : ""}>${
              hatagHatagActive ? "Hatag-Hatag Active" : "Hatag-Hatag"
            }</button>`}
            ${settledActive ? "" : `<button type="button" class="btn-secondary settle-btn" data-index="${index}">Settle</button>`}
          </div>
        </td>
        <td class="settled-select-cell">
          ${settledActive ? `<label class="settled-select-control"><input type="checkbox" class="settled-record-checkbox" data-index="${index}" aria-label="Select settled account" ${isChecked ? "checked" : ""} /></label>` : ""}
        </td>
      </tr>
    `;
      }
    )
    .join("");

  initializeDatePickers();
  setDiagnosticsPanel("ok", `Showing ${rows.length} visible record${rows.length === 1 ? "" : "s"} from ${viewRecords.length} total in this dashboard.`, latestSyncIssue || filtersSummary);
}

function applyDashboardViewState() {
  document.body.classList.toggle("settled-dashboard-view", isSettledDashboardView);

  if (recordsSectionTitle) {
    recordsSectionTitle.textContent = isSettledDashboardView ? "Settled Accounts" : "Active Accounts";
  }

  updateSettledDeleteButtonState();

  if (toggleLoanEntryBtn) {
    toggleLoanEntryBtn.classList.toggle("is-hidden", isSettledDashboardView);
  }

  dashboardViewLinks.forEach((link) => {
    link.classList.toggle("drawer-link--active", link.dataset.dashboardView === currentDashboardView);
  });

  document.title = isSettledDashboardView ? "Morris Gilbert Inso - Settled Accounts" : "Morris Gilbert Inso - Credit Services";
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function isDashboard2Page() {
  try {
    return String(window.location.pathname || "").toLowerCase().endsWith("/dashboard2.html")
      || String(window.location.pathname || "").toLowerCase().endsWith("dashboard2.html");
  } catch {
    return document.body?.classList.contains("dashboard2") === true;
  }
}

function sanitize(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatName(lastName, firstName, middleInitial) {
  const cleanLast = sanitize(lastName.trim());
  const cleanFirst = sanitize(firstName.trim());
  const cleanMiddle = sanitize(middleInitial.trim().charAt(0).toUpperCase());

  if (!cleanMiddle) {
    return `${cleanLast}, ${cleanFirst}`;
  }

  return `${cleanLast}, ${cleanFirst}, ${cleanMiddle}.`;
}

function updateCoMakerFieldsVisibility() {
  const hasCoMaker = Boolean((coMakerInput?.value || "").trim());

  coMakerContactWrap?.classList.toggle("is-hidden", !hasCoMaker);
  coMakerAddressWrap?.classList.toggle("is-hidden", !hasCoMaker);

  if (!hasCoMaker) {
    if (coMakerContactNumberInput) {
      coMakerContactNumberInput.value = "";
    }
    if (coMakerAddressInput) {
      coMakerAddressInput.value = "";
    }
  }
}

function updatePortfolioButtonVisibility() {
  // Portfolio button removed from main dashboard - only accessible via portfolio login
}

function updateLoanEntryVisibility(open) {
  if (!loanEntryPanel || !toggleLoanEntryBtn || !mainContainer) {
    return;
  }

  isLoanEntryOpen = Boolean(open);
  loanEntryPanel.classList.toggle("is-collapsed", !isLoanEntryOpen);
  loanEntryPanel.setAttribute("aria-hidden", String(!isLoanEntryOpen));
  mainContainer.classList.toggle("form-hidden", !isLoanEntryOpen);
  toggleLoanEntryBtn.setAttribute("aria-expanded", String(isLoanEntryOpen));
  toggleLoanEntryBtn.textContent = isLoanEntryOpen ? "Hide Loan Application" : "Loan Application";
}

function updateReleaseSummaryVisibility(open) {
  if (!releaseSummaryPanel || !toggleReleaseSummaryBtn) {
    return;
  }

  isReleaseSummaryOpen = Boolean(open);
  releaseSummaryPanel.classList.toggle("is-collapsed", !isReleaseSummaryOpen);
  releaseSummaryPanel.setAttribute("aria-hidden", String(!isReleaseSummaryOpen));
  toggleReleaseSummaryBtn.setAttribute("aria-expanded", String(isReleaseSummaryOpen));
  toggleReleaseSummaryBtn.textContent = isReleaseSummaryOpen ? "Hide Released Summary" : "Released Summary";
}

function hideLoadingScreen() {
  if (!loadingScreen) {
    return;
  }
  loadingScreen.classList.add("hidden");
  document.body.classList.remove("login-locked");
}

function setLoginMessage(text, isSuccess) {
  if (!loginMessage) {
    return;
  }
  loginMessage.textContent = text;
  loginMessage.classList.toggle("success", Boolean(isSuccess));
}

function authenticateUser(username, password) {
  const auth = getAuthSettings();
  if (username === auth.mainUsername && password === auth.mainPassword) {
    return "main";
  }
  if (
    (username === auth.dashboard2Username && password === auth.dashboard2Password)
    || (username === DEFAULT_AUTH_SETTINGS.dashboard2Username && password === DEFAULT_AUTH_SETTINGS.dashboard2Password)
  ) {
    return "dashboard2";
  }
  if (username === auth.portfolioUsername && password === auth.portfolioPassword) {
    return "portfolio";
  }
  return null;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const lastName = (formData.get("lastName") || "").toString().trim();
  const firstName = (formData.get("firstName") || "").toString().trim();
  const middleInitial = (formData.get("middleInitial") || "").toString().trim();
  const address = (formData.get("address") || "").toString().trim();
  const coMaker = (formData.get("coMaker") || "").toString().trim();
  const coMakerContactNumber = (formData.get("coMakerContactNumber") || "").toString().trim();
  const coMakerAddress = (formData.get("coMakerAddress") || "").toString().trim();
  const contactNumber = (formData.get("contactNumber") || "").toString().trim();
  const purposeOfLoan = (formData.get("purposeOfLoan") || "").toString().trim();
  const amountRaw = (formData.get("amount") || "").toString().trim();
  const amount = parseAmount(amountRaw);
  const dateGranted = (formData.get("dateGranted") || "").toString();
  const payableWithin = (formData.get("payableWithin") || "").toString();
  const selectedModeOfPayment = (formData.get("modeOfPayment") || modeOfPaymentSelect?.value || "").toString().trim();
  const modeOfPayment = isBiMonthlyAutoLoan(payableWithin)
    ? "Bi-Monthly"
    : (isWeeklyFixedLoan(payableWithin) || isMonthly100FixedLoan(payableWithin))
      ? "Weekly"
      : selectedModeOfPayment;
  const interestRateRaw = (formData.get("interestRate") || "").toString().trim();
  const interestRate = Number(interestRateRaw);

  const missingFields = [];
  if (!lastName) {
    missingFields.push("Last Name");
  }
  if (!firstName) {
    missingFields.push("First Name");
  }
  if (!purposeOfLoan) {
    missingFields.push("Purpose of Loan");
  }
  if (!amountRaw) {
    missingFields.push("Loan Amount");
  }
  if (!dateGranted) {
    missingFields.push("Date Granted");
  }
  if (!modeOfPayment && !(isWeeklyFixedLoan(payableWithin) || isMonthly100FixedLoan(payableWithin) || isBiMonthlyAutoLoan(payableWithin))) {
    missingFields.push("Mode of Payment");
  }
  if (!payableWithin) {
    missingFields.push("Type");
  }
  if (!interestRateRaw && !isMonthly60FixedLoan(payableWithin)) {
    missingFields.push("Interest Rate (%)");
  }

  if (missingFields.length > 0) {
    showMessage(`Please fill in: ${missingFields.join(", ")}.`, "error");
    return;
  }

  if (middleInitial && !/^[A-Za-z]$/.test(middleInitial)) {
    showMessage("Middle Initial must be one letter.", "error");
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage("Loan amount must be greater than 0.", "error");
    return;
  }

  const effectiveInterestRate = isMonthly60FixedLoan(payableWithin) ? 10 : interestRate;

  if (!Number.isFinite(effectiveInterestRate) || effectiveInterestRate < 0) {
    showMessage("Interest rate cannot be negative.", "error");
    return;
  }

  const totalPayable = amount + amount * (effectiveInterestRate / 100);
  const dueDate = computeDueDate(dateGranted, payableWithin);

  const nextRecord = {
    name: formatName(lastName, firstName, middleInitial),
    address: sanitize(address),
    coMaker: sanitize(coMaker),
    coMakerContactNumber: sanitize(coMakerContactNumber),
    coMakerAddress: sanitize(coMakerAddress),
    contactNumber: sanitize(contactNumber),
    purposeOfLoan: sanitize(purposeOfLoan),
    modeOfPayment: sanitize(modeOfPayment),
    amount,
    dateGranted,
    dueDate,
    payDate: dueDate,
    payableWithin,
    interestRate: effectiveInterestRate,
    totalPayable,
    paymentHistory: [],
  };

  const records = getRecords();
  records.unshift(nextRecord);
  setRecords(records);
  saveAddressSuggestions(address, coMakerAddress);
  renderRecords();

  form.reset();
  updateCoMakerFieldsVisibility();
  showMessage("Loan record saved.", "success");
  showToast("Loan record saved", "success");
});

clearBtn?.addEventListener("click", () => {
  if (isSettledDashboardView) {
    deleteSelectedSettledRecords();
    return;
  }

  const records = getRecords();
  if (records.length === 0) {
    showMessage("No records to delete.", "error");
    return;
  }

  const confirmed = window.confirm("Delete all records?");
  if (!confirmed) {
    return;
  }

  setRecords([]);
  renderRecords();
  showMessage("All records deleted.", "success");
});

amountInput.addEventListener("input", () => {
  const normalized = normalizeAmountInput(amountInput.value);
  amountInput.value = addCommas(normalized);
});

body.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  // Auto-uppercase inline text inputs (remarks)
  if (target.classList.contains("remarks-input")) {
    const pos = target.selectionStart;
    target.value = target.value.toUpperCase();
    target.setSelectionRange(pos, pos);
  }

  const shouldFormat =
    target.classList.contains("weekly-amount-input") ||
    target.classList.contains("collectible-edit-input") ||
    target.classList.contains("rebate-input") ||
    target.classList.contains("arrears-input") ||
    target.classList.contains("other-arrears-input");

  if (!shouldFormat) {
    return;
  }

  target.value = addCommas(normalizeAmountInput(target.value));

  const rowIndex = Number(target.dataset.index);
  if (Number.isInteger(rowIndex)) {
    updateRowSaveButtonStates(rowIndex);
  }
});

body.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
    return;
  }

  if (target instanceof HTMLInputElement && target.classList.contains("settled-record-checkbox")) {
    const rowIndex = Number(target.dataset.index);
    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record no longer exists.", "error");
      renderRecords();
      return;
    }

    setSettledRecordChecked(record, target.checked);
    return;
  }

  if (target instanceof HTMLInputElement && target.classList.contains("due-date-input")) {
    const rowIndex = Number(target.dataset.index);
    if (Number.isInteger(rowIndex)) {
      saveDueDateForRow(rowIndex, target.value);
    }
    return;
  }

  if (target instanceof HTMLInputElement && target.classList.contains("move-date-input")) {
    const rowIndex = Number(target.dataset.index);
    if (Number.isInteger(rowIndex)) {
      saveMoveDateForRow(rowIndex, target.value);
    }
    return;
  }

  const rowIndex = Number(target.dataset.index);
  if (Number.isInteger(rowIndex)) {
    updateRowSaveButtonStates(rowIndex);
  }
});

body.addEventListener("click", async (event) => {
  const editNameBtn = event.target.closest(".edit-name-btn");
  if (editNameBtn) {
    const rowIndex = Number(editNameBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const currentName = String(records[rowIndex].name || "").trim();
    const updatedName = await requestRecordFieldEdit({
      title: "Edit borrower name:",
      label: "Borrower Name",
      value: currentName,
    });
    if (updatedName === null) {
      return;
    }

    const nextName = updatedName.trim();
    if (!nextName) {
      showMessage("Borrower name cannot be empty.", "error");
      return;
    }

    records[rowIndex].name = nextName;
    setRecords(records);
    renderRecords();
    showMessage("Borrower name updated.", "success");
    showToast("Borrower name updated", "success");
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
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const currentContact = String(records[rowIndex].contactNumber || "").trim();
    const updatedContact = await requestRecordFieldEdit({
      title: "Edit contact number:",
      label: "Contact Number",
      value: currentContact,
    });
    if (updatedContact === null) {
      return;
    }

    const nextContact = updatedContact.trim();
    if (!nextContact) {
      showMessage("Contact number cannot be empty.", "error");
      return;
    }

    records[rowIndex].contactNumber = nextContact;
    setRecords(records);
    renderRecords();
    showMessage("Contact number updated.", "success");
    showToast("Contact number updated", "success");
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
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const currentAddress = String(records[rowIndex].address || "").trim();
    const updatedAddress = await requestRecordFieldEdit({
      title: "Edit address:",
      label: "Address",
      value: currentAddress,
    });
    if (updatedAddress === null) {
      return;
    }

    const nextAddress = updatedAddress.trim();
    if (!nextAddress) {
      showMessage("Address cannot be empty.", "error");
      return;
    }

    records[rowIndex].address = nextAddress;
    setRecords(records);
    saveAddressSuggestions(nextAddress);
    renderRecords();
    showMessage("Address updated.", "success");
    showToast("Address updated", "success");
    return;
  }

  const saveArrearsFromEditor = event.target.closest(".save-arrears-btn");
  const saveOtherArrearsFromEditor = event.target.closest(".save-other-arrears-btn");
  const saveRemarksFromEditor = event.target.closest(".save-remarks-btn");
  const saveRebateFromEditor = event.target.closest(".save-rebate-btn");
  if (
    (event.target.closest(".rebate-editor") || event.target.closest(".arrears-editor") || event.target.closest(".other-arrears-editor") || event.target.closest(".remarks-editor")) &&
    !saveRebateFromEditor &&
    !saveArrearsFromEditor &&
    !saveOtherArrearsFromEditor &&
    !saveRemarksFromEditor
  ) {
    return;
  }

  const rebateDisplayBtn = event.target.closest(".rebate-display-btn");
  if (rebateDisplayBtn) {
    const rowIndex = Number(rebateDisplayBtn.dataset.index);
    if (Number.isInteger(rowIndex)) {
      toggleRebateEditor(rowIndex);
    }
    return;
  }

  const payPrincipalOnlyBtn = event.target.closest(".pay-principal-only-btn");
  if (payPrincipalOnlyBtn) {
    const rowIndex = Number(payPrincipalOnlyBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record no longer exists.", "error");
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

  const collectibleDisplayBtn = event.target.closest(".collectible-display-btn");
  if (collectibleDisplayBtn) {
    const rowIndex = Number(collectibleDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }
    toggleCollectibleEditor(rowIndex);
    return;
  }

  const saveRebateBtn = event.target.closest(".save-rebate-btn");
  if (saveRebateBtn) {
    const rowIndex = Number(saveRebateBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const rebateInputEl = body.querySelector(`.rebate-input[data-index="${rowIndex}"]`);
    const updatedRebate = parseAmount(rebateInputEl instanceof HTMLInputElement ? rebateInputEl.value : "0");
    if (!Number.isFinite(updatedRebate) || updatedRebate < 0) {
      showMessage("Rebate cannot be negative.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
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
    renderRecords();
    showMessage("Rebate updated.", "success");
    showToast("Rebate updated", "success");
    toggleRebateEditor(rowIndex, false);
    return;
  }

  const arrearsDisplayBtn = event.target.closest(".arrears-display-btn");
  if (arrearsDisplayBtn) {
    const rowIndex = Number(arrearsDisplayBtn.dataset.index);
    if (Number.isInteger(rowIndex)) {
      toggleArrearsEditor(rowIndex);
    }
    return;
  }

  const otherArrearsDisplayBtn = event.target.closest(".other-arrears-display-btn");
  if (otherArrearsDisplayBtn) {
    const rowIndex = Number(otherArrearsDisplayBtn.dataset.index);
    if (Number.isInteger(rowIndex)) {
      toggleOtherArrearsEditor(rowIndex);
    }
    return;
  }

  const openRemarksBtn = event.target.closest(".open-remarks-btn");
  if (openRemarksBtn) {
    const rowIndex = Number(openRemarksBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    toggleRemarksEditor(rowIndex);
    return;
  }

  const dueDateDisplayBtn = event.target.closest(".due-date-display-btn");
  if (dueDateDisplayBtn) {
    const rowIndex = Number(dueDateDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
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

  const moveDateDisplayBtn = event.target.closest(".move-date-display-btn");
  if (moveDateDisplayBtn) {
    const rowIndex = Number(moveDateDisplayBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const moveDateInputEl = body.querySelector(`.move-date-input[data-index="${rowIndex}"]`);
    if (!(moveDateInputEl instanceof HTMLInputElement)) {
      showMessage("Unable to open pay date picker.", "error");
      return;
    }

    if (typeof moveDateInputEl.showPicker === "function") {
      moveDateInputEl.showPicker();
    } else {
      moveDateInputEl.click();
    }
    return;
  }

  const saveOtherArrearsBtn = event.target.closest(".save-other-arrears-btn");
  if (saveOtherArrearsBtn) {
    const rowIndex = Number(saveOtherArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const controlsWrap = saveOtherArrearsBtn.closest(".other-arrears-editor");
    const otherArrearsInputEl = controlsWrap?.querySelector(`.other-arrears-input[data-index="${rowIndex}"]`);
    const otherArrearsTypeSelectEl = controlsWrap?.querySelector(`.other-arrears-type-select[data-index="${rowIndex}"]`);
    const updatedOtherArrears = parseAmount(otherArrearsInputEl instanceof HTMLInputElement ? otherArrearsInputEl.value : "0");
    const selectedOtherArrearsType = otherArrearsTypeSelectEl instanceof HTMLSelectElement ? otherArrearsTypeSelectEl.value : "Interest";
    if (!Number.isFinite(updatedOtherArrears) || updatedOtherArrears < 0) {
      showMessage("Other arrears cannot be negative.", "error");
      return;
    }
    if (selectedOtherArrearsType !== "Principal" && selectedOtherArrearsType !== "Interest") {
      showMessage("Please select a valid other arrears type.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    records[rowIndex].manualOtherArrearsAmount = updatedOtherArrears;
    records[rowIndex].otherArrearsType = selectedOtherArrearsType;
    setRecords(records);
    renderRecords();
    showMessage("Other arrears updated.", "success");
    showToast("Other arrears updated", "success");
    toggleOtherArrearsEditor(rowIndex, false);
    return;
  }

  const saveArrearsBtn = event.target.closest(".save-arrears-btn");
  if (saveArrearsBtn) {
    const rowIndex = Number(saveArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const controlsWrap = saveArrearsBtn.closest(".arrears-editor");
    const arrearsInputEl = controlsWrap?.querySelector(`.arrears-input[data-index="${rowIndex}"]`);
    const arrearsTypeSelectEl = controlsWrap?.querySelector(`.arrears-type-select[data-index="${rowIndex}"]`);
    const updatedArrears = parseAmount(arrearsInputEl instanceof HTMLInputElement ? arrearsInputEl.value : "0");
    const selectedArrearsType = arrearsTypeSelectEl instanceof HTMLSelectElement ? arrearsTypeSelectEl.value : "Interest";
    if (!Number.isFinite(updatedArrears) || updatedArrears < 0) {
      showMessage("Arrears cannot be negative.", "error");
      return;
    }
    if (selectedArrearsType !== "Principal" && selectedArrearsType !== "Interest") {
      showMessage("Please select a valid arrears type.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    records[rowIndex].manualArrearsAmount = updatedArrears;
    records[rowIndex].arrearsType = selectedArrearsType;
    setRecords(records);
    renderRecords();
    showMessage("Arrears updated.", "success");
    showToast("Arrears updated", "success");
    toggleArrearsEditor(rowIndex, false);
    return;
  }

  const saveDueDateBtn = event.target.closest(".save-due-date-btn");
  if (saveDueDateBtn) {
    const rowIndex = Number(saveDueDateBtn.dataset.index);
    const dueDateInputEl = body.querySelector(`.due-date-input[data-index="${rowIndex}"]`);
    const updatedDueDate = dueDateInputEl instanceof HTMLInputElement ? dueDateInputEl.value : "";
    saveDueDateForRow(rowIndex, updatedDueDate);
    return;
  }

  const saveCollectibleBtn = event.target.closest(".save-collectible-btn");
  if (saveCollectibleBtn) {
    const rowIndex = Number(saveCollectibleBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const collectibleInputEl = body.querySelector(`.collectible-edit-input[data-index="${rowIndex}"]`);
    const periodSelectEl = body.querySelector(`.collectible-period-select[data-index="${rowIndex}"]`);
    const updatedCollectible = parseAmount(collectibleInputEl instanceof HTMLInputElement ? collectibleInputEl.value : "0");
    const selectedPeriod = periodSelectEl instanceof HTMLSelectElement ? periodSelectEl.value : "Daily";

    if (!Number.isFinite(updatedCollectible) || updatedCollectible <= 0) {
      showMessage("Collectible amount must be greater than 0.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const arrearsTotal = computeArrearsAmount(records[rowIndex]) + computeOtherArrearsAmount(records[rowIndex]);
    const baseCollectible = updatedCollectible - arrearsTotal;
    if (!Number.isFinite(baseCollectible) || baseCollectible < 0) {
      showMessage("Collectible must be at least the total arrears amount.", "error");
      return;
    }

    records[rowIndex].collectibleAmountOverride = baseCollectible;
    records[rowIndex].collectiblePeriodOverride = selectedPeriod;
    if (isWeeklyFixedLoan(records[rowIndex].payableWithin)) {
      records[rowIndex].weeklyOutstandingBalance = baseCollectible;
      records[rowIndex].weeklyPrincipalBalance = Number(records[rowIndex].amount || 0);
      records[rowIndex].weeklyPaymentCycles = getWeeklyInterestPeriods(records[rowIndex]);
    }
    setRecords(records);
    renderRecords();
    showMessage("Collectible updated.", "success");
    showToast("Collectible updated", "success");
    toggleCollectibleEditor(rowIndex, false);
    return;
  }

  const saveWeeklySettingsBtn = event.target.closest(".save-weekly-settings-btn");
  if (saveWeeklySettingsBtn) {
    const rowIndex = Number(saveWeeklySettingsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const amountInputEl = body.querySelector(`.weekly-amount-input[data-index="${rowIndex}"]`);
    const collectibleInputEl = body.querySelector(`.collectible-edit-input[data-index="${rowIndex}"]`);
    const periodSelectEl = body.querySelector(`.collectible-period-select[data-index="${rowIndex}"]`);
    const updatedAmount = parseAmount(amountInputEl instanceof HTMLInputElement ? amountInputEl.value : "0");
    const updatedCollectible = parseAmount(collectibleInputEl instanceof HTMLInputElement ? collectibleInputEl.value : "0");
    const selectedPeriod = periodSelectEl instanceof HTMLSelectElement ? periodSelectEl.value : "Weekly";

    if (!Number.isFinite(updatedAmount) || updatedAmount <= 0) {
      showMessage("Weekly fixed amount must be greater than 0.", "error");
      return;
    }
    if (!Number.isFinite(updatedCollectible) || updatedCollectible <= 0) {
      showMessage("Weekly collectible must be greater than 0.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    if (!isWeeklyFixedLoan(records[rowIndex].payableWithin)) {
      showMessage("Weekly settings are only for weekly fixed loans.", "error");
      return;
    }

    const arrearsTotal = computeArrearsAmount(records[rowIndex]) + computeOtherArrearsAmount(records[rowIndex]);
    const baseCollectible = updatedCollectible - arrearsTotal;
    if (!Number.isFinite(baseCollectible) || baseCollectible < 0) {
      showMessage("Weekly collectible must be at least the total arrears amount.", "error");
      return;
    }

    records[rowIndex].amount = updatedAmount;
    records[rowIndex].collectibleAmountOverride = baseCollectible;
    records[rowIndex].collectiblePeriodOverride = selectedPeriod;
    records[rowIndex].weeklyOutstandingBalance = baseCollectible;
    records[rowIndex].weeklyPrincipalBalance = updatedAmount;
    records[rowIndex].weeklyPaymentCycles = getWeeklyInterestPeriods(records[rowIndex]);
    setRecords(records);
    renderRecords();
    showMessage("Weekly fixed amount and collectible updated.", "success");
    showToast("Weekly settings updated", "success");
    return;
  }

  const saveRemarksBtn = event.target.closest(".save-remarks-btn");
  if (saveRemarksBtn) {
    const rowIndex = Number(saveRemarksBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }
    const input = body.querySelector(`.remarks-input[data-index="${rowIndex}"]`);
    const remarks = (input instanceof HTMLInputElement ? input.value : "").trim();
    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }
    records[rowIndex].remarks = remarks;
    setRecords(records);
    renderRecords();
    showMessage("Remarks saved.", "success");
    showToast("Remarks saved", "success");
    toggleRemarksEditor(rowIndex, false);
    return;
  }

  const showPaymentHistoryBtn = event.target.closest(".show-payment-history-btn");
  if (showPaymentHistoryBtn) {
    const rowIndex = Number(showPaymentHistoryBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const paymentHistory = getPaymentHistory(record);
    openPaymentHistoryModal(record, paymentHistory);
    return;
  }

  const statementBtn = event.target.closest(".statement-btn");
  if (statementBtn) {
    const rowIndex = Number(statementBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }
    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }
    exportStatementOfAccount(records[rowIndex]);
    return;
  }

  const writeOffBtn = event.target.closest(".write-off-btn");
  if (writeOffBtn) {
    const rowIndex = Number(writeOffBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    if (records[rowIndex].isWriteOff === true) {
      showMessage("Write-Off is already active for this record.", "success");
      return;
    }

    if (isHatagHatagActive(records[rowIndex])) {
      showMessage("Hatag-Hatag is already active for this record.", "error");
      return;
    }

    const password = await requestWriteOffPassword("Write-Off");
    if (password === null) {
      return;
    }

    if (password.trim() !== getWriteOffPassword()) {
      showMessage("Invalid password. Write-Off cancelled.", "error");
      showToast("Invalid write-off password", "error");
      return;
    }

    records[rowIndex].isWriteOff = true;
    records[rowIndex].writeOffDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Write-Off activated. Interest growth is now stopped for this account.", "success");
    showToast("Write-Off activated", "success");
    return;
  }

  const hatagHatagBtn = event.target.closest(".hatag-hatag-btn");
  if (hatagHatagBtn) {
    const rowIndex = Number(hatagHatagBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    if (isHatagHatagActive(records[rowIndex])) {
      showMessage("Hatag-Hatag is already active for this record.", "success");
      return;
    }

    if (records[rowIndex].isWriteOff === true) {
      showMessage("Write-Off is already active for this record.", "error");
      return;
    }

    const password = await requestWriteOffPassword("Hatag-Hatag");
    if (password === null) {
      return;
    }

    if (password.trim() !== getWriteOffPassword()) {
      showMessage("Invalid password. Hatag-Hatag cancelled.", "error");
      showToast("Invalid Hatag-Hatag password", "error");
      return;
    }

    records[rowIndex].isHatagHatag = true;
    records[rowIndex].hatagHatagDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Hatag-Hatag activated. Interest growth is stopped and payments are logged in history only.", "success");
    showToast("Hatag-Hatag activated", "success");
    return;
  }

  const settleBtn = event.target.closest(".settle-btn");
  if (settleBtn) {
    const rowIndex = Number(settleBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const records = getRecords();
    const record = records[rowIndex];
    if (!record) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    if (isSettledRecord(record)) {
      showMessage("This account is already settled.", "success");
      return;
    }

    const password = await requestWriteOffPassword(
      "Settle",
      "Enter admin password to mark this account as settled and move it to Settled Accounts."
    );
    if (password === null) {
      return;
    }

    if (password.trim() !== getAdminPassword().trim()) {
      showMessage("Invalid admin password. Settle cancelled.", "error");
      showToast("Invalid admin password", "error");
      return;
    }

    record.isSettled = true;
    record.settledDate = toIsoDate(getReferenceDate());
    setRecords(records);
    renderRecords();
    showMessage("Account moved to Settled Accounts.", "success");
    showToast("Account settled", "success");
    return;
  }

  const moveDateBtn = event.target.closest(".move-date-btn");
  if (moveDateBtn) {
    const rowIndex = Number(moveDateBtn.dataset.index);
    const input = body.querySelector(`.move-date-input[data-index="${rowIndex}"]`);
    const newDate = input instanceof HTMLInputElement ? input.value : "";
    saveMoveDateForRow(rowIndex, newDate);
    return;
  }

  const button = event.target.closest(".save-paid-btn");
  if (!button) {
    return;
  }

  const rowIndex = Number(button.dataset.index);
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Invalid record selected.", "error");
    return;
  }

  const records = getRecords();
  const record = records[rowIndex];
  if (!record) {
    showMessage("Record no longer exists.", "error");
    return;
  }

  openPaymentEntryModal(rowIndex, record, PAYMENT_MODE_STANDARD);
  return;
});

function applyPaymentForRow(rowIndex, paidAmount, mode = PAYMENT_MODE_STANDARD) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    showMessage("Invalid record selected.", "error");
    return false;
  }

  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    showMessage("Paid amount cannot be negative.", "error");
    return false;
  }
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    showMessage("Enter a paid amount greater than 0.", "error");
    return false;
  }

  const records = getRecords();
  if (!records[rowIndex]) {
    showMessage("Record no longer exists.", "error");
    return false;
  }

  const isHatagMode = isHatagHatagActive(records[rowIndex]);
  const paymentAllocation = getPaymentAllocation(records[rowIndex], paidAmount, mode);
  if (mode === PAYMENT_MODE_PRINCIPAL_ONLY && isHatagMode) {
    showMessage("Principal-only payment is not available in Hatag-Hatag mode.", "error");
    return false;
  }
  if (!isHatagMode && paymentAllocation.appliedAmount <= 0) {
    const noInterestMessage = isHatagHatagActive(records[rowIndex])
      ? "No outstanding interest to pay in Hatag-Hatag mode."
      : mode === PAYMENT_MODE_PRINCIPAL_ONLY
        ? "There is no principal balance to pay."
        : "There is no outstanding balance to pay.";
    showMessage(noInterestMessage, "error");
    return false;
  }
  if (!isHatagMode && mode === PAYMENT_MODE_PRINCIPAL_ONLY && paidAmount > paymentAllocation.principalOutstanding) {
    showMessage("Payment cannot exceed the principal balance.", "error");
    return false;
  }
  if (!isHatagMode && mode !== PAYMENT_MODE_PRINCIPAL_ONLY && paidAmount > paymentAllocation.outstandingBalance) {
    showMessage("Payment cannot exceed the outstanding balance.", "error");
    return false;
  }

  const principalPaid = isHatagMode ? 0 : paymentAllocation.principalPaid;
  const interestPaid = isHatagMode ? paidAmount : paymentAllocation.interestPaid;
  const interestReduced = isHatagMode ? 0 : Math.max(0, Number(paymentAllocation.interestReduced || 0));
  const rebateApplied = isHatagMode ? 0 : getOutstandingBreakdown(records[rowIndex]).rebateAmount;
  const balanceReduction = isHatagMode
    ? paidAmount
    : mode === PAYMENT_MODE_PRINCIPAL_ONLY
      ? principalPaid + interestReduced
      : paymentAllocation.appliedAmount;

  // For Bi-Monthly, capture balance snapshot BEFORE payment so future cycles
  // compound correctly on the reduced balance (e.g. 11000 - 700 = 10300 stored).
  if (!isHatagMode && isMonthlyOpenLoan(records[rowIndex].payableWithin)) {
    const currentOutstanding = computeRemainingPayable(records[rowIndex]);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      records[rowIndex].dateGranted,
      records[rowIndex].payableWithin,
      getInterestReferenceDate(records[rowIndex])
    );
    records[rowIndex].monthlyOpenCurrentBalance = Math.max(0, currentOutstanding - balanceReduction);
    records[rowIndex].monthlyOpenPaymentCycles = currentCycles;
  }

  if (!isHatagMode && records[rowIndex].payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    const currentOutstanding = computeRemainingPayable(records[rowIndex]);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      records[rowIndex].dateGranted,
      records[rowIndex].payableWithin,
      getInterestReferenceDate(records[rowIndex])
    );
    records[rowIndex].biMonthlyCurrentBalance = Math.max(0, currentOutstanding - balanceReduction);
    records[rowIndex].biMonthlyPaymentCycles = currentCycles;
  }

  const currentPaid = getTotalPaidAmount(records[rowIndex]);
  records[rowIndex].totalPaidAmount = currentPaid + (isHatagMode ? 0 : paidAmount);

  if (!isHatagMode && isWeeklyFixedLoan(records[rowIndex].payableWithin)) {
    const currentWeeklyBalance = getWeeklyRunningBalance(records[rowIndex]);
    const currentWeeklyPrincipal = getWeeklyPrincipalBalance(records[rowIndex]);
    records[rowIndex].weeklyOutstandingBalance = Math.max(0, currentWeeklyBalance - balanceReduction);
    records[rowIndex].weeklyPrincipalBalance = Math.max(0, currentWeeklyPrincipal - principalPaid);
    records[rowIndex].weeklyPaymentCycles = getWeeklyInterestPeriods(records[rowIndex]);

    const baseDate = records[rowIndex].payDate || records[rowIndex].dueDate || toIsoDate(getReferenceDate());
    records[rowIndex].payDate = addDaysToIsoDate(baseDate, 7);
  } else if (!isHatagMode) {
    // Advance the due date to the next payment cycle (period + 1-day buffer)
    const currentDue = getEffectiveLoanEndDate(records[rowIndex]);
    const periodDays = getLoanPeriodDays(records[rowIndex].payableWithin);
    records[rowIndex].payDate = addDaysToIsoDate(currentDue, periodDays + 1);
  }

  const history = getPaymentHistory(records[rowIndex]);
  history.unshift({
    date: toIsoDate(getReferenceDate()),
    amount: paidAmount,
    principalPaid,
    interestPaid,
    interestReduced,
    rebateApplied,
  });
  records[rowIndex].paymentHistory = history;
  setRecords(records);
  renderRecords();
  const paymentLabel = mode === PAYMENT_MODE_PRINCIPAL_ONLY ? "Principal-only payment" : "Payment";
  showMessage(`${paymentLabel} applied successfully.`, "success");
  showToast(`${paymentLabel} successful`, "success");
  return true;
}

paymentEntryInput?.addEventListener("input", () => {
  paymentEntryInput.value = normalizeAmountInputLive(paymentEntryInput.value);
  updatePaymentEntryPreview();
});

paymentEntryCancelBtn?.addEventListener("click", () => {
  closePaymentEntryModal();
});

paymentEntryModal?.addEventListener("click", (event) => {
  if (event.target === paymentEntryModal) {
    closePaymentEntryModal();
  }
});

paymentEntryConfirmBtn?.addEventListener("click", () => {
  const rowIndex = paymentEntryRowIndex;
  const amount = parseAmount(paymentEntryInput?.value || "0");

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
  openPaymentConfirmModal(rowIndex, amount, paymentEntryMode);
});

paymentConfirmCancelBtn?.addEventListener("click", () => {
  closePaymentConfirmModal();
});

paymentConfirmYesBtn?.addEventListener("click", () => {
  if (!pendingPaymentConfirm) {
    closePaymentConfirmModal();
    return;
  }
  const { rowIndex, amount, mode } = pendingPaymentConfirm;
  closePaymentConfirmModal();
  const success = applyPaymentForRow(rowIndex, amount, mode);
  if (success) {
    closePaymentEntryModal();
  }
});

paymentConfirmModal?.addEventListener("click", (event) => {
  if (event.target === paymentConfirmModal) {
    closePaymentConfirmModal();
  }
});

testDateInput.addEventListener("input", () => {
  renderRecords();
});

useTodayBtn.addEventListener("click", () => {
  testDateInput.value = toIsoDate(new Date());
  renderRecords();
});

coMakerInput?.addEventListener("input", updateCoMakerFieldsVisibility);
form.addEventListener("reset", () => {
  setTimeout(() => {
    updateCoMakerFieldsVisibility();
    updateInterestRateForLoanType();
    updateModeOfPaymentForLoanType();
  }, 0);
});

// Auto-uppercase all text inputs in the loan application form
form.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.type === "text") {
    const pos = target.selectionStart;
    target.value = target.value.toUpperCase();
    target.setSelectionRange(pos, pos);
  }
});

// Auto-uppercase filter name so searches match stored uppercase values
filterNameInput.addEventListener("input", () => {
  const pos = filterNameInput.selectionStart;
  filterNameInput.value = filterNameInput.value.toUpperCase();
  filterNameInput.setSelectionRange(pos, pos);
  renderRecords();
});
filterDateGrantedInput.addEventListener("input", renderRecords);
filterDueDateInput.addEventListener("input", renderRecords);
filterPayableSelect.addEventListener("change", renderRecords);
sortBySelect.addEventListener("change", renderRecords);
exportWordBtn.addEventListener("click", exportVisibleRecords);
backupToExcelBtn?.addEventListener("click", exportToExcel);

initPurposeLoanSelects();
renderAddressSuggestions();
backupDataBtn?.addEventListener("click", () => {
  closeDrawer();
  const adminPassword = String(getAuthSettings().adminPassword || DEFAULT_AUTH_SETTINGS.adminPassword || "").trim();
  requestRestoreAdminPassword({
    title: "Secure Backup Download",
    message: "Enter admin password to download full backup data.",
    confirmLabel: "Download Backup",
    fallbackPrompt: "Enter admin password to download full backup:",
  }).then((enteredPassword) => {
    if (enteredPassword === null) {
      return;
    }

    if (String(enteredPassword).trim() !== adminPassword) {
      showMessage("Invalid admin password. Backup download cancelled.", "error");
      showToast("Backup download blocked", "error");
      return;
    }

    downloadFullBackup();
  });
});

restoreBackupBtn?.addEventListener("click", async () => {
  const adminPassword = String(getAuthSettings().adminPassword || DEFAULT_AUTH_SETTINGS.adminPassword || "").trim();
  const enteredPassword = await requestRestoreAdminPassword();

  if (enteredPassword === null) {
    return;
  }

  if (String(enteredPassword).trim() !== adminPassword) {
    showMessage("Invalid admin password. Restore cancelled.", "error");
    showToast("Restore blocked", "error");
    return;
  }

  restoreBackupInput?.click();
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

editRecordConfirmBtn?.addEventListener("click", () => {
  const value = (editRecordInput?.value || "").trim();
  if (!value) {
    if (editRecordError) {
      editRecordError.textContent = "Value is required.";
    }
    editRecordInput?.focus();
    return;
  }

  closeEditRecordModal(value);
});

editRecordCancelBtn?.addEventListener("click", () => {
  closeEditRecordModal(null);
});

editRecordModal?.addEventListener("click", (event) => {
  if (event.target === editRecordModal) {
    closeEditRecordModal(null);
  }
});

editRecordInput?.addEventListener("input", () => {
  if (editRecordError && editRecordError.textContent) {
    editRecordError.textContent = "";
  }
});

restoreBackupInput?.addEventListener("change", () => {
  const file = restoreBackupInput.files && restoreBackupInput.files[0];
  closeDrawer();
  restoreBackupFromFile(file || null);
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

writeOffModal?.addEventListener("click", (event) => {
  if (event.target === writeOffModal) {
    closeWriteOffModal(null);
  }
});

paymentHistoryCloseBtn?.addEventListener("click", () => {
  closePaymentHistoryModal();
});

paymentHistoryModal?.addEventListener("click", (event) => {
  if (event.target === paymentHistoryModal) {
    closePaymentHistoryModal();
  }
});

window.addEventListener("keydown", (event) => {
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

  if (editRecordModal?.classList.contains("show")) {
    if (event.key === "Escape") {
      closeEditRecordModal(null);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      editRecordConfirmBtn?.click();
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

function updateInterestRateForLoanType() {
  if (!payableWithinSelect || !interestRateInput) {
    return;
  }

  const isFixedRateLoan = isMonthly60FixedLoan(payableWithinSelect.value);
  if (isFixedRateLoan) {
    interestRateInput.value = "10";
    interestRateInput.readOnly = true;
    interestRateInput.title = "Fixed at 10% per month for 2 months (60 days)";
    return;
  }

  if (interestRateInput.readOnly && interestRateInput.value === "10") {
    interestRateInput.value = "";
  }
  interestRateInput.readOnly = false;
  if (isCashAdvanceFixedLoan(payableWithinSelect.value)) {
    interestRateInput.title = "Enter interest rate for Cash Advance (15 days), compounded every 15 days.";
  } else if (isMonthly100FixedLoan(payableWithinSelect.value)) {
    interestRateInput.title = "Enter monthly interest rate for Monthly (14 weeks).";
  } else {
    interestRateInput.title = "";
  }
}

function updateModeOfPaymentForLoanType() {
  if (!payableWithinSelect || !modeOfPaymentSelect) {
    return;
  }

  const applyModeValue = (nextValue) => {
    const changed = modeOfPaymentSelect.value !== nextValue;
    modeOfPaymentSelect.value = nextValue;
    if (changed) {
      modeOfPaymentSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  if (isBiMonthlyAutoLoan(payableWithinSelect.value)) {
    applyModeValue("Bi-Monthly");
    modeOfPaymentSelect.disabled = true;
    const label = payableWithinSelect.value === LOAN_TYPE_BI_MONTHLY_OPEN
      ? "Bi - Monthly loans automatically use Bi-Monthly mode of payment."
      : "Cash Advance (15 days) automatically uses Bi-Monthly mode of payment and bi-monthly interest.";
    modeOfPaymentSelect.title = label;
    return;
  }

  if (isWeeklyFixedLoan(payableWithinSelect.value) || isMonthly100FixedLoan(payableWithinSelect.value)) {
    applyModeValue("Weekly");
    modeOfPaymentSelect.disabled = true;
    modeOfPaymentSelect.title = isMonthly100FixedLoan(payableWithinSelect.value)
      ? "Monthly (14 weeks) automatically uses Weekly mode of payment. Interest remains monthly."
      : "Emergency Loan automatically uses Weekly mode of payment.";
    return;
  }

  modeOfPaymentSelect.disabled = false;
  modeOfPaymentSelect.title = "";
}

payableWithinSelect?.addEventListener("change", updateInterestRateForLoanType);
payableWithinSelect?.addEventListener("change", updateModeOfPaymentForLoanType);

toggleLoanEntryBtn?.addEventListener("click", () => {
  updateLoanEntryVisibility(!isLoanEntryOpen);
});

toggleReleaseSummaryBtn?.addEventListener("click", () => {
  window.location.href = "portfolio.html";
});

const mainHamburgerBtn = document.getElementById("main-hamburger");
const sideDrawer = document.getElementById("side-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerCloseBtn = document.getElementById("drawer-close");
const drawerLogoutBtn = document.getElementById("drawer-logout");
const themeOptions = document.querySelectorAll('input[name="theme-choice"]');

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

function openDrawer() {
  sideDrawer?.classList.add("is-open");
  drawerOverlay?.classList.add("is-open");
  sideDrawer?.setAttribute("aria-hidden", "false");
  mainHamburgerBtn?.classList.add("is-open");
  refreshBackupHealthStatus();
}

function closeDrawer() {
  sideDrawer?.classList.remove("is-open");
  drawerOverlay?.classList.remove("is-open");
  sideDrawer?.setAttribute("aria-hidden", "true");
  mainHamburgerBtn?.classList.remove("is-open");
}

function openLogoutConfirm() {
  logoutConfirmModal?.classList.add("show");
  logoutConfirmModal?.setAttribute("aria-hidden", "false");
}

function closeLogoutConfirm() {
  logoutConfirmModal?.classList.remove("show");
  logoutConfirmModal?.setAttribute("aria-hidden", "true");
}

mainHamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

function handleLogout() {
  closeLogoutConfirm();
  closeDrawer();
  showToast("Logging out...", "logout");
  setTimeout(() => {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
    sessionStorage.clear();
    window.location.reload();
  }, 650);
}

drawerLogoutBtn?.addEventListener("click", () => {
  closeDrawer();
  openLogoutConfirm();
});

themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

logoutBtn?.addEventListener("click", () => {
  closeDrawer();
  openLogoutConfirm();
});

logoutConfirmCancelBtn?.addEventListener("click", closeLogoutConfirm);
logoutConfirmYesBtn?.addEventListener("click", handleLogout);

logoutConfirmModal?.addEventListener("click", (event) => {
  if (event.target === logoutConfirmModal) {
    closeLogoutConfirm();
  }
});

initializeTheme();
applyDashboardViewState();
refreshBackupHealthStatus();

function revealAdminLoginButton() {
  if (!adminLoginButton || !loginLogoTrigger) {
    return;
  }
  adminLoginButton.hidden = !adminLoginButton.hidden;
  loginLogoTrigger.setAttribute("aria-label", adminLoginButton.hidden ? "Show admin dashboard button" : "Hide admin dashboard button");
}

loginLogoTrigger?.addEventListener("click", revealAdminLoginButton);
loginLogoTrigger?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    revealAdminLoginButton();
  }
});

togglePasswordBtn?.addEventListener("click", () => {
  if (!loginPasswordInput) {
    return;
  }
  const reveal = loginPasswordInput.type === "password";
  loginPasswordInput.type = reveal ? "text" : "password";
  togglePasswordBtn.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = (loginUsernameInput?.value || "").trim();
  const password = loginPasswordInput?.value || "";

  const authType = authenticateUser(username, password);
  if (authType === "main") {
    sessionStorage.setItem(LOGIN_SESSION_KEY, "1");
    sessionStorage.removeItem(PORTFOLIO_SESSION_KEY);
    setLoginMessage("Login successful.", true);
    hideLoadingScreen();
    updatePortfolioButtonVisibility();
    return;
  }

  if (authType === "dashboard2") {
    sessionStorage.setItem(LOGIN_SESSION_KEY, "1");
    sessionStorage.removeItem(PORTFOLIO_SESSION_KEY);
    if (isDashboard2Page()) {
      setLoginMessage("Login successful.", true);
      hideLoadingScreen();
      updatePortfolioButtonVisibility();
      return;
    }

    window.location.href = "dashboard2.html";
    return;
  }
  
  if (authType === "portfolio") {
    sessionStorage.setItem(PORTFOLIO_SESSION_KEY, "1");
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
    // Redirect to portfolio page immediately
    window.location.href = "portfolio.html";
    return;
  }

  setLoginMessage("Invalid username or password.", false);
});

updateCoMakerFieldsVisibility();
updateInterestRateForLoanType();
updateModeOfPaymentForLoanType();
updateLoanEntryVisibility(false);
updateReleaseSummaryVisibility(false);
updatePortfolioButtonVisibility();
testDateInput.value = toIsoDate(new Date());

// Keep totals and overdue values current without manual browser refresh.
// Also sync with server so changes from other devices appear automatically.
setInterval(() => {
  if (hasOpenInlineEditor()) {
    return;
  }
  loadRecordsFromServer().then(() => renderRecords());
}, AUTO_REFRESH_MS);

// If records are changed in another tab, refresh this page automatically.
window.addEventListener("storage", (event) => {
  const key = String(event.key || "");
  if (key === STORAGE_KEY) {
    if (hasOpenInlineEditor()) {
      return;
    }
    loadRecordsFromServer().then(() => renderRecords());
  }
});

renderRecords();
initializeDatePickers();

window.addEventListener("load", () => {
  ensureSyncStatusElement();
  console.info("[session][main] Startup", {
    loggedIn: sessionStorage.getItem(LOGIN_SESSION_KEY) === "1",
    online: navigator.onLine,
    userAgent: navigator.userAgent,
  });

  // Pull latest data from the database, then re-render so all devices stay in sync
  loadRecordsFromServer().then(() => renderRecords());

  if (sessionStorage.getItem(LOGIN_SESSION_KEY) === "1") {
    hideLoadingScreen();
    return;
  }

  document.body.classList.add("login-locked");

  if (loginUsernameInput) {
    loginUsernameInput.focus();
  }
});
