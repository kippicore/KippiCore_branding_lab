import type { Size, StaticOpts, Theme } from '../../../contracts';
import { exprToHex } from '../../shared/color-expr';
import { BASE_PARTICLES, createField } from './field';
import { buildSprites, drawScene } from './render';
import { BG } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  const f = createField(opts.seed);
  const sp = buildSprites([theme.derived.glow2, theme.derived.glow, theme.derived.glowMix]);
  ctx.save();
  drawScene(ctx, f, sp, { w: size.w, h: size.h, tSec: 0, count: BASE_PARTICLES, dark: theme.mode === 'dark', bg: exprToHex(BG, theme),
    blend: theme.derived.blendMode as GlobalCompositeOperation });
  ctx.restore();
};
