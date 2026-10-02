import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A05' as const;
export const BG: ColorExpr = 'bgDeep';
export const items = (seed: number): Light[] => {
  const r = mulberry32(hashSeed(ID, seed));
  const out: Light[] = [{ x: 40, y: 70, d: 90, color: { mix: ['accent', 'bg', 0.25] }, alpha: 0.7 }];
  for (let i = 0; i < 34; i++) {
    out.push({
      x: r() * 100, y: r() * 100, d: (1.2 + r() * 2.4) * 2.2, alpha: 1,
      color: i % 4 === 0 ? 'primary' : 'accent',
      profile: [[1, 0], [1, 8], [0.45, 8], [0, 14]],
    });
  }
  return out;
};
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><Lights items={items(opts.seed)} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n' + lightsToCss(items(1));
