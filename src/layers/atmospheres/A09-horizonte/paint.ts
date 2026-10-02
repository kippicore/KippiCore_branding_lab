import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { fillBase } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { paintLights } from '../../shared/light';
import { BG, HORIZON_Y, SKY, items } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const g = ctx.createLinearGradient(0, 0, 0, size.h);
  for (const [c, at] of SKY) g.addColorStop(at / 100, exprToHex(c, theme));
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, size.w, size.h); ctx.restore();
  paintLights(ctx, theme, size, items(opts.seed));
  ctx.save();
  ctx.fillStyle = withAlpha(exprToHex('accent', theme), 0.6);
  ctx.fillRect(0, (HORIZON_Y / 100) * size.h, size.w, 1);
  ctx.restore();
};
