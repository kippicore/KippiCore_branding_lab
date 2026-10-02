import type { Size, StaticOpts, Theme } from '../../../contracts';
import { fillBase } from '../../shared/canvas';
import { paintLights } from '../../shared/light';
import { BG, items } from './static';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  fillBase(ctx, theme, size, BG);
  paintLights(ctx, theme, size, items(opts.seed));
};
