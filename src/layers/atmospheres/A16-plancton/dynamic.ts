// A16 Plancton dinámica: ≤900 partículas en canvas 2D con sprites de halo. Flujo curl en 3 capas (parallax),
// parpadeo desfasado, banda que ondula y enfoque que respira (≈20 s). Paso fijo de 60 Hz, determinista por seed.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { ThemeTween } from '../../../runtime/motion';
import { BASE_PARTICLES, MAX_PARTICLES, STEP_MS, createField, stepField, type Field } from './field';
import { buildSprites, drawScene, type Sprites } from './render';

const MAX_STEPS = 400;
const MAX_DPR = 1.25;

export const planctonColors = (t: Theme): readonly [Hex, Hex, Hex, Hex] =>
  [t.derived.bgDeep, t.derived.glow, t.derived.glow2, t.derived.glowMix];

class Plancton implements DynamicLayerInstance {
  private tween: ThemeTween;
  private seed: number;
  private field: Field;
  private simMs = 0;
  private tMs = 0;
  private count: number;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private size: Size = { w: 640, h: 400 };
  private k = 1;
  private colors: readonly Hex[];
  private sprites: Sprites | null = null;
  private spritesDirty = true;
  constructor(init: DynamicInit) {
    this.seed = init.seed;
    this.tween = new ThemeTween(init.theme);
    this.field = createField(init.seed);
    this.colors = planctonColors(init.theme);
    this.count = this.countFor(init.params.density);
  }
  mount(host: HTMLElement): void {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext('2d', { alpha: false });
    this.resize(this.size, 1);
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.k = Math.min(dpr, MAX_DPR);
    if (this.canvas) {
      this.canvas.width = Math.max(1, Math.round(size.w * this.k));
      this.canvas.height = Math.max(1, Math.round(size.h * this.k));
    }
    this.draw();
  }
  setTheme(theme: Theme, ms: number): void {
    this.tween.set(theme, ms);
    if (ms <= 0) { this.colors = planctonColors(this.tween.current); this.spritesDirty = true; this.draw(); }
  }
  setParams(p: Partial<DynamicParams>): void { if (p.density !== undefined) this.count = this.countFor(p.density); }
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.ctx) return;
    if (tMs < this.simMs - STEP_MS) { this.field = createField(this.seed); this.simMs = 0; }
    let n = 0;
    while (this.simMs + STEP_MS <= tMs && n++ < MAX_STEPS) {
      this.simMs += STEP_MS;
      stepField(this.field, this.simMs / 1000, STEP_MS / 1000);
    }
    this.tMs = tMs;
    if (this.tween.update(dtMs)) { this.colors = planctonColors(this.tween.current); this.spritesDirty = true; }
    this.draw();
  }
  async capture(): Promise<CanvasImageSource> {
    this.draw();
    const { w, h } = this.size;
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w)); out.height = Math.max(1, Math.round(h));
    const c = out.getContext('2d');
    if (!c || !this.canvas) return this.canvas ?? out;
    c.drawImage(this.canvas, 0, 0, out.width, out.height);
    return out;
  }
  dispose(): void { this.canvas?.remove(); this.canvas = null; this.ctx = null; this.sprites = null; }
  inspectColors(): readonly Hex[] { return this.colors; }

  private countFor(density: number): number {
    return Math.max(1, Math.min(MAX_PARTICLES, Math.round(BASE_PARTICLES * Math.min(1.5, Math.max(0.5, density)))));
  }
  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.spritesDirty || !this.sprites) {
      this.sprites = buildSprites([this.colors[2]!, this.colors[1]!, this.colors[3]!]);
      this.spritesDirty = false;
    }
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    drawScene(ctx, this.field, this.sprites, {
      w: this.size.w, h: this.size.h, tSec: this.tMs / 1000, count: this.count, dark: this.tween.dark > 0.5,
      bg: this.colors[0]!, blend: (this.tween.dark > 0.5 ? 'screen' : 'multiply') as GlobalCompositeOperation,
    });
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Plancton(init);
