(function () {
  let deferredPrompt = null;
  let installBtn = null;

  function isStandaloneMode() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function ensureInstallButton() {
    if (installBtn) {
      return installBtn;
    }

    installBtn = document.getElementById("install-app-btn");
    if (installBtn) {
      return installBtn;
    }

    const topbarActions = document.querySelector(".topbar-actions");
    if (!topbarActions) {
      return null;
    }

    const btn = document.createElement("button");
    btn.id = "install-app-btn";
    btn.type = "button";
    btn.className = "btn-secondary";
    btn.textContent = "Install App";
    btn.style.display = "none";
    topbarActions.prepend(btn);

    installBtn = btn;
    return installBtn;
  }

  function toggleInstallButton(show) {
    const btn = ensureInstallButton();
    if (!btn) {
      return;
    }
    btn.style.display = show ? "inline-flex" : "none";
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  function setupInstallPrompt() {
    const btn = ensureInstallButton();
    if (!btn) {
      return;
    }

    if (isStandaloneMode()) {
      toggleInstallButton(false);
      return;
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      toggleInstallButton(true);
    });

    btn.addEventListener("click", async () => {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      toggleInstallButton(false);
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      toggleInstallButton(false);
    });
  }

  registerServiceWorker();
  setupInstallPrompt();
})();
