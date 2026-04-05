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
const toast = document.getElementById("toast");
const writeOffModal = document.getElementById("write-off-modal");
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
const loanEntryPanel = document.getElementById("loan-entry-panel");
const mainContainer = document.querySelector(".container");
const toggleLoanEntryBtn = document.getElementById("toggle-loan-entry");
const toggleRunnerBtn = document.getElementById("toggle-runner");
const releaseSummaryPanel = document.getElementById("release-summary-panel");
const toggleReleaseSummaryBtn = document.getElementById("toggle-release-summary");
const releaseSummaryAmount = document.getElementById("release-summary-amount");
const releaseSummaryCount = document.getElementById("release-summary-count");
const logoutBtn = document.getElementById("logout-btn");
const logoutConfirmModal = document.getElementById("logout-confirm-modal");
const logoutConfirmCancelBtn = document.getElementById("logout-confirm-cancel");
const logoutConfirmYesBtn = document.getElementById("logout-confirm-yes");

// Supabase-backed API for records
async function getRecords() {
  setSyncStatus("syncing", "syncing...");
  try {
    const res = await fetch(`/api/state/${STORAGE_KEY}?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch records");
    const data = await res.json();
    if (Array.isArray(data.payload)) {
      setSyncStatus("ok", `updated (${data.payload.length} records)`);
      return data.payload;
    }
    setSyncStatus("error", "invalid server payload");
    return [];
  } catch (err) {
    setSyncStatus("error", "offline or fetch error");
    setDiagnosticsPanel("error", "Cannot load records from Supabase.", err.message);
    return [];
  }
}

async function setRecords(records) {
  setSyncStatus("syncing", "saving...");
  try {
    const res = await fetch(`/api/state/${STORAGE_KEY}`, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: records }),
    });
    if (!res.ok) throw new Error("Failed to save records");
    setSyncStatus("ok", `saved (${records.length} records)`);
    return true;
  } catch (err) {
    setSyncStatus("error", "save failed");
    setDiagnosticsPanel("error", "Cannot save records to Supabase.", err.message);
    return false;
  }
}
async function updateReleasedSummaryStats() {
  if (!releaseSummaryAmount || !releaseSummaryCount) {
    return;
  }
  const records = await getRecords();
  const totalReleasedAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  releaseSummaryAmount.textContent = formatCurrency(totalReleasedAmount);
  releaseSummaryCount.textContent = `${records.length} released loan${records.length === 1 ? "" : "s"}`;
}

async function renderRecords() {
  const records = await getRecords();
  const rows = getVisibleRecords(records);
  const activeFilters = getActiveFilterSnapshot();
  await updateReleasedSummaryStats();
  console.debug("[render][main] Rendering records", {
    totalRecords: records.length,
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
  if (records.length === 0) {
    setDiagnosticsPanel("warning", "No records found in Supabase yet.", latestSyncIssue || filtersSummary);
  }
  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="15" class="empty">No records yet.</td></tr>';
    const hasActiveFilter = hasActiveFilters(activeFilters);
    if (records.length > 0 && hasActiveFilter) {
      setDiagnosticsPanel(
        "error",
        "Records exist but current filters hide them.",
        `Tip: click Reset Filters. Active filters: ${filtersSummary}`
      );
    } else if (records.length > 0) {
      setDiagnosticsPanel(
        "warning",
        "Records exist but nothing is currently visible.",
        latestSyncIssue || filtersSummary
      );
    }
    setSyncStatus("ok", hasActiveFilter ? "rendered (0 visible, filters active)" : "rendered (0 visible)");
    initializeDatePickers();
    return;
  }
  body.innerHTML = rows
    .map(
      ({ record, index, dueDate, effectiveDueDate, isPastDue, daysPastDue }) => {
        // ...existing code...
      }
    )
    .join("");
  initializeDatePickers();
  setDiagnosticsPanel("ok", `Showing ${rows.length} visible record${rows.length === 1 ? "" : "s"} from ${records.length} total.`, latestSyncIssue || filtersSummary);
  setSyncStatus("ok", `rendered (${rows.length} visible)`);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  // ...existing code...
  let records = await getRecords();
  records.unshift(nextRecord);
  await setRecords(records);
  await renderRecords();

  form.reset();
  updateCoMakerFieldsVisibility();
  showMessage("Loan record saved.", "success");
  showToast("Loan record saved", "success");
});

clearBtn.addEventListener("click", async () => {
  const confirmed = window.confirm("Delete all saved records?");
  if (!confirmed) {
    return;
  }
  await setRecords([]);
  await renderRecords();
  showMessage("All records deleted.", "success");
});

// Initial load

window.addEventListener("DOMContentLoaded", () => {
  renderRecords();
});

const STORAGE_KEY = "mgi_loan_records";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const PORTFOLIO_SESSION_KEY = "mgi_portfolio_logged_in";
const THEME_KEY = "mgi_dashboard_theme";
const AUTH_USERNAME = "username";
const AUTH_PASSWORD = "123";
const PORTFOLIO_USERNAME = "portfolio";
const PORTFOLIO_PASSWORD = "123";
const WRITE_OFF_PASSWORD = AUTH_PASSWORD;
const AUTO_REFRESH_MS = 5 * 1000;
const EXPORT_ADDRESS_TEXT = "TALISAY, SANTANDER, CEBU";
const LOAN_TYPE_MONTHLY_OPEN = "monthly_open";
const LOAN_TYPE_BI_MONTHLY_OPEN = "bi_monthly_open";
const LOAN_TYPE_CASH_ADVANCE_FIXED_15 = "cash_advance_fixed_15";
const LOAN_TYPE_MONTHLY_FIXED_60 = "monthly_60_fixed";
const LOAN_TYPE_MONTHLY_FIXED_100 = "monthly_100_fixed";
const LOAN_TYPE_EMERGENCY_FIXED = "emergency_fixed";
const LOAN_TYPE_NO_LISTED = "no_listed";
let toastTimer;
let isLoanEntryOpen = false;
let isReleaseSummaryOpen = false;
let writeOffPasswordResolver = null;
let paymentEntryRowIndex = -1;
let pendingPaymentConfirm = null;
let syncStatusElement = null;
let diagnosticsPanelElement = null;
let diagnosticsTextElement = null;
let diagnosticsMetaElement = null;
let latestSyncIssue = "";

function ensureSyncStatusElement() {
  if (syncStatusElement && document.body.contains(syncStatusElement)) {
    return syncStatusElement;
  }

  const topbarActions = document.querySelector(".topbar-actions");
  if (!topbarActions) {
    return null;
  }

  const badge = document.createElement("span");
  badge.className = "sync-status-badge is-idle";
  badge.setAttribute("role", "status");
  badge.setAttribute("aria-live", "polite");
  badge.textContent = "Sync: idle";
  topbarActions.prepend(badge);
  syncStatusElement = badge;
  return badge;
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
  if (
    diagnosticsPanelElement &&
    diagnosticsTextElement &&
    diagnosticsMetaElement &&
    document.body.contains(diagnosticsPanelElement)
  ) {
    return diagnosticsPanelElement;
  }

  const recordsPanel = document.querySelector(".records-panel");
  if (!recordsPanel) {
    return null;
  }

  const panel = document.createElement("div");
  panel.className = "sync-diagnostics-panel is-info";

  const title = document.createElement("strong");
  title.className = "sync-diagnostics-title";
  title.textContent = "Diagnostics";

  const text = document.createElement("p");
  text.className = "sync-diagnostics-text";
  text.textContent = "Waiting for sync information...";

  const meta = document.createElement("p");
  meta.className = "sync-diagnostics-meta";
  meta.textContent = "";

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "btn-secondary sync-diagnostics-reset";
  resetBtn.textContent = "Reset Filters";
  resetBtn.addEventListener("click", clearAllRecordFilters);

  panel.appendChild(title);
  panel.appendChild(text);
  panel.appendChild(meta);
  panel.appendChild(resetBtn);

  const tableHead = recordsPanel.querySelector(".table-head");
  if (tableHead?.nextSibling) {
    recordsPanel.insertBefore(panel, tableHead.nextSibling);
  } else {
    recordsPanel.appendChild(panel);
  }

  diagnosticsPanelElement = panel;
  diagnosticsTextElement = text;
  diagnosticsMetaElement = meta;
  return panel;
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

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  syncRecordsToServer(records);
}

async function syncRecordsToServer(records) {
  try {
    const res = await fetch("/api/state/" + STORAGE_KEY, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: records }),
    });
    if (!res.ok) {
      throw new Error("Failed to sync records");
    }
  } catch {
    // Server unavailable — data is safe in localStorage
  }
}

async function loadRecordsFromServer() {
  setSyncStatus("syncing", "syncing...");
  console.info("[sync][main] Fetch start", {
    storageKey: STORAGE_KEY,
    online: navigator.onLine,
    time: new Date().toISOString(),
  });

  try {
    const stateUrl = "/api/state/" + STORAGE_KEY + "?t=" + Date.now();
    const res = await fetch(stateUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
    if (!res.ok) {
      console.error("[sync][main] Fetch failed", { status: res.status, statusText: res.statusText });
      latestSyncIssue = `Server error ${res.status}: ${res.statusText || "Request failed"}`;
      setDiagnosticsPanel("error", "Cannot load latest records from server.", latestSyncIssue);
      setSyncStatus("error", `server error (${res.status})`);
      return;
    }

    const data = await res.json();
    if (Array.isArray(data.payload)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.payload));
      console.info("[sync][main] Fetch success", { records: data.payload.length });
      latestSyncIssue = "";
      setSyncStatus("ok", `updated (${data.payload.length} records)`);
      return;
    }

    if (data.payload === null) {
      // If server has no saved state yet, reset local cache to keep devices consistent.
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      console.info("[sync][main] Server has no payload yet");
      latestSyncIssue = "";
      setSyncStatus("ok", "updated (0 records)");
      return;
    }

    // If payload is an object, log and display its structure for debugging
    let payloadType = typeof data.payload;
    let payloadKeys = data.payload && typeof data.payload === "object" ? Object.keys(data.payload) : null;
    let payloadPreview = "";
    try {
      payloadPreview = JSON.stringify(data.payload, null, 2);
    } catch {}

    console.warn("[sync][main] Unexpected payload shape", { payloadType, payloadKeys, payloadPreview });
    latestSyncIssue = `Invalid server payload format. Type: ${payloadType}, Keys: ${payloadKeys ? payloadKeys.join(", ") : "-"}`;
    setDiagnosticsPanel(
      "error",
      "Server returned an invalid payload. See below for details.",
      `${latestSyncIssue}\nPreview: ${payloadPreview}`
    );
    setSyncStatus("error", "invalid server payload");
  } catch {
    // Network issue — fall back to local data
    console.error("[sync][main] Network error while fetching state");
    latestSyncIssue = "Network error while loading server data.";
    setDiagnosticsPanel("error", "Network problem while syncing.", latestSyncIssue);
    setSyncStatus("error", "offline, using local data");
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
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
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
  return `${monthNames[month - 1]} ${day},${year}`;
}

function formatUpperDate(isoDate) {
  return formatLongDate(isoDate).toUpperCase();
}

function formatPlainAmount(value) {
  return Number(value || 0).toFixed(2);
}

function toFileSafeName(value) {
  return String(value || "record")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "record";
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
    "#dateGranted, #filter-date-granted, #filter-due-date, #test-date, .due-date-input, .move-date-input"
  );

  dateInputs.forEach((input) => {
    if (!(input instanceof HTMLInputElement) || input._flatpickr) {
      return;
    }

    const isRowDateInput = input.classList.contains("due-date-input") || input.classList.contains("move-date-input");

    window.flatpickr(input, {
      dateFormat: "Y-m-d",
      altInput: true,
      altInputClass: "compact-date-input",
      altFormat: isRowDateInput ? "m/d/y" : "F j, Y",
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

function isWeeklyFixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_EMERGENCY_FIXED || payableWithin === "Emergency Loan" || payableWithin === "Weekly";
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

function getWeeklyInterestPeriods(record) {
  return getWeeklyInterestPeriodsFromDate(record.dateGranted, getInterestReferenceDate(record));
}

function getWeeklyRunningState(record, referenceDate = getInterestReferenceDate(record)) {
  const effectiveInterestRate = getEffectiveInterestRate(record) / 100;
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
    const paymentCycles = getWeeklyInterestPeriodsFromDate(record.dateGranted, paymentDate);
    const cyclesSince = Math.max(0, paymentCycles - lastCycle);
    outstandingBalance += principalBalance * effectiveInterestRate * cyclesSince;

    const amountPaid = Math.max(0, Number(item.amount || 0));
    const interestOutstanding = Math.max(0, outstandingBalance - principalBalance);
    const interestPaid = Math.min(amountPaid, interestOutstanding);
    const principalPaid = Math.min(principalBalance, Math.max(0, amountPaid - interestPaid));

    outstandingBalance = Math.max(0, outstandingBalance - amountPaid);
    principalBalance = Math.max(0, principalBalance - principalPaid);
    lastCycle = paymentCycles;
  }

  const currentCycles = getWeeklyInterestPeriodsFromDate(record.dateGranted, referenceDate);
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
  return baseTotal + computeArrearsAmount(record) + computeOtherArrearsAmount(record);
}

function getTotalPaidAmount(record) {
  const totalPaid = Number(record.totalPaidAmount ?? record.paidAmount ?? 0);
  if (!Number.isFinite(totalPaid) || totalPaid < 0) {
    return 0;
  }
  return totalPaid;
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

function getOutstandingBreakdown(record) {
  const outstandingBalance = Math.max(0, computeRemainingPayable(record));
  const principalBase = isWeeklyFixedLoan(record.payableWithin)
    ? getWeeklyPrincipalBalance(record)
    : getPrincipalOutstandingAmount(record);
  const principalOutstanding = Math.min(outstandingBalance, principalBase);
  const interestOutstanding = Math.max(0, outstandingBalance - principalOutstanding);

  return {
    outstandingBalance,
    principalOutstanding,
    interestOutstanding,
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
  return Math.max(0, grossPayable - totalPaid);
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
  const dueDateBtn = body.querySelector(`.save-due-date-btn[data-index="${rowIndex}"]`);
  if (dueDateInput instanceof HTMLInputElement && dueDateBtn instanceof HTMLButtonElement) {
    const savedDueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
    setButtonUnsavedState(dueDateBtn, dueDateInput.value !== savedDueDate);
  }

  const moveDateInput = body.querySelector(`.move-date-input[data-index="${rowIndex}"]`);
  const moveDateBtn = body.querySelector(`.move-date-btn[data-index="${rowIndex}"]`);
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
      const hasOutstandingBalance = computeRemainingPayable(record) > 0;
      const isPastDue = Boolean(dueDate && hasOutstandingBalance && compareIsoDate(dueDate, referenceDateIso) < 0);
      const daysPastDue = isPastDue
        ? Math.floor((new Date(`${referenceDateIso}T00:00:00`).getTime() - new Date(`${dueDate}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return { record, index, dueDate, effectiveDueDate, isPastDue, daysPastDue };
    })
    .filter((row) => {
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
  const outstandingBalance = computeRemainingPayable(record);
  const paymentHistory = getPaymentHistory(record);
  const currentBalance = outstandingBalance;
  const printableRemarks = String(record.remarks || "").trim() || "No remarks";
  const hasCoMaker = Boolean(String(record.coMaker || "").trim());

  let runningBalanceAfterPayment = currentBalance;
  const transactionHistoryRows = paymentHistory.length
    ? [...paymentHistory]
        .map((item) => {
          const amountPaid = Number(item.amount || 0);
          const balanceAfterPayment = runningBalanceAfterPayment;
          const balanceBeforePayment = Math.max(0, balanceAfterPayment + amountPaid);
          runningBalanceAfterPayment = balanceBeforePayment;
          return {
            date: item.date,
            amountPaid,
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
              <td>${formatCurrency(item.amountPaid)}</td>
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
              <td>${record.interestRate.toFixed(2)}%</td>
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
              <td>${record.interestRate.toFixed(2)}%</td>
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

function requestWriteOffPassword() {
  if (!writeOffModal || !writeOffPasswordInput) {
    const fallback = window.prompt("Enter password to confirm Write-Off:");
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

      return `
        <div class="payment-history-row">
          <span><span class="pill">#${idx + 1}</span></span>
          <span>${sanitize(formatLongDate(item.date))}</span>
          <span>${formatCurrency(amountPaid)}</span>
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

function openPaymentConfirmModal(rowIndex, amount) {
  pendingPaymentConfirm = { rowIndex, amount };
  if (paymentConfirmText) {
    paymentConfirmText.textContent = `Confirm payment of ${formatCurrency(amount)}?`;
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
  const allocation = splitPaymentAmount(record, amount);
  paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(allocation.interestPaid)} | Principal ${formatCurrency(allocation.principalPaid)}`;
}

function openPaymentEntryModal(rowIndex, record) {
  if (!paymentEntryModal || !paymentEntryInput) {
    return;
  }

  paymentEntryRowIndex = rowIndex;
  if (paymentEntrySubtitle) {
    paymentEntrySubtitle.textContent = `Borrower: ${record.name}`;
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
  const rows = getVisibleRecords(records);
  const activeFilters = getActiveFilterSnapshot();
  updateReleasedSummaryStats();
  console.debug("[render][main] Rendering records", {
    totalRecords: records.length,
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

  if (records.length === 0) {
    setDiagnosticsPanel("warning", "No records found in this browser storage yet.", latestSyncIssue || filtersSummary);
  }

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="15" class="empty">No records yet.</td></tr>';
    const hasActiveFilter = hasActiveFilters(activeFilters);

    if (records.length > 0 && hasActiveFilter) {
      setDiagnosticsPanel(
        "error",
        "Records exist but current filters hide them in this browser.",
        `Tip: click Reset Filters. Active filters: ${filtersSummary}`
      );
    } else if (records.length > 0) {
      setDiagnosticsPanel(
        "warning",
        "Records exist but nothing is currently visible.",
        latestSyncIssue || filtersSummary
      );
    }

    setSyncStatus("ok", hasActiveFilter ? "rendered (0 visible, filters active)" : "rendered (0 visible)");
    initializeDatePickers();
    return;
  }

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
        const arrearsType = record.arrearsType === "Principal" ? "Principal" : "Interest";
        const otherArrearsType = record.otherArrearsType === "Principal" ? "Principal" : "Interest";
        const isWriteOffActive = record.isWriteOff === true;
        const writeOffFreezeDate = String(record.writeOffDate || "").trim();
        const hatagHatagActive = isHatagHatagActive(record);
        const hatagHatagDate = String(record.hatagHatagDate || "").trim();
        const escapedRemarks = sanitize(record.remarks || "");
        const paymentCount = paymentHistory.length;
        return `
      <tr class="${isPastDue ? "past-due-row" : ""}">
        <td>${record.name}</td>
        <td>${sanitize(String(record.address || "-"))}</td>
        <td>${sanitize(String(record.contactNumber || "-"))}</td>
        <td>${sanitize(String(record.purposeOfLoan || "-"))}</td>
        <td>${sanitize(String(record.modeOfPayment || "-"))}</td>
        <td>${sanitize(getTypeLabel(record.payableWithin))}</td>
        <td>
          ${formatCurrency(record.amount)}
          ${
            isWeeklyFixedLoan(record.payableWithin)
              ? `<div class="paid-controls"><input type="text" class="weekly-amount-input" data-index="${index}" value="${addCommas(formatPlainAmount(record.amount))}" inputmode="decimal" autocomplete="off" /><button type="button" class="btn-secondary save-weekly-settings-btn" data-index="${index}">Save Weekly</button></div>`
              : ""
          }
        </td>
        <td>${formatLongDate(record.dateGranted)}</td>
        <td class="${isPastDue ? "past-due-cell" : ""}">
          <small class="mini-note">${formatLongDate(dueDate)}</small>
          ${isPastDue ? `<small class="mini-note past-due-note">Past Due (${daysPastDue} day${daysPastDue === 1 ? "" : "s"})</small>` : ""}
          <div class="paid-controls">
            <input type="date" class="due-date-input" data-index="${index}" value="${dueDate}" />
            <button type="button" class="btn-secondary save-due-date-btn" data-index="${index}">Save Due Date</button>
          </div>
        </td>
        <td>
          ${getEffectiveInterestRate(record).toFixed(2)}%
          <small class="per-period">${formatCurrency(collectibleAmount)}/${getCollectibleLabelForRecord(record)}</small>
          ${
            isWriteOffActive
              ? `<small class="mini-note">Write-Off active since ${sanitize(formatLongDate(writeOffFreezeDate))}</small>`
              : hatagHatagActive
                ? `<small class="mini-note">Hatag-Hatag active since ${sanitize(formatLongDate(hatagHatagDate))}</small>`
                : ""
          }
          <div class="paid-controls">
            <input type="text" class="collectible-edit-input" data-index="${index}" value="${addCommas(formatPlainAmount(collectibleAmount))}" inputmode="decimal" autocomplete="off" />
            <select class="collectible-period-select" data-index="${index}">
              <option value="Daily" ${collectiblePeriod === "Daily" ? "selected" : ""}>Daily</option>
              <option value="Weekly" ${collectiblePeriod === "Weekly" ? "selected" : ""}>Weekly</option>
              <option value="Bi-Monthly" ${collectiblePeriod === "Bi-Monthly" ? "selected" : ""}>Bi-Monthly</option>
              <option value="Monthly" ${collectiblePeriod === "Monthly" ? "selected" : ""}>Monthly</option>
            </select>
            <button type="button" class="btn-secondary save-collectible-btn" data-index="${index}">Save</button>
          </div>
        </td>
        <td>
          <div class="move-date-controls">
            <input type="date" class="move-date-input" data-index="${index}" value="${payDate}" />
            <button type="button" class="btn-primary move-date-btn" data-index="${index}">Save</button>
          </div>
          <small class="mini-note">Moved pay date: ${formatLongDate(payDate)}</small>
        </td>
        <td>
          <div class="paid-controls arrears-controls">
            <small class="mini-note">${formatCurrency(arrearsAmount)} (${arrearsType})</small>
            <input type="text" class="arrears-input" data-index="${index}" value="${addCommas(formatPlainAmount(arrearsAmount))}" inputmode="decimal" autocomplete="off" />
            <select class="arrears-type-select" data-index="${index}">
              <option value="Principal" ${arrearsType === "Principal" ? "selected" : ""}>Principal</option>
              <option value="Interest" ${arrearsType === "Interest" ? "selected" : ""}>Interest</option>
            </select>
            <button type="button" class="btn-secondary save-arrears-btn" data-index="${index}">Save</button>
          </div>
        </td>
        <td>
          <div class="paid-controls other-arrears-controls">
            <small class="mini-note">${formatCurrency(otherArrearsAmount)} (${otherArrearsType})</small>
            <input type="text" class="other-arrears-input" data-index="${index}" value="${addCommas(formatPlainAmount(otherArrearsAmount))}" inputmode="decimal" autocomplete="off" />
            <select class="other-arrears-type-select" data-index="${index}">
              <option value="Principal" ${otherArrearsType === "Principal" ? "selected" : ""}>Principal</option>
              <option value="Interest" ${otherArrearsType === "Interest" ? "selected" : ""}>Interest</option>
            </select>
            <button type="button" class="btn-secondary save-other-arrears-btn" data-index="${index}">Save</button>
          </div>
        </td>
        <td>${formatCurrency(computeRemainingPayable(record))}</td>
        <td>
          <div class="paid-controls">
            <small class="mini-note">Interest due: ${formatCurrency(paymentBreakdown.interestOutstanding)} | Principal due: ${formatCurrency(paymentBreakdown.principalOutstanding)}</small>
            <button type="button" class="btn-pay save-paid-btn" data-index="${index}">Pay</button>
          </div>
          <small class="mini-note">Total paid: ${formatCurrency(totalPaidAmount)}</small>
          <button type="button" class="btn-secondary show-payment-history-btn" data-index="${index}">Show Payment History</button>
          <small class="mini-note">${paymentCount} payment${paymentCount === 1 ? "" : "s"}</small>
        </td>
        <td>
          <div class="remarks-controls">
            <input type="text" class="remarks-input" data-index="${index}" value="${escapedRemarks}" placeholder="Add remarks..." autocomplete="off" />
            <button type="button" class="btn-secondary save-remarks-btn" data-index="${index}">Save</button>
            <button type="button" class="btn-secondary statement-btn" data-index="${index}">Statement of Account</button>
            <button type="button" class="btn-danger write-off-btn" data-index="${index}" ${isWriteOffActive || hatagHatagActive ? "disabled" : ""}>${
              isWriteOffActive ? "Write-Off Active" : "Write-Off"
            }</button>
            <button type="button" class="btn-hatag-hatag hatag-hatag-btn" data-index="${index}" ${hatagHatagActive || isWriteOffActive ? "disabled" : ""}>${
              hatagHatagActive ? "Hatag-Hatag Active" : "Hatag-Hatag"
            }</button>
          </div>
        </td>
      </tr>
    `;
      }
    )
    .join("");

  initializeDatePickers();
  setDiagnosticsPanel("ok", `Showing ${rows.length} visible record${rows.length === 1 ? "" : "s"} from ${records.length} total.`, latestSyncIssue || filtersSummary);
  setSyncStatus("ok", `rendered (${rows.length} visible)`);
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type}`;
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
}

function setLoginMessage(text, isSuccess) {
  if (!loginMessage) {
    return;
  }
  loginMessage.textContent = text;
  loginMessage.classList.toggle("success", Boolean(isSuccess));
}

function authenticateUser(username, password) {
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    return "main";
  }
  if (username === PORTFOLIO_USERNAME && password === PORTFOLIO_PASSWORD) {
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
  if (!middleInitial) {
    missingFields.push("Middle Initial");
  }
  if (!address) {
    missingFields.push("Address");
  }
  if (!contactNumber) {
    missingFields.push("Contact Number");
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

  if (!/^[A-Za-z]$/.test(middleInitial)) {
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
  renderRecords();

  form.reset();
  updateCoMakerFieldsVisibility();
  showMessage("Loan record saved.", "success");
  showToast("Loan record saved", "success");
});

clearBtn.addEventListener("click", () => {
  const confirmed = window.confirm("Delete all saved records?");
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

  const rowIndex = Number(target.dataset.index);
  if (Number.isInteger(rowIndex)) {
    updateRowSaveButtonStates(rowIndex);
  }
});

body.addEventListener("click", async (event) => {
  const saveOtherArrearsBtn = event.target.closest(".save-other-arrears-btn");
  if (saveOtherArrearsBtn) {
    const rowIndex = Number(saveOtherArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const controlsWrap = saveOtherArrearsBtn.closest(".other-arrears-controls");
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
    return;
  }

  const saveArrearsBtn = event.target.closest(".save-arrears-btn");
  if (saveArrearsBtn) {
    const rowIndex = Number(saveArrearsBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const controlsWrap = saveArrearsBtn.closest(".arrears-controls");
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
    return;
  }

  const saveDueDateBtn = event.target.closest(".save-due-date-btn");
  if (saveDueDateBtn) {
    const rowIndex = Number(saveDueDateBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }

    const dueDateInputEl = body.querySelector(`.due-date-input[data-index="${rowIndex}"]`);
    const updatedDueDate = dueDateInputEl instanceof HTMLInputElement ? dueDateInputEl.value : "";
    if (!updatedDueDate) {
      showMessage("Please select a due date.", "error");
      return;
    }

    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }

    const dueDateBtn = body.querySelector(`.save-due-date-btn[data-index="${rowIndex}"]`);
    dueDateBtn?.classList.remove("btn-unsaved");

    const previousDueDate = records[rowIndex].dueDate || computeDueDate(records[rowIndex].dateGranted, records[rowIndex].payableWithin);
    if (!records[rowIndex].payDate || records[rowIndex].payDate === previousDueDate) {
      records[rowIndex].payDate = updatedDueDate;
    }
    records[rowIndex].dueDate = updatedDueDate;
    setRecords(records);
    renderRecords();
    showMessage("Due date updated.", "success");
    showToast("Due date updated", "success");
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

    const password = await requestWriteOffPassword();
    if (password === null) {
      return;
    }

    if (password.trim() !== WRITE_OFF_PASSWORD) {
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

    const password = await requestWriteOffPassword();
    if (password === null) {
      return;
    }

    if (password.trim() !== WRITE_OFF_PASSWORD) {
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

  const moveDateBtn = event.target.closest(".move-date-btn");
  if (moveDateBtn) {
    const rowIndex = Number(moveDateBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Invalid record selected.", "error");
      return;
    }
    const input = body.querySelector(`.move-date-input[data-index="${rowIndex}"]`);
    const newDate = input instanceof HTMLInputElement ? input.value : "";
    if (!newDate) {
      showMessage("Please select a new pay date.", "error");
      return;
    }
    const records = getRecords();
    if (!records[rowIndex]) {
      showMessage("Record no longer exists.", "error");
      return;
    }
    records[rowIndex].payDate = newDate;
    setRecords(records);
    renderRecords();
    showMessage("Pay date moved.", "success");
    showToast("Pay date moved", "success");
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

  openPaymentEntryModal(rowIndex, record);
  return;
});

function applyPaymentForRow(rowIndex, paidAmount) {
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
  const paymentAllocation = splitPaymentAmount(records[rowIndex], paidAmount);
  if (!isHatagMode && paymentAllocation.appliedAmount <= 0) {
    const noInterestMessage = isHatagHatagActive(records[rowIndex])
      ? "No outstanding interest to pay in Hatag-Hatag mode."
      : "There is no outstanding balance to pay.";
    showMessage(noInterestMessage, "error");
    return false;
  }
  if (!isHatagMode && paidAmount > paymentAllocation.outstandingBalance) {
    showMessage("Payment cannot exceed the outstanding balance.", "error");
    return false;
  }

  const principalPaid = isHatagMode ? 0 : paymentAllocation.principalPaid;
  const interestPaid = isHatagMode ? paidAmount : paymentAllocation.interestPaid;

  // For Bi-Monthly, capture balance snapshot BEFORE payment so future cycles
  // compound correctly on the reduced balance (e.g. 11000 - 700 = 10300 stored).
  if (!isHatagMode && isMonthlyOpenLoan(records[rowIndex].payableWithin)) {
    const currentOutstanding = computeRemainingPayable(records[rowIndex]);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      records[rowIndex].dateGranted,
      records[rowIndex].payableWithin,
      getInterestReferenceDate(records[rowIndex])
    );
    records[rowIndex].monthlyOpenCurrentBalance = Math.max(0, currentOutstanding - paidAmount);
    records[rowIndex].monthlyOpenPaymentCycles = currentCycles;
  }

  if (!isHatagMode && records[rowIndex].payableWithin === LOAN_TYPE_BI_MONTHLY_OPEN) {
    const currentOutstanding = computeRemainingPayable(records[rowIndex]);
    const currentCycles = getOpenLoanInterestPeriodsFromReferenceDate(
      records[rowIndex].dateGranted,
      records[rowIndex].payableWithin,
      getInterestReferenceDate(records[rowIndex])
    );
    records[rowIndex].biMonthlyCurrentBalance = Math.max(0, currentOutstanding - paidAmount);
    records[rowIndex].biMonthlyPaymentCycles = currentCycles;
  }

  const currentPaid = getTotalPaidAmount(records[rowIndex]);
  records[rowIndex].totalPaidAmount = currentPaid + (isHatagMode ? 0 : paidAmount);

  if (!isHatagMode && isWeeklyFixedLoan(records[rowIndex].payableWithin)) {
    const currentWeeklyBalance = getWeeklyRunningBalance(records[rowIndex]);
    const currentWeeklyPrincipal = getWeeklyPrincipalBalance(records[rowIndex]);
    records[rowIndex].weeklyOutstandingBalance = Math.max(0, currentWeeklyBalance - paidAmount);
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
  });
  records[rowIndex].paymentHistory = history;
  setRecords(records);
  renderRecords();
  showMessage("Payment applied successfully.", "success");
  showToast("Payment successful", "success");
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
  openPaymentConfirmModal(rowIndex, amount);
});

paymentConfirmCancelBtn?.addEventListener("click", () => {
  closePaymentConfirmModal();
});

paymentConfirmYesBtn?.addEventListener("click", () => {
  if (!pendingPaymentConfirm) {
    closePaymentConfirmModal();
    return;
  }
  const { rowIndex, amount } = pendingPaymentConfirm;
  closePaymentConfirmModal();
  const success = applyPaymentForRow(rowIndex, amount);
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

  if (isBiMonthlyAutoLoan(payableWithinSelect.value)) {
    modeOfPaymentSelect.value = "Bi-Monthly";
    modeOfPaymentSelect.disabled = true;
    const label = payableWithinSelect.value === LOAN_TYPE_BI_MONTHLY_OPEN
      ? "Bi - Monthly loans automatically use Bi-Monthly mode of payment."
      : "Cash Advance (15 days) automatically uses Bi-Monthly mode of payment and bi-monthly interest.";
    modeOfPaymentSelect.title = label;
    return;
  }

  if (isWeeklyFixedLoan(payableWithinSelect.value) || isMonthly100FixedLoan(payableWithinSelect.value)) {
    modeOfPaymentSelect.value = "Weekly";
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

toggleRunnerBtn?.addEventListener("click", () => {
  window.location.href = "runner.html";
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
  const selectedTheme = ["white", "black"].includes(theme) ? theme : "white";
  document.body.classList.remove("theme-white", "theme-black");
  document.body.classList.add(`theme-${selectedTheme}`);
  localStorage.setItem(THEME_KEY, selectedTheme);
  themeOptions.forEach((option) => {
    option.checked = option.value === selectedTheme;
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "white";
  applyTheme(savedTheme);
}

function openDrawer() {
  sideDrawer?.classList.add("is-open");
  drawerOverlay?.classList.add("is-open");
  sideDrawer?.setAttribute("aria-hidden", "false");
  mainHamburgerBtn?.classList.add("is-open");
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
  loadRecordsFromServer().then(() => renderRecords());
}, AUTO_REFRESH_MS);

// If records are changed in another tab, refresh this page automatically.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    renderRecords();
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

  if (loginUsernameInput) {
    loginUsernameInput.focus();
  }
});
