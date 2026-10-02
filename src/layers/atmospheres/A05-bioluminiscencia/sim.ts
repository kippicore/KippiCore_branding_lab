// Simulación determinista de A05 (MOTION.md §4.4–4.7). Pura: sin DOM ni canvas.
// El estado en el tiempo t es función de (seed, aspect, t) gracias al paso fijo de 1/60 s.
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { createNoise3D, easeInOut, easeOut, type Noise3D } from '../../../runtime/motion';

export const MAX_PARTICLES = 72;
export const BASE_PARTICLES = 34;
const STEP_MS = 1000 / 60;
const F = 1.6, TT = 40, V0 = 0.006, EPS = 1e-3, VMAX = 0.012;
const MARGIN = 0.06;

export interface Particle {
  /** Posición normalizada 0..1 de la vista (puede salir del rango por el margen). */
  x: number; y: number; px: number; py: number;   // actual y del paso anterior (para interpolar)
  size: number;       // 1.2–3.6 (% del ancho)
  z: number;          // 0..1
  phase: number; period: number;   // pulso: φ, P (s)
  primary: boolean;   // 1 de cada 4 en primary
  presence: number;   // 0..1 (densidad)
  born: number;       // tiempo (s) del último reaparecer; fundido de 1 s
}
export interface Flare { start: number; i: number }

export class Sim {
  readonly particles: Particle[] = [];
  private noise: Noise3D;
  private simMs = 0;
  private flares: Flare[] = [];
  private flareRng: () => number;
  private flareEnd = 0;
  private flareNextAt = 0;
  private seed: number;
  constructor(seed: number, public aspect: number, private activeN = BASE_PARTICLES) {
    this.seed = seed;
    this.noise = createNoise3D(mulberry32(hashSeed('A05', seed, 'noise')));
    this.flareRng = mulberry32(hashSeed('A05', seed, 'flare'));
    for (let i = 0; i < MAX_PARTICLES; i++) {
      // Orden de consumo del PRNG (congelado; el estático debe usar el mismo): x, y, size, φ, P.
      const r = mulberry32(hashSeed('A05', seed, 'p', i));
      const x = r(), y = r(), size = 1.2 + 2.4 * r(), phase = 2 * Math.PI * r(), period = 8 + 8 * r();
      this.particles.push({ x, y, px: x, py: y, size, z: (size - 1.2) / 2.4, phase, period, primary: i % 4 === 0,
        presence: i < activeN ? 1 : 0, born: -10 });
    }
    this.flareNextAt = 4 + this.exp() * 9;
  }
  private exp(): number { return -Math.log(1 - this.flareRng()); }
  setActive(n: number): void { this.activeN = Math.max(0, Math.min(MAX_PARTICLES, Math.round(n))); }
  get active(): number { return this.activeN; }
  get timeMs(): number { return this.simMs; }

  private curl(u: number, v: number, t: number): [number, number] {
    const z = t / TT, n = this.noise;
    const dv = (n(u * F, (v + EPS) * F, z) - n(u * F, (v - EPS) * F, z)) / (2 * EPS);
    const du = (n((u + EPS) * F, v * F, z) - n((u - EPS) * F, v * F, z)) / (2 * EPS);
    return [dv, -du];
  }

  /** Avanza a `tMs` en pasos fijos. Devuelve alfa de interpolación 0..1 entre el paso anterior y el actual. */
  advanceTo(tMs: number): number {
    while (this.simMs + STEP_MS <= tMs) this.step(STEP_MS / 1000);
    return Math.min(1, Math.max(0, (tMs - this.simMs) / STEP_MS));
  }

  private step(h: number): void {
    const tNext = this.simMs / 1000 + h;
    const ramp = easeOut(Math.min(1, tNext / 1.2));            // 0→1 en 1.2 s al arrancar
    const a = this.aspect;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!;
      p.px = p.x; p.py = p.y;
      const target = i < this.activeN ? 1 : 0;
      p.presence += Math.max(-h, Math.min(h, target - p.presence));   // fundido de 1 s al cambiar la densidad
      // unidades de ancho: u = x, v = y·aspect
      const [cx, cy] = this.curl(p.x, p.y * a, tNext);
      const k = (V0 * (0.6 + 0.8 * p.z)) / F;
      let vx = cx * k, vy = cy * k - 0.0015 * (0.5 + p.z);
      const sp = Math.hypot(vx, vy);
      if (sp > VMAX) { vx *= VMAX / sp; vy *= VMAX / sp; }
      p.x += vx * h * ramp;
      p.y += (vy * h * ramp) / a;
      this.wrap(p, tNext);
    }
    this.simMs += h * 1000;
    this.scheduleFlares();
  }
  /** Sale por un lado y reaparece por el opuesto, fuera de la vista. */
  private wrap(p: Particle, t: number): void {
    const mx = MARGIN, my = MARGIN / this.aspect;
    let moved = false;
    if (p.x < -mx) { p.x += 1 + 2 * mx; p.px += 1 + 2 * mx; moved = true; }
    else if (p.x > 1 + mx) { p.x -= 1 + 2 * mx; p.px -= 1 + 2 * mx; moved = true; }
    if (p.y < -my) { p.y += 1 + 2 * my; p.py += 1 + 2 * my; moved = true; }
    else if (p.y > 1 + my) { p.y -= 1 + 2 * my; p.py -= 1 + 2 * my; moved = true; }
    if (moved) p.born = t;
  }
  private scheduleFlares(): void {
    const t = this.simMs / 1000;
    while (this.flareNextAt <= t + 6) {
      const start = Math.max(this.flareNextAt, this.flareEnd + 0.2);
      this.flares.push({ start, i: Math.floor(this.flareRng() * BASE_PARTICLES) });
      this.flareEnd = start + 4;                                  // 1.2 s de subida + 2.8 s de bajada
      this.flareNextAt = start + 4 + this.exp() * 5;              // media ≈ 9 s entre destellos
    }
    if (this.flares.length > 8) this.flares.splice(0, this.flares.length - 8);
  }

  /** Brillo b_i(t) con rampa de pulso (3 s) y destello. Rango ≈ 0.45–1.25. */
  brightness(i: number, tS: number): number {
    const p = this.particles[i]!;
    const raw = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin((2 * Math.PI * tS) / p.period + p.phase), 1.6);
    const ramp = easeInOut(Math.min(1, tS / 3));
    let b = 1 + (raw - 1) * ramp;
    const env = this.flareEnvelope(i, tS);
    if (env > 0) b += (1.25 - b) * env;
    return b;
  }
  flareEnvelope(i: number, tS: number): number {
    for (const f of this.flares) {
      if (f.i !== i) continue;
      const d = tS - f.start;
      if (d < 0 || d > 4) continue;
      return d < 1.2 ? easeOut(d / 1.2) : 1 - easeInOut((d - 1.2) / 2.8);
    }
    return 0;
  }
  /** Fundido de reaparición (1 s) × presencia. */
  alpha(i: number, tS: number): number {
    const p = this.particles[i]!;
    return p.presence * Math.min(1, Math.max(0, (tS - p.born) / 1));
  }
  get seedValue(): number { return this.seed; }
}

/** Alfa de la sinapsis entre dos partículas a distancia d (px) con umbral D (px): continuo, 0 en D. */
export const synapseWeight = (d: number, D: number): number => (d >= D ? 0 : (1 - d / D) ** 2);
