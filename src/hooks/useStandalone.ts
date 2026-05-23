import { useEffect, useState } from "react";

// True when the app runs as an installed PWA rather than inside a browser tab.
function detectStandalone(): boolean {
  if (typeof window === "undefined") return true;
  const mql = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari exposes navigator.standalone instead of the display-mode query.
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return Boolean(mql || iosStandalone);
}

export function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(detectStandalone);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(detectStandalone());
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  return standalone;
}
