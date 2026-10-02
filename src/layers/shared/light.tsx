import type { ReactNode } from 'react';
import type { Size, Theme } from '../../contracts';
import type { ColorExpr } from './color-expr';
export interface Light { x: number; y: number; d: number; color: ColorExpr; alpha: number; blur?: number; blend?: 'screen' | 'multiply' | 'theme' }
export function Lights(_p: { items: Light[] }): ReactNode { throw new Error('pendiente: P2') }
export const paintLights = (_ctx: CanvasRenderingContext2D, _theme: Theme, _size: Size, _items: Light[]): void => { throw new Error('pendiente: P2') };
export const lightsToCss = (_items: Light[]): string => { throw new Error('pendiente: P2') };
