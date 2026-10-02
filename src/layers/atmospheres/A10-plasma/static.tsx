import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A10' as const;
export const BG: ColorExpr = 'bg';
export const items = (_seed: number): Light[] => [
  { x: 38, y: 46, d: 80, color: 'primary', alpha: 1, blend: 'theme' },
  { x: 66, y: 56, d: 78, color: 'accent', alpha: 1, blend: 'theme' },
  { x: 85, y: 10, d: 40, color: { mix: ['accent', 'primary', 0.5] }, alpha: 0.6 },
];
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><Lights items={items(opts.seed)} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1));
