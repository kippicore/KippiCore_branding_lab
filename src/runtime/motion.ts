// Utilidades de motion compartidas por las capas dinámicas (MOTION.md §1.5, §2.4, §2.6, §6.3, Anexo A).
import type { Theme } from '../contracts';
import { lerpTheme } from '../theme/interpolate';

/** Easing por tokens de motion (§1.5). */
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeOut = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number): number => { const x = clamp01(t); return x * x * (3 - 2 * x); };

/** cubic-bezier(x1,y1,x2,y2) como función de progreso (resuelve x por Newton + bisección). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-5) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-5) break;
      if (e > 0) hi = t; else lo = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
/** Easing de la transición de paleta (§2.6): cubic-bezier(.2, 0, 0, 1). */
export const easeTheme = cubicBezier(0.2, 0, 0, 1);

// ---------- Ruido sembrado (simplex 3D; 2D = 3D con z fijo) ----------
const GRAD3 = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
export type Noise2D = (x: number, y: number) => number;
export type Noise3D = (x: number, y: number, z: number) => number;

export function createNoise3D(rng: () => number): Noise3D {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const r = Math.floor(rng() * (i + 1)); const t = p[i]!; p[i] = p[r]!; p[r] = t; }
  const perm = new Uint8Array(512), pm12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]!; pm12[i] = perm[i]! % 12; }
  const F3 = 1 / 3, G3 = 1 / 6;
  return (xin, yin, zin) => {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    const corner = (x: number, y: number, z: number, gi: number): number => {
      let tt = 0.6 - x * x - y * y - z * z;
      if (tt < 0) return 0;
      const g = pm12[gi]! * 3;
      tt *= tt;
      return tt * tt * (GRAD3[g]! * x + GRAD3[g + 1]! * y + GRAD3[g + 2]! * z);
    };
    const n0 = corner(x0, y0, z0, ii + perm[jj + perm[kk]!]!);
    const n1 = corner(x1, y1, z1, ii + i1 + perm[jj + j1 + perm[kk + k1]!]!);
    const n2 = corner(x2, y2, z2, ii + i2 + perm[jj + j2 + perm[kk + k2]!]!);
    const n3 = corner(x3, y3, z3, ii + 1 + perm[jj + 1 + perm[kk + 1]!]!);
    return 32 * (n0 + n1 + n2 + n3);
  };
}
export function createNoise2D(rng: () => number): Noise2D {
  const n3 = createNoise3D(rng);
  return (x, y) => n3(x, y, 0.37);
}

/** Desplazamiento suave, acotado a ±A y nulo en t = 0 (§2.4). t en segundos. */
export const drift = (n: Noise2D, t: number, T: number, lane: number, A: number): number =>
  A * Math.tanh(1.25 * (n(t / T, lane) - n(0, lane)));
/** Escala asimétrica 0.95–1.08, = 1 en t = 0 (§2.4). */
export const driftScale = (n: Noise2D, t: number, T: number, lane: number): number => {
  const k = Math.tanh(1.25 * (n(t / T, lane) - n(0, lane)));
  return 1 + 0.065 * k + 0.015 * k * k;
};

// ---------- Resorte críticamente amortiguado (§6.3) ----------
export interface Spring { x: number; v: number }
export function springStep(s: Spring, target: number, omega: number, dt: number): void {
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega, hoo = dt * oo, hhoo = dt * hoo;
  const detInv = 1 / (f + hhoo);
  const x = (f * s.x + dt * s.v + hhoo * target) * detInv;
  const v = (s.v + hoo * (target - s.x)) * detInv;
  s.x = x; s.v = v;
}

// ---------- Tween de tema (§2.6) ----------
/** Interpola el Theme entero en OKLCH durante `ms` con easing .2,0,0,1. Nunca reinicia desde el origen:
 *  si hay un tween en curso, parte del valor interpolado actual. `dark` se interpola 0..1 (para mezclas continuas). */
export class ThemeTween {
  current: Theme;
  dark: number;
  /** Tiempo transcurrido del tween en curso (ms) y duración. */
  elapsed = 0;
  duration = 0;
  fromBlend: 'screen' | 'multiply';
  private from: Theme;
  private to: Theme;
  private fromDark: number;
  private toDark: number;
  private dirty = true;
  constructor(theme: Theme) {
    this.current = this.from = this.to = theme;
    this.dark = this.fromDark = this.toDark = theme.mode === 'dark' ? 1 : 0;
    this.fromBlend = theme.derived.blendMode;
  }
  set(theme: Theme, ms: number): void {
    this.dirty = true;
    this.fromBlend = this.current.derived.blendMode;
    if (ms <= 0) {
      this.current = this.from = this.to = theme;
      this.dark = this.fromDark = this.toDark = theme.mode === 'dark' ? 1 : 0;
      this.elapsed = this.duration = 0;
      return;
    }
    this.from = this.current;
    this.fromDark = this.dark;
    this.to = theme;
    this.toDark = theme.mode === 'dark' ? 1 : 0;
    this.elapsed = 0;
    this.duration = ms;
  }
  get active(): boolean { return this.duration > 0 && this.elapsed < this.duration; }
  /** Avanza dtMs (reales). Devuelve true si el tema cambió (o está pendiente de aplicar). */
  update(dtMs: number): boolean {
    if (this.active) {
      this.elapsed = Math.min(this.duration, this.elapsed + dtMs);
      const p = this.elapsed / this.duration;
      const e = easeTheme(p);
      this.current = p >= 1 ? this.to : lerpTheme(this.from, this.to, e);
      this.dark = lerp(this.fromDark, this.toDark, e);
      this.dirty = true;
    }
    const d = this.dirty;
    this.dirty = false;
    return d;
  }
}
