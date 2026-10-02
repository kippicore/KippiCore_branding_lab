import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCssAlpha } from '../../shared/color-expr';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A06' as const;
export const BG: ColorExpr = 'bg';
export const BEAM = { from: 145, cx: 12, cy: -6, inset: -20, blur: 28 } as const;
export const items = (_seed: number): Light[] => [
  { x: 55, y: 105, d: 90, color: 'primary', alpha: 0.55 },
  { x: 20, y: 8, d: 40, color: 'accent', alpha: 0.5 },
];
const beamBg = (): string =>
  `conic-gradient(from ${BEAM.from}deg at ${BEAM.cx}% ${BEAM.cy}%, transparent 0deg, ${exprToCssAlpha('accent', 0.55)} 10deg, ` +
  `${exprToCssAlpha({ mix: ['accent', 'primary', 0.5] }, 0.35)} 22deg, transparent 38deg)`;
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <div data-kc-beam style={{ position: 'absolute', inset: `${BEAM.inset}%`, background: beamBg(), filter: `blur(${BEAM.blur}px)` }} />
    <Lights items={items(opts.seed)} />
  </Root>
);
export const css = (): string => rootCss(ID, BG) + `\n.kc-beam {\n  position: absolute;\n  inset: ${BEAM.inset}%;\n  background: ${beamBg()};\n  filter: blur(${BEAM.blur}px);\n}\n` + lightsToCss(items(1));
