import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase } from '../../shared/canvas';
import { GRAIN_ALPHA, grainDataUrl } from '../../shared/grain';
import { paintLights } from '../../shared/light';
import { BG, items } from './static';

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((res) => {
    if (typeof Image === 'undefined') return res(null);
    const im = new Image();
    const t = setTimeout(() => res(null), 1500);
    im.onload = () => { clearTimeout(t); res(im); };
    im.onerror = () => { clearTimeout(t); res(null); };
    im.src = src;
  });

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  paintLights(ctx, theme, size, items(opts.seed));
  // En entornos sin render real (tests con contexto grabador) no se espera a la imagen.
  const real = typeof HTMLCanvasElement !== 'undefined' && (ctx.canvas as unknown) instanceof HTMLCanvasElement;
  const img = real ? await loadImage(grainDataUrl()) : null;
  if (!img) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = GRAIN_ALPHA;
  ctx.drawImage(img, 0, 0, size.w, size.h);
  ctx.restore();
};
