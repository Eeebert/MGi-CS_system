const STORAGE_KEY = "mgi_loan_records";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const THEME_KEY = "mgi_dashboard_theme";

const portfolioTotal = document.getElementById("portfolio-total");
const portfolioEarnedInterest = document.getElementById("portfolio-earned-interest");
const portfolioTotalOutstanding = document.getElementById("portfolio-total-outstanding");
const portfolioMeta = document.getElementById("portfolio-meta");
const portfolioCount = document.getElementById("portfolio-count");
const portfolioPastDueCount = document.getElementById("portfolio-past-due-count");
const portfolioAverage = document.getElementById("portfolio-average");
const releasedInterestBreakdown = document.getElementById("released-interest-breakdown");
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
const typeSettled = document.getElementById("type-settled");
const typeAccountOfficerBalance = document.getElementById("type-account-officer-balance");
const typeSettledBalance = document.getElementById("type-settled-balance");
const portfolioLogoutBtn = document.getElementById("portfolio-logout");
const dailyPrincipalCollected = document.getElementById("daily-principal-collected");
const dailyInterestCollected = document.getElementById("daily-interest-collected");

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
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

function compareIsoDate(a, b) {
  const aTime = a ? new Date(`${a}T00:00:00`).getTime() : 0;
  const bTime = b ? new Date(`${b}T00:00:00`).getTime() : 0;
  return aTime - bTime;
}

function getWeeklyRunningState(record, referenceDate = new Date()) {
  const effectiveInterestRate = Number(record.interestRate || 0) / 100;
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

function computeOutstandingBalance(record) {
  // For weekly loans (Emergency Loan, etc.), use the running balance calculation
  if (isWeeklyFixedLoan(record.payableWithin)) {
    return getWeeklyRunningState(record).outstandingBalance;
  }
  
  // For other loans, use simple calculation
  const amount = Number(record.amount || 0);
  const interestRate = Number(record.interestRate || 0);
  const monthlyInterestAmount = amount * (interestRate / 100);
  const totalPayable = amount + monthlyInterestAmount;
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

  records.forEach((record) => {
    const key = getTypeKey(record.payableWithin);
    counts[key] += 1;
    balances[key] += computeOutstandingBalance(record);
  });
  let accountOfficerCount = 0;
  let accountOfficerBalance = 0;
  let settledCount = 0;
  let settledBalance = 0;

  records.forEach((record) => {
    if (record.accountOfficer && String(record.accountOfficer).trim()) {
      accountOfficerCount += 1;
      accountOfficerBalance += computeOutstandingBalance(record);
    }

    const outstanding = computeOutstandingBalance(record);
    if (outstanding === 0) {
      settledCount += 1;
      settledBalance += 0;
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

  releasedInterestBreakdown.innerHTML = `
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
}

function renderPortfolio() {
  const allRecords = getRecords();
  const records = getPortfolioFilteredRecords(allRecords);
  const totalReleased = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalEarnedInterest = records.reduce((sum, record) => sum + computeEarnedInterest(record), 0);
  const totalOutstanding = records.reduce((sum, record) => sum + computeOutstandingBalance(record), 0);
  const todayIso = new Date().toISOString().slice(0, 10);
  const pastDueCount = records.filter((record) => isPastDueRecord(record, todayIso)).length;

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
    portfolioMeta.textContent = `${records.length} released loan${records.length === 1 ? "" : "s"}`;
  }
  if (portfolioCount) {
    portfolioCount.textContent = String(records.length);
  }
  if (portfolioPastDueCount) {
    portfolioPastDueCount.textContent = String(pastDueCount);
  }
  if (portfolioAverage) {
    portfolioAverage.textContent = formatCurrency(totalReleased);
  }

  renderReleasedInterestBreakdown(records);

  renderTypeBreakdown(records);

  renderDailyCollections(allRecords);
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
  portfolioHamburgerBtn?.classList.add("is-open");
}

function closeDrawer() {
  sideDrawer?.classList.remove("is-open");
  drawerOverlay?.classList.remove("is-open");
  sideDrawer?.setAttribute("aria-hidden", "true");
  portfolioHamburgerBtn?.classList.remove("is-open");
}

portfolioHamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

drawerLogoutBtn?.addEventListener("click", () => {
  closeDrawer();
  portfolioLogoutBtn?.click();
});

themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

backDashboardBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

portfolioLogoutBtn?.addEventListener("click", () => {
  const confirmed = window.confirm("Log out now?");
  if (!confirmed) {
    return;
  }
  sessionStorage.removeItem(LOGIN_SESSION_KEY);
  sessionStorage.clear();
  window.location.href = "index.html";
});

if (sessionStorage.getItem(LOGIN_SESSION_KEY) !== "1") {
  window.location.href = "index.html";
} else {
  initializeTheme();
  renderPortfolio();
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    renderPortfolio();
  }
});