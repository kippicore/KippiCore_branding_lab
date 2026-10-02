import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { paintLights } from '../../shared/light';
import { BEAM, BG, items } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const k = 1 - (2 * BEAM.inset) / 100;
  const bw = size.w * k, bh = size.h * k, bx = (BEAM.inset / 100) * size.w, by = (BEAM.inset / 100) * size.h;
  const cx = bx + (BEAM.cx / 100) * bw, cy = by + (BEAM.cy / 100) * bh;
  const a = exprToHex('accent', theme), m = exprToHex({ mix: ['accent', 'primary', 0.5] }, theme);
  const g = ctx.createConicGradient(((BEAM.from - 90) * Math.PI) / 180, cx, cy);
  g.addColorStop(0, withAlpha(a, 0));
  g.addColorStop(10 / 360, withAlpha(a, 0.55));
  g.addColorStop(22 / 360, withAlpha(m, 0.35));
  g.addColorStop(38 / 360, withAlpha(m, 0));
  g.addColorStop(1, withAlpha(m, 0));
  withBlur(ctx, BEAM.blur, () => { ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh); });
  paintLights(ctx, theme, size, items(opts.seed));
};
