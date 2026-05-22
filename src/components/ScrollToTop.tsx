import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { haptic } from "../lib/haptic";
import { springConfig } from "../lib/animations";

interface Props {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  threshold?: number;
}

export function ScrollToTop({ scrollContainerRef, threshold = 400 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setVisible(container.scrollTop > threshold);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, threshold]);

  const scrollToTop = () => {
    haptic();
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          className="safe-bottom fixed bottom-20 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-card/90 shadow-soft backdrop-blur-xl text-ink-soft active:bg-bg-elevated"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={springConfig}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
