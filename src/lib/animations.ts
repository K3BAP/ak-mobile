import type { Variants } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1] as const;

export const springConfig = {
  type: "spring" as const,
  stiffness: 320,
  damping: 38,
  mass: 0.7,
};

export const easeConfig = {
  ease: easeOut,
  duration: 0.24,
};

export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: easeConfig },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: easeOut } },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...easeConfig, delay: Math.min(i * 0.035, 0.18) },
  }),
  exit: { opacity: 0, transition: { duration: 0.18, ease: easeOut } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: easeConfig },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: easeOut } },
};

export const sheetAnimation = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: 0.28, ease: easeOut } },
  exit: { y: "100%", transition: { duration: 0.24, ease: [0.32, 0, 0.67, 0] } },
};

export const backdropAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const scaleTap = {
  whileTap: { scale: 0.96 },
};

export const favoriteAnimation = {
  initial: { scale: 1 },
  tap: { scale: [1, 1.4, 0.9, 1.1, 1], transition: { duration: 0.5, ease: "easeOut" } },
};
