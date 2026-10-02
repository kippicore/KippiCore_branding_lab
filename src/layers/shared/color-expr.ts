import type { Hex, Theme, ThemeColorKey } from '../../contracts';
export type ColorExpr = ThemeColorKey | 'white' | 'black' | { mix: [ColorExpr, ColorExpr, number] };
export const exprToCss = (_e: ColorExpr): string => { throw new Error('pendiente: P2') };
export const exprToHex = (_e: ColorExpr, _theme: Theme): Hex => { throw new Error('pendiente: P2') };
