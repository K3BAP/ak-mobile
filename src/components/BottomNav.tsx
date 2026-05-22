import { CalendarDays, LayoutGrid, Radio, Star, DoorOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

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
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-accent" : "text-ink-faint active:text-ink-soft"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
