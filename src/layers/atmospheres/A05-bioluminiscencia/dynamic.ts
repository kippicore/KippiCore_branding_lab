// A05 Bioluminiscencia dinámica (MOTION.md §4): partículas por campo curl, pulso senoidal y sinapsis en Canvas 2D.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hashSeed } from '../../../lib/prng';
import { lerpOklch } from '../../../theme/oklch';
import { easeInOut, ThemeTween, clamp01 } from '../../../runtime/motion';
import { BASE_PARTICLES, MAX_PARTICLES, Sim, synapseWeight } from './sim';

const SPRITE = 128;
const clampN = (density: number): number => Math.max(1, Math.min(MAX_PARTICLES, Math.round(BASE_PARTICLES * density)));

export const bioColors = (t: Theme): readonly [Hex, Hex, Hex, Hex] =>
  [t.derived.bgDeep, t.derived.glow, t.derived.glow2, t.derived.ambient];

const pairSign = (seed: number, i: number, j: number): number =>
  (hashSeed('A05', seed, 'pair', Math.min(i, j), Math.max(i, j)) / 4294967296) * 2 - 1;

class Bio implements DynamicLayerInstance {
  private tween: ThemeTween;
  private sim: Sim;
  private size: Size = { w: 640, h: 400 };
  private dpr = 1;
  private root: HTMLDivElement | null = null;
  private ambient: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private sprites: [HTMLCanvasElement | null, HTMLCanvasElement | null] = [null, null];
  private tMs = 0;
  private alphaStep = 0;
  private blend: 'screen' | 'multiply';
  private colors: readonly Hex[];
  private seed: number;
  constructor(init: DynamicInit) {
    this.seed = init.seed;
    this.tween = new ThemeTween(init.theme);
    this.sim = new Sim(init.seed, this.size.h / this.size.w, clampN(init.params.density));
    this.blend = init.theme.derived.blendMode;
    this.colors = bioColors(init.theme);
  }
  mount(host: HTMLElement): void {
    const root = document.createElement('div');
    root.style.cssText = 'position:absolute;inset:0;overflow:hidden';
    const amb = document.createElement('div');
    amb.style.cssText = 'position:absolute;left:40%;top:70%;width:90%;aspect-ratio:1;translate:-50% -50%;will-change:transform';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    root.append(amb, canvas);
    host.appendChild(root);
    this.root = root; this.ambient = amb; this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.applyTheme();
    this.applyAmbientTransform(0);
  }
  resize(size: Size, dpr: number): void {
    this.size = size; this.dpr = dpr;
    this.sim.aspect = size.h / Math.max(1, size.w);
    if (this.canvas) {
      this.canvas.width = Math.max(1, Math.round(size.w * dpr));
      this.canvas.height = Math.max(1, Math.round(size.h * dpr));
    }
    this.draw();
  }
  setTheme(theme: Theme, ms: number): void { this.tween.set(theme, ms); if (ms <= 0) this.applyTheme(); }
  setParams(p: Partial<DynamicParams>): void { if (p.density !== undefined) this.sim.setActive(clampN(p.density)); }
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.canvas) return;
    this.tMs = tMs;
    if (this.tween.update(dtMs)) this.applyTheme();
    this.alphaStep = this.sim.advanceTo(tMs);
    this.applyAmbientTransform(tMs / 1000);
    this.draw();
  }
  async capture(): Promise<CanvasImageSource> {
    const { w, h } = this.size;
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w)); out.height = Math.max(1, Math.round(h));
    const c = out.getContext('2d');
    if (c) {
      const th = this.tween.current;
      c.fillStyle = th.derived.bgDeep; c.fillRect(0, 0, out.width, out.height);
      const g = c.createRadialGradient(0.4 * w, 0.7 * h, 0, 0.4 * w, 0.7 * h, 0.4808 * 0.9 * w);
      g.addColorStop(0, th.derived.ambient); g.addColorStop(1, th.derived.ambient + '00');
      c.globalAlpha = 0.7; c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
      if (this.canvas) c.drawImage(this.canvas, 0, 0, out.width, out.height);
    }
    return out;
  }
  dispose(): void { this.root?.remove(); this.root = this.canvas = this.ambient = this.ctx = null; this.sprites = [null, null]; }
  inspectColors(): readonly Hex[] { return this.colors; }

  /** Colores del tema actual → fondo, luz ambiental y sprites. */
  private applyTheme(): void {
    const th = this.tween.current;
    this.colors = bioColors(th);
    if (this.root) this.root.style.backgroundColor = this.colors[0]!;
    if (this.ambient) this.ambient.style.background = `radial-gradient(circle, ${this.colors[3]} 0, ${this.colors[3]}00 68%)`;
    if (this.ambient) this.ambient.style.opacity = '0.7';
    this.makeSprites();
    this.applyBlend();
  }
  private applyBlend(): void {
    const tw = this.tween;
    const target = tw.current.derived.blendMode;
    // El modo de mezcla es discreto: el canvas se funde a 0 (200 ms), cambia y vuelve (300 ms) (§4.8).
    if (tw.active && tw.fromBlend !== target) {
      const ms = tw.elapsed;
      if (this.canvas) this.canvas.style.opacity = String(ms < 200 ? 1 - ms / 200 : clamp01((ms - 200) / 300));
      this.blend = ms < 200 ? tw.fromBlend : target;
    } else {
      this.blend = target;
      if (this.canvas) this.canvas.style.opacity = '1';
    }
  }
  private makeSprites(): void {
    const th = this.tween.current;
    const light = th.mode === 'light';
    const ink = th.roles.ink;
    [th.derived.glow, th.derived.glow2].forEach((col, idx) => {
      const cv = this.sprites[idx] ?? document.createElement('canvas');
      cv.width = cv.height = SPRITE;
      const c = cv.getContext('2d');
      if (!c) { this.sprites[idx] = cv; return; }
      const core = light ? lerpOklch(col, ink, 0.25) : col;
      const halo = light ? 0.8 : 1;
      const g = c.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
      g.addColorStop(0, core);
      g.addColorStop(0.08, core);
      g.addColorStop(0.14, hexA(col, 0.45 * halo));
      g.addColorStop(1, hexA(col, 0));
      c.fillStyle = g; c.fillRect(0, 0, SPRITE, SPRITE);
      this.sprites[idx] = cv;
    });
  }
  private applyAmbientTransform(t: number): void {
    if (!this.ambient) return;
    const s = 1 + 0.05 * (0.5 - 0.5 * Math.cos((Math.PI * t) / 34));     // 1 → 1.05, 34 s por tramo
    const tx = 2 * Math.sin((2 * Math.PI * t) / 43), ty = 1.5 * Math.sin((2 * Math.PI * t) / 53);
    this.ambient.style.transform = `translate(${tx.toFixed(3)}%, ${ty.toFixed(3)}%) scale(${s.toFixed(5)})`;
  }

  private draw(): void {
    const ctx = this.ctx, cv = this.canvas;
    if (!ctx || !cv) return;
    const { w, h } = this.size;
    const tS = this.tMs / 1000;
    const th = this.tween.current;
    const light = th.mode === 'light';
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = this.blend;
    const ps = this.sim.particles, a = this.alphaStep;
    const n = ps.length;
    const X = new Float32Array(n), Y = new Float32Array(n), B = new Float32Array(n), Al = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = ps[i]!;
      X[i] = (p.px + (p.x - p.px) * a) * w;
      Y[i] = (p.py + (p.y - p.py) * a) * h;
      B[i] = this.sim.brightness(i, tS);
      Al[i] = this.sim.alpha(i, tS);
    }
    // Sinapsis (antes que las partículas). Umbral D = 0.14·min(W,H), reducido si hay más de 34.
    const active = Math.max(BASE_PARTICLES, this.sim.active);
    const D = 0.14 * Math.min(w, h) * Math.sqrt(BASE_PARTICLES / active);
    const rampL = easeInOut(Math.min(1, tS / 1.2));
    ctx.lineWidth = light ? 1 : 0.75;
    const wob = Math.cos((2 * Math.PI * tS) / 37);
    for (let i = 0; i < n; i++) {
      if (Al[i]! <= 0) continue;
      for (let j = i + 1; j < n; j++) {
        if (Al[j]! <= 0) continue;
        const dx = X[j]! - X[i]!, dy = Y[j]! - Y[i]!;
        if (Math.abs(dx) >= D || Math.abs(dy) >= D) continue;
        const d = Math.hypot(dx, dy);
        const wgt = synapseWeight(d, D);
        if (wgt <= 0) continue;
        const pi = ps[i]!, pj = ps[j]!;
        let al = 0.35 * wgt * Math.min(B[i]!, B[j]!, 1) * Math.min(Al[i]!, Al[j]!) * rampL;
        const fl = Math.max(this.sim.flareEnvelope(i, tS), this.sim.flareEnvelope(j, tS));
        al *= 1 + 0.6 * fl;
        if (al < 0.004) continue;
        let col: Hex = pi.primary || pj.primary ? th.derived.glowMix : th.derived.glow;
        if (light) col = lerpOklch(col, th.roles.ink, 0.35);
        ctx.globalAlpha = Math.min(1, al);
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(X[i]!, Y[i]!);
        const bend = 0.08 * d * pairSign(this.seed, i, j) * wob;       // curvatura de hifa
        ctx.quadraticCurveTo((X[i]! + X[j]!) / 2 - (dy / d) * bend, (Y[i]! + Y[j]!) / 2 + (dx / d) * bend, X[j]!, Y[j]!);
        ctx.stroke();
      }
    }
    // Partículas.
    for (let i = 0; i < n; i++) {
      const p = ps[i]!;
      const al = Al[i]!;
      if (al <= 0) continue;
      const sprite = this.sprites[p.primary ? 1 : 0];
      if (!sprite) continue;
      const b = B[i]!;
      const rad = 0.92 + 0.08 * clamp01((b - 0.45) / 0.55);
      const diam = (p.size / 100) * w * (0.7 + 0.6 * p.z) * rad;
      ctx.globalAlpha = Math.min(1, b) * al;
      ctx.drawImage(sprite, X[i]! - diam / 2, Y[i]! - diam / 2, diam, diam);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  /** Solo pruebas: posiciones visibles (px) de las partículas activas. */
  inspectPositions(): { x: number; y: number }[] {
    return this.sim.particles.map((p) => ({ x: p.x, y: p.y }));
  }
}

const hexA = (h: Hex, a: number): string => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export const create = (init: DynamicInit): DynamicLayerInstance => new Bio(init);
