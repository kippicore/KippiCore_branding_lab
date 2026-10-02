import type { Size, StaticOpts, Theme } from '../../../contracts';
import { exprToHex } from '../../shared/color-expr';
import { fillBase, withBlur } from '../../shared/canvas';
import { paintLights } from '../../shared/light';
import { withAlpha } from '../../../theme/color';
import { BG, FOCUS_Y, HORIZON, items, rays, stars } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  const { w, h } = size;
  fillBase(ctx, theme, size, BG);
  paintLights(ctx, theme, size, items(opts.seed));
  const accent = exprToHex('accent', theme), mid = exprToHex({ mix: ['accent', 'primary', 0.4] }, theme);
  for (const ray of rays(opts.seed)) {
    const rw = (ray.width / 100) * w, rh = 1.5 * h;
    ctx.save();
    ctx.translate(w / 2, (FOCUS_Y / 100) * h);
    ctx.rotate((ray.angle * Math.PI) / 180);
    ctx.globalAlpha = ray.alpha;
    ctx.globalCompositeOperation = theme.derived.blendMode as GlobalCompositeOperation;
    const g = ctx.createLinearGradient(0, 0, 0, -rh);
    g.addColorStop(0, withAlpha(accent, 0.9));
    g.addColorStop(0.45, withAlpha(mid, 0.55));
    g.addColorStop(0.85, withAlpha(mid, 0));
    withBlur(ctx, 8, () => { ctx.fillStyle = g; ctx.fillRect(-rw / 2, -rh, rw, rh); });
    ctx.restore();
  }
  const ink = exprToHex('ink', theme);
  for (const s of stars(opts.seed)) {
    ctx.save();
    ctx.globalAlpha = s.a;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse((s.x / 100) * w, (s.y / 100) * h, s.r * 0.3 * w / 100, s.r * 0.5 * h / 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const bg = exprToHex(BG, theme);
  const y0 = (HORIZON / 100) * h;
  const g = ctx.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, withAlpha(bg, 0));
  g.addColorStop(0.35, withAlpha(bg, 0.92));
  g.addColorStop(1, bg);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, h - y0);
  ctx.restore();
};
