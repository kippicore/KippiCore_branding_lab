// Reloj único (MOTION.md §2.2): un solo rAF para todo el laboratorio.
import { recordFrame, resetFps } from './fps';

export interface Tickable { frame(tMs: number, dtMs: number): void }

export interface TickerEnv {
  request(cb: (now: number) => void): number;
  cancel(id: number): void;
}
export interface AddOptions {
  speed?: number;
  /** Rampa de arranque (ms): 1200 la primera vez, 400 al reanudar tras pausa. 0 = sin rampa. */
  rampMs?: number;
  /** Constante de suavizado de la velocidad (τ, ms). 0 = salto inmediato. */
  smoothMs?: number;
}
interface Entry { inst: Tickable; target: number; cur: number; rampMs: number; rampT: number; smoothMs: number }

const MAX_DT = 50;
const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);

export class Ticker {
  private entries = new Map<Tickable, Entry>();
  /** Tiempo acumulado por instancia; sobrevive a pausas (el tiempo se congela, no salta). */
  private clocks = new WeakMap<Tickable, number>();
  private handle: number | null = null;
  private last: number | null = null;
  constructor(private env: TickerEnv) {}

  get size(): number { return this.entries.size; }
  get running(): boolean { return this.handle !== null; }

  add(inst: Tickable, opts: AddOptions = {}): void {
    if (this.entries.has(inst)) return;
    const resumed = this.clocks.has(inst);
    const speed = opts.speed ?? 1;
    const smoothMs = opts.smoothMs ?? 300;
    this.entries.set(inst, {
      inst, target: speed, cur: smoothMs > 0 ? speed : speed, smoothMs,
      rampMs: opts.rampMs ?? (resumed ? 400 : 1200), rampT: 0,
    });
    if (!resumed) this.clocks.set(inst, 0);
    if (this.handle === null) { this.last = null; this.handle = this.env.request(this.loop); }
  }
  remove(inst: Tickable): void {
    this.entries.delete(inst);
    if (this.entries.size === 0 && this.handle !== null) {
      this.env.cancel(this.handle);
      this.handle = null;
      this.last = null;
      resetFps();
    }
  }
  setSpeed(inst: Tickable, speed: number): void {
    const e = this.entries.get(inst);
    if (e) e.target = speed;
  }
  /** Tiempo de capa acumulado (ms) de una instancia. */
  timeOf(inst: Tickable): number { return this.clocks.get(inst) ?? 0; }

  private loop = (now: number): void => {
    this.handle = null;
    this.tick(now);
    if (this.entries.size > 0) this.handle = this.env.request(this.loop);
  };

  /** Un paso del reloj. Público para poder dirigirlo en pruebas. */
  tick(now: number): void {
    const dt = this.last === null ? 0 : Math.min(Math.max(now - this.last, 0), MAX_DT);
    this.last = now;
    recordFrame(now);
    for (const e of [...this.entries.values()]) {
      if (!this.entries.has(e.inst)) continue;
      // Velocidad integrada, no multiplicada: persigue al regulador con suavizado exponencial.
      e.cur = e.smoothMs > 0 ? e.cur + (e.target - e.cur) * (1 - Math.exp(-dt / e.smoothMs)) : e.target;
      e.rampT += dt;
      const ramp = e.rampMs > 0 ? easeOutCubic(Math.min(1, e.rampT / e.rampMs)) : 1;
      const t = (this.clocks.get(e.inst) ?? 0) + dt * e.cur * ramp;
      this.clocks.set(e.inst, t);
      if (typeof window !== 'undefined') window.__kcFrames = (window.__kcFrames ?? 0) + 1;
      e.inst.frame(t, dt);
    }
  }
}

export const ticker = new Ticker({
  request: (cb) => requestAnimationFrame(cb),
  cancel: (id) => cancelAnimationFrame(id),
});
export const createTicker = (env: TickerEnv): Ticker => new Ticker(env);
