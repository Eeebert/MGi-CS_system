const STORAGE_KEY = "mgi_loan_records";
const LOGIN_SESSION_KEY = "mgi_logged_in";
const THEME_KEY = "mgi_dashboard_theme";

const activeLoansEl = document.getElementById("runner-active-loans");
const totalOutstandingEl = document.getElementById("runner-total-outstanding");
const dueTodayEl = document.getElementById("runner-due-today");
const overdueEl = document.getElementById("runner-overdue");
const runnerMetaEl = document.getElementById("runner-meta");
const runnerBody = document.getElementById("runner-body");
const runnerBackDashboardBtn = document.getElementById("runner-back-dashboard");
const runnerLogoutBtn = document.getElementById("runner-logout");

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

function toDateStart(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

  return `${monthNames[month - 1]} ${day}, ${year}`;
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
    return "Monthly (14 weeks)";
  }
  if (payableWithin === "emergency_fixed" || payableWithin === "Emergency Loan") {
    return "Emergency Loan - Fixed";
  }
  if (payableWithin === "no_listed") {
    return "Not Listed";
  }
  return payableWithin || "";
}

function computeOutstandingBalance(record) {
  const totalPaid = Number(record.totalPaidAmount ?? record.paidAmount ?? 0);
  const amount = Number(record.amount || 0);
  const interestRate = Number(record.interestRate || 0);
  const totalPayable = amount + amount * (interestRate / 100);
  return Math.max(0, totalPayable - totalPaid);
}

function getLoanStatus(record, todayDate) {
  const dueDate = toDateStart(record.dueDate);
  const outstanding = computeOutstandingBalance(record);

  if (outstanding <= 0) {
    return "Paid";
  }

  if (!dueDate) {
    return "Active";
  }

  if (dueDate < todayDate) {
    return "Overdue";
  }

  if (record.dueDate === todayIso()) {
    return "Due Today";
  }

  return "Active";
}

function renderRunnerDashboard() {
  const records = getRecords();
  const today = toDateStart(todayIso());

  const withOutstanding = records.filter((record) => computeOutstandingBalance(record) > 0);
  const dueTodayCount = withOutstanding.filter((record) => record.dueDate === todayIso()).length;
  const overdueCount = withOutstanding.filter((record) => {
    const dueDate = toDateStart(record.dueDate);
    return dueDate && today && dueDate < today;
  }).length;
  const totalOutstanding = withOutstanding.reduce((sum, record) => sum + computeOutstandingBalance(record), 0);

  if (activeLoansEl) {
    activeLoansEl.textContent = String(withOutstanding.length);
  }
  if (totalOutstandingEl) {
    totalOutstandingEl.textContent = formatCurrency(totalOutstanding);
  }
  if (dueTodayEl) {
    dueTodayEl.textContent = String(dueTodayCount);
  }
  if (overdueEl) {
    overdueEl.textContent = String(overdueCount);
  }
  if (runnerMetaEl) {
    runnerMetaEl.textContent = `${records.length} total record${records.length === 1 ? "" : "s"}`;
  }

  if (!runnerBody) {
    return;
  }

  if (records.length === 0) {
    runnerBody.innerHTML = '<tr><td colspan="6" class="empty">No loan records yet.</td></tr>';
    return;
  }

  const rows = [...records]
    .sort((a, b) => {
      const aDate = toDateStart(a.dueDate);
      const bDate = toDateStart(b.dueDate);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .map((record) => {
      const outstanding = computeOutstandingBalance(record);
      const status = getLoanStatus(record, today);
      return `
        <tr>
          <td>${String(record.name || "-")}</td>
          <td>${getTypeLabel(record.payableWithin)}</td>
          <td>${formatLongDate(record.dateGranted)}</td>
          <td>${formatLongDate(record.dueDate)}</td>
          <td>${formatCurrency(outstanding)}</td>
          <td>${status}</td>
        </tr>
      `;
    })
    .join("");

  runnerBody.innerHTML = rows;
}

const runnerHamburgerBtn = document.getElementById("runner-hamburger");
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
  const savedTheme = localStorage.getItem(THEME_KEY) || "black";
  applyTheme(savedTheme);
}

function openDrawer() {
  sideDrawer?.classList.add("is-open");
  drawerOverlay?.classList.add("is-open");
  sideDrawer?.setAttribute("aria-hidden", "false");
  runnerHamburgerBtn?.classList.add("is-open");
}

function closeDrawer() {
  sideDrawer?.classList.remove("is-open");
  drawerOverlay?.classList.remove("is-open");
  sideDrawer?.setAttribute("aria-hidden", "true");
  runnerHamburgerBtn?.classList.remove("is-open");
}

runnerHamburgerBtn?.addEventListener("click", openDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

drawerLogoutBtn?.addEventListener("click", () => {
  closeDrawer();
  runnerLogoutBtn?.click();
});

themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

runnerBackDashboardBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

runnerLogoutBtn?.addEventListener("click", () => {
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
  renderRunnerDashboard();
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    renderRunnerDashboard();
  }
});
