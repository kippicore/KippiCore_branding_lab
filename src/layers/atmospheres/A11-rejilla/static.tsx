import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCssAlpha } from '../../shared/color-expr';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A11' as const;
export const BG: ColorExpr = 'bg';
export const GRID = { cell: 44, alpha: 0.14, spotX: 65, spotY: 40, maskStop: 60 } as const;
export const items = (_seed: number): Light[] => [
  { x: 65, y: 40, d: 70, color: 'accent', alpha: 0.55 },
  { x: 95, y: 95, d: 50, color: 'primary', alpha: 0.5 },
];
const line = (): string => exprToCssAlpha('ink', GRID.alpha);
const gridBg = (): string =>
  `linear-gradient(${line()} 1px, transparent 1px), linear-gradient(90deg, ${line()} 1px, transparent 1px)`;
const mask = (): string => `radial-gradient(circle at var(--kc-spot-x, ${GRID.spotX}%) var(--kc-spot-y, ${GRID.spotY}%), black 0, transparent ${GRID.maskStop}%)`;
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG} style={{ ['--kc-spot-x' as string]: `${GRID.spotX}%`, ['--kc-spot-y' as string]: `${GRID.spotY}%` }}>
    <div data-kc-grid style={{ position: 'absolute', inset: 0, backgroundImage: gridBg(), backgroundSize: `${GRID.cell}px ${GRID.cell}px`,
      maskImage: mask(), WebkitMaskImage: mask() }} />
    <Lights items={items(opts.seed)} />
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n.kc-atm--A11 {\n  --kc-spot-x: ${GRID.spotX}%;\n  --kc-spot-y: ${GRID.spotY}%;\n}\n` +
  `.kc-grid {\n  position: absolute;\n  inset: 0;\n  background-image: ${gridBg()};\n  background-size: ${GRID.cell}px ${GRID.cell}px;\n  mask-image: ${mask()};\n}\n` + lightsToCss(items(1));
