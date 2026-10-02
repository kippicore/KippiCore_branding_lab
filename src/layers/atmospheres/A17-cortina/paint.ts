import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { sliceTransform } from '../../shared/svg';
import { BG, BLUR, scene } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const { k, ox, oy } = sliceTransform(size.w, size.h);
  const s = scene(opts.seed);
  const ink = exprToHex('ink', theme);
  ctx.save();
  for (const q of s.stars) {
    ctx.globalAlpha = q.a;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(ox + q.x * k, oy + q.y * k, q.r * k, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = theme.derived.blendMode as GlobalCompositeOperation;
  withBlur(ctx, BLUR * k, () => {
    for (const q of s.rays) {
      const hex = exprToHex(q.color, theme);
      const y0 = oy + q.top * k, y1 = oy + q.bottom * k;
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, withAlpha(hex, 0));
      g.addColorStop(0.7, withAlpha(hex, 0.55));
      g.addColorStop(1, hex);
      ctx.globalAlpha = q.alpha;
      ctx.fillStyle = g;
      ctx.fillRect(ox + q.x * k, y0, q.w * k, y1 - y0);
    }
  });
  ctx.restore();
  ctx.save();
  ctx.fillStyle = exprToHex('bgDeep', theme);
  ctx.beginPath();
  s.trees.forEach((p, i) => { const x = ox + p[0] * k, y = oy + p[1] * k; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
