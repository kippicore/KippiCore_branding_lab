// A16 Plancton: modelo compartido (estática, paint y dinámica). Banda diagonal de partículas en coordenadas (u, v)
// (u a lo largo de la banda, v perpendicular, en unidades de la diagonal S). Flujo = corriente + campo curl
// analítico (función de corriente ψ de 3 ondas, así es divergence-free), 3 capas de profundidad con parallax.
import { hashSeed, mulberry32 } from '../../../lib/prng';

export const MAX_PARTICLES = 900;
export const BASE_PARTICLES = 600;
export const STEP_MS = 1000 / 60;
export const HALF_LEN = 0.66;                 // semilargo de la banda (S); los extremos quedan fuera de pantalla
export const ANGLE = -0.42;                   // rad: la banda sube hacia la derecha
export const CENTER = { x: 0.5, y: 0.54 };
export const LEVELS = 6;                      // niveles de desenfoque de los sprites
export const HALO = 4.2;                      // radio del sprite / radio del punto
export const TAU = Math.PI * 2;

const LAYER_SPEED = [0.5, 1, 1.8] as const;   // parallax: far, mid, near
const LAYER_CURL = [0.6, 1, 1.5] as const;
const LAYER_SIZE = [0.8, 1, 1.6] as const;
const LAYER_ALPHA = [0.3, 0.95, 0.22] as const;
const LAYER_Z = [-1, 0, 1] as const;
const U_DRIFT = 0.012;                        // S/s en la capa media
const CURL_T = [60, 40, 24] as const;         // periodos (s) de las ondas de ψ

const smooth = (a: number, b: number, x: number): number => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export interface Field {
  readonly n: number;
  readonly layer: Uint8Array; readonly col: Uint8Array; readonly dust: Uint8Array;
  readonly u: Float32Array; readonly v: Float32Array; readonly z: Float32Array;
  readonly sz: Float32Array; readonly zd: Float32Array; readonly ph: Float32Array; readonly hz: Float32Array; readonly base: Float32Array;
  readonly kx: number[]; readonly ky: number[]; readonly fi: number[];
}

/** Anchura de la banda en función de u: densa y fina al principio, se disuelve en polvo hacia +u. */
const sigma = (u: number): number => 0.028 + 0.12 * smooth(-0.05, 0.62, u);
const wave = (u: number, t: number): number =>
  0.035 * Math.sin(TAU * (u * 1.6 - t / 30)) + 0.018 * Math.sin(TAU * (u * 3.1 + t / 20) + 1.3);

export function createField(seed: number, n = MAX_PARTICLES): Field {
  const r = mulberry32(hashSeed('A16', seed));
  const f: Field = {
    n, layer: new Uint8Array(n), col: new Uint8Array(n), dust: new Uint8Array(n),
    u: new Float32Array(n), v: new Float32Array(n), z: new Float32Array(n), sz: new Float32Array(n), zd: new Float32Array(n),
    ph: new Float32Array(n), hz: new Float32Array(n), base: new Float32Array(n),
    kx: [], ky: [], fi: [],
  };
  for (let i = 0; i < 3; i++) {
    const a = r() * TAU, k = TAU * (2.2 + r() * 2.3);
    f.kx.push(Math.cos(a) * k); f.ky.push(Math.sin(a) * k); f.fi.push(r() * TAU);
  }
  for (let i = 0; i < n; i++) {
    const q = r();
    const L = q < 0.34 ? 0 : q < 0.86 ? 1 : 2;
    f.layer[i] = L;
    const dust = r() < 0.4 ? 1 : 0;
    f.dust[i] = dust;
    f.col[i] = dust ? 0 : (r() < 0.28 ? 2 : 1);                      // 0 glow2 (polvo) · 1 glow (banda) · 2 glowMix
    f.u[i] = (r() * 2 - 1) * HALF_LEN;
    f.z[i] = Math.max(-2.6, Math.min(2.6, (r() + r() + r() - 1.5) * 2)) * (dust ? 2.6 : 1);
    f.sz[i] = 0.6 + r() * r() * 1.1 + r() * 0.3;
    f.zd[i] = LAYER_Z[L]! + (r() - 0.5) * 0.5;
    f.ph[i] = r(); f.hz[i] = 1 / (3 + r() * 6);
    f.base[i] = 0.55 + r() * 0.45;
    f.v[i] = f.z[i]! * sigma(f.u[i]!);
  }
  return f;
}

/** Un paso fijo de integración (dt segundos) en el instante tSec. */
export function stepField(f: Field, tSec: number, dt: number): void {
  const w = [0, 1, 2].map((i) => TAU * tSec / CURL_T[i]!);
  for (let i = 0; i < f.n; i++) {
    const L = f.layer[i]!, u = f.u[i]!, v = f.v[i]!;
    let cu = 0, cv = 0;
    for (let k = 0; k < 3; k++) {
      const c = Math.cos(f.kx[k]! * u + f.ky[k]! * v + f.fi[k]! + w[k]! + L * 1.7);
      cu += f.ky[k]! * c; cv -= f.kx[k]! * c;                          // v = (∂ψ/∂v, -∂ψ/∂u)
    }
    cu *= 0.0012; cv *= 0.0012;                                       // amplitud: ≈ 0.01–0.03 S/s
    const dust = f.dust[i]!;
    const target = f.z[i]! * sigma(u) + wave(u, tSec) * (dust ? 0.4 : 1);
    const kr = dust ? 0.08 : 0.3;
    let nu = u + (U_DRIFT * LAYER_SPEED[L]! + cu * LAYER_CURL[L]!) * dt;
    const nv = v + (cv * LAYER_CURL[L]!) * dt - kr * (v - target) * dt;
    if (nu > HALF_LEN) nu -= 2 * HALF_LEN; else if (nu < -HALF_LEN) nu += 2 * HALF_LEN;
    f.u[i] = nu; f.v[i] = nv;
  }
}

export interface Draw { x: number; y: number; rad: number; alpha: number; col: number; lvl: number; layer: number }

/** Enfoque que respira (-0.3..0.3 en profundidad), periodo 20 s. */
export const focusAt = (tSec: number): number => 0.3 * Math.sin(TAU * tSec / 20);

/** Proyecta la partícula i a píxeles y calcula tamaño, alfa y nivel de desenfoque. false = no se dibuja. */
export function particleDraw(f: Field, i: number, tSec: number, w: number, h: number, out: Draw): boolean {
  const S = Math.hypot(w, h);
  const u = f.u[i]!, v = f.v[i]!, L = f.layer[i]!;
  const ca = Math.cos(ANGLE), sa = Math.sin(ANGLE);
  const x = CENTER.x * w + S * (u * ca - v * sa), y = CENTER.y * h + S * (u * sa + v * ca);
  const dx = (x / w - 0.5) * 2, dy = (y / h - 0.5) * 2;
  const r2 = Math.min(1, (dx * dx + dy * dy) / 2);
  const b = Math.min(1, Math.abs(f.zd[i]! - focusAt(tSec)) * 0.9 + 0.45 * r2 * r2);
  const lvl = Math.round(b * (LEVELS - 1));
  const s = lvl / (LEVELS - 1);
  const tw = 0.68 + 0.32 * Math.sin(TAU * (tSec * f.hz[i]! + f.ph[i]!));
  const fade = (1 - 0.6 * smooth(0.05, 0.62, u)) * (1 - smooth(0.55, 0.66, Math.abs(u)));
  const alpha = f.base[i]! * LAYER_ALPHA[L]! * tw * fade;
  const rad = S * 0.0022 * f.sz[i]! * LAYER_SIZE[L]! * HALO * (1 + 2.8 * s);
  if (alpha < 0.01 || x < -rad || x > w + rad || y < -rad || y > h + rad) return false;
  out.x = x; out.y = y; out.rad = rad; out.alpha = alpha; out.col = f.col[i]!; out.lvl = lvl; out.layer = L;
  return true;
}

/** Perfil radial del sprite (alfa en r∈[0,1]) para el nivel de desenfoque s∈[0,1]. */
export const profile = (s: number, r: number): number => {
  const sharp = 0.95 * Math.exp(-Math.pow(r / 0.09, 2)) + 0.3 * Math.exp(-Math.pow(r / 0.28, 2)) + 0.07 * (1 - r) * (1 - r);
  const disc = 0.5 * (1 - smooth(0.5, 1, r)) + 0.1 * Math.exp(-Math.pow((r - 0.82) / 0.09, 2));
  return lerp(sharp, disc, s) * (1 - 0.5 * s) * (1 - smooth(0.88, 1, r));
};
export const PROFILE_STOPS = 13;
export const levelS = (lvl: number): number => lvl / (LEVELS - 1);

/** Bruma a lo largo de la banda: (u, v, largo, ancho, alfa) en unidades de S. */
export const HAZE: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [-0.22, 0, 0.62, 0.15, 0.16], [0.04, 0, 0.55, 0.12, 0.14], [0.3, 0.02, 0.55, 0.26, 0.07],
];
