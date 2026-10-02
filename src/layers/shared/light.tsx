import type { CSSProperties, ReactNode } from 'react';
import type { Size, Theme } from '../../contracts';
import { withAlpha } from '../../theme/color';
import { exprToCss, exprToCssAlpha, exprToHex, type ColorExpr } from './color-expr';
import { withBlur } from './canvas';

export interface Light {
  x: number; y: number; d: number; color: ColorExpr; alpha: number; blur?: number; blend?: 'screen' | 'multiply' | 'theme';
  /** Perfil de alfa a lo largo del radio: [alfa, posición %]. Por defecto [[1,0],[0,68]] (la `luz` de la spec). */
  profile?: ReadonlyArray<readonly [number, number]>;
}

const DEFAULT_PROFILE: ReadonlyArray<readonly [number, number]> = [[1, 0], [0, 68]];
const blendCss = (b: Light['blend']): string | undefined => (b === 'theme' ? 'var(--kc-blend)' : b);

const gradientCss = (l: Light): string =>
  `radial-gradient(circle, ${(l.profile ?? DEFAULT_PROFILE)
    .map(([a, at]) => `${exprToCssAlpha(l.color, a)} ${at}%`).join(', ')})`;

export const lightStyle = (l: Light): CSSProperties => ({
  position: 'absolute', left: `${l.x}%`, top: `${l.y}%`, width: `${l.d}%`, aspectRatio: '1',
  transform: 'translate(-50%, -50%)', background: gradientCss(l), opacity: l.alpha,
  filter: l.blur ? `blur(${l.blur}px)` : undefined, mixBlendMode: blendCss(l.blend) as CSSProperties['mixBlendMode'],
  pointerEvents: 'none',
});

export function Lights({ items }: { items: Light[] }): ReactNode {
  return items.map((l, i) => <div key={i} data-kc-light style={lightStyle(l)} />);
}

/** Dibuja las luces en canvas: mismo gradiente (farthest-corner, mismos topes), alfa 0 del MISMO color (R6). */
export const paintLights = (ctx: CanvasRenderingContext2D, theme: Theme, size: Size, items: Light[]): void => {
  for (const l of items) {
    const hex = exprToHex(l.color, theme);
    const cx = (l.x / 100) * size.w, cy = (l.y / 100) * size.h;
    const R = ((l.d / 100) * size.w) * Math.SQRT1_2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    for (const [a, at] of l.profile ?? DEFAULT_PROFILE) g.addColorStop(Math.min(1, at / 100), a >= 1 ? hex : withAlpha(hex, a));
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.globalCompositeOperation = l.blend === 'theme' ? (theme.derived.blendMode as GlobalCompositeOperation)
      : l.blend ?? 'source-over';
    withBlur(ctx, l.blur ?? 0, () => { ctx.fillStyle = g; ctx.fillRect(cx - R - 40, cy - R - 40, 2 * R + 80, 2 * R + 80); });
    ctx.restore();
  }
};

/** CSS legible (generado desde los datos) para Ficha y exportación. */
export const lightsToCss = (items: Light[]): string =>
  items.map((l, i) => {
    const decl = [
      'position: absolute', `left: ${l.x}%`, `top: ${l.y}%`, `width: ${l.d}%`, 'aspect-ratio: 1', 'transform: translate(-50%, -50%)',
      `background: ${gradientCss(l)}`, `opacity: ${l.alpha}`,
      ...(l.blur ? [`filter: blur(${l.blur}px)`] : []), ...(l.blend ? [`mix-blend-mode: ${blendCss(l.blend)}`] : []),
    ];
    return `.kc-light-${i + 1} {\n  ${decl.join(';\n  ')};\n}`;
  }).join('\n');

export { exprToCss };
