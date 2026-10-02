import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { fillBase } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { paintLights } from '../../shared/light';
import { BG, GRID, items } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  // La máscara radial equivale a un degradado de alfa (ink·14 % → 0) sobre las líneas: sin destination-in.
  const cx = (GRID.spotX / 100) * size.w, cy = (GRID.spotY / 100) * size.h;
  const far = Math.max(Math.hypot(cx, cy), Math.hypot(size.w - cx, cy), Math.hypot(cx, size.h - cy), Math.hypot(size.w - cx, size.h - cy));
  const ink = exprToHex('ink', theme);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, far * (GRID.maskStop / 100));
  g.addColorStop(0, withAlpha(ink, GRID.alpha));
  g.addColorStop(1, withAlpha(ink, 0));
  ctx.save();
  ctx.fillStyle = g;
  for (let x = 0; x < size.w; x += GRID.cell) ctx.fillRect(x, 0, 1, size.h);
  for (let y = 0; y < size.h; y += GRID.cell) ctx.fillRect(0, y, size.w, 1);
  ctx.restore();
  paintLights(ctx, theme, size, items(opts.seed));
};
