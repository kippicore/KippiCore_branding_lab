// A01 Aurora dinámica (MOTION.md §3): 4 luces que derivan por ruido simplex, compuestas en un shader OGL.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { hexToRgb01 } from '../../../theme/color';
import { lerpOklch } from '../../../theme/oklch';
import { createGlSurface, type GlSurface } from '../../../runtime/gl-surface';
import { createNoise2D, drift, driftScale, easeInOut, ThemeTween } from '../../../runtime/motion';
import fragment from './aurora.frag.glsl?raw';

interface LightDef { x: number; y: number; d: number; alpha: number; T: number; wy: number }
// luz(x, y, d, color, α) de la receta + periodo T (s) y peso vertical (§3.3–3.4).
const LIGHTS: readonly LightDef[] = [
  { x: 78, y: 28, d: 78, alpha: 0.9, T: 18, wy: 0.6 },
  { x: 58, y: 78, d: 62, alpha: 0.55, T: 21.5, wy: 1 },
  { x: 98, y: 96, d: 60, alpha: 0.95, T: 24.3, wy: 0.6 },
  { x: 30, y: 40, d: 50, alpha: 0.6, T: 27, wy: 1 },
];
const RENDER_SCALE = 0.5;
const SHADE_X = 40; // zona de sombra protegida (donde va el texto)

/** Colores de las 4 luces + fondo, función pura del tema. */
export const auroraColors = (t: Theme): readonly [Hex, Hex, Hex, Hex, Hex] => {
  const { accent, primary, bg } = t.roles;
  return [bg, accent, lerpOklch(accent, primary, 0.45), primary, lerpOklch(bg, accent, 0.85)];
};

class Aurora implements DynamicLayerInstance {
  private tween: ThemeTween;
  private surface: GlSurface | null = null;
  private size: Size = { w: 1, h: 1 };
  private tMs = 0;
  private lanes: number[][];
  private noise;
  private colors: readonly Hex[];
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.noise = createNoise2D(mulberry32(hashSeed('A01', init.seed)));
    this.lanes = LIGHTS.map((_, i) => { const r = mulberry32(hashSeed('A01', init.seed, 'lane', i)); return [r() * 1000, r() * 1000, r() * 1000]; });
    this.colors = auroraColors(init.theme);
  }
  mount(host: HTMLElement): void {
    const u: Record<string, { value: unknown }> = { uTime: { value: 0 }, uWarpAmt: { value: 0 }, uBg: { value: [0, 0, 0] } };
    for (let i = 0; i < 4; i++) { u[`uL${i}`] = { value: [0, 0, 1, 0] }; u[`uC${i}`] = { value: [0, 0, 0] }; }
    this.surface = createGlSurface(host, fragment, u, RENDER_SCALE);
    this.pushColors();
    this.pushLights();
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.surface?.setSize(size, dpr);
    this.pushLights();
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
    this.pushLights();
    this.surface.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.surface) return Promise.reject(new Error('A01: sin superficie'));
    this.pushLights();
    return this.surface.capture(this.size);
  }
  dispose(): void { this.surface?.dispose(); this.surface = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private pushColors(): void {
    this.colors = auroraColors(this.tween.current);
    const s = this.surface;
    if (!s) return;
    s.uniforms.uBg!.value = [...hexToRgb01(this.colors[0]!)];
    for (let i = 0; i < 4; i++) s.uniforms[`uC${i}`]!.value = [...hexToRgb01(this.colors[i + 1]!)];
  }
  private pushLights(): void {
    const s = this.surface;
    if (!s) return;
    const t = this.tMs / 1000;
    const k = s.canvas.width > 0 ? s.canvas.width / this.size.w : 1; // px de backing por px CSS
    const { w, h } = this.size;
    LIGHTS.forEach((L, i) => {
      const [lx, ly, ls] = this.lanes[i]!;
      let dx = drift(this.noise, t, L.T, lx!, 6);
      if (L.x + dx < SHADE_X && dx < 0) dx *= 0.5;                   // la sombra de la izquierda se protege
      const dy = drift(this.noise, t, L.T, ly!, 6) * L.wy;
      const sc = driftScale(this.noise, t, L.T * 1.3, ls!);
      let a = L.alpha;
      if (i === 0) a = 0.9 * (1 - 0.06 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 41))); // respiración de L0
      s.uniforms[`uL${i}`]!.value = [((L.x + dx) / 100) * w * k, ((L.y + dy) / 100) * h * k, (L.d / 100) * w * sc * k, a];
    });
    // La deformación orgánica entra en 4 s para que t = 0 coincida con el estático.
    s.uniforms.uTime!.value = t;
    s.uniforms.uWarpAmt!.value = easeInOut(Math.min(1, this.tMs / 4000));
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Aurora(init);
