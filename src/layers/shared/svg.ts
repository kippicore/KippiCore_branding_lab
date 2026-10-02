import type { Theme } from '../../contracts';
import { exprToCss, exprToHex, type ColorExpr } from './color-expr';
import { mulberry32, hashSeed } from '../../lib/prng';

export type SvgMode = 'vars' | 'resolved';
export const colorFor = (e: ColorExpr, mode: SvgMode, theme?: Theme): string =>
  mode === 'vars' || !theme ? exprToCss(e) : exprToHex(e, theme);

/** A08: tres bandas de seda sobre un lienzo de 400x300. */
export const SILK_VIEW = { w: 400, h: 300 } as const;
export const SILK_BLUR = 16;
export const SILK: ReadonlyArray<{ d: string; pts: [number, number, number, number, number, number, number, number]; width: number; color: ColorExpr }> = [
  { d: 'M-40 210 C 80 80, 200 330, 440 120', pts: [-40, 210, 80, 80, 200, 330, 440, 120], width: 70, color: 'primary' },
  { d: 'M-40 120 C 120 280, 240 20, 440 200', pts: [-40, 120, 120, 280, 240, 20, 440, 200], width: 50, color: 'accent' },
  { d: 'M-40 260 C 140 200, 260 300, 440 60', pts: [-40, 260, 140, 200, 260, 300, 440, 60], width: 60, color: { mix: ['accent', 'primary', 0.5] } },
];
export const silkSvg = (mode: SvgMode, theme?: Theme): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">` +
  `<defs><filter id="kc-silk-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${SILK_BLUR}"/></filter></defs>` +
  `<g filter="url(#kc-silk-blur)" fill="none" stroke-linecap="round">` +
  SILK.map((s) => `<path d="${s.d}" stroke="${colorFor(s.color, mode, theme)}" stroke-width="${s.width}" opacity=".9"/>`).join('') +
  `</g></svg>`;

/** A14: tablero (16 barras, polilínea y círculo) sobre 400x300. */
export interface DataScene { bars: { x: number; y: number; w: number; h: number; accent: boolean }[]; line: [number, number][]; dot: [number, number] }
export const dataScene = (seed: number): DataScene => {
  const r = mulberry32(hashSeed('A14', seed));
  const bars = Array.from({ length: 16 }, (_, i) => {
    const h = 60 + r() * 150;
    return { x: 18 + i * 23.5, y: 270 - h, w: 15, h, accent: i % 4 === 3 };
  });
  const line: [number, number][] = bars.map((b, i) => [b.x + 7.5, 150 - Math.sin(i / 2.2) * 50 - i * 3 + r() * 14]);
  return { bars, line, dot: line[line.length - 1] as [number, number] };
};
export const dataSvg = (seed: number, mode: SvgMode, theme?: Theme): string => {
  const s = dataScene(seed);
  const P = colorFor('primary', mode, theme), A = colorFor('accent', mode, theme);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">` +
    s.bars.map((b) => `<rect x="${b.x}" y="${b.y.toFixed(1)}" width="${b.w}" height="${b.h.toFixed(1)}" rx="2" fill="${b.accent ? A : P}" opacity=".85"/>`).join('') +
    `<polyline fill="none" stroke="${A}" stroke-width="4" stroke-linejoin="round" points="${s.line.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>` +
    `<circle cx="${s.dot[0].toFixed(1)}" cy="${s.dot[1].toFixed(1)}" r="7" fill="${A}"/></svg>`;
};

/** Mapea el lienzo 400x300 al escenario con `slice` (cubrir). */
export const sliceTransform = (w: number, h: number) => {
  const k = Math.max(w / SILK_VIEW.w, h / SILK_VIEW.h);
  return { k, ox: (w - SILK_VIEW.w * k) / 2, oy: (h - SILK_VIEW.h * k) / 2 };
};
