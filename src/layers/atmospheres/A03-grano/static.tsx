import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { GRAIN_ALPHA, grainCss, grainDataUrl } from '../../shared/grain';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A03' as const;
export const BG: ColorExpr = 'bg';
export const items = (_seed: number): Light[] => [
  { x: 15, y: 20, d: 110, color: 'primary', alpha: 1 },
  { x: 85, y: 25, d: 100, color: 'accent', alpha: 0.95 },
  { x: 60, y: 95, d: 110, color: { mix: ['accent', 'primary', 0.5] }, alpha: 0.9 },
];
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <Lights items={items(opts.seed)} />
    <div data-kc-grain style={{ position: 'absolute', inset: 0, backgroundImage: `url("${grainDataUrl()}")`, backgroundSize: '100% 100%',
      mixBlendMode: 'overlay', opacity: GRAIN_ALPHA }} />
  </Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1)) + '\n' + grainCss();
