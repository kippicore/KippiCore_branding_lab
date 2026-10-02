import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import type { ColorExpr } from '../../shared/color-expr';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A04' as const;
export const BG: ColorExpr = 'bg';
const COLORS: ColorExpr[] = ['accent', 'primary', { mix: ['accent', 'primary', 0.5] }];
export const items = (seed: number): Light[] => {
  const r = mulberry32(hashSeed(ID, seed));
  const out: Light[] = [{ x: 70, y: 60, d: 90, color: { mix: ['accent', 'bg', 0.35] }, alpha: 0.6 }];
  for (let i = 0; i < 16; i++) {
    out.push({
      x: r() * 100, y: r() * 100, d: (6 + r() * 16) * 1.4, alpha: 0.25 + r() * 0.5, color: COLORS[i % 3] as ColorExpr,
      profile: [[1, 0], [1, 52], [0, 70]],
    });
  }
  return out;
};
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><Lights items={items(opts.seed)} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1));
