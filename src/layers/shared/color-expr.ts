import type { Hex, Theme, ThemeColorKey } from '../../contracts';
import { mix } from '../../theme/color';

export type ColorExpr = ThemeColorKey | 'white' | 'black' | { mix: [ColorExpr, ColorExpr, number] };

const WHITE: Hex = '#FFFFFF';
const BLACK: Hex = '#000000';

const VAR: Record<ThemeColorKey, string> = {
  bg: '--kc-bg', surface: '--kc-surface', ink: '--kc-ink', muted: '--kc-muted', primary: '--kc-primary', accent: '--kc-accent',
  glow: '--kc-glow', glow2: '--kc-glow-2', glowMix: '--kc-glow-mix', ambient: '--kc-ambient', bgDeep: '--kc-bg-deep',
  onPrimary: '--kc-on-primary', onAccent: '--kc-on-accent', accentAsText: '--kc-accent-text',
  onSmoke: '--kc-on-smoke', mutedOnSmoke: '--kc-muted-on-smoke',
};

/** Expresión → CSS (var(--kc-*) / color-mix(in srgb …)). */
export const exprToCss = (e: ColorExpr): string => {
  if (e === 'white') return WHITE;
  if (e === 'black') return BLACK;
  if (typeof e === 'string') return `var(${VAR[e]})`;
  const [a, b, t] = e.mix;
  return `color-mix(in srgb, ${exprToCss(a)} ${+(t * 100).toFixed(2)}%, ${exprToCss(b)})`;
};

/** Expresión con alfa α (0..1) en CSS. α=1 → opaco; α=0 → transparent. */
export const exprToCssAlpha = (e: ColorExpr, a: number): string =>
  a >= 1 ? exprToCss(e) : a <= 0 ? 'transparent' : `color-mix(in srgb, ${exprToCss(e)} ${+(a * 100).toFixed(2)}%, transparent)`;

/** Expresión → hex resuelto con el theme (misma matemática que color-mix in srgb). */
export const exprToHex = (e: ColorExpr, theme: Theme): Hex => {
  if (e === 'white') return WHITE;
  if (e === 'black') return BLACK;
  if (typeof e === 'string') return ({ ...theme.roles, ...theme.derived } as unknown as Record<string, Hex>)[e] as Hex;
  const [a, b, t] = e.mix;
  return mix(exprToHex(a, theme), exprToHex(b, theme), t);
};
