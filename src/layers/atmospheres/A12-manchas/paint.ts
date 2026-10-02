import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { BG, BLOBS, BLUR } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, _opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  withBlur(ctx, BLUR, () => {
    for (const b of BLOBS) {
      const r = ((b.d / 100) * size.w) / 2;
      ctx.beginPath();
      ctx.arc((b.x / 100) * size.w + r, (b.y / 100) * size.h + r, r, 0, Math.PI * 2);
      ctx.fillStyle = exprToHex(b.color, theme);
      ctx.fill();
    }
  });
};
