import { blurImageData } from '../../lib/imageops';
import type { Size, Theme } from '../../contracts';
import { exprToHex, type ColorExpr } from './color-expr';

/** Rellena el escenario con un color del theme (base de cada atmósfera). */
export const fillBase = (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, e: ColorExpr = 'bg'): void => {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = exprToHex(e, theme);
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.restore();
};

/** Ejecuta `draw` con desenfoque `px` (ctx.filter; si no existe, offscreen + blurImageData). El alfa y el
 *  modo de composición los fija quien llama; `draw` solo rellena. */
export const withBlur = (ctx: CanvasRenderingContext2D, px: number, draw: () => void): void => {
  if (px <= 0) { draw(); return; }
  if (typeof ctx.filter === 'string') {
    ctx.save();
    ctx.filter = `blur(${px}px)`;
    draw();
    ctx.restore();
    return;
  }
  const c = ctx.canvas as unknown;
  if (typeof HTMLCanvasElement === 'undefined' || !(c instanceof HTMLCanvasElement)) { draw(); return; }
  const off = document.createElement('canvas');
  off.width = c.width; off.height = c.height;
  const octx = off.getContext('2d');
  if (!octx) { draw(); return; }
  const m = ctx.getTransform();
  const scale = Math.hypot(m.a, m.b) || 1;
  // `draw` pinta sobre ctx: redirigimos temporalmente copiando resultado desde un lienzo limpio.
  const snap = ctx.getImageData(0, 0, c.width, c.height);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.restore();
  draw();
  const drawn = ctx.getImageData(0, 0, c.width, c.height);
  octx.putImageData(blurImageData(drawn, px * scale), 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.putImageData(snap, 0, 0);
  ctx.drawImage(off, 0, 0); ctx.restore();
};

export const cssVarFromCanvas = (ctx: CanvasRenderingContext2D, name: string, fallback: string): string => {
  const c = ctx.canvas as unknown;
  if (typeof HTMLElement !== 'undefined' && c instanceof HTMLElement && c.isConnected) {
    const v = getComputedStyle(c).getPropertyValue(name).trim();
    if (v) return v;
  }
  return fallback;
};

export const fontsReady = async (): Promise<void> => {
  if (typeof document !== 'undefined' && document.fonts?.ready) { try { await document.fonts.ready; } catch { /* sin fuentes */ } }
};
