import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A02' as const;
export const BG: ColorExpr = { mix: ['primary', 'accent', 0.5] };
export const items = (_seed: number): Light[] => [
  { x: 0, y: 0, d: 130, color: 'primary', alpha: 1 },
  { x: 100, y: 0, d: 120, color: 'accent', alpha: 1 },
  { x: 0, y: 100, d: 120, color: { mix: ['primary', 'bg', 0.5] }, alpha: 1 },
  { x: 100, y: 100, d: 130, color: { mix: ['accent', 'primary', 0.4] }, alpha: 1 },
];
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><Lights items={items(opts.seed)} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1));
