import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { AK, Category, Owner } from "../lib/types";
import { accent } from "../lib/color";
import { CategoryPill } from "./CategoryPill";
import { FavoriteButton } from "./FavoriteButton";
import { springConfig } from "../lib/animations";

export function AKCard({
  slug,
  ak,
  category,
  owners,
  schedule,
  onToggleFavorite,
}: {
  slug: string;
  ak: AK;
  category: Category | null;
  owners: Owner[];
  schedule?: { time: string; room: string } | null;
  onToggleFavorite?: (active: boolean) => void;
}) {
  const ownerNames = owners.map((o) => o.name).join(", ");

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      transition={springConfig}
    >
      <Link
        to={`/${slug}/ak/${ak.id}`}
        className="group flex items-stretch gap-3 rounded-2xl border border-line bg-bg-card p-3 shadow-soft"
      >
        <span
          className="w-1 shrink-0 rounded-full"
          style={{ backgroundColor: accent(category?.color) }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink line-clamp-2">
              {ak.name}
            </h3>
            {ak.reso && (
              <span className="mt-0.5 shrink-0 rounded-md bg-fuchsia-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fuchsia-300">
                Reso
              </span>
            )}
          </div>

          {ownerNames && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{ownerNames}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {category && <CategoryPill name={category.name} color={category.color} />}
            {schedule && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
                <MapPin className="h-3.5 w-3.5" />
                {schedule.time} · {schedule.room}
              </span>
            )}
          </div>
        </div>

        <div className="-mr-1 flex items-center">
          <FavoriteButton slug={slug} akId={ak.id} onToggle={onToggleFavorite} />
        </div>
      </Link>
    </motion.div>
  );
}
