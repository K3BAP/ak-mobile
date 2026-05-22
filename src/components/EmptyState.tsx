import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUp } from "../lib/animations";

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
    <motion.div
      className="flex flex-col items-center justify-center px-8 py-16 text-center"
      variants={fadeUp}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-card text-ink-faint"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      >
        <Icon className="h-7 w-7" />
      </motion.div>
      <motion.p
        className="font-medium text-ink-soft"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        {title}
      </motion.p>
      {hint && (
        <motion.p
          className="mt-1 text-sm text-ink-faint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {hint}
        </motion.p>
      )}
    </motion.div>
  );
}
