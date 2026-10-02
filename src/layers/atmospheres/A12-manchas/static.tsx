import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCss, type ColorExpr } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A12' as const;
export const BG: ColorExpr = 'bg';
export const BLUR = 6;
/** left/top en % del contenedor (esquina superior izquierda), d = diámetro en % del ancho. */
export const BLOBS: ReadonlyArray<{ d: number; x: number; y: number; color: ColorExpr }> = [
  { d: 52, x: 46, y: -22, color: 'primary' },
  { d: 40, x: 68, y: 42, color: 'accent' },
  { d: 34, x: 2, y: 46, color: { mix: ['primary', 'accent', 0.5] } },
  { d: 22, x: 30, y: 4, color: { mix: ['accent', 'bg', 0.7] } },
];
export const renderStatic = (_theme: Theme, _opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    {BLOBS.map((b, i) => (
      <div key={i} data-kc-blob style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: `${b.d}%`, aspectRatio: '1',
        borderRadius: '50%', background: exprToCss(b.color), filter: `blur(${BLUR}px)` }} />
    ))}
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + '\n' + BLOBS.map((b, i) =>
    `.kc-blob-${i + 1} {\n  position: absolute;\n  left: ${b.x}%;\n  top: ${b.y}%;\n  width: ${b.d}%;\n  aspect-ratio: 1;\n  border-radius: 50%;\n  background: ${exprToCss(b.color)};\n  filter: blur(${BLUR}px);\n}`).join('\n');
