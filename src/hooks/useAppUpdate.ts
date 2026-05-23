import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

// Detects when a newer build's service worker is waiting and exposes a reload
// that activates it. Update checks only run on focus/open (no background timer).
export function useAppUpdate(): { needRefresh: boolean; reload: () => void } {
  const registration = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      registration.current = r ?? null;
    },
  });

  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      registration.current?.update();
    };
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Drive skip-waiting -> controllerchange -> reload ourselves rather than relying
  // on updateServiceWorker(true)'s internal `isUpdate` heuristic (which can no-op).
  // A plain reload while the OLD SW still controls the page just re-serves the
  // cached build, so we must wait for the new SW to take control before reloading.
  const reload = () => {
    const waiting = registration.current?.waiting;
    if (waiting) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => window.location.reload(),
        { once: true },
      );
      waiting.postMessage({ type: "SKIP_WAITING" });
      // Belt-and-suspenders: also kick the plugin's own skip-waiting path.
      void updateServiceWorker(true);
    } else {
      // No waiting worker (already up to date / dev): a normal reload is enough.
      window.location.reload();
    }
  };

  return { needRefresh, reload };
}
