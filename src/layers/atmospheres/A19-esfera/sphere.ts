// A19 Esfera de partículas: modelo compartido por static/paint (TS) y dynamic (réplica exacta en sphere.vert.glsl).
// Unidades: esfera de radio 1, y hacia arriba, z hacia la cámara. Todo es función pura de (seed, t, tilt).
import type { Hex, Size, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { mix } from '../../../theme/color';

export const TAU = Math.PI * 2;
/** Periodos (s). Todo cierra en ROT_T: W0 = 2·(2π/90), W1 = 3·(2π/90), EJ_T divide a 90. */
export const ROT_T = 90;
export const RIM_T = 30;
export const EJ_T = 18;
export const W0 = TAU / 45, W1 = TAU / 30, W2 = TAU / 90;
export const CAM_D = 3.6;
export const TILT_Z = 0.38, TILT_X = 0.22;
export const LIGHT: readonly [number, number] = [0.871, 0.49]; // rim más intenso arriba-derecha (y arriba)
export const N_DYNAMIC = 9000;
export const N_STATIC = 2200;
export const EJECTA = 0.035;
export const INTERIOR = 0.18;

/** Centro y radio (px CSS): derecha-centro, escala por el lado menor, sin salirse por la derecha. */
export const layout = (size: Size): { cx: number; cy: number; R: number } => {
  const R = 0.34 * Math.min(size.w, size.h);
  return { cx: Math.min(0.64 * size.w, size.w - 1.15 * R), cy: 0.5 * size.h, R };
};
/** CSS equivalente de layout() dentro de un contenedor con container-type: size. */
export const LAYOUT_CSS = { left: 'min(64%, calc(100% - 39.1cqmin))', top: '50%', R: 34 } as const;

export const breath = (t: number): number => 0.8 + 0.2 * (0.5 + 0.5 * Math.cos((TAU * t) / RIM_T));

export interface Waves { k: [number, number, number][]; ph: [number, number, number] }
export const waves = (seed: number): Waves => {
  const r = mulberry32(hashSeed('A19', seed, 'waves'));
  const k = [3.4, 4.1, 5.0].map((mag) => {
    const z = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - z * z);
    return [Math.cos(a) * s * mag, Math.sin(a) * s * mag, z * mag] as [number, number, number];
  });
  return { k, ph: [r() * TAU, r() * TAU, r() * TAU] };
};

export interface Cloud { n: number; pos: Float32Array; rand: Float32Array }
/** Fibonacci con jitter + ~18 % de polvo interior + ~3.5 % de partículas que se desprenden (rand.y = 1). */
export const cloud = (seed: number, n: number): Cloud => {
  const r = mulberry32(hashSeed('A19', seed, 'cloud'));
  const pos = new Float32Array(n * 3), rand = new Float32Array(n * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n + (r() - 0.5) * (1.6 / n);
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const ph = i * golden + (r() - 0.5) * 0.06;
    const kindR = r();
    const ejecta = kindR > 1 - EJECTA;
    const rad = kindR < INTERIOR ? 0.35 + 0.6 * Math.cbrt(r()) : 1;
    pos[i * 3] = Math.cos(ph) * rr * rad; pos[i * 3 + 1] = y * rad; pos[i * 3 + 2] = Math.sin(ph) * rr * rad;
    rand[i * 4] = r(); rand[i * 4 + 1] = ejecta ? 1 : 0; rand[i * 4 + 2] = r(); rand[i * 4 + 3] = r();
  }
  return { n, pos, rand };
};

const smooth = (a: number, b: number, x: number): number => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const dot3 = (k: readonly number[], q: readonly number[]): number => k[0]! * q[0]! + k[1]! * q[1]! + k[2]! * q[2]!;

export const field = (w: Waves, p: readonly number[], t: number): number => {
  const q = [p[0]! + 0.32 * Math.sin(1.7 * p[1]! + 0.9 + t * W1), p[1]! + 0.32 * Math.sin(1.9 * p[2]! + 2.1 - t * W1), p[2]! + 0.32 * Math.sin(1.5 * p[0]! + 4.0 + t * W2)];
  const a = Math.sin(dot3(w.k[0]!, q) + w.ph[0] + t * W0);
  const b = Math.sin(dot3(w.k[1]!, q) + w.ph[1] - t * W2);
  const c = Math.sin(dot3(w.k[2]!, q) + w.ph[2] + t * W1);
  return (a + 0.8 * b + 0.6 * c) / 2.4;
};

const rotY = (p: number[], a: number): void => { const c = Math.cos(a), s = Math.sin(a), x = p[0]!; p[0] = c * x + s * p[2]!; p[2] = -s * x + c * p[2]!; };
const rotZ = (p: number[], a: number): void => { const c = Math.cos(a), s = Math.sin(a), x = p[0]!; p[0] = c * x - s * p[1]!; p[1] = s * x + c * p[1]!; };
const rotX = (p: number[], a: number): void => { const c = Math.cos(a), s = Math.sin(a), y = p[1]!; p[1] = c * y - s * p[2]!; p[2] = s * y + c * p[2]!; };

export interface Sample { x: number; y: number; z: number; s: number; size: number; dust: number; fil: number; rim: number; ej: number }

/** Réplica TS del vertex shader (para el estático, el paint y los tests). */
export const sample = (w: Waves, c: Cloud, i: number, t: number, tilt: readonly [number, number] = [0, 0]): Sample => {
  const r0 = c.rand[i * 4]!, ejecta = c.rand[i * 4 + 1]! > 0.5, r2 = c.rand[i * 4 + 2]!, r3 = c.rand[i * 4 + 3]!;
  let p = [c.pos[i * 3]!, c.pos[i * 3 + 1]!, c.pos[i * 3 + 2]!];
  const len0 = Math.hypot(p[0]!, p[1]!, p[2]!);
  let spin = 0, fil = 0, ej = 0;
  if (ejecta) {
    const u = (((t / EJ_T + r2) % 1) + 1) % 1;
    const rad = 1 + u * (0.45 + 0.7 * r0);
    p = p.map((v) => (v / len0) * rad);
    spin = -u * 0.35;
    ej = smooth(0, 0.12, u) * Math.pow(1 - u, 1.6) * 0.85;
  } else {
    const f = field(w, p, t);
    fil = Math.exp(-f * f * 45);
    const k = 1 + 0.06 * f + 0.04 * fil * breath(t);
    p = [p[0]! * k + 0.012 * Math.sin(t * 2 * W1 + r2 * TAU), p[1]! * k + 0.012 * Math.cos(t * 3 * W0 + r3 * TAU), p[2]! * k + 0.012 * Math.sin(t * W1 + (r2 + r3) * TAU)];
  }
  rotY(p, (TAU * t) / ROT_T + spin); rotZ(p, TILT_Z); rotX(p, TILT_X); rotX(p, tilt[1]); rotY(p, tilt[0]);
  const len = Math.hypot(p[0]!, p[1]!, p[2]!) || 1;
  const nz = p[2]! / len, nxy = Math.hypot(p[0]!, p[1]!) || 1e-4;
  const front = (nz + 1) / 2;
  const side = smooth(-0.35, 0.9, (p[0]! * LIGHT[0] + p[1]! * LIGHT[1]) / nxy);
  const shell = smooth(0.9, 0.98, len0);
  const rim = ejecta ? 0 : Math.pow(1 - Math.abs(nz), 2.5) * (0.25 + 0.75 * side) * breath(t) * shell * 0.9;
  const s = CAM_D / (CAM_D - p[2]!);
  return {
    x: p[0]! * s, y: p[1]! * s, z: p[2]!, s, size: (0.8 + 1.2 * r0) * s * (ejecta ? 0.9 : 1),
    dust: ejecta ? 0 : (0.1 + 0.2 * front) * (shell > 0.5 ? 1 : 0.7),
    fil: fil * (0.25 + 0.6 * front) * (shell > 0.5 ? 1 : 0.8), rim, ej,
  };
};

/** Colores de la capa, función pura del tema: fondo, polvo, filamentos, halo, rim (oscuro), rim (claro). */
export const sphereColors = (t: Theme): readonly [Hex, Hex, Hex, Hex, Hex, Hex] => {
  const { bgDeep, glow, glow2, glowMix } = t.derived;
  return [bgDeep, glow, glow2, glowMix, mix('#FFFFFF', glow, 0.45), mix(t.roles.ink, glow, 0.25)];
};
