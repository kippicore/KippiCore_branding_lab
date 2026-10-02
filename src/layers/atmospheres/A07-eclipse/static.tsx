import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCss, exprToCssAlpha } from '../../shared/color-expr';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A07' as const;
export const BG: ColorExpr = 'bg';
export const RING = { x: 68, y: 50, size: 58, blur: 14, disc: 30 } as const;
export const items = (_seed: number): Light[] => [{ x: 100, y: 100, d: 50, color: 'primary', alpha: 0.45 }];
const ringBg = (): string =>
  `radial-gradient(circle, transparent 0 36%, ${exprToCss('accent')} 40%, ${exprToCssAlpha({ mix: ['accent', 'primary', 0.5] }, 0.7)} 47%, transparent 66%)`;
const pos = (s: number) => ({ position: 'absolute' as const, left: `${RING.x}%`, top: `${RING.y}%`, width: `${s}%`, aspectRatio: '1', transform: 'translate(-50%, -50%)' });
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <Lights items={items(opts.seed)} />
    <div data-kc-ring style={{ ...pos(RING.size), background: ringBg(), filter: `blur(${RING.blur}px)` }} />
    <div data-kc-disc style={{ ...pos(RING.disc), borderRadius: '50%', background: exprToCss(BG), boxShadow: `0 0 0 1px ${exprToCssAlpha('accent', 0.4)}` }} />
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n.kc-ring {\n  position: absolute;\n  left: ${RING.x}%;\n  top: ${RING.y}%;\n  width: ${RING.size}%;\n  aspect-ratio: 1;\n  transform: translate(-50%, -50%);\n  background: ${ringBg()};\n  filter: blur(${RING.blur}px);\n}\n` +
  `.kc-disc {\n  position: absolute;\n  left: ${RING.x}%;\n  top: ${RING.y}%;\n  width: ${RING.disc}%;\n  aspect-ratio: 1;\n  border-radius: 50%;\n  transform: translate(-50%, -50%);\n  background: ${exprToCss(BG)};\n  box-shadow: 0 0 0 1px ${exprToCssAlpha('accent', 0.4)};\n}\n` + lightsToCss(items(1));
