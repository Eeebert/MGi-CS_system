const THEME_KEY = "mgi_dashboard_theme";
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
const pageTitle = document.getElementById("page-title");
const backOfficersBtn = document.getElementById("back-officers");
const officerLogoutBtn = document.getElementById("officer-logout");
const toggleLoanEntryBtn = document.getElementById("toggle-loan-entry");
const loanEntryPanel = document.getElementById("loan-entry-panel");
const hamburgerBtn = document.getElementById("officer-hamburger");
const sideDrawer = document.getElementById("side-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerCloseBtn = document.getElementById("drawer-close");
const drawerLogoutBtn = document.getElementById("drawer-logout");
const themeOptions = document.querySelectorAll('input[name="theme-choice"]');
const dashboardTotalLoans = document.getElementById("dashboard-total-loans");
const dashboardTotalAmount = document.getElementById("dashboard-total-amount");
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";

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

async function fetchStateApi(stateKey, options, includeCacheBuster) {
  const candidates = getStateApiCandidates(stateKey, includeCacheBuster);
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
const EMPTY_OVERWRITE_GUARD_MS = 20000;
let hasUnsyncedLocalChanges = false;
let pendingRetryTimer = null;
let paymentEntryRowIndex = -1;
let writeOffPasswordResolver = null;

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

function getWriteOffPassword() {
  return String(getAuthSettings().mainPassword || DEFAULT_AUTH_SETTINGS.mainPassword);
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

function getOfficerStorageKey() {
  return `mgi_officer_records_${currentOfficer}`;
}

function getRecords() {
  return Array.isArray(recordsCache) ? recordsCache : [];
}

function setRecords(records) {
  recordsCache = Array.isArray(records) ? records : [];
  lastLocalMutationAt = Date.now();
  hasUnsyncedLocalChanges = true;
  syncRecordsToServer(records);
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
    setSyncStatus("ok", `saved (${records.length} records)`);
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
  setSyncStatus("syncing", "syncing...");
  console.info("[sync][officer] Fetch start", {
    officer: currentOfficer,
    storageKey: getOfficerStorageKey(),
    online: navigator.onLine,
    time: new Date().toISOString(),
  });

  try {
    const res = await fetchStateApi(getOfficerStorageKey(), {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    }, true);
    if (!res.ok) {
      console.error("[sync][officer] Fetch failed", { status: res.status, statusText: res.statusText });
      setSyncStatus("error", `server error (${res.status})`);
      return;
    }

    const data = await res.json();
    if (Array.isArray(data.payload)) {
      const shouldProtectUnsyncedData = (
        hasUnsyncedLocalChanges &&
        data.payload.length === 0 &&
        recordsCache.length > 0
      );
      if (shouldProtectUnsyncedData) {
        console.info("[sync][officer] Keeping unsynced local records while server save is failing", {
          officer: currentOfficer,
          cacheRecords: recordsCache.length,
        });
        setSyncStatus("error", "save pending retry");
        schedulePendingSaveRetry();
        return;
      }
      const shouldGuardEmptyOverwrite = (
        data.payload.length === 0 &&
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
      recordsCache = data.payload;
      console.info("[sync][officer] Fetch success", { officer: currentOfficer, records: data.payload.length });
      setSyncStatus("ok", `updated (${data.payload.length} records)`);
      return;
    }

    if (data.payload === null) {
      recordsCache = [];
      console.info("[sync][officer] Server has no payload yet", { officer: currentOfficer });
      setSyncStatus("ok", "updated (0 records)");
      return;
    }

    console.warn("[sync][officer] Unexpected payload shape", { payloadType: typeof data.payload });
    setSyncStatus("error", "invalid server payload");
  } catch {
    console.error("[sync][officer] Network error while fetching state", { officer: currentOfficer });
    setSyncStatus("error", "offline (server-only mode)");
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value || 0);
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

function isMonthly60FixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_MONTHLY_FIXED_60;
}

function isWeeklyFixedLoan(payableWithin) {
  return payableWithin === LOAN_TYPE_EMERGENCY_FIXED || payableWithin === "Emergency Loan" || payableWithin === "Weekly";
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

function getWeeklyInterestPeriodsFromDate(dateGranted, referenceDate) {
  const startDate = new Date(`${dateGranted}T00:00:00`);
  const referenceDay = referenceDate instanceof Date ? referenceDate : new Date(`${referenceDate}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(referenceDay.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor(diffDays(startDate, referenceDay) / 7));
}

function getWeeklyRunningState(record, referenceDate = getReferenceDate()) {
  const effectiveInterestRate = getEffectiveInterestRate(record) / 100;
  const history = [...getPaymentHistory(record)]
    .filter((item) => item?.date && compareIsoDate(item.date, toIsoDate(referenceDate)) <= 0)
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

function computeCollectibleAmount(record) {
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record, getReferenceDate()).outstandingBalance;
  }
  if (isMonthly60FixedLoan(record.payableWithin)) {
    return computeBaseTotalPayable(record) / 60;
  }
  return 0;
}

function getCollectibleLabelForRecord(record) {
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return "weekly collectible";
  }
  return "daily collectible";
}

function isHatagHatagActive(record) {
  return Boolean(record && record.isHatagHatag === true);
}

function computeRemainingPayable(record) {
  if (record?.isWriteOff === true || isHatagHatagActive(record)) {
    const frozenOutstanding = Number(record.frozenOutstandingBalance);
    const frozenPaidBase = Number(record.frozenPaidBase || 0);
    if (Number.isFinite(frozenOutstanding) && frozenOutstanding >= 0) {
      if (isHatagHatagActive(record)) {
        return Math.max(0, frozenOutstanding);
      }
      const totalPaid = getTotalPaidAmount(record);
      const paidAfterFreeze = Math.max(0, totalPaid - (Number.isFinite(frozenPaidBase) ? frozenPaidBase : 0));
      return Math.max(0, frozenOutstanding - paidAfterFreeze);
    }
  }

  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record, getReferenceDate()).outstandingBalance;
  }
  const grossPayable = computeBaseTotalPayable(record);
  const totalPaid = getTotalPaidAmount(record);
  return Math.max(0, grossPayable - totalPaid);
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

function getOutstandingBreakdown(record) {
  const outstandingBalance = Math.max(0, computeRemainingPayable(record));
  const principalBase = isWeeklyFixedLoan(record.payableWithin)
    ? getWeeklyRunningState(record, getReferenceDate()).principalBalance
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

function showMessage(text, type = "success") {
  if (!message) return;

  message.textContent = text;
  message.className = `form-message show ${type}`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    message.className = "form-message";
  }, 3000);
}

function updateDashboardStats() {
  const records = getRecords();
  const totalLoans = records.length;
  const totalAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  
  if (dashboardTotalLoans) {
    dashboardTotalLoans.textContent = String(totalLoans);
  }
  if (dashboardTotalAmount) {
    dashboardTotalAmount.textContent = formatCurrency(totalAmount);
  }
}

function setLoanFormVisibility(isVisible) {
  isLoanFormVisible = Boolean(isVisible);

  if (loanEntryPanel) {
    loanEntryPanel.style.display = isLoanFormVisible ? "block" : "none";
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
    body.innerHTML = '<tr><td colspan="13" class="empty">No records yet.</td></tr>';
    updateDashboardStats();
    return;
  }

  body.innerHTML = filtered
    .map(({ record, index }) => {
      const dueDate = String(record.dueDate || computeDueDate(record.dateGranted, record.payableWithin));
      const collectibleAmount = computeCollectibleAmount(record);
      const outstandingBalance = computeRemainingPayable(record);
      const totalPaidAmount = getTotalPaidAmount(record);
      const effectiveInterestRate = getEffectiveInterestRate(record);
      const escapedRemarks = sanitize(String(record.remarks || ""));
      const isWriteOffActive = record.isWriteOff === true;
      const writeOffFreezeDate = String(record.writeOffDate || "").trim();
      const hatagHatagActive = isHatagHatagActive(record);
      const hatagHatagDate = String(record.hatagHatagDate || "").trim();
      return `
        <tr>
          <td>${sanitize(String(record.name || ""))}</td>
          <td>${sanitize(String(record.address || "-"))}</td>
          <td>${sanitize(String(record.contactNumber || "-"))}</td>
          <td>${sanitize(String(record.purposeOfLoan || "-"))}</td>
          <td>${sanitize(String(record.modeOfPayment || "-"))}</td>
          <td>${sanitize(getTypeLabel(record.payableWithin))}</td>
          <td>${formatCurrency(record.amount)}</td>
          <td>${formatLongDate(record.dateGranted)}</td>
          <td>
            <small class="mini-note">${formatLongDate(dueDate)}</small>
            <div class="paid-controls">
              <input type="date" class="due-date-input" data-index="${index}" value="${sanitize(dueDate)}" />
              <button type="button" class="btn-secondary save-due-date-btn" data-index="${index}">Save Due Date</button>
            </div>
          </td>
          <td>${effectiveInterestRate.toFixed(2)}%<small class="per-period">${formatCurrency(collectibleAmount)}/${getCollectibleLabelForRecord(record)}</small></td>
          <td>${formatCurrency(outstandingBalance)}</td>
          <td>
            <div class="paid-controls">
              <button type="button" class="btn-pay pay-loan-btn" data-index="${index}">Pay</button>
            </div>
            <small class="mini-note">Total paid: ${formatCurrency(totalPaidAmount)}</small>
            <button type="button" class="btn-secondary show-payment-history-btn" data-index="${index}">Show Payment History</button>
            <small class="mini-note">${getPaymentHistory(record).length} payment${getPaymentHistory(record).length === 1 ? "" : "s"}</small>
          </td>
          <td>
            <div class="remarks-controls">
              <input type="text" class="remarks-input" data-index="${index}" value="${escapedRemarks}" placeholder="Add remarks..." autocomplete="off" />
              <button type="button" class="btn-secondary save-remarks-btn" data-index="${index}">Save</button>
              <button type="button" class="statement-btn" data-index="${index}">Statement of Account</button>
              <button type="button" class="btn-danger write-off-btn" data-index="${index}" ${isWriteOffActive || hatagHatagActive ? "disabled" : ""}>${isWriteOffActive ? "Write-Off Active" : "Write-Off"}</button>
              <button type="button" class="btn-hatag-hatag hatag-hatag-btn" data-index="${index}" ${hatagHatagActive || isWriteOffActive ? "disabled" : ""}>${hatagHatagActive ? "Hatag-Hatag Active" : "Hatag-Hatag"}</button>
            </div>
            ${isWriteOffActive
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
  const payableFilter = String(filterPayableSelect?.value || "").trim();
  const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => {
    const matchesName = nameFilter === "" || String(record.name || "").toLowerCase().includes(nameFilter);
    const matchesDate = dateFilter === "" || String(record.dateGranted || "") === dateFilter;
    const matchesPayable = payableFilter === "" || String(record.payableWithin || "") === payableFilter;
    return matchesName && matchesDate && matchesPayable;
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
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function closePaymentHistoryModal() {
  if (!paymentHistoryModal) {
    return;
  }
  paymentHistoryModal.classList.remove("show");
  paymentHistoryModal.setAttribute("aria-hidden", "true");
}

function openPaymentHistoryModal(record, history) {
  if (!paymentHistoryModal || !paymentHistoryContent) {
    return;
  }

  if (paymentHistoryTitle) {
    paymentHistoryTitle.textContent = `Payment History - ${record.name || "Borrower"}`;
  }

  if (!Array.isArray(history) || history.length === 0) {
    paymentHistoryContent.innerHTML = '<p class="payment-history-empty">No payment history yet.</p>';
    paymentHistoryModal.classList.add("show");
    paymentHistoryModal.setAttribute("aria-hidden", "false");
    return;
  }

  const rows = [...history]
    .reverse()
    .map((item, idx) => {
      const amountPaid = Number(item.amount || 0);
      const principalPaid = Number(item.principalPaid || 0);
      const interestPaid = Number(item.interestPaid || 0);

      return `
        <div class="payment-history-row">
          <span><span class="pill">#${idx + 1}</span></span>
          <span>${sanitize(formatLongDate(item.date) || String(item.date || "-"))}</span>
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

  const allocation = splitPaymentAmount(record, amount);
  paymentEntryPreview.textContent = `Applied: Interest ${formatCurrency(allocation.interestPaid)} | Principal ${formatCurrency(allocation.principalPaid)}`;
}

function openPaymentEntryModal(rowIndex, record) {
  if (!paymentEntryModal || !paymentEntryInput) {
    return;
  }

  paymentEntryRowIndex = rowIndex;
  if (paymentEntrySubtitle) {
    const statusNote = record.isWriteOff === true
      ? " | Write-Off Active"
      : isHatagHatagActive(record)
        ? " | Hatag-Hatag Active"
        : "";
    paymentEntrySubtitle.textContent = `Borrower: ${record.name || ""}${statusNote}`;
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

function applyPaymentForRow(rowIndex, paidAmount) {
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

  const currentOutstanding = computeRemainingPayable(record);
  if (currentOutstanding <= 0) {
    showMessage("There is no outstanding balance to pay.", "error");
    return false;
  }

  const allocation = splitPaymentAmount(record, paidAmount);
  const isHatagMode = isHatagHatagActive(record);
  if (!isHatagMode && allocation.appliedAmount <= 0) {
    showMessage("There is no outstanding balance to pay.", "error");
    return false;
  }

  if (!isHatagMode && paidAmount > currentOutstanding) {
    showMessage("Payment cannot exceed the outstanding balance.", "error");
    return false;
  }

  const principalPaid = isHatagMode ? 0 : allocation.principalPaid;
  const interestPaid = isHatagMode ? paidAmount : allocation.interestPaid;

  record.totalPaidAmount = getTotalPaidAmount(record) + (isHatagMode ? 0 : paidAmount);
  const history = getPaymentHistory(record);
  history.unshift({
    date: toIsoDate(getReferenceDate()),
    amount: paidAmount,
    principalPaid,
    interestPaid,
  });
  record.paymentHistory = history;

  setRecords(records);
  renderRecords();
  showMessage("Payment applied successfully.", "success");
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

  const headerRow = `
    <tr>
      <th>Name</th>
      <th>Address</th>
      <th>Contact Number</th>
      <th>Purpose of Loan</th>
      <th>Mode of Payment</th>
      <th>Type of Loan</th>
      <th>Amount</th>
      <th>Date Granted</th>
      <th>Due Date</th>
      <th>Interest Rate</th>
      <th>Outstanding Balance</th>
      <th>Total Paid</th>
      <th>Remarks</th>
    </tr>
  `;

  const bodyRows = rows
    .map(({ record }) => {
      const dueDate = String(record.dueDate || computeDueDate(record.dateGranted, record.payableWithin));
      const outstandingBalance = computeRemainingPayable(record);
      const totalPaidAmount = getTotalPaidAmount(record);
      const effectiveInterestRate = getEffectiveInterestRate(record);
      return `
        <tr>
          <td>${sanitize(String(record.name || ""))}</td>
          <td>${sanitize(String(record.address || "-"))}</td>
          <td>${sanitize(String(record.contactNumber || "-"))}</td>
          <td>${sanitize(String(record.purposeOfLoan || "-"))}</td>
          <td>${sanitize(String(record.modeOfPayment || "-"))}</td>
          <td>${sanitize(getTypeLabel(record.payableWithin))}</td>
          <td>${formatCurrency(record.amount)}</td>
          <td>${sanitize(formatLongDate(record.dateGranted))}</td>
          <td>${sanitize(formatLongDate(dueDate))}</td>
          <td>${sanitize(formatPlainAmount(effectiveInterestRate))}%</td>
          <td>${formatCurrency(outstandingBalance)}</td>
          <td>${formatCurrency(totalPaidAmount)}</td>
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
          body {
            font-family: "Aptos Display", "Aptos", "Times New Roman", serif;
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
          .records-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .records-table th, .records-table td {
            border: 1px solid #9eb6ce;
            padding: 4px 5px;
            font-size: 7pt;
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

async function exportStatementOfAccount(record) {
  const logoDataUrl = await getImageDataUrl("images/mgi_logo.png");
  const dueDate = record.dueDate || computeDueDate(record.dateGranted, record.payableWithin);
  const outstandingBalance = computeRemainingPayable(record);
  const totalPaidAmount = getTotalPaidAmount(record);
  const totalPayable = outstandingBalance + totalPaidAmount;
  const paymentHistory = getPaymentHistory(record);

  let runningBalanceAfterPayment = outstandingBalance;
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
  if (payableWithin === "emergency_fixed") {
    return "Emergency Loan - Fixed";
  }
  if (payableWithin === "monthly_60_fixed") {
    return "Monthly (60 days) - Fixed";
  }
  return payableWithin || "";
}

function syncModeOfPaymentWithLoanType() {
  const loanType = String(payableWithinSelect?.value || "").trim();
  if (!modeOfPaymentSelect) {
    return;
  }

  if (loanType === "emergency_fixed") {
    modeOfPaymentSelect.value = "Weekly";
    return;
  }

  if (loanType === "monthly_60_fixed") {
    modeOfPaymentSelect.value = "Daily";
    return;
  }

  modeOfPaymentSelect.value = "";
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const records = getRecords();
  const newRecord = {
    name: toUpperInputValue(nameInput.value).trim(),
    address: toUpperInputValue(addressInput.value).trim(),
    contactNumber: toUpperInputValue(contactNumberInput.value).trim(),
    purposeOfLoan: String(purposeOfLoanInput.value || "").trim(),
    modeOfPayment: String(modeOfPaymentSelect.value || "").trim(),
    payableWithin: String(payableWithinSelect.value || "").trim(),
    amount: parseAmountInput(amountInput.value),
    dateGranted: String(dateGrantedInput.value || "").trim(),
    dueDate: "",
    interestRate: Number(interestRateInput.value || 0),
    totalPaidAmount: 0,
    paidAmount: 0,
    paymentHistory: [],
    remarks: "",
    isWriteOff: false,
    writeOffDate: "",
    isHatagHatag: false,
    hatagHatagDate: "",
    frozenOutstandingBalance: null,
    frozenPaidBase: 0,
  };

  newRecord.dueDate = computeDueDate(newRecord.dateGranted, newRecord.payableWithin);

  if (!newRecord.name || !newRecord.payableWithin || newRecord.amount <= 0) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  records.push(newRecord);
  setRecords(records);
  showMessage("Loan record saved successfully.", "success");
  form.reset();
  renderRecords();
});

filterNameInput?.addEventListener("input", renderRecords);
filterDateGrantedInput?.addEventListener("change", renderRecords);
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

useTodayBtn?.addEventListener("click", () => {
  if (testDateInput) {
    testDateInput.value = toIsoDate(new Date());
  }
  renderRecords();
});

exportWordOfficerBtn?.addEventListener("click", exportVisibleRecordsToWord);

paymentHistoryCloseBtn?.addEventListener("click", closePaymentHistoryModal);
paymentHistoryModal?.addEventListener("click", (event) => {
  if (event.target === paymentHistoryModal) {
    closePaymentHistoryModal();
  }
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

  const success = applyPaymentForRow(rowIndex, amount);
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

body?.addEventListener("click", async (event) => {
  const saveDueDateBtn = event.target.closest(".save-due-date-btn");
  if (saveDueDateBtn) {
    const rowIndex = Number(saveDueDateBtn.dataset.index);
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      showMessage("Unable to update due date.", "error");
      return;
    }

    const dueDateInputEl = body.querySelector(`.due-date-input[data-index="${rowIndex}"]`);
    const nextDueDate = String(dueDateInputEl?.value || "").trim();
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
    renderRecords();
    showMessage("Remarks saved.", "success");
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

    if (computeRemainingPayable(record) <= 0) {
      showMessage("There is no outstanding balance to pay.", "error");
      return;
    }

    openPaymentEntryModal(rowIndex, record);
    return;
  }

  const showPaymentHistoryBtn = event.target.closest(".show-payment-history-btn");
  if (showPaymentHistoryBtn) {
    const rowIndex = Number(showPaymentHistoryBtn.dataset.index);
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

    openPaymentHistoryModal(record, getPaymentHistory(record));
    return;
  }

  const statementBtn = event.target.closest(".statement-btn");
  if (statementBtn) {
    const rowIndex = Number(statementBtn.dataset.index);
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
    record.frozenOutstandingBalance = computeRemainingPayable(record);
    record.frozenPaidBase = getTotalPaidAmount(record);
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

    record.isHatagHatag = true;
    record.hatagHatagDate = toIsoDate(getReferenceDate());
    record.frozenOutstandingBalance = computeRemainingPayable(record);
    record.frozenPaidBase = getTotalPaidAmount(record);
    setRecords(records);
    renderRecords();
    showMessage("Hatag-Hatag activated. Interest growth is stopped and payments are logged in history only.", "success");
    return;
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

toggleLoanEntryBtn?.addEventListener("click", () => {
  setLoanFormVisibility(!isLoanFormVisible);
});

backOfficersBtn?.addEventListener("click", () => {
  window.location.href = "runner.html";
});

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

hamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

drawerLogoutBtn?.addEventListener("click", () => {
  closeDrawer();
  officerLogoutBtn?.click();
});

officerLogoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem(LOGIN_SESSION_KEY);
  sessionStorage.clear();
  window.location.href = "index.html";
});

// Initialize on page load
if (sessionStorage.getItem(LOGIN_SESSION_KEY) !== "1") {
  window.location.href = "index.html";
} else {
  // Get officer name from URL parameter
  const params = new URLSearchParams(window.location.search);
  currentOfficer = params.get("officer") || "Unknown";
  
  if (pageTitle) {
    pageTitle.textContent = `${currentOfficer} DASHBOARD`;
  }

  initializeTheme();
  ensureSyncStatusElement();
  console.info("[session][officer] Startup", {
    officer: currentOfficer,
    loggedIn: sessionStorage.getItem(LOGIN_SESSION_KEY) === "1",
    online: navigator.onLine,
    userAgent: navigator.userAgent,
  });
  setLoanFormVisibility(true);
  syncModeOfPaymentWithLoanType();

  // Pull latest data from server then render
  loadRecordsFromServer().then(() => renderRecords());

  // Keep synced with server every 5 seconds so all devices stay in sync
  setInterval(() => {
    loadRecordsFromServer().then(() => renderRecords());
  }, 5000);

  window.addEventListener("online", () => {
    if (!isServerWritePending && hasUnsyncedLocalChanges) {
      syncRecordsToServer(getRecords());
    }
    loadRecordsFromServer().then(() => renderRecords());
  });
}
