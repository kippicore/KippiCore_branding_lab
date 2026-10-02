import type { Hex } from '../contracts';
import { hexToRgb01, rgb01ToHex } from './color';

const toLin = (c: number): number => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/** Hex → OKLCH [L 0..1, C, h en grados 0..360). */
export const hexToOklch = (h: Hex): [number, number, number] => {
  const [r8, g8, b8] = hexToRgb01(h);
  const r = toLin(r8), g = toLin(g8), b = toLin(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let hue = (Math.atan2(B, A) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return [L, C, C < 1e-6 ? 0 : hue];
};

const EPS = -1e-6;
/** OKLCH → sRGB gamma sin recortar, o null si cae fuera de gamut. */
const oklchToRgb = (L: number, C: number, h: number): [number, number, number] | null => {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const inG = (v: number): boolean => v >= EPS && v <= 1 - EPS;
  if (!inG(r) || !inG(g) || !inG(bl)) return null;
  return [toGamma(r), toGamma(g), toGamma(bl)];
};

/** OKLCH → Hex. Si cae fuera de sRGB reduce C por bisección (L y h se conservan). */
export const oklchToHex = (l: number, c: number, h: number): Hex => {
  const L = Math.min(1, Math.max(0, l));
  const hue = ((h % 360) + 360) % 360;
  let rgb = oklchToRgb(L, c, hue);
  if (!rgb) {
    let lo = 0, hi = c;
    rgb = oklchToRgb(L, 0, hue) ?? [L, L, L];
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const r = oklchToRgb(L, mid, hue);
      if (r) { lo = mid; rgb = r; } else hi = mid;
    }
  }
  return rgb01ToHex(rgb);
};

/** Interpola a→b en OKLCH (t = proporción de b, 0 → a). El tono toma el camino corto;
 *  si un extremo es acromático se hereda el tono del otro. */
export const lerpOklch = (a: Hex, b: Hex, t: number): Hex => {
  const [L1, C1, h1] = hexToOklch(a);
  const [L2, C2, h2] = hexToOklch(b);
  let ha = h1, hb = h2;
  if (C1 < 1e-4) ha = hb; else if (C2 < 1e-4) hb = ha;
  let d = hb - ha;
  if (d > 180) d -= 360; else if (d < -180) d += 360;
  return oklchToHex(L1 + (L2 - L1) * t, C1 + (C2 - C1) * t, ha + d * t);
};
