import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface Props {
  show: boolean;
  onReload: () => void;
}

export function UpdateBanner({ show, onReload }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="safe-top sticky top-0 z-40 flex items-center gap-2 border-b border-accent/30 bg-accent/15 px-4 py-2 text-xs font-medium text-accent backdrop-blur-xl"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">A new version is available</span>
          <button
            onClick={onReload}
            className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-bg"
          >
            Reload
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
