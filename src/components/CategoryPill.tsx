import { readable, tint } from "../lib/color";

export function CategoryPill({
  name,
  color,
  className = "",
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ backgroundColor: tint(color, 0.16), color: readable(color) }}
    >
      {name}
    </span>
  );
}
