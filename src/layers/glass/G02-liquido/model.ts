import { ellipseFill, insetEdge, insetGlow, model, white, cssLinear } from '../model-base';
export const g02 = model({
  saturate: 1.9, brightness: 1.05,
  paintOverlays(ctx, _t, r) {
    // degradado de luz (encima del velo): blanco .26 → transparente al 45 %
    const { g } = cssLinear(ctx, r, 180);
    g.addColorStop(0, white(0.26)); g.addColorStop(0.45, white(0));
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
    // brillo especular: elipse centrada en (22.5 %, -5 %) con radios 37.5 % × 65 %
    ellipseFill(ctx, r, r.x + r.w * 0.225, r.y - r.h * 0.05, r.w * 0.375, r.h * 0.65,
      [[0, white(0.32)], [1, white(0)]]);
    insetGlow(ctx, r, 26, 0.14);
    insetEdge(ctx, r, white(0.55));
  },
});
