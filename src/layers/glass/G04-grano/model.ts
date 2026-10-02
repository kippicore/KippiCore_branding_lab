import { hashSeed, mulberry32 } from '../../../lib/prng';
import { black, model, white } from '../model-base';
export const g04 = model({
  saturate: 1.2, brightness: 1,
  paintOverlays(ctx, _t, r) {
    // grano determinista: motas de 1 px en modo «overlay», opacidad conjunta ≈ .55
    const rnd = mulberry32(hashSeed('G04', Math.round(r.w), Math.round(r.h)));
    const n = Math.min(40000, Math.round((r.w * r.h) / 3));
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < n; i++) {
      const v = rnd();
      ctx.fillStyle = v < 0.5 ? white(0.55 * (1 - v * 2) * 0.9) : black(0.55 * (v * 2 - 1) * 0.9);
      ctx.fillRect(r.x + rnd() * r.w, r.y + rnd() * r.h, 1, 1);
    }
    ctx.restore();
  },
});
