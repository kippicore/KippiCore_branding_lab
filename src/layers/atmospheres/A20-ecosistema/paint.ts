import type { Size, StaticOpts, Theme } from '../../../contracts';
import { cssVarFromCanvas } from '../../shared/canvas';
import { paintSphere } from '../A19-esfera/paint';
import { sphereColors } from '../A19-esfera/sphere';
import { cells, layout, STATIC_T } from './cells';
import { overlayColors, paintCells } from './overlay';

export const paint = async (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, opts: StaticOpts & { tMs?: number }): Promise<void> => {
  const geom = layout(size);
  paintSphere(ctx, theme, size, opts, geom);
  ctx.save();
  ctx.globalCompositeOperation = theme.derived.blendMode as GlobalCompositeOperation;
  paintCells(ctx, size, geom, STATIC_T, [0, 0], cells(opts.seed), overlayColors(sphereColors(theme), theme.mode === 'dark' ? 1 : 0), cssVarFromCanvas(ctx, '--kc-font-text', 'sans-serif'));
  ctx.restore();
};
