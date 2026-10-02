import type { CSSProperties, ReactNode } from 'react';
import { exprToCss, type ColorExpr } from './color-expr';

export const DEFAULT_SEED = 1;
/** Nodo raíz de toda atmósfera. Sin filter/opacity/mask/backdrop/blend/will-change (R1): eso va en hijos. */
export function Root({ id, bg = 'bg', style, children }: { id: string; bg?: ColorExpr; style?: CSSProperties; children?: ReactNode }): ReactNode {
  return (
    <div data-kc-atmosphere={id} className={`kc-atm kc-atm--${id}`}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', isolation: 'isolate', background: exprToCss(bg), ...style }}>
      {children}
    </div>
  );
}
export const rootCss = (id: string, bg: ColorExpr = 'bg'): string =>
  `.kc-atm--${id} {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  isolation: isolate;\n  background: ${exprToCss(bg)};\n}`;
