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

  const reload = () => {
    updateServiceWorker();
    window.location.reload();
  };

  return { needRefresh, reload };
}
