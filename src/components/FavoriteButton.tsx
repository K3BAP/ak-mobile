import { Star } from "lucide-react";
import { useState } from "react";
import { favorites } from "../lib/favorites";

export function FavoriteButton({
  slug,
  akId,
  size = "md",
  onToggle,
}: {
  slug: string;
  akId: number;
  size?: "md" | "lg";
  onToggle?: (active: boolean) => void;
}) {
  const [active, setActive] = useState(() => favorites.has(slug, akId));
  const dim = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = favorites.toggle(slug, akId);
        setActive(next);
        onToggle?.(next);
      }}
      aria-label={active ? "Remove from agenda" : "Add to agenda"}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-full p-2 transition-colors active:bg-bg-elevated ${
        active ? "text-amber-400" : "text-ink-faint"
      }`}
    >
      <Star className={dim} fill={active ? "currentColor" : "none"} strokeWidth={2} />
    </button>
  );
}
