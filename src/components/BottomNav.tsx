import { motion } from "framer-motion";
import { CalendarDays, LayoutGrid, Radio, Star, DoorOpen } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { haptic } from "../lib/haptic";
import { springConfig } from "../lib/animations";

const TABS = [
  { to: "now", label: "Now", icon: Radio },
  { to: "schedule", label: "Schedule", icon: CalendarDays },
  { to: "browse", label: "Browse", icon: LayoutGrid },
  { to: "agenda", label: "Agenda", icon: Star },
  { to: "rooms", label: "Rooms", icon: DoorOpen },
] as const;

export function BottomNav({ slug }: { slug: string }) {
  const location = useLocation();
  const activeIndex = TABS.findIndex(
    (t) => location.pathname.startsWith(`/${slug}/${t.to}`),
  );

  return (
    <nav className="app-bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-bg/85 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-screen-sm items-stretch justify-around px-1">
        {activeIndex >= 0 && (
          <div
            className="absolute -top-px h-0.5 w-6 rounded-full bg-accent"
            style={{
              left: `${((activeIndex + 0.5) / TABS.length) * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        )}

        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={`/${slug}/${to}`}
            onClick={() => haptic(10)}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-accent" : "text-ink-faint active:text-ink-soft"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.06 : 1 }}
                  transition={springConfig}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                </motion.div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
