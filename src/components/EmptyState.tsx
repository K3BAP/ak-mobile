import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-card text-ink-faint">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-medium text-ink-soft">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
    </div>
  );
}
