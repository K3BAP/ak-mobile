import { Bell } from "lucide-react";
import { useState } from "react";
import {
  isSupported,
  notifications,
  requestPermission,
  LEAD_OPTIONS,
} from "../lib/notifications";

export function ReminderToggle() {
  const [enabled, setEnabled] = useState(() => notifications.isEnabled());
  const [lead, setLead] = useState(() => notifications.leadMinutes());
  const [denied, setDenied] = useState(
    () => isSupported() && Notification.permission === "denied",
  );

  if (!isSupported()) return null;

  const handleToggle = async () => {
    if (enabled) {
      notifications.setEnabled(false);
      setEnabled(false);
      return;
    }
    const permission = await requestPermission();
    if (permission === "granted") {
      notifications.setEnabled(true);
      setEnabled(true);
      setDenied(false);
    } else {
      setDenied(permission === "denied");
    }
  };

  const pickLead = (value: number) => {
    notifications.setLeadMinutes(value);
    setLead(value);
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Bell className="h-5 w-5 shrink-0 text-accent" />
          <span className="text-sm font-medium text-ink">Remind me before AKs start</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full p-0 transition-colors ${
            enabled ? "bg-accent" : "bg-bg-elevated"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-bg transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && !denied && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Lead time</p>
          <div className="flex gap-1.5">
            {LEAD_OPTIONS.map((value) => {
              const active = value === lead;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pickLead(value)}
                  aria-pressed={active}
                  className={`flex-1 rounded-xl border py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent text-bg"
                      : "border-line bg-bg-elevated text-ink-soft active:bg-bg-card"
                  }`}
                >
                  {value} min
                </button>
              );
            })}
          </div>
        </div>
      )}

      {denied && (
        <p className="mt-2 text-xs text-ink-faint">
          Notifications are blocked. Allow them in your browser settings to enable reminders.
        </p>
      )}
    </div>
  );
}
