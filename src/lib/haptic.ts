const DEFAULT_DURATION = 15;

export function haptic(duration = DEFAULT_DURATION): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export function hapticPattern(pattern: number[]): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function useHaptic() {
  return { haptic, hapticPattern };
}
