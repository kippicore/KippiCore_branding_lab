// A15 Marea luminosa dinámica: frentes de ola en perspectiva que llegan, rompen sobre la orilla (≈14 s),
// la espuma bioluminiscente se apaga en la retirada y deja brillo residual y destellos sobre la arena mojada.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { hexToRgb01 } from '../../../theme/color';
import { createGlSurface, type GlSurface } from '../../../runtime/gl-surface';
import { clamp01, easeInOut, easeOut, ThemeTween } from '../../../runtime/motion';
import { exprToHex } from '../../shared/color-expr';
import { SEA_COLOR, SPRAY_COLOR } from './static';
import fragment from './marea.frag.glsl?raw';

export const CYCLE_MS = 14000;
const ADVANCE = 0.3;           // fracción del ciclo en que la ola sube (rápida); el resto es la retirada lenta
const RENDER_SCALE = 0.6;

/** bgDeep, mar, halo, núcleo, ambient, destello. Función pura del tema. */
export const mareaColors = (t: Theme): readonly [Hex, Hex, Hex, Hex, Hex, Hex] =>
  [t.derived.bgDeep, exprToHex(SEA_COLOR, t), t.derived.glowMix, t.derived.glow, t.derived.ambient, exprToHex(SPRAY_COLOR, t)];

export interface TideState { ph: number; cycle: number; run: number; runup: number; foam: number; resid: number }
/** Estado de la marea: función determinista de (seed, tMs). */
export const tideState = (seed: number, tMs: number): TideState => {
  const c = tMs / CYCLE_MS;
  const cycle = Math.floor(c);
  const ph = c - cycle;
  const run = 0.8 + 0.4 * mulberry32(hashSeed('A15', seed, 'cycle', cycle))();
  const runup = ph < ADVANCE ? easeOut(ph / ADVANCE) : 1 - easeInOut((ph - ADVANCE) / (1 - ADVANCE));
  const rise = clamp01(ph / 0.06);
  const foam = (0.9 + 0.1 * rise) * (ph < 0.06 ? 1 : 0.16 + 0.84 * Math.exp(-(ph - 0.06) * 2.6)) * (1 - easeInOut((ph - 0.82) / 0.18));
  const resid = ph < ADVANCE ? 0 : Math.exp(-(ph - ADVANCE) * 3.2) * (1 - easeInOut((ph - 0.85) / 0.15)) * easeOut((ph - ADVANCE) / 0.05);
  return { ph, cycle, run, runup, foam, resid };
};

class Marea implements DynamicLayerInstance {
  private tween: ThemeTween;
  private surface: GlSurface | null = null;
  private size: Size = { w: 1, h: 1 };
  private tMs = 0;
  private seed: number;
  private seedF: number;
  private colors: readonly Hex[];
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.seed = init.seed;
    this.seedF = mulberry32(hashSeed('A15', init.seed, 'shader'))() * 97;
    this.colors = mareaColors(init.theme);
  }
  mount(host: HTMLElement): void {
    const v3 = () => ({ value: [0, 0, 0] });
    this.surface = createGlSurface(host, fragment, {
      uTime: { value: 0 }, uSeed: { value: this.seedF }, uDark: { value: this.tween.dark },
      uRunup: { value: 0 }, uFoam: { value: 0 }, uResid: { value: 0 }, uRun: { value: 1 }, uCycle: { value: 0 }, uPh: { value: 0 },
      uWarmup: { value: 0 },
      uBgDeep: v3(), uSea: v3(), uHalo: v3(), uCore: v3(), uAmbient: v3(), uSpark: v3(),
    }, RENDER_SCALE);
    this.pushColors();
    this.pushState();
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.surface?.setSize(size, dpr);
    this.surface?.draw();
  }
  setTheme(theme: Theme, ms: number): void { this.tween.set(theme, ms); if (ms <= 0) this.pushColors(); }
  setParams(_p: Partial<DynamicParams>): void {}
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.surface) return;
    this.tMs = Math.max(0, tMs);
    if (this.tween.update(Math.min(50, Math.max(0, dtMs)))) this.pushColors();
    this.pushState();
    this.surface.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.surface) return Promise.reject(new Error('A15: sin superficie'));
    this.pushState();
    return this.surface.capture(this.size);
  }
  dispose(): void { this.surface?.dispose(); this.surface = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private pushColors(): void {
    this.colors = mareaColors(this.tween.current);
    const s = this.surface;
    if (!s) return;
    ['uBgDeep', 'uSea', 'uHalo', 'uCore', 'uAmbient', 'uSpark'].forEach((n, i) => { s.uniforms[n]!.value = [...hexToRgb01(this.colors[i]!)]; });
    s.uniforms.uDark!.value = this.tween.dark;
  }
  private pushState(): void {
    const s = this.surface;
    if (!s) return;
    const st = tideState(this.seed, this.tMs);
    const u = s.uniforms;
    u.uTime!.value = this.tMs / 1000;
    u.uRunup!.value = st.runup;
    u.uFoam!.value = st.foam;
    u.uResid!.value = st.resid;
    u.uRun!.value = st.run;
    u.uCycle!.value = st.cycle;
    u.uPh!.value = st.ph;
    // Arranque suave: la primera vez no aparece de golpe (y la captura en t = 0 ya muestra la escena).
    u.uWarmup!.value = 0.55 + 0.45 * easeInOut(this.tMs / 2500);
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Marea(init);
