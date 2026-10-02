import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { Root, rootCss } from '../../shared/root';
import { dataSvg } from '../../shared/svg';

export const ID = 'A14' as const;
export const BG: ColorExpr = 'bg';
export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}><div data-kc-data style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: dataSvg(opts.seed, 'vars') }} /></Root>
);
export const css = (): string => rootCss(ID, BG) + '\n/* SVG 400x300 (slice): 16 barras primary (cada cuarta accent), polilinea accent 4px, circulo accent */';
