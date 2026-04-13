const STORAGE_KEY = "mgi_loan_records";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const PORTFOLIO_SESSION_KEY = "mgi_portfolio_logged_in";
const THEME_KEY = "mgi_dashboard_theme";

const portfolioTotal = document.getElementById("portfolio-total");
const portfolioEarnedInterest = document.getElementById("portfolio-earned-interest");
const portfolioTotalOutstanding = document.getElementById("portfolio-total-outstanding");
const portfolioMeta = document.getElementById("portfolio-meta");
const portfolioCount = document.getElementById("portfolio-count");
const portfolioPastDueCount = document.getElementById("portfolio-past-due-count");
const portfolioAverage = document.getElementById("portfolio-average");
const releasedInterestBreakdown = document.getElementById("released-interest-breakdown");
const showReleasedDataBtn = document.getElementById("show-released-data");
const portfolioReleaseDataModal = document.getElementById("portfolio-release-data-modal");
const portfolioReleaseDataCloseBtn = document.getElementById("portfolio-release-data-close");
const portfolioReleaseDataContent = document.getElementById("portfolio-release-data-content");
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
const typeMonthlyOpenBalance = document.getElementById("type-monthly-open-balance");
const typeBiMonthlyBalance = document.getElementById("type-bi-monthly-balance");
const typeCashAdvanceBalance = document.getElementById("type-cash-advance-balance");
const typeMonthly60Balance = document.getElementById("type-monthly-60-balance");
const typeMonthly14WeeksBalance = document.getElementById("type-monthly-14-weeks-balance");
const typeEmergencyBalance = document.getElementById("type-emergency-balance");
const typeNotListedBalance = document.getElementById("type-not-listed-balance");
const backDashboardBtn = document.getElementById("back-dashboard");
const typeAccountOfficer = document.getElementById("type-account-officer");
const officerCountJunJun = document.getElementById("officer-count-junjun");
const officerCountAga = document.getElementById("officer-count-aga");
const officerCountJomar = document.getElementById("officer-count-jomar");
const officerCountJames = document.getElementById("officer-count-james");
const officerCountJambi = document.getElementById("officer-count-jambi");
const officerCountMariaJoy = document.getElementById("officer-count-mariajoy");
const typeSettled = document.getElementById("type-settled");
const typeAccountOfficerBalance = document.getElementById("type-account-officer-balance");
const typeSettledBalance = document.getElementById("type-settled-balance");
const portfolioLogoutBtn = document.getElementById("portfolio-logout");
const dailyPrincipalCollected = document.getElementById("daily-principal-collected");
const dailyInterestCollected = document.getElementById("daily-interest-collected");
const API_FALLBACK_ORIGIN = "https://mgi-cs-system.onrender.com";
const OFFICER_NAMES = ["JunJun", "Aga", "Jomar", "James", "Jambi", "Maria Joy"];
const OFFICER_STORAGE_KEY_PREFIX = "mgi_officer_records_";
let recordsCache = [];
let didLoadServerRecords = false;

const OFFICER_SLUG_TO_NAME = OFFICER_NAMES.reduce((acc, name) => {
  acc[toOfficerSlug(name)] = name;
  return acc;
}, {});

const officerSummaryCards = [
  { valueEl: officerCountJunJun, fallbackName: "JunJun" },
  { valueEl: officerCountAga, fallbackName: "Aga" },
  { valueEl: officerCountJomar, fallbackName: "Jomar" },
  { valueEl: officerCountJames, fallbackName: "James" },
  { valueEl: officerCountJambi, fallbackName: "Jambi" },
  { valueEl: officerCountMariaJoy, fallbackName: "Maria Joy" },
].map((item) => ({
  ...item,
  labelEl: item.valueEl?.closest("article")?.querySelector(".portfolio-type-label") || null,
  metaEl: item.valueEl?.closest("article")?.querySelector("p") || null,
}));

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
  const names = new Set(OFFICER_NAMES);
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = String(localStorage.key(index) || "");
      if (!key.startsWith(OFFICER_STORAGE_KEY_PREFIX)) {
        continue;
      }
      const officerName = findOfficerName(key.slice(OFFICER_STORAGE_KEY_PREFIX.length).trim());
      if (officerName) {
        names.add(officerName);
      }
    }
  } catch {
    // Ignore localStorage access errors.
  }
  return Array.from(names);
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

function readCachedStateRecords(stateKey) {
  try {
    const raw = localStorage.getItem(stateKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLocalOfficerRecords() {
  const merged = getKnownOfficerNames().flatMap((officerName) => {
    const allRecords = getOfficerStorageKeys(officerName)
      .flatMap((stateKey) => readCachedStateRecords(stateKey))
      .filter((record) => {
        const taggedOfficer = findOfficerName(record?.accountOfficer);
        return taggedOfficer === "" || taggedOfficer === officerName;
      })
      .map((record) => ({
        ...record,
        accountOfficer: findOfficerName(String(record?.accountOfficer || "").trim()) || officerName,
      }));
    return dedupeRecords(allRecords);
  });

  return dedupeRecords(merged);
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
  if (didLoadServerRecords) {
    return Array.isArray(recordsCache) ? recordsCache : [];
  }

  const localOfficerRecords = getLocalOfficerRecords();
  const localGlobalRecords = readCachedStateRecords(STORAGE_KEY).filter(
    (r) => !String(r?.accountOfficer || "").trim()
  );
  const merged = dedupeRecords([...localOfficerRecords, ...localGlobalRecords]);
  return merged.length > 0 ? merged : localGlobalRecords;
}

async function loadRecordsFromServer() {
  const officerNames = getKnownOfficerNames();

  try {
    const [officerPayloads, globalRecords] = await Promise.all([
      Promise.all(
        officerNames.map((officerName) => Promise.all(getOfficerStorageKeys(officerName).map((stateKey) => loadStateRecords(stateKey))).then((payloads) => {
          const mergedOfficerPayload = dedupeRecords(payloads.flat()).filter((record) => {
            const taggedOfficer = findOfficerName(record?.accountOfficer);
            return taggedOfficer === "" || taggedOfficer === officerName;
          });
          return mergedOfficerPayload.map((record) => ({
            ...record,
            accountOfficer: findOfficerName(String(record?.accountOfficer || "").trim()) || officerName,
          }));
        }))
      ),
      loadStateRecords(STORAGE_KEY),
    ]);

    const mergedOfficerRecords = dedupeRecords(officerPayloads.flat());

    // Global records from the main dashboard have no accountOfficer — exclude any
    // that were previously contaminated (officer records leaked into the global key).
    const cleanGlobalRecords = globalRecords.filter(
      (r) => !String(r?.accountOfficer || "").trim()
    );

    const allRecords = dedupeRecords([...mergedOfficerRecords, ...cleanGlobalRecords]);

    if (allRecords.length > 0) {
      recordsCache = allRecords;
      didLoadServerRecords = true;
      return;
    }
  } catch {
    // Fall back to localStorage-backed records when server state is unavailable.
  }

  recordsCache = getRecords();
  didLoadServerRecords = true;
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
  const effectiveInterestRate = Number(record.interestRate || 0) / 100;
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
    const interestOutstanding = Math.max(0, outstandingBalance - principalBalance);
    const interestPaid = Math.min(amountPaid, interestOutstanding);
    const principalPaid = Math.min(principalBalance, Math.max(0, amountPaid - interestPaid));

    outstandingBalance = Math.max(0, outstandingBalance - amountPaid);
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

  // For weekly loans (Emergency Loan, etc.), use the running balance calculation
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record).outstandingBalance;
  }
  
  // Keep Monthly 60-day fixed loan math consistent with Officer Dashboard.
  const amount = Number(record.amount || 0);
  const interestRate = record.payableWithin === "monthly_60_fixed"
    ? 10
    : Number(record.interestRate || 0);
  const monthlyInterestAmount = amount * (interestRate / 100);
  const totalPayable = record.payableWithin === "monthly_60_fixed"
    ? amount + monthlyInterestAmount * 2
    : amount + monthlyInterestAmount;
  const totalPaid = Number(record.totalPaidAmount ?? record.paidAmount ?? 0);
  
  return Math.max(0, totalPayable - totalPaid);
}

function isPastDueRecord(record, todayIso) {
  const dueDate = String(record?.dueDate || "").trim();
  if (!dueDate) {
    return false;
  }
  if (computeOutstandingBalance(record) <= 0) {
    return false;
  }
  return dueDate < todayIso;
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

  const counts = {
    monthlyOpen: 0,
    biMonthly: 0,
    cashAdvance: 0,
    monthly60: 0,
    monthly14Weeks: 0,
    emergency: 0,
    notListed: 0,
  };

  const balances = {
    monthlyOpen: 0,
    biMonthly: 0,
    cashAdvance: 0,
    monthly60: 0,
    monthly14Weeks: 0,
    emergency: 0,
    notListed: 0,
  };

  openRecords.forEach((record) => {
    const key = getTypeKey(record.payableWithin);
    counts[key] += 1;
    balances[key] += computeOutstandingBalance(record);
  });

  let accountOfficerCount = 0;
  let accountOfficerBalance = 0;
  let settledCount = 0;
  let settledBalance = 0;

  sourceRecords.forEach((record) => {
    const outstanding = computeOutstandingBalance(record);
    const isSettled = record?.isSettled === true || outstanding <= 0;

    if (!isSettled && record.accountOfficer && String(record.accountOfficer).trim()) {
      accountOfficerCount += 1;
      accountOfficerBalance += outstanding;
    }

    if (isSettled) {
      settledCount += 1;
      settledBalance += outstanding;
    }
  });

  if (typeMonthlyOpen) typeMonthlyOpen.textContent = String(counts.monthlyOpen);
  if (typeBiMonthly) typeBiMonthly.textContent = String(counts.biMonthly);
  if (typeCashAdvance) typeCashAdvance.textContent = String(counts.cashAdvance);
  if (typeMonthly60) typeMonthly60.textContent = String(counts.monthly60);
  if (typeMonthly14Weeks) typeMonthly14Weeks.textContent = String(counts.monthly14Weeks);
  if (typeEmergency) typeEmergency.textContent = String(counts.emergency);
  if (typeNotListed) typeNotListed.textContent = String(counts.notListed);
  if (typeAccountOfficer) typeAccountOfficer.textContent = String(accountOfficerCount);
  if (typeSettled) typeSettled.textContent = String(settledCount);

  if (typeMonthlyOpenBalance) typeMonthlyOpenBalance.textContent = formatCurrency(balances.monthlyOpen);
  if (typeBiMonthlyBalance) typeBiMonthlyBalance.textContent = formatCurrency(balances.biMonthly);
  if (typeCashAdvanceBalance) typeCashAdvanceBalance.textContent = formatCurrency(balances.cashAdvance);
  if (typeMonthly60Balance) typeMonthly60Balance.textContent = formatCurrency(balances.monthly60);
  if (typeMonthly14WeeksBalance) typeMonthly14WeeksBalance.textContent = formatCurrency(balances.monthly14Weeks);
  if (typeEmergencyBalance) typeEmergencyBalance.textContent = formatCurrency(balances.emergency);
  if (typeNotListedBalance) typeNotListedBalance.textContent = formatCurrency(balances.notListed);
  if (typeAccountOfficerBalance) typeAccountOfficerBalance.textContent = formatCurrency(accountOfficerBalance);
  if (typeSettledBalance) typeSettledBalance.textContent = formatCurrency(settledBalance);
}

function getOfficerNameFromRecord(record) {
  const directName = findOfficerName(String(record?.accountOfficer || "").trim());
  if (directName) {
    return directName;
  }
  const fallbackName = findOfficerName(String(record?.officerName || record?.officer || "").trim());
  return fallbackName;
}

function renderOfficerCounts(records) {
  const statsByOfficer = new Map();

  records.forEach((record) => {
    const officerName = getOfficerNameFromRecord(record);
    if (!officerName) {
      return;
    }
    const outstanding = computeOutstandingBalance(record);
    const prev = statsByOfficer.get(officerName) || { balance: 0, openCount: 0 };
    const nextBalance = prev.balance + Math.max(0, outstanding);
    const nextOpenCount = outstanding > 0 ? prev.openCount + 1 : prev.openCount;
    statsByOfficer.set(officerName, {
      balance: nextBalance,
      openCount: nextOpenCount,
    });
  });

  const ranked = Array.from(statsByOfficer.entries())
    .sort((a, b) => b[1].balance - a[1].balance);

  const cardCount = officerSummaryCards.length;
  const displayRows = ranked.slice(0, cardCount);

  if (displayRows.length < cardCount) {
    const usedNames = new Set(displayRows.map(([name]) => name));
    OFFICER_NAMES.forEach((name) => {
      if (displayRows.length >= cardCount || usedNames.has(name)) {
        return;
      }
      displayRows.push([name, statsByOfficer.get(name) || { balance: 0, openCount: 0 }]);
      usedNames.add(name);
    });
  }

  officerSummaryCards.forEach((card, index) => {
    const [name, stats] = displayRows[index] || [card.fallbackName, { balance: 0, openCount: 0 }];
    const openCount = Number(stats?.openCount || 0);
    const balance = Number(stats?.balance || 0);
    if (card.labelEl) {
      card.labelEl.textContent = name;
    }
    if (card.metaEl) {
      card.metaEl.textContent = `${openCount} open account${openCount === 1 ? "" : "s"}`;
    }
    if (card.valueEl) {
      card.valueEl.textContent = formatCurrency(balance);
    }
  });
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
  if (!releasedInterestBreakdown || !portfolioReleaseDataContent) {
    return;
  }

  if (!records.length) {
    releasedInterestBreakdown.innerHTML = '<p class="empty" style="margin: 0;">No released loans yet.</p>';
    portfolioReleaseDataContent.innerHTML = '<p class="empty" style="margin: 0;">No released loans yet.</p>';
    if (showReleasedDataBtn) {
      showReleasedDataBtn.disabled = true;
    }
    return;
  }

  const sortedRecords = records
    .slice()
    .sort((a, b) => String(b.dateGranted || "").localeCompare(String(a.dateGranted || "")))
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
          <td colspan="3" style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">Total Interest</td>
          <td style="padding: 6px; text-align: right; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2);">${formatCurrency(totalInterest)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  releasedInterestBreakdown.innerHTML = `
    <p style="margin: 0; font-size: 0.66rem;">Total Interest: <strong>${formatCurrency(totalInterest)}</strong></p>
  `;
  portfolioReleaseDataContent.innerHTML = breakdownTableHtml;
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
  const todayIso = new Date().toISOString().slice(0, 10);
  const pastDueCount = activeRecords.filter((record) => isPastDueRecord(record, todayIso)).length;

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
  if (portfolioAverage) {
    portfolioAverage.textContent = formatCurrency(totalReleased);
  }

  renderReleasedInterestBreakdown(activeRecords);

  renderTypeBreakdown(allRecords);

  renderDailyCollections(allRecords);

  renderOfficerCounts(records);
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

function openReleaseDataModal() {
  portfolioReleaseDataModal?.classList.add("show");
  portfolioReleaseDataModal?.setAttribute("aria-hidden", "false");
}

function closeReleaseDataModal() {
  portfolioReleaseDataModal?.classList.remove("show");
  portfolioReleaseDataModal?.setAttribute("aria-hidden", "true");
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
  sessionStorage.removeItem(PORTFOLIO_SESSION_KEY);
  sessionStorage.clear();
  window.location.href = "index.html";
}

portfolioHamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);
showReleasedDataBtn?.addEventListener("click", openReleaseDataModal);
portfolioReleaseDataCloseBtn?.addEventListener("click", closeReleaseDataModal);
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

if (sessionStorage.getItem(PORTFOLIO_SESSION_KEY) !== "1") {
  window.location.href = "index.html";
} else {
  initializeTheme();
  if (portfolioDateFilterInput) {
    portfolioDateFilterInput.value = "";
  }
  if (portfolioMonthFilterInput) {
    portfolioMonthFilterInput.value = "";
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