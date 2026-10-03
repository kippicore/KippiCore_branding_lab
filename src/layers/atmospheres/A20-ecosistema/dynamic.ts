// A20 Ecosistema dinámico: la esfera de A19 (WebGL, perfectamente redonda) con un canvas 2D encima donde orbitan las
// células-cliente, algunas se disparan hacia la cámara con estela y otras se señalan con un rótulo hexagonal.
import type { DynamicInit, DynamicLayerInstance, Size } from '../../../contracts';
import { cssVarFromCanvas } from '../../shared/canvas';
import { Esfera, type OverlayFrame, type SphereOverlay } from '../A19-esfera/dynamic';
import { cells, layout, type CellSpec } from './cells';
import { overlayColors, paintCells } from './overlay';

const N_POINTS = 6500;            // la esfera es más chica que en A19: menos puntos para la misma densidad

class Celulas implements SphereOverlay {
  canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private specs: CellSpec[];
  private dpr = 1;
  private size: Size = { w: 1, h: 1 };
  private blend = '';
  private family = 'sans-serif';
  private n = 0;
  constructor(seed: number) { this.specs = cells(seed); }
  mount(host: HTMLElement): void {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
    host.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext('2d');
  }
  resize(size: Size, dpr: number): void {
    this.size = size; this.dpr = dpr;
    if (!this.canvas) return;
    this.canvas.width = Math.max(1, Math.round(size.w * dpr));
    this.canvas.height = Math.max(1, Math.round(size.h * dpr));
  }
  draw(f: OverlayFrame): void {
    const ctx = this.ctx, c = this.canvas;
    if (!ctx || !c) return;
    const mode = f.dark >= 0.5 ? 'screen' : 'multiply';
    if (mode !== this.blend) { this.blend = mode; c.style.mixBlendMode = mode; }
    if (this.n++ % 45 === 0) this.family = cssVarFromCanvas(ctx, '--kc-font-text', 'sans-serif');   // sigue al sistema tipográfico
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.size.w, this.size.h);
    paintCells(ctx, this.size, f.geom, f.t, f.tilt, this.specs, overlayColors(f.colors, f.dark), this.family);
  }
  dispose(): void { this.canvas?.remove(); this.canvas = null; this.ctx = null; }
}

export const create = (init: DynamicInit): DynamicLayerInstance =>
  new Esfera(init, { layout, overlay: new Celulas(init.seed), n: N_POINTS });
