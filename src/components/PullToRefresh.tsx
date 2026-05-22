import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticPattern } from "../lib/haptic";

interface Props {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, children }: Props) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || container.scrollTop > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    setPulling(true);
  }, [refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || refreshing) return;
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullDistance(Math.min(delta * 0.5, MAX_PULL));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling || refreshing) {
      setPulling(false);
      setPullDistance(0);
      return;
    }

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      hapticPattern([10, 30, 10]);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setPulling(false);
  }, [pulling, refreshing, pullDistance, onRefresh]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div ref={scrollContainerRef} className="relative h-full overflow-y-auto">
      <AnimatePresence>
        {(pulling || refreshing) && (
          <motion.div
            className="absolute left-0 right-0 flex items-center justify-center overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullDistance, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: rotation }}
              transition={
                refreshing
                  ? { repeat: Infinity, duration: 1, ease: "linear" }
                  : { type: "spring", stiffness: 300, damping: 25 }
              }
            >
              <RefreshCw className="h-5 w-5 text-ink-faint" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
