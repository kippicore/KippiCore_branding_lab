import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { dataScene, sliceTransform } from '../../shared/svg';
import { BG } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const { k, ox, oy } = sliceTransform(size.w, size.h);
  const s = dataScene(opts.seed);
  const P = exprToHex('primary', theme), A = exprToHex('accent', theme);
  ctx.save();
  ctx.globalAlpha = 0.85;
  for (const b of s.bars) { ctx.fillStyle = b.accent ? A : P; ctx.fillRect(ox + b.x * k, oy + b.y * k, b.w * k, b.h * k); }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  s.line.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * k, oy + y * k) : ctx.moveTo(ox + x * k, oy + y * k)));
  ctx.lineWidth = 4 * k; ctx.lineJoin = 'round'; ctx.strokeStyle = A; ctx.stroke();
  ctx.beginPath(); ctx.arc(ox + s.dot[0] * k, oy + s.dot[1] * k, 7 * k, 0, Math.PI * 2); ctx.fillStyle = A; ctx.fill();
  ctx.restore();
};
