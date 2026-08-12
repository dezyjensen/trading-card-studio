"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ColorMode = "light" | "dark";

type ColorModeContextValue = {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggle: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);
const STORAGE_KEY = "tcs-color-mode";

function applyMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.toggle("light", mode === "light");
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

function readInitialMode(): ColorMode {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // private mode / blocked storage
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    // ignore
  }
  return "dark";
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>("dark");

  useEffect(() => {
    const preferred = readInitialMode();
    setModeState(preferred);
    applyMode(preferred);
  }, []);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyMode(next);
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle],
  );

  // Never hide children — visibility:hidden + display:contents breaks Safari/iOS
  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
