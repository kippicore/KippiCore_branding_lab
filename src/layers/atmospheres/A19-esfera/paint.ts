import type { Size, StaticOpts, Theme } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { exprToHex } from '../../shared/color-expr';
import { fillBase, withBlur } from '../../shared/canvas';
import { BG, dots, layerColor, rimExpr } from './static';
import { layout, LIGHT } from './sphere';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  const { cx, cy, R } = layout(size);
  const blend = theme.derived.blendMode as GlobalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  const radial = (key: 'glowMix' | 'glow2', r: number, stops: [number, number][]): void => {
    const hex = exprToHex(key, theme);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * R);
    for (const [at, a] of stops) g.addColorStop(at, withAlpha(hex, a));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r * R, cy - r * R, 2 * r * R, 2 * r * R);
  };
  radial('glowMix', 2.1, [[0, 0.22], [0.26, 0.22], [1, 0]]);
  radial('glow2', 1, [[0, 0.12], [1, 0]]);
  const rimHex = exprToHex(rimExpr(theme.mode), theme);
  const ring = (rad: number, width: number, alpha: number, blur: number): void => {
    const g = ctx.createLinearGradient(cx - LIGHT[0] * R, cy + LIGHT[1] * R, cx + LIGHT[0] * R, cy - LIGHT[1] * R);
    g.addColorStop(0.2, withAlpha(rimHex, 0.12)); g.addColorStop(1, rimHex);
    ctx.globalAlpha = alpha;
    withBlur(ctx, blur * R, () => { ctx.strokeStyle = g; ctx.lineWidth = width * R; ctx.beginPath(); ctx.arc(cx, cy, rad * R, 0, Math.PI * 2); ctx.stroke(); });
  };
  ring(1.05, 0.3, 0.16, 0.16);
  ring(1.03, 0.07, 0.3, 0.035);
  for (const b of dots(opts.seed)) {
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = exprToHex(layerColor(b.layer, theme.mode), theme);
    const r = Math.max(0.5, b.r * R);
    ctx.beginPath();
    for (const [x, y] of b.pts) { const px = cx + x * R, py = cy + y * R; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); }
    ctx.fill();
  }
  ctx.restore();
};
