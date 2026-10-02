import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A01' as const;
export const BG: ColorExpr = 'bg';
export const items = (_seed: number): Light[] => [
  { x: 78, y: 28, d: 78, color: 'accent', alpha: 0.9 },
  { x: 58, y: 78, d: 62, color: { mix: ['accent', 'primary', 0.45] }, alpha: 0.55 },
  { x: 98, y: 96, d: 60, color: 'primary', alpha: 0.95 },
  { x: 30, y: 40, d: 50, color: { mix: ['bg', 'accent', 0.85] }, alpha: 0.6 },
];
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><Lights items={items(opts.seed)} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1));
