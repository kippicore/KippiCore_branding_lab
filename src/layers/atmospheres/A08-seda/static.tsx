import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { Root, rootCss } from '../../shared/root';
import { SILK, SILK_BLUR, silkSvg } from '../../shared/svg';

export const ID = 'A08' as const;
export const BG: ColorExpr = 'bg';
export const renderStatic = (_theme: Theme, _opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><div data-kc-silk style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: silkSvg('vars') }} /></Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n/* SVG 400x300 (slice), feGaussianBlur ${SILK_BLUR} */\n` + SILK.map((s) => `/* ${s.d} · stroke-width ${s.width} */`).join('\n');
