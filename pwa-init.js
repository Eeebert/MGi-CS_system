(function () {
  // Skip PWA install button on portfolio page
  if (window.location.pathname.includes("portfolio.html")) {
    return;
  }

  let deferredPrompt = null;
  let installBtn = null;
  let hasControllerChanged = false;

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

  function activateWaitingWorker(worker) {
    if (!worker) {
      return;
    }
    worker.postMessage({ type: "SKIP_WAITING" });
  }

  function watchRegistration(registration) {
    if (!registration) {
      return;
    }

    if (registration.waiting) {
      activateWaitingWorker(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) {
        return;
      }

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          activateWaitingWorker(newWorker);
        }
      });
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasControllerChanged) {
        return;
      }
      hasControllerChanged = true;
      window.location.reload();
    });

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        watchRegistration(registration);
        registration.update().catch(() => {});

        window.addEventListener("focus", () => {
          registration.update().catch(() => {});
        });

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        });
      } catch {
        // Ignore registration failures and continue without PWA features.
      }
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
