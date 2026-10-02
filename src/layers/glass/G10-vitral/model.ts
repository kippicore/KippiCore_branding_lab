import { withAlpha } from '../../../theme/color';
import { cssLinear, model } from '../model-base';
export const g10 = model({
  saturate: 1.9, brightness: 1,
  paintOverlays(ctx, theme, r) {
    const { primary, accent, ink } = theme.roles;
    const { g, len } = cssLinear(ctx, r, 115);
    const f = (p: number): number => Math.min(1, Math.max(0, p));
    const hard = (pos: number, c: string): void => { g.addColorStop(f(pos), c); };
    // paños
    const p1 = withAlpha(primary, 0.26), a1 = withAlpha(accent, 0.26), p2 = withAlpha(primary, 0.14), a2 = withAlpha(accent, 0.18);
    hard(0, p1); hard(0.32, p1); hard(0.32, a1); hard(0.58, a1); hard(0.58, p2); hard(0.76, p2); hard(0.76, a2); hard(1, a2);
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
    // plomo: tres líneas de 3 px sobre los cortes (32 %, 58 %, 76 %) + borde interior de 3 px
    const lead = withAlpha(ink, 0.55);
    const { g: lg } = cssLinear(ctx, r, 115);
    const w = 1.5 / len;
    lg.addColorStop(0, withAlpha(ink, 0));
    for (const c of [0.32, 0.58, 0.76]) {
      lg.addColorStop(f(c - w), withAlpha(ink, 0)); lg.addColorStop(f(c - w), lead);
      lg.addColorStop(f(c + w), lead); lg.addColorStop(f(c + w), withAlpha(ink, 0));
    }
    lg.addColorStop(1, withAlpha(ink, 0));
    ctx.fillStyle = lg; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = lead; ctx.lineWidth = 3;
    ctx.strokeRect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3);
  },
});
