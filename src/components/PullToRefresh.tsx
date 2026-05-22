import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticPattern } from "../lib/haptic";

interface Props {
  onRefresh: () => Promise<void> | void;
  scrollRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, scrollRef, children }: Props) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Mutable refs for gesture tracking (don't cause re-renders mid-gesture)
  const startY = useRef(0);
  const isActive = useRef(false);
  // ── helpers ───────────────────────────────────────────────
  const getScrollTop = useCallback(() => {
    return scrollRef.current?.scrollTop ?? 0;
  }, [scrollRef]);

  const reset = useCallback(() => {
    isActive.current = false;
    setPulling(false);
    setPullDistance(0);
  }, []);

  // ── touch handlers ──────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshing) return;
      startY.current = e.touches[0].clientY;
      isActive.current = false;
    },
    [refreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (refreshing) return;

      const currentY = e.touches[0].clientY;
      const delta = currentY - startY.current;

      // Scrolling up from top? Let it pass through normally.
      if (delta <= 0) {
        if (isActive.current) reset();
        return;
      }

      // User is pulling down — check if we're at the very top.
      const scrollTop = getScrollTop();

      if (scrollTop > 0) {
        // Not at top yet — this is normal scroll, don't interfere.
        if (isActive.current) reset();
        return;
      }

      // At top + pulling down → activate pull-to-refresh
      e.preventDefault();

      if (!isActive.current) {
        isActive.current = true;
        setPulling(true);
      }

      setPullDistance(Math.min(delta * 0.5, MAX_PULL));
    },
    [refreshing, getScrollTop, reset],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isActive.current || refreshing) {
      reset();
      return;
    }

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      hapticPattern([10, 30, 10]);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        reset();
      }
    } else {
      reset();
    }
  }, [pullDistance, refreshing, onRefresh, reset]);

  // ── attach listeners ─────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div
      ref={scrollRef}
      className="relative h-full overflow-y-auto"
    >
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
