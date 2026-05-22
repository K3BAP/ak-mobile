import { motion } from "framer-motion";
import { CalendarDays, LayoutGrid, Radio, Star, DoorOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { haptic } from "../lib/haptic";

const TABS = [
  { to: "now", label: "Now", icon: Radio },
  { to: "schedule", label: "Schedule", icon: CalendarDays },
  { to: "browse", label: "Browse", icon: LayoutGrid },
  { to: "agenda", label: "Agenda", icon: Star },
  { to: "rooms", label: "Rooms", icon: DoorOpen },
] as const;

export function BottomNav({ slug }: { slug: string }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-sm items-stretch justify-around px-1">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={`/${slug}/${to}`}
            onClick={() => haptic(10)}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-accent" : "text-ink-faint active:text-ink-soft"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                </motion.div>
                {label}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
