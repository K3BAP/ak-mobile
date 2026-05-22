import type { Variants } from "framer-motion";

export const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const easeConfig = {
  ease: [0.25, 0.1, 0.25, 1] as const,
  duration: 0.35,
};

export const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: easeConfig },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

export const listItem: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...springConfig, delay: Math.min(i * 0.06, 0.36) },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { ...springConfig, duration: undefined } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const sheetAnimation = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", stiffness: 300, damping: 35, mass: 0.6 } },
  exit: { y: "100%", transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] } },
};

export const backdropAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const scaleTap = {
  whileTap: { scale: 0.92 },
  whileHover: { scale: 1.02 },
};

export const favoriteAnimation = {
  initial: { scale: 1 },
  tap: { scale: [1, 1.4, 0.9, 1.1, 1], transition: { duration: 0.5, ease: "easeOut" } },
};
