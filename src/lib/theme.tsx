import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* ------------------------------------------------------------------ types */
export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarTheme = 'dark' | 'light' | 'auto';
export type AccentKey = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan';

/* ------------------------------------------------------------------ accents */
export interface Accent {
  key: AccentKey;
  label: string;
  /** Representative swatch (the 500 stop) for the picker UI. */
  swatch: string;
  /** 50 → 800 ramp, in hex. */
  ramp: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800, string>;
}

export const ACCENTS: Accent[] = [
  {
    key: 'blue',
    label: 'Blue',
    swatch: '#2E5BE6',
    ramp: { 50: '#EEF4FF', 100: '#D9E6FF', 200: '#B7CEFF', 300: '#8AAEFF', 400: '#5B84F5', 500: '#2E5BE6', 600: '#1E45C8', 700: '#1836A1', 800: '#162E82' },
  },
  {
    key: 'violet',
    label: 'Violet',
    swatch: '#8B5CF6',
    ramp: { 50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', 800: '#5B21B6' },
  },
  {
    key: 'emerald',
    label: 'Emerald',
    swatch: '#10B981',
    ramp: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46' },
  },
  {
    key: 'rose',
    label: 'Rose',
    swatch: '#F43F5E',
    ramp: { 50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 300: '#FDA4AF', 400: '#FB7185', 500: '#F43F5E', 600: '#E11D48', 700: '#BE123C', 800: '#9F1239' },
  },
  {
    key: 'amber',
    label: 'Amber',
    swatch: '#F59E0B',
    ramp: { 50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E' },
  },
  {
    key: 'cyan',
    label: 'Cyan',
    swatch: '#06B6D4',
    ramp: { 50: '#ECFEFF', 100: '#CFFAFE', 200: '#A5F3FC', 300: '#67E8F9', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490', 800: '#155E75' },
  },
];

/* ------------------------------------------------------------------ storage */
const KEY = 'tms.theme.v1';

interface StoredTheme {
  mode: ThemeMode;
  accent: AccentKey;
  sidebar: SidebarTheme;
}

const DEFAULTS: StoredTheme = { mode: 'system', accent: 'blue', sidebar: 'dark' };

function load(): StoredTheme {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    return {
      mode: parsed.mode ?? DEFAULTS.mode,
      accent: parsed.accent ?? DEFAULTS.accent,
      sidebar: parsed.sidebar ?? DEFAULTS.sidebar,
    };
  } catch {
    return DEFAULTS;
  }
}

/* ------------------------------------------------------------------ helpers */
function hexToRgbChannels(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Apply everything the theme touches to <html>. Kept side-effect-only so it
 *  can also run once, inline, before React hydrates (see applyThemeSync). */
export function applyTheme(t: StoredTheme) {
  const root = document.documentElement;
  const resolved: 'light' | 'dark' = t.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : t.mode;

  root.classList.toggle('dark', resolved === 'dark');

  const accent = ACCENTS.find((a) => a.key === t.accent) ?? ACCENTS[0];
  (Object.keys(accent.ramp) as unknown as (keyof Accent['ramp'])[]).forEach((stop) => {
    root.style.setProperty(`--c-brand-${stop}`, hexToRgbChannels(accent.ramp[stop]));
  });

  const sidebar = t.sidebar === 'auto' ? resolved : t.sidebar;
  root.setAttribute('data-sidebar-theme', sidebar);

  return resolved;
}

/* ------------------------------------------------------------------ context */
interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentKey;
  sidebar: SidebarTheme;
  /** The concrete light/dark currently applied (system resolved). */
  resolved: 'light' | 'dark';
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentKey) => void;
  setSidebar: (s: SidebarTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredTheme>(() => load());
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    state.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : state.mode,
  );

  // Apply + persist whenever any part of the theme changes.
  useEffect(() => {
    const r = applyTheme(state);
    setResolved(r);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state]);

  // React to OS scheme changes while following the system (mode or sidebar).
  useEffect(() => {
    if (state.mode !== 'system' && state.sidebar !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(applyTheme(state));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [state]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: state.mode,
      accent: state.accent,
      sidebar: state.sidebar,
      resolved,
      setMode: (mode) => setState((s) => ({ ...s, mode })),
      setAccent: (accent) => setState((s) => ({ ...s, accent })),
      setSidebar: (sidebar) => setState((s) => ({ ...s, sidebar })),
    }),
    [state, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** One-shot synchronous apply for the pre-hydration script, avoids FOUC. */
export function applyThemeSync() {
  applyTheme(load());
}
