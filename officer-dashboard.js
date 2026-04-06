const THEME_KEY = "mgi_dashboard_theme";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const LOAN_TYPE_MONTHLY_FIXED_60 = "monthly_60_fixed";
const LOAN_TYPE_EMERGENCY_FIXED = "emergency_fixed";

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
const testDateInput = document.getElementById("test-date");
const useTodayBtn = document.getElementById("use-today");
const toast = document.getElementById("toast");
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

function computeRemainingPayable(record) {
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record, getReferenceDate()).outstandingBalance;
  }
  const grossPayable = computeBaseTotalPayable(record);
  const totalPaid = getTotalPaidAmount(record);
  return Math.max(0, grossPayable - totalPaid);
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
  const records = getRecords();
  const nameFilter = String(filterNameInput?.value || "").toLowerCase().trim();
  const dateFilter = String(filterDateGrantedInput?.value || "").trim();
  console.debug("[render][officer] Rendering records", {
    officer: currentOfficer,
    totalRecords: records.length,
    time: new Date().toISOString(),
  });

  let filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => {
    const matchesName = nameFilter === "" || String(record.name || "").toLowerCase().includes(nameFilter);
    const matchesDate = dateFilter === "" || String(record.dateGranted || "") === dateFilter;
    return matchesName && matchesDate;
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
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
  
  updateDashboardStats();
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
    name: String(nameInput.value || "").trim(),
    address: String(addressInput.value || "").trim(),
    contactNumber: String(contactNumberInput.value || "").trim(),
    purposeOfLoan: String(purposeOfLoanInput.value || "").trim(),
    modeOfPayment: String(modeOfPaymentSelect.value || "").trim(),
    payableWithin: String(payableWithinSelect.value || "").trim(),
    amount: Number(amountInput.value || 0),
    dateGranted: String(dateGrantedInput.value || "").trim(),
    dueDate: "",
    interestRate: Number(interestRateInput.value || 0),
    totalPaidAmount: 0,
    paidAmount: 0,
    paymentHistory: [],
    remarks: "",
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
payableWithinSelect?.addEventListener("change", syncModeOfPaymentWithLoanType);
testDateInput?.addEventListener("change", renderRecords);

useTodayBtn?.addEventListener("click", () => {
  if (testDateInput) {
    testDateInput.value = toIsoDate(new Date());
  }
  renderRecords();
});

clearBtn?.addEventListener("click", () => {
  if (confirm("Delete all records? This cannot be undone.")) {
    setRecords([]);
    renderRecords();
    showMessage("All records deleted.", "success");
  }
});

body?.addEventListener("click", (event) => {
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

    const currentOutstanding = computeRemainingPayable(record);
    if (currentOutstanding <= 0) {
      showMessage("There is no outstanding balance to pay.", "error");
      return;
    }

    const response = window.prompt(`Enter payment amount (max ${formatCurrency(currentOutstanding)}):`, "");
    if (response === null) {
      return;
    }

    const paidAmount = Number(String(response).replace(/,/g, "").trim());
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      showMessage("Please enter a valid payment amount.", "error");
      return;
    }

    if (paidAmount > currentOutstanding) {
      showMessage("Payment cannot exceed the outstanding balance.", "error");
      return;
    }

    record.totalPaidAmount = getTotalPaidAmount(record) + paidAmount;
    const history = getPaymentHistory(record);
    history.unshift({
      date: toIsoDate(getReferenceDate()),
      amount: paidAmount,
      principalPaid: 0,
      interestPaid: 0,
    });
    record.paymentHistory = history;

    setRecords(records);
    renderRecords();
    showMessage("Payment applied successfully.", "success");
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

    const history = getPaymentHistory(record);
    if (history.length === 0) {
      window.alert("No payment history yet.");
      return;
    }

    const historyText = history
      .map((item, idx) => {
        const dateLabel = formatLongDate(item.date || "") || String(item.date || "-");
        const amountPaid = Number(item.amount || 0);
        return `${idx + 1}. ${dateLabel} - ${formatCurrency(amountPaid)}`;
      })
      .join("\n");

    window.alert(`Payment History for ${record.name || "this loan"}:\n\n${historyText}`);
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
