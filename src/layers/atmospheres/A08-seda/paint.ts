import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { SILK, SILK_BLUR, sliceTransform } from '../../shared/svg';
import { BG } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, _opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const { k, ox, oy } = sliceTransform(size.w, size.h);
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.lineCap = 'round';
  withBlur(ctx, SILK_BLUR * k, () => {
    for (const s of SILK) {
      const p = s.pts.map((v, i) => (i % 2 ? oy + v * k : ox + v * k)) as [number, number, number, number, number, number, number, number];
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      ctx.lineWidth = s.width * k;
      ctx.strokeStyle = exprToHex(s.color, theme);
      ctx.stroke();
    }
  });
  ctx.restore();
};
