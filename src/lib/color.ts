// Helpers for using a category's hex color as an accent on the dark theme.

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function tint(hex: string | undefined, alpha: number): string {
  const rgb = hex ? hexToRgb(hex) : null;
  if (!rgb) return `rgba(58,167,208,${alpha})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

export function accent(hex: string | undefined): string {
  return hex && hexToRgb(hex) ? hex : "#3aa7d0";
}

// Lighten a color so it stays legible as text on the dark background.
export function readable(hex: string | undefined): string {
  const rgb = hex ? hexToRgb(hex) : null;
  if (!rgb) return "#7fd0ec";
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  if (lum >= 0.45) return hex as string;
  const mix = (c: number) => Math.round(c + (255 - c) * 0.45);
  return `rgb(${mix(rgb[0])},${mix(rgb[1])},${mix(rgb[2])})`;
}
