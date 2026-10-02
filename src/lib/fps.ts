// Medidor de fps: media móvil de 1 s sobre las marcas de tiempo de cada cuadro.
declare global {
  interface Window { __kcFps?: number; __kcFrames?: number }
}

export class FpsCounter {
  private stamps: number[] = [];
  /** Registra un cuadro en `now` (ms) y devuelve los fps de la última ventana de `windowMs`. */
  push(now: number, windowMs = 1000): number {
    this.stamps.push(now);
    while (this.stamps.length > 1 && now - this.stamps[0]! > windowMs) this.stamps.shift();
    const span = now - this.stamps[0]!;
    return span > 0 ? ((this.stamps.length - 1) * 1000) / span : 0;
  }
  reset(): void { this.stamps = []; }
}

const counter = new FpsCounter();
/** Lo llama el ticker en cada rAF. Expone `window.__kcFps`. */
export function recordFrame(now: number): void {
  if (typeof window === 'undefined') return;
  window.__kcFps = Math.round(counter.push(now) * 10) / 10;
}
export function resetFps(): void { counter.reset(); if (typeof window !== 'undefined') window.__kcFps = 0; }
