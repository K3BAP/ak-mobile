import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { favorites } from "../lib/favorites";
import { springConfig } from "../lib/animations";

const sparkleCount = 6;
const sparkleAngles = Array.from({ length: sparkleCount }, (_, i) => (i * 360) / sparkleCount);

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
  const [showSparkles, setShowSparkles] = useState(false);
  const dim = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.toggle(slug, akId);
    setActive(next);
    if (next) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 600);
    }
    onToggle?.(next);
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label={active ? "Remove from agenda" : "Add to agenda"}
      aria-pressed={active}
      className={`relative flex items-center justify-center rounded-full p-2 active:bg-bg-elevated ${
        active ? "text-amber-400" : "text-ink-faint"
      }`}
      whileTap={{ scale: 0.85 }}
      transition={springConfig}
    >
      <motion.div
        animate={{ scale: active ? [1, 1.3, 0.9, 1.05, 1] : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Star className={dim} fill={active ? "currentColor" : "none"} strokeWidth={2} />
      </motion.div>

      <AnimatePresence>
        {showSparkles &&
          sparkleAngles.map((angle, i) => {
            const radians = (angle * Math.PI) / 180;
            const x = Math.cos(radians) * 20;
            const y = Math.sin(radians) * 20;
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-amber-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x,
                  y,
                  opacity: [1, 1, 0],
                  scale: [0, 1.2, 0.8],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  opacity: { times: [0, 0.6, 1], duration: 0.5 },
                }}
              />
            );
          })}
      </AnimatePresence>
    </motion.button>
  );
}
