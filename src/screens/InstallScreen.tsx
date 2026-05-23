import { motion } from "framer-motion";
import { Download, Plus, Share, SquareDashedBottom } from "lucide-react";
import { useEffect, useState } from "react";
import { pageTransition, listItem, scaleTap } from "../lib/animations";

type Platform = "ios" | "android" | "desktop";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) || (/macintosh/.test(ua) && "ontouchend" in document))
    return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

const STEPS: Record<Platform, { icon: typeof Share; text: string }[]> = {
  ios: [
    { icon: Share, text: "Tap the Share button in Safari's toolbar." },
    { icon: Plus, text: "Choose “Add to Home Screen”." },
    { icon: Download, text: "Tap “Add”, then open AK from your home screen." },
  ],
  android: [
    { icon: SquareDashedBottom, text: "Open the browser menu (⋮)." },
    { icon: Plus, text: "Tap “Install app” or “Add to Home screen”." },
    { icon: Download, text: "Confirm, then open AK from your home screen." },
  ],
  desktop: [
    { icon: Download, text: "Click the install icon in the address bar." },
    { icon: Plus, text: "Or open the browser menu and choose “Install AK Companion”." },
    { icon: SquareDashedBottom, text: "Launch AK as its own window." },
  ],
};

export function InstallScreen({ onSkip }: { onSkip: () => void }) {
  const [platform] = useState(detectPlatform);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const steps = STEPS[platform];

  return (
    <motion.div
      className="mx-auto flex min-h-dvh max-w-screen-sm flex-col px-6 pb-10 pt-16"
      {...pageTransition}
    >
      <header className="safe-top text-center">
        <img src="/icon.svg" alt="" className="mx-auto h-20 w-20 rounded-2xl shadow-soft" />
        <p className="mt-6 text-sm font-medium text-accent">AK Companion</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Install the app</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-ink-faint">
          Add AK Companion to your home screen for a faster, full-screen experience that works
          offline.
        </p>
      </header>

      <main className="mt-10 flex-1">
        <ol className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={i}
                variants={listItem}
                custom={i}
                initial="initial"
                animate="animate"
                className="flex items-center gap-4 rounded-2xl border border-line bg-bg-card p-4 shadow-soft"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[15px] leading-snug text-ink-soft">{step.text}</p>
              </motion.li>
            );
          })}
        </ol>

        {deferred && (
          <motion.button
            {...scaleTap}
            onClick={install}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[15px] font-semibold text-bg shadow-soft"
          >
            <Download className="h-5 w-5" />
            Install now
          </motion.button>
        )}
      </main>

      <footer className="pt-6 text-center">
        <button
          onClick={onSkip}
          className="text-sm font-medium text-ink-faint underline-offset-4 hover:underline"
        >
          Test in browser instead
        </button>
      </footer>
    </motion.div>
  );
}
