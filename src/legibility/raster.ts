import type { LegibilityInput } from '../contracts';

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** Función que devuelve el fondo del escenario (dpr 1) como ImageData. Inyectable en pruebas. */
export type RasterFn = (input: LegibilityInput) => Promise<ImageData>;

/** Crea un canvas fuera del DOM (OffscreenCanvas si existe). */
export const createCanvas = (w: number, h: number): { canvas: HTMLCanvasElement | OffscreenCanvas; ctx: Ctx2D } | null => {
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) return { canvas, ctx };
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) return { canvas, ctx };
  }
  return null;
};

/** Pinta el fondo del escenario: el cuadro dinámico si existe; si no, la atmósfera estática. */
export const rasterizeStage: RasterFn = async (input) => {
  const { stage, theme, atmosphere, seed, frame } = input;
  const c = createCanvas(stage.w, stage.h);
  if (!c) throw new Error('Sin canvas 2D disponible para medir la legibilidad');
  const ctx = c.ctx;
  ctx.fillStyle = theme.roles.bg;
  ctx.fillRect(0, 0, stage.w, stage.h);
  if (frame) ctx.drawImage(frame, 0, 0, stage.w, stage.h);
  else await atmosphere.paint(ctx as CanvasRenderingContext2D, theme, stage, { seed });
  return ctx.getImageData(0, 0, Math.round(stage.w), Math.round(stage.h));
};
