import { ellipseFill, insetEdge, insetGlow, model, white } from '../model-base';
export const g06 = model({
  saturate: 1, brightness: 1.12,
  paintOverlays(ctx, _t, r) {
    // elipse al 50 % / 45 %, radios de «farthest-corner»; transparente al 35 %, blanco .55 al 120 %
    const cx = r.x + r.w * 0.5, cy = r.y + r.h * 0.45;
    const rx = r.w * 0.5 * Math.SQRT2 * 1.2;
    const ry = Math.max(r.h * 0.45, r.h * 0.55) * Math.SQRT2 * 1.2;
    ellipseFill(ctx, r, cx, cy, rx, ry, [[0, white(0)], [0.35 / 1.2, white(0)], [1, white(0.55)]]);
    insetGlow(ctx, r, 34, 0.55);
    insetEdge(ctx, r, white(0.75));
  },
});
