import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { springConfig } from "../lib/animations";

export function TopBar({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string | (() => void) | true;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  const onBack = () => {
    if (typeof back === "function") back();
    else if (typeof back === "string") navigate(back);
    else navigate(-1);
  };

  return (
    <header className="app-top-bar safe-top sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 pb-2.5 pt-2.5">
        {back !== undefined && (
          <motion.button
            onClick={onBack}
            aria-label="Back"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft active:bg-bg-card"
            whileTap={{ scale: 0.96 }}
            transition={springConfig}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-ink-faint">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
