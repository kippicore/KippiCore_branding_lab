import type { Derived, Hex, Mode, Palette, PaletteId, Rgb01, Roles, Theme, ThemeColorKey, ToneScale, ToneStep } from '../contracts';
import { hexToRgb01, mix } from './color';
import { contrastRatio, pickBestContrast } from './contrast';
import { hexToOklch, oklchToHex } from './oklch';
import { toCssVars } from './css-vars';

/** Base del ahumado (G05): única definición de este hex en el código. */
export const SMOKE_BASE: Hex = '#0B0D12';
const WHITE: Hex = '#FFFFFF';
const BLACK: Hex = '#000000';

export const TONE_STEPS: readonly ToneStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const TONE_L: Readonly<Record<ToneStep, number>> = {
  50: 0.97, 100: 0.93, 200: 0.87, 300: 0.79, 400: 0.7, 500: 0.61, 600: 0.53, 700: 0.45, 800: 0.37, 900: 0.29, 950: 0.22,
};

/** Escala tonal: conserva h y C del color base y fija L por paso (C se recorta en oklchToHex). */
export const toneScale = (base: Hex): ToneScale => {
  const [, c, h] = hexToOklch(base);
  const out = {} as Record<ToneStep, Hex>;
  for (const s of TONE_STEPS) out[s] = oklchToHex(TONE_L[s], c, h);
  return out;
};

const COLOR_KEYS: readonly ThemeColorKey[] = [
  'bg', 'surface', 'ink', 'muted', 'primary', 'accent', 'glow', 'glow2', 'glowMix', 'ambient', 'bgDeep',
  'onPrimary', 'onAccent', 'accentAsText', 'onSmoke', 'mutedOnSmoke',
];

export const deriveFromRoles = (roles: Roles, mode: Mode): Derived => {
  const { bg, ink, muted, primary, accent } = roles;
  const dark = mode === 'dark';
  const accentIsFillOnly = contrastRatio(accent, bg) < 4.5;
  return {
    onPrimary: pickBestContrast(primary, [WHITE, ink, bg]),
    onAccent: pickBestContrast(accent, [WHITE, ink, bg]),
    accentAsText: accentIsFillOnly ? primary : accent,
    accentIsFillOnly,
    glow: accent,
    glow2: primary,
    glowMix: mix(accent, primary, 0.5),
    ambient: mix(accent, bg, 0.2),
    bgDeep: dark ? mix(bg, BLACK, 0.65) : bg,
    smokeBase: SMOKE_BASE,
    onSmoke: mix(WHITE, ink, 0.92),
    mutedOnSmoke: mix(WHITE, muted, 0.72),
    blendMode: dark ? 'screen' : 'multiply',
    scales: { primary: toneScale(primary), accent: toneScale(accent) },
  };
};

/** Ensambla un Theme completo (rgb + cssVars) a partir de roles y derivados ya calculados. */
export const buildTheme = (paletteId: PaletteId, mode: Mode, roles: Roles, derived: Derived): Theme => {
  const src = { ...roles, ...derived } as unknown as Record<ThemeColorKey, Hex>;
  const rgb = {} as Record<ThemeColorKey, Rgb01>;
  for (const k of COLOR_KEYS) rgb[k] = hexToRgb01(src[k]);
  const base = { paletteId, mode, roles, derived, rgb, cssVars: {} } as Theme;
  return { ...base, cssVars: toCssVars(base) as Theme['cssVars'] };
};

const cache = new Map<string, Theme>();

/** palette + mode → Theme (memoizado por id+modo). */
export const deriveTheme = (p: Palette, m: Mode): Theme => {
  const key = `${p.id}:${m}`;
  let t = cache.get(key);
  if (!t) {
    const roles = m === 'dark' ? p.dark : p.light;
    t = buildTheme(p.id, m, roles, deriveFromRoles(roles, m));
    cache.set(key, t);
  }
  return t;
};

/** Fondo de vidrio: superficie al `veil` % sobre transparente. */
export const glassBg = (veil: number): string => `color-mix(in srgb, var(--kc-surface) ${veil}%, transparent)`;
/** Velo del ahumado (G05): #0B0D12 con alfa veil/100 + .25, máximo 1. */
export const smoke = (veil: number): string => `rgba(11,13,18, ${Math.min(1, veil / 100 + 0.25)})`;
