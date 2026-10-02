import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { paintLights } from '../../shared/light';
import { BG, RING, items } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  paintLights(ctx, theme, size, items(opts.seed));
  const cx = (RING.x / 100) * size.w, cy = (RING.y / 100) * size.h;
  const D = (RING.size / 100) * size.w, R = D * Math.SQRT1_2;
  const a = exprToHex('accent', theme), m = exprToHex({ mix: ['accent', 'primary', 0.5] }, theme);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  g.addColorStop(0, withAlpha(a, 0));
  g.addColorStop(0.36, withAlpha(a, 0));
  g.addColorStop(0.4, a);
  g.addColorStop(0.47, withAlpha(m, 0.7));
  g.addColorStop(0.66, withAlpha(m, 0));
  g.addColorStop(1, withAlpha(m, 0));
  withBlur(ctx, RING.blur, () => { ctx.fillStyle = g; ctx.fillRect(cx - D, cy - D, 2 * D, 2 * D); });
  const rd = ((RING.disc / 100) * size.w) / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI * 2);
  ctx.fillStyle = exprToHex(BG, theme); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, rd + 0.5, 0, Math.PI * 2);
  ctx.lineWidth = 1; ctx.strokeStyle = withAlpha(a, 0.4); ctx.stroke();
  ctx.restore();
};
