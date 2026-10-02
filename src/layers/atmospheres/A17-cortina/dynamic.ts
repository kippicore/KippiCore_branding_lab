// A17 Cortina boreal dinámica: cortinas verticales deformadas por fbm con dominio warped (≈40 s), estrellas que titilan.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed } from '../../../lib/prng';
import { hexToRgb01 } from '../../../theme/color';
import { createGlSurface, type GlSurface } from '../../../runtime/gl-surface';
import { easeInOut, ThemeTween } from '../../../runtime/motion';
import fragment from './cortina.frag.glsl?raw';

const RENDER_SCALE = 0.6;
const NAMES = ['uBg', 'uDeep', 'uGlow', 'uGlow2', 'uMix', 'uInk'] as const;

export const cortinaColors = (t: Theme): readonly [Hex, Hex, Hex, Hex, Hex, Hex] =>
  [t.roles.bg, t.derived.bgDeep, t.derived.glow, t.derived.glow2, t.derived.glowMix, t.roles.ink];

class Cortina implements DynamicLayerInstance {
  private tween: ThemeTween;
  private surface: GlSurface | null = null;
  private size: Size = { w: 1, h: 1 };
  private tMs = 0;
  private seedOff: number;
  private colors: readonly Hex[];
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.seedOff = hashSeed('A17', init.seed) % 1000;
    this.colors = cortinaColors(init.theme);
  }
  mount(host: HTMLElement): void {
    const u: Record<string, { value: unknown }> = { uTime: { value: 0 }, uWarpAmt: { value: 0 }, uDark: { value: this.tween.dark }, uSeed: { value: this.seedOff } };
    for (const n of NAMES) u[n] = { value: [0, 0, 0] };
    this.surface = createGlSurface(host, fragment, u, RENDER_SCALE);
    this.pushColors();
    this.pushTime();
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
    this.tMs = tMs;
    if (this.tween.update(Math.min(dtMs, 50))) this.pushColors();
    this.pushTime();
    this.surface.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.surface) return Promise.reject(new Error('A17: sin superficie'));
    this.pushTime();
    return this.surface.capture(this.size);
  }
  dispose(): void { this.surface?.dispose(); this.surface = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private pushColors(): void {
    this.colors = cortinaColors(this.tween.current);
    const s = this.surface;
    if (!s) return;
    NAMES.forEach((n, i) => { s.uniforms[n]!.value = [...hexToRgb01(this.colors[i]!)]; });
    s.uniforms.uDark!.value = this.tween.dark;
  }
  private pushTime(): void {
    const s = this.surface;
    if (!s) return;
    // El tiempo del shader avanza 1 unidad/s: los periodos de pliegue (≈1/0.05 = 20 s en ruido, fase 2π/0.35 ≈ 18 s) dan un ciclo percibido ~40 s.
    s.uniforms.uTime!.value = this.tMs / 1000;
    s.uniforms.uWarpAmt!.value = easeInOut(Math.min(1, this.tMs / 4000));
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Cortina(init);
