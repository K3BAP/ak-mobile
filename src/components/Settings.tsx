import { AnimatePresence, motion } from "framer-motion";
import { Check, Settings as SettingsIcon, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { THEMES, useTheme } from "../ThemeContext";
import { backdropAnimation, springConfig } from "../lib/animations";
import { haptic } from "../lib/haptic";
import { isSupported } from "../lib/notifications";
import { ReminderToggle } from "./ReminderToggle";

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <motion.button
        onClick={() => {
          haptic(10);
          setOpen(true);
        }}
        aria-label="Settings"
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
        whileTap={{ scale: 0.94 }}
        transition={springConfig}
      >
        <SettingsIcon className="h-[22px] w-[22px]" />
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col justify-end"
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                aria-label="Close settings"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                {...backdropAnimation}
              />
              <motion.div
                className="safe-bottom relative max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line bg-bg-soft px-4 pb-6 pt-3 shadow-soft"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.6 }}
              >
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {isSupported() && (
                  <section className="mb-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Notifications
                    </h3>
                    <ReminderToggle />
                  </section>
                )}

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {THEMES.map((t) => {
                      const active = t.id === theme;
                      return (
                        <motion.button
                          key={t.id}
                          onClick={() => {
                            haptic(10);
                            setTheme(t.id);
                          }}
                          whileTap={{ scale: 0.97 }}
                          transition={springConfig}
                          className={`relative flex items-center gap-3 rounded-2xl border p-3 text-left ${
                            active
                              ? "border-accent bg-bg-card shadow-glow"
                              : "border-line bg-bg-card active:bg-bg-elevated"
                          }`}
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-black/10"
                            aria-hidden
                          >
                            <span className="h-full w-1/3" style={{ background: t.swatch[0] }} />
                            <span className="h-full w-1/3" style={{ background: t.swatch[1] }} />
                            <span className="h-full w-1/3" style={{ background: t.swatch[2] }} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {t.emoji} {t.name}
                            </span>
                          </span>
                          {active && <Check className="h-4 w-4 shrink-0 text-accent" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
