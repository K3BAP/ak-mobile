import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface ThemeDef {
  id: string;
  name: string;
  emoji: string;
  /** [background, surface, accent] swatch preview colors */
  swatch: [string, string, string];
}

export const THEMES: ThemeDef[] = [
  { id: "dark", name: "Midnight", emoji: "🌙", swatch: ["#0b0d10", "#181c22", "#3aa7d0"] },
  { id: "light", name: "Daylight", emoji: "☀️", swatch: ["#f7f8fa", "#ffffff", "#1684b2"] },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "🌃", swatch: ["#090514", "#170e2c", "#ff2bd6"] },
  { id: "christmas", name: "Christmas", emoji: "🎄", swatch: ["#0c1610", "#14281c", "#e63946"] },
  { id: "sunset", name: "Sunset", emoji: "🌅", swatch: ["#1a0e1e", "#311939", "#ff7e5f"] },
  { id: "forest", name: "Forest", emoji: "🌲", swatch: ["#0e1411", "#19251e", "#7cc66e"] },
  { id: "ocean", name: "Ocean", emoji: "🌊", swatch: ["#08111f", "#10213a", "#38bdf8"] },
  { id: "halloween", name: "Halloween", emoji: "🎃", swatch: ["#110b06", "#23150c", "#ff8a18"] },
  { id: "sakura", name: "Sakura", emoji: "🌸", swatch: ["#fff5f8", "#ffffff", "#e9548e"] },
];

const STORAGE_KEY = "ak-theme";
const DEFAULT_THEME = "dark";

export function readStoredTheme(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some((t) => t.id === stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

function applyTheme(id: string) {
  document.documentElement.setAttribute("data-theme", id);
  const def = THEMES.find((t) => t.id === id);
  if (def) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", def.swatch[0]);
  }
}

interface ThemeState {
  theme: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    setThemeState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
