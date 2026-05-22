import { X } from "lucide-react";
import type { Category, Room } from "../lib/types";
import { readable, tint } from "../lib/color";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  rooms: Room[];
  selectedCategories: Set<number>;
  selectedRooms: Set<number>;
  onToggleCategory: (id: number) => void;
  onToggleRoom: (id: number) => void;
  onClear: () => void;
}

export function FilterSheet({
  open,
  onClose,
  categories,
  rooms,
  selectedCategories,
  selectedRooms,
  onToggleCategory,
  onToggleRoom,
  onClear,
}: Props) {
  if (!open) return null;
  const count = selectedCategories.size + selectedRooms.size;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="safe-bottom relative max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-line bg-bg-soft px-4 pb-6 pt-3 shadow-soft animate-fade-in">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <button
                onClick={onClear}
                className="rounded-full px-3 py-1 text-sm font-medium text-accent active:bg-bg-card"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <Section title="Category">
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                color={c.color}
                active={selectedCategories.has(c.id)}
                onClick={() => onToggleCategory(c.id)}
              />
            ))}
          </Section>
        )}

        {rooms.length > 0 && (
          <Section title="Room">
            {rooms.map((r) => (
              <Chip
                key={r.id}
                label={r.name}
                active={selectedRooms.has(r.id)}
                onClick={() => onToggleRoom(r.id)}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-transparent" : "border-line text-ink-soft active:bg-bg-card"
      }`}
      style={
        active
          ? { backgroundColor: tint(color, 0.2), color: readable(color) }
          : undefined
      }
    >
      {label}
    </button>
  );
}
