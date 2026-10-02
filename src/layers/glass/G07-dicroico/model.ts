import { withAlpha } from '../../../theme/color';
import { cssLinear, model } from '../model-base';
export const g07 = model({
  saturate: 1.5, brightness: 1,
  paintOverlays(ctx, theme, r) {
    const { primary, accent } = theme.derived.scales;
    const mixc = theme.derived.glowMix;
    const { g } = cssLinear(ctx, r, 120);
    g.addColorStop(0, withAlpha(primary[300], 0.14));
    g.addColorStop(0.5, withAlpha(mixc, 0.14));
    g.addColorStop(1, withAlpha(accent[300], 0.14));
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
    // filo iridiscente de 1.6 px (cónico desde 210°; en canvas 0° = 3 en punto)
    const cg = ctx.createConicGradient(((210 - 90) * Math.PI) / 180, r.x + r.w / 2, r.y + r.h / 2);
    const cols = [primary[300], accent[300], mixc, primary[500], accent[500], primary[300]];
    cols.forEach((c, i) => cg.addColorStop(i / (cols.length - 1), c));
    ctx.fillStyle = cg;
    const e = 1.6;
    ctx.fillRect(r.x, r.y, r.w, e); ctx.fillRect(r.x, r.y + r.h - e, r.w, e);
    ctx.fillRect(r.x, r.y, e, r.h); ctx.fillRect(r.x + r.w - e, r.y, e, r.h);
  },
});
