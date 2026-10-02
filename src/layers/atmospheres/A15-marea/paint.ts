import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase, withBlur } from '../../shared/canvas';
import { exprToHex } from '../../shared/color-expr';
import { paintLights } from '../../shared/light';
import { sliceTransform } from '../../shared/svg';
import { BG, SEA_COLOR, SPRAY_COLOR, lights, scene } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const s = scene(opts.seed);
  const { k, ox, oy } = sliceTransform(size.w, size.h);
  const X = (x: number) => ox + x * k, Y = (y: number) => oy + y * k;
  ctx.save();
  ctx.beginPath();
  s.sea.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
  ctx.closePath();
  ctx.fillStyle = exprToHex(SEA_COLOR, theme);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = theme.derived.blendMode as GlobalCompositeOperation;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const st of s.strokes) {
    ctx.globalAlpha = st.alpha;
    withBlur(ctx, st.blur * k, () => {
      ctx.beginPath();
      st.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
      ctx.lineWidth = st.width * k;
      ctx.strokeStyle = exprToHex(st.color, theme);
      ctx.stroke();
    });
  }
  ctx.fillStyle = exprToHex(SPRAY_COLOR, theme);
  for (const d of s.dots) {
    ctx.globalAlpha = d.alpha;
    ctx.beginPath();
    ctx.arc(X(d.x), Y(d.y), Math.max(0.5, d.r * k), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  paintLights(ctx, theme, size, lights());
};
