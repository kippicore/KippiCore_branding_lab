import type { Hex, Rgb01 } from '../contracts';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** '#RRGGBB' (o '#RGB') → [r,g,b] en 0..1, sRGB con gamma. */
export const hexToRgb01 = (h: Hex): Rgb01 => {
  let s = h.slice(1);
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const byte = (v: number): string => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0').toUpperCase();

/** Redondea al entero más cercano (0.5 sube): mix(#000, #FFF, .5) = #808080. */
export const rgb01ToHex = (c: Rgb01): Hex => `#${byte(c[0])}${byte(c[1])}${byte(c[2])}`;

/** Interpolación lineal en sRGB gamma; t = proporción de `a` (igual a color-mix(in srgb, a t%, b)). */
export const mix = (a: Hex, b: Hex, t: number): Hex => {
  const A = hexToRgb01(a);
  const B = hexToRgb01(b);
  return rgb01ToHex([A[0] * t + B[0] * (1 - t), A[1] * t + B[1] * (1 - t), A[2] * t + B[2] * (1 - t)]);
};

/** `rgba(r, g, b, α)` con canales 0..255. */
export const withAlpha = (h: Hex, a: number): string => {
  const [r, g, b] = hexToRgb01(h);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
};
