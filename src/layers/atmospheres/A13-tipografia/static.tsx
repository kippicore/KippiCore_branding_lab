import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCss, type ColorExpr } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A13' as const;
export const BG: ColorExpr = 'bg';
export const TYPE = { size: 17, weight: 700, tracking: -0.05, lineHeight: 0.95, padLeft: 5 } as const;
export const LINES: ReadonlyArray<{ text: string; color: ColorExpr }> = [
  { text: 'KippiCore', color: 'primary' },
  { text: 'sistemas', color: 'accent' },
  { text: 'a la medida', color: 'ink' },
];
export const renderStatic = (_theme: Theme, _opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG} style={{ containerType: 'inline-size' }}>
    <div data-kc-type style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingLeft: `${TYPE.padLeft}%`, fontFamily: 'var(--kc-font-display, sans-serif)', fontWeight: TYPE.weight,
      fontSize: `${TYPE.size}cqw`, letterSpacing: `${TYPE.tracking}em`, lineHeight: TYPE.lineHeight, whiteSpace: 'nowrap' }}>
      {LINES.map((l) => <span key={l.text} style={{ color: exprToCss(l.color) }}>{l.text}</span>)}
    </div>
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n.kc-atm--A13 {\n  container-type: inline-size;\n}\n.kc-type {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  padding-left: ${TYPE.padLeft}%;\n  font-family: var(--kc-font-display);\n  font-weight: ${TYPE.weight};\n  font-size: ${TYPE.size}cqw;\n  letter-spacing: ${TYPE.tracking}em;\n  line-height: ${TYPE.lineHeight};\n}\n` +
  LINES.map((l, i) => `.kc-type span:nth-child(${i + 1}) { color: ${exprToCss(l.color)}; }`).join('\n');
