// A18 Resplandor dinámica: rayos en abanico que respiran y derivan (25 s), nubes de luz (50 s), núcleo que pulsa (10 s), estrellas que titilan.
// Ciclo completo = 50 s; todas las fases dividen 50 s.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { hexToRgb01 } from '../../../theme/color';
import { createGlSurface, type GlSurface } from '../../../runtime/gl-surface';
import { easeInOut, ThemeTween } from '../../../runtime/motion';
import fragment from './resplandor.frag.glsl?raw';

const RENDER_SCALE = 0.6;

export const resplandorColors = (t: Theme): readonly [Hex, Hex, Hex, Hex, Hex] =>
  [t.derived.bgDeep, t.derived.glow2, t.derived.glow, t.derived.glowMix, t.roles.ink];

class Resplandor implements DynamicLayerInstance {
  private tween: ThemeTween;
  private surface: GlSurface | null = null;
  private size: Size = { w: 1, h: 1 };
  private tMs = 0;
  private seedF: number;
  private colors: readonly Hex[];
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.seedF = mulberry32(hashSeed('A18', init.seed))();
    this.colors = resplandorColors(init.theme);
  }
  mount(host: HTMLElement): void {
    this.surface = createGlSurface(host, fragment, {
      uTime: { value: 0 }, uAmt: { value: 0 }, uSeed: { value: this.seedF }, uDark: { value: this.tween.dark },
      uBg: { value: [0, 0, 0] }, uPrimary: { value: [0, 0, 0] }, uAccent: { value: [0, 0, 0] },
      uGlowMix: { value: [0, 0, 0] }, uInk: { value: [0, 0, 0] },
    }, RENDER_SCALE);
    this.pushColors();
    this.pushTime();
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.surface?.setSize(size, dpr);
    this.pushTime();
    this.surface?.draw();
  }
  setTheme(theme: Theme, ms: number): void { this.tween.set(theme, ms); if (ms <= 0) this.pushColors(); }
  setParams(_p: Partial<DynamicParams>): void {}
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.surface) return;
    this.tMs = tMs;
    if (this.tween.update(dtMs)) this.pushColors();
    this.pushTime();
    this.surface.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.surface) return Promise.reject(new Error('A18: sin superficie'));
    this.pushTime();
    return this.surface.capture(this.size);
  }
  dispose(): void { this.surface?.dispose(); this.surface = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private pushColors(): void {
    this.colors = resplandorColors(this.tween.current);
    const s = this.surface;
    if (!s) return;
    ['uBg', 'uPrimary', 'uAccent', 'uGlowMix', 'uInk'].forEach((n, i) => { s.uniforms[n]!.value = [...hexToRgb01(this.colors[i]!)]; });
    s.uniforms.uDark!.value = this.tween.dark;
  }
  private pushTime(): void {
    const s = this.surface;
    if (!s) return;
    s.uniforms.uTime!.value = this.tMs / 1000;
    s.uniforms.uAmt!.value = easeInOut(Math.min(1, this.tMs / 3000));
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Resplandor(init);
