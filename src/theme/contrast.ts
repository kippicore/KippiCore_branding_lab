import type { Hex, Rgb01, Verdict } from '../contracts';
import { hexToRgb01 } from './color';

const lin = (c: number): number => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** Luminancia relativa WCAG 2.x. */
export const relativeLuminance = (h: Hex | Rgb01): number => {
  const [r, g, b] = typeof h === 'string' ? hexToRgb01(h) : h;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrastRatio = (a: Hex, b: Hex): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** El candidato con más contraste sobre `on`; en empate gana el primero. */
export const pickBestContrast = (on: Hex, candidates: Hex[]): Hex => {
  let best = candidates[0] as Hex;
  let bestR = -1;
  for (const c of candidates) {
    const r = contrastRatio(on, c);
    if (r > bestR + 1e-9) { best = c; bestR = r; }
  }
  return best;
};

export const verdict = (ratio: number): Verdict =>
  ratio >= 7 ? 'excelente' : ratio >= 4.5 ? 'suficiente' : ratio >= 3 ? 'solo-grande' : 'insuficiente';
