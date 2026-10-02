import { black, model, white } from '../model-base';
export const g03 = model({
  saturate: 1.3, brightness: 1,
  paintOverlays(ctx, _t, r) {
    // estrías verticales: período de 12 px
    for (let x = 0; x < r.w; x += 12) {
      const g = ctx.createLinearGradient(r.x + x, 0, r.x + x + 12, 0);
      g.addColorStop(0, white(0.32)); g.addColorStop(5 / 12, white(0.03));
      g.addColorStop(11 / 12, black(0.09)); g.addColorStop(1, white(0.32));
      ctx.fillStyle = g;
      ctx.fillRect(r.x + x, r.y, Math.min(12, r.w - x), r.h);
    }
  },
});
