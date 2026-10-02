import type { Size, StaticOpts, Theme } from '../../../contracts';
import { cssVarFromCanvas, fillBase, fontsReady } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { BG, LINES, TYPE } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, _opts: StaticOpts & { tMs?: number }): Promise<void> => {
  await fontsReady();
  fillBase(ctx, theme, size, BG);
  const fs = (TYPE.size / 100) * size.w;
  const lh = fs * TYPE.lineHeight;
  const family = cssVarFromCanvas(ctx, '--kc-font-display', 'sans-serif');
  ctx.save();
  ctx.font = `${TYPE.weight} ${fs}px ${family}`;
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${TYPE.tracking * fs}px`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const top = size.h / 2 - (lh * LINES.length) / 2;
  LINES.forEach((l, i) => {
    ctx.fillStyle = exprToHex(l.color, theme);
    ctx.fillText(l.text, (TYPE.padLeft / 100) * size.w, top + lh * (i + 0.5));
  });
  ctx.restore();
};
