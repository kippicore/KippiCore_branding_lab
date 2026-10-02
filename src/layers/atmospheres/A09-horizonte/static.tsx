import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCss, exprToCssAlpha, type ColorExpr } from '../../shared/color-expr';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A09' as const;
export const BG: ColorExpr = 'bg';
export const SKY: ReadonlyArray<readonly [ColorExpr, number]> = [['bg', 0], [{ mix: ['primary', 'bg', 0.35] }, 62], [{ mix: ['accent', 'primary', 0.5] }, 100]];
export const HORIZON_Y = 80;
export const items = (_seed: number): Light[] => [
  { x: 72, y: 80, d: 46, color: 'accent', alpha: 1 },
  { x: 72, y: 80, d: 16, color: { mix: ['accent', 'white', 0.6] }, alpha: 0.9 },
];
const skyBg = (): string => `linear-gradient(180deg, ${SKY.map(([c, at]) => `${exprToCss(c)} ${at}%`).join(', ')})`;
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <div data-kc-sky style={{ position: 'absolute', inset: 0, background: skyBg() }} />
    <Lights items={items(opts.seed)} />
    <div data-kc-horizon style={{ position: 'absolute', left: 0, right: 0, top: `${HORIZON_Y}%`, height: 1, background: exprToCssAlpha('accent', 0.6) }} />
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n.kc-sky {\n  position: absolute;\n  inset: 0;\n  background: ${skyBg()};\n}\n` + lightsToCss(items(1)) +
  `\n.kc-horizon {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: ${HORIZON_Y}%;\n  height: 1px;\n  background: ${exprToCssAlpha('accent', 0.6)};\n}`;
