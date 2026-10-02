// A10 Plasma duotono dinámica (MOTION.md §5): dos luces orbitan (40 s) y donde se tocan nace la tercera.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { hexToRgb01 } from '../../../theme/color';
import { createGlSurface, type GlSurface } from '../../../runtime/gl-surface';
import { createNoise2D, drift, easeInOut, ThemeTween } from '../../../runtime/motion';
import fragment from './plasma.frag.glsl?raw';

const P0 = { x: 0.38, y: 0.46, d: 0.8 };
const A0 = { x: 0.66, y: 0.56, d: 0.78 };
const M0 = { x: 0.85, y: 0.1, d: 0.4, alpha: 0.6 };
const TAU = Math.PI * 2;
const RENDER_SCALE = 0.5;

export const plasmaColors = (t: Theme): readonly [Hex, Hex, Hex, Hex] =>
  [t.roles.bg, t.derived.glow2, t.derived.glow, t.derived.glowMix];

class Plasma implements DynamicLayerInstance {
  private tween: ThemeTween;
  private surface: GlSurface | null = null;
  private size: Size = { w: 1, h: 1 };
  private tMs = 0;
  private noise;
  private lanes: [number, number];
  private colors: readonly Hex[];
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.noise = createNoise2D(mulberry32(hashSeed('A10', init.seed)));
    const r = mulberry32(hashSeed('A10', init.seed, 'lane'));
    this.lanes = [r() * 1000, r() * 1000];
    this.colors = plasmaColors(init.theme);
  }
  mount(host: HTMLElement): void {
    this.surface = createGlSurface(host, fragment, {
      uTime: { value: 0 }, uWarpAmt: { value: 0 }, uDark: { value: this.tween.dark },
      uBg: { value: [0, 0, 0] }, uPrimary: { value: [0, 0, 0] }, uAccent: { value: [0, 0, 0] }, uGlowMix: { value: [0, 0, 0] },
      uP: { value: [0, 0, 1, 1] }, uA: { value: [0, 0, 1, 1] }, uM: { value: [0, 0, 1, 1] },
    }, RENDER_SCALE);
    this.pushColors();
    this.pushGeometry();
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.surface?.setSize(size, dpr);
    this.pushGeometry();
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
    this.pushGeometry();
    this.surface.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.surface) return Promise.reject(new Error('A10: sin superficie'));
    this.pushGeometry();
    return this.surface.capture(this.size);
  }
  dispose(): void { this.surface?.dispose(); this.surface = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private pushColors(): void {
    this.colors = plasmaColors(this.tween.current);
    const s = this.surface;
    if (!s) return;
    const names = ['uBg', 'uPrimary', 'uAccent', 'uGlowMix'];
    names.forEach((n, i) => { s.uniforms[n]!.value = [...hexToRgb01(this.colors[i]!)]; });
    s.uniforms.uDark!.value = this.tween.dark;
  }
  private pushGeometry(): void {
    const s = this.surface;
    if (!s) return;
    const t = this.tMs / 1000;
    const { w, h } = this.size;
    const k = s.canvas.width > 0 ? s.canvas.width / w : 1;
    const p0 = [P0.x * w, P0.y * h], a0 = [A0.x * w, A0.y * h];
    const c = [(p0[0]! + a0[0]!) / 2, (p0[1]! + a0[1]!) / 2];
    const hx = p0[0]! - c[0]!, hy = p0[1]! - c[1]!;
    const th = (TAU * t) / 40;                                  // giro lineal continuo
    const sep = 1 + 0.18 * (0.5 - 0.5 * Math.cos((TAU * t) / 53)); // la separación respira 1 → 1.18
    const cos = Math.cos(th), sin = Math.sin(th);
    const rx = (cos * hx - sin * hy) * sep, ry = (sin * hx + cos * hy) * sep;
    const sP = 1 + 0.03 * Math.sin((TAU * t) / 29);
    const sA = 1 + 0.03 * Math.sin((TAU * t) / 29 + Math.PI);
    const mx = M0.x * w + drift(this.noise, t, 31, this.lanes[0], 0.04) * w;
    const my = M0.y * h + drift(this.noise, t, 43, this.lanes[1], 0.04) * h;
    s.uniforms.uP!.value = [(c[0]! + rx) * k, (c[1]! + ry) * k, P0.d * w * sP * k, 1];
    s.uniforms.uA!.value = [(c[0]! - rx) * k, (c[1]! - ry) * k, A0.d * w * sA * k, 1];
    s.uniforms.uM!.value = [mx * k, my * k, M0.d * w * k, M0.alpha];
    s.uniforms.uTime!.value = t;
    s.uniforms.uWarpAmt!.value = easeInOut(Math.min(1, this.tMs / 4000));
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Plasma(init);
