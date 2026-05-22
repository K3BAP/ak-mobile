import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";

interface Props {
  online: boolean;
  lastUpdated?: Date;
}

export function OfflineBanner({ online, lastUpdated }: Props) {
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          className="safe-top sticky top-0 z-40 flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-medium text-amber-200 backdrop-blur-xl"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">You&apos;re offline — showing cached data</span>
          {lastUpdated && (
            <span className="shrink-0 text-amber-300/70">
              Updated {formatRelative(lastUpdated)}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}
