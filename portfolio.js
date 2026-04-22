const STORAGE_KEY = "mgi_loan_records";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const PORTFOLIO_SESSION_KEY = "mgi_portfolio_logged_in";
const THEME_KEY = "mgi_dashboard_theme";

function hasStoredPortfolioLogin() {
  return sessionStorage.getItem(PORTFOLIO_SESSION_KEY) === "1" || localStorage.getItem(PORTFOLIO_SESSION_KEY) === "1";
}

function restoreStoredPortfolioLogin() {
  if (localStorage.getItem(PORTFOLIO_SESSION_KEY) === "1") {
    sessionStorage.setItem(PORTFOLIO_SESSION_KEY, "1");
  }
}

function clearStoredPortfolioLogin() {
  sessionStorage.removeItem(PORTFOLIO_SESSION_KEY);
  localStorage.removeItem(PORTFOLIO_SESSION_KEY);
}

const portfolioTotal = document.getElementById("portfolio-total");
const portfolioEarnedInterest = document.getElementById("portfolio-earned-interest");
const portfolioTotalOutstanding = document.getElementById("portfolio-total-outstanding");
const portfolioMeta = document.getElementById("portfolio-meta");
const portfolioCount = document.getElementById("portfolio-count");
const portfolioPastDueCount = document.getElementById("portfolio-past-due-count");
const portfolioPastDueBtn = document.getElementById("portfolio-past-due-btn");
const pastDueBreakdown = document.getElementById("past-due-breakdown");
const portfolioAverage = document.getElementById("portfolio-average");
const releasedInterestBreakdown = document.getElementById("released-interest-breakdown");
const showReleasedDataBtn = document.getElementById("show-released-data");
const portfolioReleaseDataModal = document.getElementById("portfolio-release-data-modal");
const portfolioReleaseDataCloseBtn = document.getElementById("portfolio-release-data-close");
const portfolioReleaseDataExportBtn = document.getElementById("portfolio-release-data-export");
const portfolioReleaseDataContent = document.getElementById("portfolio-release-data-content");
const portfolioReleaseDataTitle = document.getElementById("portfolio-release-data-title");
const portfolioReleaseDataSubtitle = portfolioReleaseDataModal?.querySelector(".payment-history-head p") || null;
const portfolioTypesGrid = document.getElementById("portfolio-types-grid");
const portfolioDateFilterInput = document.getElementById("portfolio-date-filter");
const portfolioMonthFilterInput = document.getElementById("portfolio-month-filter");
const portfolioDateClearBtn = document.getElementById("portfolio-date-clear");
const typeMonthlyOpen = document.getElementById("type-monthly-open");
const typeBiMonthly = document.getElementById("type-bi-monthly");
const typeCashAdvance = document.getElementById("type-cash-advance");
const typeMonthly60 = document.getElementById("type-monthly-60");
const typeMonthly14Weeks = document.getElementById("type-monthly-14-weeks");
const typeEmergency = document.getElementById("type-emergency");
const typeNotListed = document.getElementById("type-not-listed");
const typeWriteOff = document.getElementById("type-write-off");
const typeHatagHatag = document.getElementById("type-hatag-hatag");
const typeMonthlyOpenBalance = document.getElementById("type-monthly-open-balance");
const typeBiMonthlyBalance = document.getElementById("type-bi-monthly-balance");
const typeCashAdvanceBalance = document.getElementById("type-cash-advance-balance");
const typeMonthly60Balance = document.getElementById("type-monthly-60-balance");
const typeMonthly14WeeksBalance = document.getElementById("type-monthly-14-weeks-balance");
const typeEmergencyBalance = document.getElementById("type-emergency-balance");
const typeNotListedBalance = document.getElementById("type-not-listed-balance");
const typeWriteOffBalance = document.getElementById("type-write-off-balance");
const typeHatagHatagBalance = document.getElementById("type-hatag-hatag-balance");
const backDashboardBtn = document.getElementById("back-dashboard");
const typeAccountOfficer = document.getElementById("type-account-officer");
const typeSettled = document.getElementById("type-settled");
const typeAccountOfficerBalance = document.getElementById("type-account-officer-balance");
const typeSettledBalance = document.getElementById("type-settled-balance");
const portfolioLogoutBtn = document.getElementById("portfolio-logout");
const dailyPrincipalCollected = document.getElementById("daily-principal-collected");
const dailyInterestCollected = document.getElementById("daily-interest-collected");
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";
const DEFAULT_RELEASE_DATA_TITLE = "Released Loan Data";
const DEFAULT_RELEASE_DATA_SUBTITLE = "Detailed list of Date, Released, Rate, and Interest.";
let OFFICER_NAMES = (() => {
  try {
    const raw = localStorage.getItem("mgi_officer_names");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"];
  } catch { return ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"]; }
})();
const OFFICER_STORAGE_KEY_PREFIX = "mgi_officer_records_";
let recordsCache = [];
let didLoadServerRecords = false;
let typeDetailBuckets = {
  monthlyOpen: [],
  biMonthly: [],
  cashAdvance: [],
  monthly60: [],
  monthly14Weeks: [],
  emergency: [],
  notListed: [],
  writeOff: [],
  hatagHatag: [],
  settled: [],
  pastDue: [],
};
let officerPastDueRecords = [];
let mainDashboardPastDueRecords = [];
let activePortfolioModalMode = "released";
let releasedDataModalHtml = '<p class="empty" style="margin: 0;">No released loans yet.</p>';
let releasedDataModalSubtitle = DEFAULT_RELEASE_DATA_SUBTITLE;

let OFFICER_SLUG_TO_NAME = OFFICER_NAMES.reduce((acc, name) => {
  acc[toOfficerSlug(name)] = name;
  return acc;
}, {});

async function refreshOfficerNamesFromServer() {
  let didUpdateOfficerNames = false;
  try {
    const res = await fetchStateApi("mgi_officer_names", {}, true);
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data?.payload) && data.payload.length > 0 ? data.payload : null;
    if (list) {
      OFFICER_NAMES = list;
      OFFICER_SLUG_TO_NAME = list.reduce((acc, name) => { acc[toOfficerSlug(name)] = name; return acc; }, {});
      localStorage.setItem("mgi_officer_names", JSON.stringify(list));
      didUpdateOfficerNames = true;
    }
  } catch { /* ignore */ }
  return didUpdateOfficerNames;
}

let officerSummaryStats = new Map();

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

  const directMatch = OFFICER_NAMES.find((name) => name.toLowerCase() === value.toLowerCase());
  if (directMatch) {
    return directMatch;
  }

  const slugMatch = OFFICER_SLUG_TO_NAME[toOfficerSlug(value)];
  return slugMatch || value;
}

function findOfficerName(rawOfficer) {
  const normalized = normalizeOfficerName(rawOfficer);
  if (!normalized) {
    return "";
  }

  return OFFICER_NAMES.includes(normalized) ? normalized : "";
}

function getOfficerStorageKeys(officerName) {
  const normalized = normalizeOfficerName(officerName) || String(officerName || "").trim();
  const canonical = `mgi_officer_records_${toOfficerSlug(normalized)}`;
  const legacy = `mgi_officer_records_${normalized}`;
  return Array.from(new Set([canonical, legacy]));
}

function getOfficerStorageKey(officerName) {
  return getOfficerStorageKeys(officerName)[0];
}

function getKnownOfficerNames() {
  return Array.from(new Set(OFFICER_NAMES));
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
  const merged = [];
  const indexByFingerprint = new Map();

  for (const rawRecord of records) {
    const record = rawRecord && typeof rawRecord === "object" ? { ...rawRecord } : rawRecord;
    const fingerprint = buildRecordFingerprint(record);
    const existingIndex = indexByFingerprint.get(fingerprint);

    if (typeof existingIndex === "undefined") {
      indexByFingerprint.set(fingerprint, merged.length);
      merged.push(record);
      continue;
    }

    const existing = merged[existingIndex] || {};
    const nextRecord = {
      ...existing,
      ...record,
      // Keep status flags even when data is split between canonical and legacy keys.
      isWriteOff: isWriteOffActive(existing) || isWriteOffActive(record),
      isHatagHatag: isHatagHatagActive(existing) || isHatagHatagActive(record),
      writeOffDate: String(existing?.writeOffDate || "").trim() || String(record?.writeOffDate || "").trim(),
      hatagHatagDate: String(existing?.hatagHatagDate || "").trim() || String(record?.hatagHatagDate || "").trim(),
    };

    const existingPaid = Number(existing?.totalPaidAmount ?? existing?.paidAmount ?? 0);
    const incomingPaid = Number(record?.totalPaidAmount ?? record?.paidAmount ?? 0);
    if (incomingPaid > existingPaid) {
      nextRecord.totalPaidAmount = incomingPaid;
    }

    const existingHistory = Array.isArray(existing?.paymentHistory) ? existing.paymentHistory : [];
    const incomingHistory = Array.isArray(record?.paymentHistory) ? record.paymentHistory : [];
    if (incomingHistory.length > existingHistory.length) {
      nextRecord.paymentHistory = incomingHistory;
    }

    merged[existingIndex] = nextRecord;
  }

  return merged;
}

function dedupeRecordsForOfficerDashboardParity(records) {
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

async function loadStateRecords(stateKey, includeCacheBuster = true) {
  try {
    const res = await fetchStateApi(
      stateKey,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      includeCacheBuster
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json().catch(() => null);
    return Array.isArray(data?.payload) ? data.payload : [];
  } catch {
    return [];
  }
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

function readOfficerRecordsFromLocalStorage(officerName) {
  try {
    for (const key of getOfficerStorageKeys(officerName)) {
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

function readGlobalRecordsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

function getRecords() {
  return Array.isArray(recordsCache) ? recordsCache : [];
}

function getSettledDashboardParityRecords(sourceRecords) {
  return (Array.isArray(sourceRecords) ? sourceRecords : []).filter((record) => record?.isSettled === true);
}

async function loadRecordsFromServer() {
  await refreshOfficerNamesFromServer();
  const officerNames = getKnownOfficerNames();

  try {
    const [officerPayloads, globalRecords] = await Promise.all([
      Promise.all(
        officerNames.map((officerName) => {
          const allKeys = getOfficerStorageKeys(officerName);
          const canonicalKey = allKeys[0];
          return loadOfficerServerRecords(allKeys).then((results) => {
            const successfulResults = results.filter((result) => result.ok);
            const localFallbackRecords = readOfficerRecordsFromLocalStorage(officerName);
            const canonicalServerRecords = successfulResults.find((result) => result.key === canonicalKey)?.records || [];
            const canonicalRecords = canonicalServerRecords.length > 0
              ? canonicalServerRecords
              : localFallbackRecords;
            const allKeyPayloads = successfulResults.length > 0
              ? successfulResults.map((result) => result.records)
              : [localFallbackRecords];

            const canonicalFiltered = dedupeRecords(canonicalRecords).filter((record) => {
              const tagged = findOfficerName(record?.accountOfficer);
              return tagged === "" || tagged === officerName;
            }).map((record) => ({
              ...record,
              accountOfficer: officerName,
            }));

            const parityStatsRecords = dedupeRecordsForOfficerDashboardParity(allKeyPayloads.flat()).filter((record) => {
              const taggedOfficer = findOfficerName(record?.accountOfficer);
              return taggedOfficer === "" || taggedOfficer === officerName;
            }).map((record) => ({
              ...record,
              accountOfficer: officerName,
            }));

            const mergedOfficerPayload = dedupeRecords(allKeyPayloads.flat()).filter((record) => {
              const taggedOfficer = findOfficerName(record?.accountOfficer);
              return taggedOfficer === "" || taggedOfficer === officerName;
            });
            const normalizedRecords = mergedOfficerPayload.map((record) => ({
              ...record,
              accountOfficer: findOfficerName(String(record?.accountOfficer || "").trim()) || officerName,
            }));
            return {
              officerName,
              records: normalizedRecords,
              canonicalRecords: parityStatsRecords.length > 0 ? parityStatsRecords : canonicalFiltered,
            };
          });
        })
      ),
      loadStateRecords(STORAGE_KEY),
    ]);

    const nextOfficerSummaryStats = new Map();
    officerPayloads.forEach((entry) => {
      const officerName = String(entry?.officerName || "").trim();
      const records = Array.isArray(entry?.canonicalRecords) ? entry.canonicalRecords : [];
      if (!officerName) {
        return;
      }

      const todayIsoForStats = toIsoDate(new Date());
      const stats = records.reduce((acc, record) => {
        const isSettled = record?.isSettled === true;
        if (!isSettled) {
          acc.activeCount += 1;
          acc.balance += Math.max(0, computeOutstandingBalance(record));
          acc.totalAmount += Number(record?.amount || 0);
          // Use dueDate only (not payDate) to match officer dashboard past-due logic.
          // payDate is the "Move Pay Date" collection schedule which is unrelated to
          // whether a loan is contractually past its due date.
          if (isPastDueByDueDate(record, todayIsoForStats)) {
            acc.pastDueCount += 1;
          }
        }
        return acc;
      }, { balance: 0, activeCount: 0, totalAmount: 0, pastDueCount: 0 });

      nextOfficerSummaryStats.set(officerName, stats);
    });
    officerSummaryStats = nextOfficerSummaryStats;
    officerPastDueRecords = officerPayloads.flatMap((entry) => {
      const records = Array.isArray(entry?.canonicalRecords) ? entry.canonicalRecords : [];
      return records.filter((record) => isPastDueByDueDate(record, toIsoDate(new Date())));
    });
    const rawGlobalRecords = dedupeRecordsForOfficerDashboardParity([
      ...(Array.isArray(globalRecords) ? globalRecords : []),
      ...readGlobalRecordsFromLocalStorage(),
    ]);
    mainDashboardPastDueRecords = dedupeRecordsForOfficerDashboardParity(
      rawGlobalRecords.filter((record) =>
        isMainDashboardPastDueRecord(record, toIsoDate(new Date()))
      )
    );

    const mergedOfficerRecords = dedupeRecords(officerPayloads.flatMap((entry) => (Array.isArray(entry?.records) ? entry.records : [])));

    // Global records from the main dashboard have no accountOfficer — exclude any
    // that were previously contaminated (officer records leaked into the global key).
    const cleanGlobalRecords = globalRecords.filter(
      (r) => !String(r?.accountOfficer || "").trim()
    );

    const allRecords = dedupeRecords([...mergedOfficerRecords, ...cleanGlobalRecords]);

    recordsCache = allRecords;
    didLoadServerRecords = true;
    return;
  } catch {
    recordsCache = [];
    officerSummaryStats = new Map();
    officerPastDueRecords = [];
    mainDashboardPastDueRecords = [];
    didLoadServerRecords = true;
    return;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value || 0);
}

function formatCurrencyRoundedUp(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.ceil(Number(value) || 0));
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

function formatMonthLabel(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  if (!year || !month) {
    return String(monthKey || "");
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

  return `${monthNames[month - 1]} ${year}`;
}

function toIsoDate(dateValue) {
  const y = dateValue.getFullYear();
  const m = String(dateValue.getMonth() + 1).padStart(2, "0");
  const d = String(dateValue.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWriteOffActive(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  const rawFlag = record.isWriteOff;
  if (rawFlag === true) {
    return true;
  }
  if (typeof rawFlag === "string" && rawFlag.trim().toLowerCase() === "true") {
    return true;
  }

  return String(record.writeOffDate || "").trim() !== "";
}

function isHatagHatagActive(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  const rawFlag = record.isHatagHatag;
  if (rawFlag === true) {
    return true;
  }
  if (typeof rawFlag === "string" && rawFlag.trim().toLowerCase() === "true") {
    return true;
  }

  return String(record.hatagHatagDate || "").trim() !== "";
}

function getTypeLabel(payableWithin) {
  if (payableWithin === "monthly_open" || payableWithin === "Monthly") {
    return "Monthly - Open";
  }
  if (payableWithin === "bi_monthly_open") {
    return "Bi - Monthly (Others)";
  }
  if (payableWithin === "cash_advance_fixed_15") {
    return "Cash Advance (15 days) - Fixed";
  }
  if (payableWithin === "monthly_60_fixed") {
    return "Monthly (60 days) - Fixed";
  }
  if (payableWithin === "monthly_100_fixed") {
    return "Monthly (100 days) - Fixed";
  }
  if (payableWithin === "emergency_fixed" || payableWithin === "Emergency Loan") {
    return "Emergency Loan - Fixed";
  }
  if (payableWithin === "no_listed") {
    return "No Listed";
  }
  return payableWithin || "";
}

function isWeeklyFixedLoan(payableWithin) {
  return payableWithin === "emergency_fixed" || payableWithin === "Emergency Loan" || payableWithin === "Weekly";
}

function getPaymentHistory(record) {
  if (Array.isArray(record.paymentHistory)) {
    return record.paymentHistory;
  }
  return [];
}

function getTotalPaidAmount(record) {
  const totalPaid = Number(record?.totalPaidAmount ?? record?.paidAmount ?? 0);
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
    const interestReduced = Number(item?.interestReduced || 0);
    if (!Number.isFinite(interestReduced) || interestReduced <= 0) {
      return sum;
    }
    return sum + interestReduced;
  }, 0);
}

function getEffectiveInterestRate(record) {
  if (record?.payableWithin === "monthly_60_fixed") {
    return 10;
  }
  return Number(record?.interestRate || 0);
}

function computeBaseTotalPayable(record) {
  const effectiveInterestRate = getEffectiveInterestRate(record);
  const monthlyInterestAmount = Number(record?.amount || 0) * (effectiveInterestRate / 100);
  if (record?.payableWithin === "monthly_60_fixed") {
    return Number(record?.amount || 0) + monthlyInterestAmount * 2;
  }
  return Number(record?.amount || 0) + monthlyInterestAmount;
}

function diffDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.floor((to - from) / msPerDay);
}

function toStartOfDayDate(dateValue) {
  if (!dateValue) return null;
  const date = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
  if (Number.isNaN(date.getTime())) return null;
  return date;
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

function compareIsoDate(a, b) {
  const aTime = a ? new Date(`${a}T00:00:00`).getTime() : 0;
  const bTime = b ? new Date(`${b}T00:00:00`).getTime() : 0;
  return aTime - bTime;
}

function getWeeklyRunningState(record, referenceDate = new Date()) {
  const effectiveInterestRate = getEffectiveInterestRate(record) / 100;
  const periodsFromDate = record.payableWithin === "emergency_fixed"
    ? getEmergencyFixedInterestPeriodsFromDate
    : getWeeklyInterestPeriodsFromDate;
  const history = [...getPaymentHistory(record)]
    .filter((item) => {
      if (!item?.date) {
        return false;
      }
      const itemDate = new Date(`${item.date}T00:00:00`);
      const refDate = new Date(`${referenceDate instanceof Date ? referenceDate.toISOString().split('T')[0] : referenceDate}T00:00:00`);
      return itemDate <= refDate;
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

function computeOutstandingBalance(record) {
  if (record?.isSettled === true) {
    return 0;
  }

  if (isHatagHatagActive(record)) {
    const snapshot = Number(record?.hatagHatagOutstanding);
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

// Uses only dueDate (not payDate) — matches officer dashboard logic.
function isPastDueByDueDate(record, todayIso) {
  if (record?.isSettled === true || isWriteOffActive(record) || isHatagHatagActive(record)) {
    return false;
  }

  const effectiveDueDate = String(
    record?.dueDate || computeDueDate(record?.dateGranted, record?.payableWithin) || ""
  ).trim();
  if (!effectiveDueDate) {
    return false;
  }
  if (computeOutstandingBalance(record) <= 0) {
    return false;
  }
  return effectiveDueDate < todayIso;
}

function isMainDashboardPastDueRecord(record, todayIso) {
  if (record?.isSettled === true) {
    return false;
  }

  const dueDate = String(
    record?.dueDate || computeDueDate(record?.dateGranted, record?.payableWithin) || ""
  ).trim();
  if (!dueDate) {
    return false;
  }

  return computeOutstandingBalance(record) > 0 && compareIsoDate(dueDate, todayIso) < 0;
}

function isPastDueRecord(record, todayIso) {
  if (record?.isSettled === true || isWriteOffActive(record) || isHatagHatagActive(record)) {
    return false;
  }

  const effectiveDueDate = String(
    record?.payDate || record?.dueDate || computeDueDate(record?.dateGranted, record?.payableWithin) || ""
  ).trim();
  if (!effectiveDueDate) {
    return false;
  }
  if (computeOutstandingBalance(record) <= 0) {
    return false;
  }
  return effectiveDueDate < todayIso;
}

function computeEarnedInterest(record) {
  const paymentHistory = Array.isArray(record.paymentHistory) ? record.paymentHistory : [];
  if (paymentHistory.length > 0) {
    return paymentHistory.reduce((sum, item) => sum + Number(item.interestPaid || 0), 0);
  }

  const totalPaid = Number(record.totalPaidAmount ?? record.paidAmount ?? 0);
  const principalPaid = 0;
  return Math.max(0, totalPaid - principalPaid);
}

function getDailyCollections(records) {
  const dailyMap = {};

  records.forEach((record) => {
    const paymentHistory = Array.isArray(record.paymentHistory) ? record.paymentHistory : [];
    paymentHistory.forEach((payment) => {
      const paymentDate = String(payment.date || "").trim();
      if (!paymentDate) return;

      if (!dailyMap[paymentDate]) {
        dailyMap[paymentDate] = {
          principal: 0,
          interest: 0,
        };
      }

      const principalPaid = Number(payment.principalPaid || 0);
      const interestPaid = Number(payment.interestPaid || 0);

      dailyMap[paymentDate].principal += principalPaid;
      dailyMap[paymentDate].interest += interestPaid;
    });
  });

  return dailyMap;
}

function getTotalDailyCollections(records, selectedDate = "", selectedMonth = "") {
  const dailyMap = getDailyCollections(records);
  let totalPrincipal = 0;
  let totalInterest = 0;

  Object.entries(dailyMap).forEach(([date, data]) => {
    let includePayment = true;

    if (selectedDate) {
      // Compare payment date directly to selected date
      includePayment = date.trim() === selectedDate.trim();
    } else if (selectedMonth) {
      // Check if payment date starts with selected month
      includePayment = date.trim().startsWith(`${selectedMonth.trim()}-`);
    }

    if (includePayment) {
      totalPrincipal += data.principal;
      totalInterest += data.interest;
    }
  });

  return { principal: totalPrincipal, interest: totalInterest };
}

function renderDailyCollections(records) {
  const selectedDate = String(portfolioDateFilterInput?.value || "").trim();
  const selectedMonth = String(portfolioMonthFilterInput?.value || "").trim();

  // Only show daily collection when a specific date is chosen
  if (!selectedDate) {
    if (dailyPrincipalCollected) dailyPrincipalCollected.textContent = formatCurrency(0);
    if (dailyInterestCollected) dailyInterestCollected.textContent = formatCurrency(0);
    return;
  }

  const { principal, interest } = getTotalDailyCollections(records, selectedDate, selectedMonth);

  if (dailyPrincipalCollected) {
    dailyPrincipalCollected.textContent = formatCurrency(principal);
  }
  if (dailyInterestCollected) {
    dailyInterestCollected.textContent = formatCurrency(interest);
  }
}


function getTypeKey(payableWithin) {
  if (payableWithin === "monthly_open" || payableWithin === "Monthly") {
    return "monthlyOpen";
  }
  if (payableWithin === "bi_monthly_open") {
    return "biMonthly";
  }
  if (payableWithin === "cash_advance_fixed_15") {
    return "cashAdvance";
  }
  if (payableWithin === "monthly_60_fixed") {
    return "monthly60";
  }
  if (payableWithin === "monthly_100_fixed") {
    return "monthly14Weeks";
  }
  if (payableWithin === "emergency_fixed" || payableWithin === "Emergency Loan") {
    return "emergency";
  }
  if (payableWithin === "no_listed") {
    return "notListed";
  }
  return "notListed";
}

function renderTypeBreakdown(records) {
  const sourceRecords = Array.isArray(records) ? records : [];
  const openRecords = sourceRecords.filter((record) => record?.isSettled !== true && computeOutstandingBalance(record) > 0);
  const activeRecords = sourceRecords.filter((record) => record?.isSettled !== true);
  const settledRecordsForDashboardParity = getSettledDashboardParityRecords(sourceRecords);
  typeDetailBuckets = {
    monthlyOpen: [],
    biMonthly: [],
    cashAdvance: [],
    monthly60: [],
    monthly14Weeks: [],
    emergency: [],
    notListed: [],
    writeOff: [],
    hatagHatag: [],
    settled: settledRecordsForDashboardParity.slice(),
  };

  const counts = {
    monthlyOpen: 0,
    biMonthly: 0,
    cashAdvance: 0,
    monthly60: 0,
    monthly14Weeks: 0,
    emergency: 0,
    notListed: 0,
    writeOff: 0,
    hatagHatag: 0,
  };

  const balances = {
    monthlyOpen: 0,
    biMonthly: 0,
    cashAdvance: 0,
    monthly60: 0,
    monthly14Weeks: 0,
    emergency: 0,
    notListed: 0,
    writeOff: 0,
    hatagHatag: 0,
  };

  openRecords.forEach((record) => {
    const key = getTypeKey(record.payableWithin);
    const outstanding = computeOutstandingBalance(record);
    counts[key] += 1;
    balances[key] += outstanding;
    if (Array.isArray(typeDetailBuckets[key])) {
      typeDetailBuckets[key].push(record);
    }
  });

  activeRecords.forEach((record) => {
    const outstanding = Math.max(0, computeOutstandingBalance(record));

    if (isWriteOffActive(record)) {
      counts.writeOff += 1;
      balances.writeOff += outstanding;
      typeDetailBuckets.writeOff.push(record);
    }

    if (isHatagHatagActive(record)) {
      counts.hatagHatag += 1;
      balances.hatagHatag += outstanding;
      typeDetailBuckets.hatagHatag.push(record);
    }
  });

  let accountOfficerCount = 0;
  let accountOfficerBalance = 0;
  let settledCount = 0;
  let settledBalance = 0;

  sourceRecords.forEach((record) => {
    const outstanding = computeOutstandingBalance(record);
    const isSettled = record?.isSettled === true;

    if (!isSettled && record.accountOfficer && String(record.accountOfficer).trim()) {
      accountOfficerCount += 1;
      accountOfficerBalance += outstanding;
    }

  });

  settledCount = settledRecordsForDashboardParity.length;
  settledBalance = settledRecordsForDashboardParity.reduce(
    (sum, record) => sum + computeOutstandingBalance(record),
    0
  );

  if (typeMonthlyOpen) typeMonthlyOpen.textContent = String(counts.monthlyOpen);
  if (typeBiMonthly) typeBiMonthly.textContent = String(counts.biMonthly);
  if (typeCashAdvance) typeCashAdvance.textContent = String(counts.cashAdvance);
  if (typeMonthly60) typeMonthly60.textContent = String(counts.monthly60);
  if (typeMonthly14Weeks) typeMonthly14Weeks.textContent = String(counts.monthly14Weeks);
  if (typeEmergency) typeEmergency.textContent = String(counts.emergency);
  if (typeNotListed) typeNotListed.textContent = String(counts.notListed);
  if (typeWriteOff) typeWriteOff.textContent = String(counts.writeOff);
  if (typeHatagHatag) typeHatagHatag.textContent = String(counts.hatagHatag);
  if (typeAccountOfficer) typeAccountOfficer.textContent = String(accountOfficerCount);
  if (typeSettled) typeSettled.textContent = String(settledCount);

  if (typeMonthlyOpenBalance) typeMonthlyOpenBalance.textContent = formatCurrency(balances.monthlyOpen);
  if (typeBiMonthlyBalance) typeBiMonthlyBalance.textContent = formatCurrency(balances.biMonthly);
  if (typeCashAdvanceBalance) typeCashAdvanceBalance.textContent = formatCurrency(balances.cashAdvance);
  if (typeMonthly60Balance) typeMonthly60Balance.textContent = formatCurrency(balances.monthly60);
  if (typeMonthly14WeeksBalance) typeMonthly14WeeksBalance.textContent = formatCurrency(balances.monthly14Weeks);
  if (typeEmergencyBalance) typeEmergencyBalance.textContent = formatCurrency(balances.emergency);
  if (typeNotListedBalance) typeNotListedBalance.textContent = formatCurrency(balances.notListed);
  if (typeWriteOffBalance) typeWriteOffBalance.textContent = formatCurrency(balances.writeOff);
  if (typeHatagHatagBalance) typeHatagHatagBalance.textContent = formatCurrency(balances.hatagHatag);
  if (typeAccountOfficerBalance) typeAccountOfficerBalance.textContent = formatCurrency(accountOfficerBalance);
  if (typeSettledBalance) typeSettledBalance.textContent = formatCurrency(settledBalance);
}

function getTypeDetailTitle(typeKey) {
  const titles = {
    monthlyOpen: "Monthly - Open",
    biMonthly: "Bi - Monthly",
    cashAdvance: "Cash Advance",
    monthly60: "Monthly (60 Days) - Fixed",
    monthly14Weeks: "Monthly (14 weeks)",
    emergency: "Emergency Loan - Fixed",
    notListed: "Not Listed",
    writeOff: "Write-Off",
    hatagHatag: "Hatag-Hatag",
    settled: "Settled",
    pastDue: "Past Due",
  };

  return titles[typeKey] || "Loan Type";
}

function getRecordStatusLabel(record) {
  if (record?.isSettled === true) {
    return "Settled";
  }
  if (isWriteOffActive(record)) {
    return "Write-Off";
  }
  if (isHatagHatagActive(record)) {
    return "Hatag-Hatag";
  }
  return "Active";
}

function openTypeDataModal(typeKey) {
  const typeLabel = getTypeDetailTitle(typeKey);
  const records = (typeDetailBuckets[typeKey] || []).slice();

  if (!portfolioReleaseDataContent) {
    return;
  }

  if (records.length === 0) {
    openReleaseDataModal({
      mode: typeKey,
      title: `${typeLabel} Data`,
      subtitle: "No matching records for this type.",
      contentHtml: '<p class="empty" style="margin: 0;">No records found.</p>',
    });
    return;
  }

  const sorted = records
    .slice()
    .sort((a, b) => String(b.dateGranted || "").localeCompare(String(a.dateGranted || "")));

  const totalRelease = sorted.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalOutstanding = sorted.reduce((sum, record) => sum + Math.max(0, computeOutstandingBalance(record)), 0);
  const totalInterest = sorted.reduce((sum, record) => sum + computeEarnedInterest(record), 0);
  const hideInterest = typeKey === "pastDue";

  const subtitle = hideInterest
    ? `Count: ${sorted.length} | Total Release: ${formatCurrency(totalRelease)} | Total Outstanding: ${formatCurrency(totalOutstanding)}`
    : `Count: ${sorted.length} | Total Release: ${formatCurrency(totalRelease)} | Total Outstanding: ${formatCurrency(totalOutstanding)} | Total Interest: ${formatCurrency(totalInterest)}`;

  const rows = sorted
    .map((record) => {
      const borrowerName = String(record?.name || "-");
      const officerName = getOfficerNameFromRecord(record) || "-";
      const dateLabel = formatLongDate(record.dateGranted) || "-";
      const released = Number(record.amount || 0);
      const outstanding = Math.max(0, computeOutstandingBalance(record));
      const status = getRecordStatusLabel(record);

      return `<tr>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12);">${borrowerName}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); white-space: nowrap;">${officerName}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); white-space: nowrap;">${dateLabel}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: right; white-space: nowrap;">${formatCurrency(released)}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: right; white-space: nowrap;">${formatCurrency(outstanding)}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: center; white-space: nowrap;">${status}</td>
      </tr>`;
    })
    .join("");

  const contentHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Borrower</th>
          <th style="text-align: left; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Account Officer</th>
          <th style="text-align: left; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Date</th>
          <th style="text-align: right; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Released</th>
          <th style="text-align: right; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Outstanding</th>
          <th style="text-align: center; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Totals</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Released</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Outstanding</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">${hideInterest ? "Status" : "Interest"}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.12);">Value</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.12);">${formatCurrency(totalRelease)}</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.12);">${formatCurrency(totalOutstanding)}</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.12);">${hideInterest ? "-" : formatCurrency(totalInterest)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  openReleaseDataModal({
    mode: typeKey,
    title: `${typeLabel} Data`,
    subtitle,
    contentHtml,
  });
}

function getOfficerNameFromRecord(record) {
  const directName = findOfficerName(String(record?.accountOfficer || "").trim());
  return directName;
}

function renderOfficerDashboards() {
  const grid = document.getElementById("officer-dashboards-grid");
  if (!grid) {
    return;
  }

  const statsByOfficer = officerSummaryStats instanceof Map ? officerSummaryStats : new Map();

  const officers = OFFICER_NAMES.filter((name) => statsByOfficer.has(name) || true);

  if (officers.length === 0) {
    grid.innerHTML = '<p class="empty" style="margin: 0; font-size: 0.72rem;">No officer data yet.</p>';
    return;
  }

  grid.innerHTML = officers.map((name) => {
    const stats = statsByOfficer.get(name) || { balance: 0, activeCount: 0, totalAmount: 0, pastDueCount: 0 };
    const activeCount = Number(stats.activeCount || 0);
    const balance = Number(stats.balance || 0);
    const totalAmount = Number(stats.totalAmount || 0);
    const pastDueCount = Number(stats.pastDueCount || 0);
    const slug = toOfficerSlug(name);
    const initials = name.split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
    const pastDueClass = pastDueCount > 0 ? " officer-dash-stat__value--alert" : "";

    return `
      <article class="officer-dash-card" id="officer-dashboard-card-${slug}">
        <div class="officer-dash-card__header">
          <div class="officer-dash-card__avatar" aria-hidden="true">${initials}</div>
          <div>
            <div class="officer-dash-card__name">${name}</div>
            <div class="officer-dash-card__subtitle">Account Dashboard</div>
          </div>
        </div>
        <hr class="officer-dash-divider" />
        <div class="officer-dash-card__body">
          <div class="officer-dash-stat">
            <span class="officer-dash-stat__label">Total Loans Released</span>
            <span class="officer-dash-stat__value">${activeCount}</span>
            <span class="officer-dash-stat__sub">loan${activeCount === 1 ? "" : "s"}</span>
          </div>
          <div class="officer-dash-stat">
            <span class="officer-dash-stat__label">Total Outstanding Balance</span>
            <span class="officer-dash-stat__value">${formatCurrencyRoundedUp(balance)}</span>
          </div>
          <div class="officer-dash-stat">
            <span class="officer-dash-stat__label">Past Due Accounts</span>
            <span class="officer-dash-stat__value${pastDueClass}">${pastDueCount}</span>
            <span class="officer-dash-stat__sub">account${pastDueCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function getPortfolioFilteredRecords(records) {
  const selectedDate = String(portfolioDateFilterInput?.value || "").trim();
  const selectedMonth = String(portfolioMonthFilterInput?.value || "").trim();

  if (selectedDate) {
    return records.filter((record) => String(record.dateGranted || "").trim() === selectedDate);
  }

  if (selectedMonth) {
    return records.filter((record) => String(record.dateGranted || "").trim().startsWith(`${selectedMonth}-`));
  }

  return records;
}

function renderReleasedInterestBreakdown(records) {
  if (!releasedInterestBreakdown) {
    return;
  }

  if (!records.length) {
    releasedInterestBreakdown.innerHTML = '<p class="empty" style="margin: 0;">No released loans yet.</p>';
    releasedDataModalHtml = '<p class="empty" style="margin: 0;">No released loans yet.</p>';
    releasedDataModalSubtitle = DEFAULT_RELEASE_DATA_SUBTITLE;
    if (portfolioReleaseDataModal?.classList.contains("show") && activePortfolioModalMode === "released") {
      openReleaseDataModal({
        mode: "released",
        title: DEFAULT_RELEASE_DATA_TITLE,
        subtitle: releasedDataModalSubtitle,
        contentHtml: releasedDataModalHtml,
      });
    }
    if (showReleasedDataBtn) {
      showReleasedDataBtn.disabled = true;
    }
    return;
  }

  const sortedRecords = records
    .slice()
    .sort((a, b) => String(b.dateGranted || "").localeCompare(String(a.dateGranted || "")))
  const totalRelease = sortedRecords.reduce((sum, record) => {
    const amount = Number(record.amount || 0);
    return sum + amount;
  }, 0);
  const totalInterest = sortedRecords.reduce((sum, record) => {
    const amount = Number(record.amount || 0);
    const rate = Number(record.interestRate || 0);
    return sum + amount * (rate / 100);
  }, 0);

  const breakdownRows = sortedRecords
    .map((record) => {
      const amount = Number(record.amount || 0);
      const rate = Number(record.interestRate || 0);
      const interestAmount = amount * (rate / 100);
      const dateLabel = formatLongDate(record.dateGranted) || "-";

      return `<tr>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); white-space: nowrap;">${dateLabel}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: right; white-space: nowrap;">${formatCurrency(amount)}</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: center; white-space: nowrap;">${rate}%</td>
        <td style="padding: 4px 6px; border-bottom: 1px dashed rgba(0,0,0,0.12); text-align: right; white-space: nowrap;">${formatCurrency(interestAmount)}</td>
      </tr>`;
    })
    .join("");

  const breakdownTableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Date</th>
          <th style="text-align: right; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Released</th>
          <th style="text-align: center; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Rate</th>
          <th style="text-align: right; padding: 4px 6px; border-bottom: 1px solid rgba(0,0,0,0.2);">Interest</th>
        </tr>
      </thead>
      <tbody>
        ${breakdownRows}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Total Release</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">${formatCurrency(totalRelease)}</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Total Interest</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">${formatCurrency(totalInterest)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  releasedInterestBreakdown.innerHTML = `
    <p style="margin: 0; font-size: 0.66rem;">Total Interest: <strong>${formatCurrency(totalInterest)}</strong></p>
  `;
  releasedDataModalHtml = breakdownTableHtml;
  releasedDataModalSubtitle = `Total Release: ${formatCurrency(totalRelease)} | Total Interest: ${formatCurrency(totalInterest)}`;
  if (portfolioReleaseDataModal?.classList.contains("show") && activePortfolioModalMode === "released") {
    openReleaseDataModal({
      mode: "released",
      title: DEFAULT_RELEASE_DATA_TITLE,
      subtitle: releasedDataModalSubtitle,
      contentHtml: releasedDataModalHtml,
    });
  }
  if (showReleasedDataBtn) {
    showReleasedDataBtn.disabled = false;
  }
}

function renderPortfolio() {
  const allRecords = getRecords();
  const records = getPortfolioFilteredRecords(allRecords);
  const activeRecords = records.filter((record) => record?.isSettled !== true);
  const totalReleased = activeRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalEarnedInterest = activeRecords.reduce((sum, record) => sum + computeEarnedInterest(record), 0);
  const totalOutstanding = activeRecords.reduce((sum, record) => sum + computeOutstandingBalance(record), 0);
  const filteredMainDashboardPastDueRecords = getPortfolioFilteredRecords(mainDashboardPastDueRecords);
  const combinedPastDueRecords = dedupeRecordsForOfficerDashboardParity([
    ...(Array.isArray(officerPastDueRecords) ? officerPastDueRecords : []),
    ...filteredMainDashboardPastDueRecords,
  ]);
  const pastDueRecords = combinedPastDueRecords;
  const pastDueCount = pastDueRecords.length;
  const pastDueTotalRelease = pastDueRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const pastDueTotalInterest = pastDueRecords.reduce((sum, record) => sum + computeEarnedInterest(record), 0);

  if (portfolioTotal) {
    portfolioTotal.textContent = formatCurrency(totalReleased);
  }
  if (portfolioEarnedInterest) {
    portfolioEarnedInterest.textContent = formatCurrency(totalEarnedInterest);
  }
  if (portfolioTotalOutstanding) {
    portfolioTotalOutstanding.textContent = formatCurrency(totalOutstanding);
  }
  if (portfolioMeta) {
    portfolioMeta.textContent = `${activeRecords.length} released loan${activeRecords.length === 1 ? "" : "s"}`;
  }
  if (portfolioCount) {
    portfolioCount.textContent = String(activeRecords.length);
  }
  if (portfolioPastDueCount) {
    portfolioPastDueCount.textContent = String(pastDueCount);
  }
  if (portfolioPastDueBtn) {
    portfolioPastDueBtn.disabled = pastDueCount === 0;
  }
  if (pastDueBreakdown) {
    pastDueBreakdown.innerHTML = pastDueCount === 0
      ? '<p class="empty" style="margin: 0;">No past due loans.</p>'
      : `<p style="margin: 0; font-size: 0.66rem;">Total Release: <strong>${formatCurrency(pastDueTotalRelease)}</strong></p>`;
  }
  if (portfolioAverage) {
    portfolioAverage.textContent = formatCurrency(totalReleased);
  }

  renderReleasedInterestBreakdown(activeRecords);

  renderTypeBreakdown(allRecords);
  typeDetailBuckets.pastDue = pastDueRecords.slice();

  renderDailyCollections(allRecords);

  renderOfficerDashboards();
}

portfolioDateFilterInput?.addEventListener("change", () => {
  if (portfolioDateFilterInput.value) {
    if (portfolioMonthFilterInput) {
      portfolioMonthFilterInput.value = "";
    }
  }
  renderPortfolio();
});

portfolioMonthFilterInput?.addEventListener("change", () => {
  if (portfolioMonthFilterInput.value) {
    if (portfolioDateFilterInput) {
      portfolioDateFilterInput.value = "";
    }
  }
  renderPortfolio();
});

portfolioDateClearBtn?.addEventListener("click", () => {
  if (portfolioDateFilterInput) {
    portfolioDateFilterInput.value = "";
  }
  if (portfolioMonthFilterInput) {
    portfolioMonthFilterInput.value = "";
  }
  renderPortfolio();
});

const portfolioHamburgerBtn = document.getElementById("portfolio-hamburger");
const sideDrawer = document.getElementById("side-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const drawerCloseBtn = document.getElementById("drawer-close");
const drawerLogoutBtn = document.getElementById("drawer-logout");
const portfolioLogoutConfirmModal = document.getElementById("portfolio-logout-confirm-modal");
const portfolioLogoutConfirmCancelBtn = document.getElementById("portfolio-logout-confirm-cancel");
const portfolioLogoutConfirmYesBtn = document.getElementById("portfolio-logout-confirm-yes");
const themeOptions = document.querySelectorAll('input[name="theme-choice"]');

function applyTheme(theme) {
  const selectedTheme = ["white", "black", "blue", "green"].includes(theme) ? theme : "white";
  document.body.classList.remove("theme-white", "theme-black", "theme-blue", "theme-green");
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
  portfolioHamburgerBtn?.classList.add("is-open");
}

function closeDrawer() {
  sideDrawer?.classList.remove("is-open");
  drawerOverlay?.classList.remove("is-open");
  sideDrawer?.setAttribute("aria-hidden", "true");
  portfolioHamburgerBtn?.classList.remove("is-open");
}

function openReleaseDataModal(config = null) {
  const title = String(config?.title || DEFAULT_RELEASE_DATA_TITLE);
  const subtitle = String(config?.subtitle || DEFAULT_RELEASE_DATA_SUBTITLE);
  const contentHtml = typeof config?.contentHtml === "string" ? config.contentHtml : releasedDataModalHtml;

  activePortfolioModalMode = String(config?.mode || "released");

  if (portfolioReleaseDataTitle) {
    portfolioReleaseDataTitle.textContent = title;
  }
  if (portfolioReleaseDataSubtitle) {
    portfolioReleaseDataSubtitle.textContent = subtitle;
  }
  if (portfolioReleaseDataContent) {
    portfolioReleaseDataContent.innerHTML = contentHtml;
  }
  if (portfolioReleaseDataExportBtn) {
    const hasTable = Boolean(portfolioReleaseDataContent?.querySelector("table"));
    portfolioReleaseDataExportBtn.disabled = !hasTable;
  }
  portfolioReleaseDataModal?.classList.add("show");
  portfolioReleaseDataModal?.setAttribute("aria-hidden", "false");
}

function closeReleaseDataModal() {
  activePortfolioModalMode = "released";
  portfolioReleaseDataModal?.classList.remove("show");
  portfolioReleaseDataModal?.setAttribute("aria-hidden", "true");
}

function toCsvCell(value) {
  const text = String(value || "").replace(/\r?\n|\r/g, " ").trim();
  const escaped = text.replace(/"/g, '""');
  // Wrap as Excel text formula so values display exactly as exported.
  return `"=""${escaped}"""`;
}

function exportPortfolioModalTableToExcel() {
  const table = portfolioReleaseDataContent?.querySelector("table");
  if (!table) {
    return;
  }

  const rows = Array.from(table.querySelectorAll("tr"));
  const maxColumns = rows.reduce((max, row) => {
    const cells = Array.from(row.querySelectorAll("th, td"));
    const rowColumns = cells.reduce((sum, cell) => {
      const span = Number(cell.getAttribute("colspan") || 1);
      return sum + (Number.isFinite(span) && span > 0 ? span : 1);
    }, 0);
    return Math.max(max, rowColumns);
  }, 0);

  const csvRows = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("th, td"));
    const expanded = [];
    cells.forEach((cell) => {
      const span = Number(cell.getAttribute("colspan") || 1);
      const safeSpan = Number.isFinite(span) && span > 0 ? span : 1;
      expanded.push(cell.textContent || "");
      for (let i = 1; i < safeSpan; i += 1) {
        expanded.push("");
      }
    });
    while (expanded.length < maxColumns) {
      expanded.push("");
    }
    return expanded.map((cellValue) => toCsvCell(cellValue)).join(",");
  });

  const titleRow = toCsvCell(portfolioReleaseDataTitle?.textContent || "Portfolio Data");
  const subtitleRow = toCsvCell(portfolioReleaseDataSubtitle?.textContent || "");
  const headerRows = [titleRow];
  if (String(portfolioReleaseDataSubtitle?.textContent || "").trim()) {
    headerRows.push(subtitleRow);
  }

  const csvContent = `\uFEFF${[...headerRows, "", ...csvRows].join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const title = String(portfolioReleaseDataTitle?.textContent || "portfolio_data")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `${title || "portfolio_data"}_${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openLogoutConfirm() {
  portfolioLogoutConfirmModal?.classList.add("show");
  portfolioLogoutConfirmModal?.setAttribute("aria-hidden", "false");
}

function closeLogoutConfirm() {
  portfolioLogoutConfirmModal?.classList.remove("show");
  portfolioLogoutConfirmModal?.setAttribute("aria-hidden", "true");
}

function handleLogout() {
  closeLogoutConfirm();
  clearStoredPortfolioLogin();
  sessionStorage.clear();
  window.location.href = "index.html";
}

portfolioHamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);
showReleasedDataBtn?.addEventListener("click", openReleaseDataModal);
portfolioPastDueBtn?.addEventListener("click", () => {
  openTypeDataModal("pastDue");
});
portfolioTypesGrid?.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest(".portfolio-type-card[data-type-key]") : null;
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  const typeKey = String(trigger.dataset.typeKey || "").trim();
  if (!typeKey) {
    return;
  }

  openTypeDataModal(typeKey);
});
portfolioTypesGrid?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const trigger = event.target instanceof Element ? event.target.closest(".portfolio-type-card[data-type-key]") : null;
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  event.preventDefault();
  const typeKey = String(trigger.dataset.typeKey || "").trim();
  if (!typeKey) {
    return;
  }

  openTypeDataModal(typeKey);
});
portfolioReleaseDataCloseBtn?.addEventListener("click", closeReleaseDataModal);
portfolioReleaseDataExportBtn?.addEventListener("click", exportPortfolioModalTableToExcel);
portfolioReleaseDataModal?.addEventListener("click", (event) => {
  if (event.target === portfolioReleaseDataModal) {
    closeReleaseDataModal();
  }
});

drawerLogoutBtn?.addEventListener("click", () => {
  closeDrawer();
  openLogoutConfirm();
});

portfolioLogoutConfirmCancelBtn?.addEventListener("click", closeLogoutConfirm);
portfolioLogoutConfirmYesBtn?.addEventListener("click", handleLogout);

portfolioLogoutConfirmModal?.addEventListener("click", (event) => {
  if (event.target === portfolioLogoutConfirmModal) {
    closeLogoutConfirm();
  }
});

themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

restoreStoredPortfolioLogin();

if (!hasStoredPortfolioLogin()) {
  window.location.href = "index.html";
} else {
  initializeTheme();
  if (portfolioDateFilterInput) {
    portfolioDateFilterInput.value = "";
  }
  loadRecordsFromServer().then(() => renderPortfolio());
}

window.addEventListener("storage", (event) => {
  const key = String(event.key || "");
  if (key === STORAGE_KEY || key.startsWith("mgi_officer_records_")) {
    loadRecordsFromServer().then(() => renderPortfolio());
  }
});

setInterval(() => {
  loadRecordsFromServer().then(() => renderPortfolio());
}, 30000);

window.addEventListener("focus", () => {
  loadRecordsFromServer().then(() => renderPortfolio());
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadRecordsFromServer().then(() => renderPortfolio());
  }
});