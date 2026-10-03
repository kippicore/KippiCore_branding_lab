import type { CSSProperties, ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { exprToCss, type ColorExpr } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';
import { cloud, LAYOUT_CSS, LIGHT, N_STATIC, sample, waves } from './sphere';

export const ID = 'A19' as const;
export const BG: ColorExpr = 'bgDeep';
/** Lado del lienzo SVG en unidades de radio (la esfera mide 2). */
export const VIEW = 3.8;

export type DotLayer = 'dust' | 'fil' | 'rim' | 'ej';
export const layerColor = (l: DotLayer, mode: Theme['mode']): ColorExpr =>
  l === 'dust' ? 'glow' : l === 'fil' ? 'glow2' : l === 'ej' ? 'glowMix'
    : mode === 'dark' ? { mix: ['white', 'glow', 0.45] } : { mix: ['ink', 'glow', 0.25] };
export const rimExpr = (mode: Theme['mode']): ColorExpr => layerColor('rim', mode);

export interface DotBucket { layer: DotLayer; alpha: number; r: number; pts: [number, number][] }
const LEVELS = 5;
const STATIC_BOOST = 1.7;   // menos puntos que la dinámica (2200 vs 9000): cada uno pesa más

/** Cuadro t = 0 de la dinámica (mismo modelo), agrupado por capa/alfa/tamaño. Coordenadas en radios, y hacia abajo. */
export const dots = (seed: number): DotBucket[] => {
  const w = waves(seed), c = cloud(seed, N_STATIC);
  const map = new Map<string, DotBucket>();
  const order: DotLayer[] = ['dust', 'fil', 'ej', 'rim'];
  const samples = Array.from({ length: c.n }, (_, i) => sample(w, c, i, 0)).sort((a, b) => a.z - b.z);
  for (const s of samples) {
    const r = s.size > 1.4 ? 0.0075 : 0.005;
    for (const layer of order) {
      const a = Math.min(1, s[layer] * STATIC_BOOST);
      if (a < 0.04) continue;
      const level = Math.max(1, Math.round(a * LEVELS)) / LEVELS;
      const key = `${layer}|${level}|${r}`;
      let b = map.get(key);
      if (!b) { b = { layer, alpha: level, r, pts: [] }; map.set(key, b); }
      b.pts.push([+s.x.toFixed(3), +(-s.y).toFixed(3)]);
    }
  }
  return [...map.values()].sort((a, b) => order.indexOf(a.layer) - order.indexOf(b.layer));
};

const pathOf = (b: DotBucket): string => b.pts.map(([x, y]) => `M${x} ${y}h0`).join('');

const blend: CSSProperties = { mixBlendMode: 'var(--kc-blend)' as CSSProperties['mixBlendMode'] };

export interface SphereCss { left: string; top: string; R: number }
/** La esfera como SVG (halo, interior, rim y puntos). A20 la reutiliza con otro encuadre y otro prefijo de ids. */
export const sphereSvg = (theme: Theme, seed: number, at: SphereCss = LAYOUT_CSS, idp = 'kc-a19'): ReactNode => {
  const h = VIEW / 2;
  const [lx, ly] = LIGHT;
  const box: CSSProperties = {
    position: 'absolute', left: at.left, top: at.top, width: `${VIEW * at.R}cqmin`,
    height: `${VIEW * at.R}cqmin`, transform: 'translate(-50%, -50%)', pointerEvents: 'none',
  };
  return (
    <svg data-kc-sphere viewBox={`${-h} ${-h} ${VIEW} ${VIEW}`} style={box} aria-hidden="true">
      <defs>
        <radialGradient id={`${idp}-halo`} cx="0" cy="0" r="2.1" gradientUnits="userSpaceOnUse">
          <stop offset="0.26" stopColor={exprToCss('glowMix')} stopOpacity="0.22" />
          <stop offset="1" stopColor={exprToCss('glowMix')} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${idp}-in`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={exprToCss('glow2')} stopOpacity="0.12" />
          <stop offset="1" stopColor={exprToCss('glow2')} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${idp}-rim`} x1={-lx} y1={ly} x2={lx} y2={-ly} gradientUnits="userSpaceOnUse">
          <stop offset="0.2" stopColor={exprToCss(rimExpr(theme.mode))} stopOpacity="0.12" />
          <stop offset="1" stopColor={exprToCss(rimExpr(theme.mode))} stopOpacity="1" />
        </linearGradient>
        <filter id={`${idp}-b1`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.035" /></filter>
        <filter id={`${idp}-b2`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.16" /></filter>
      </defs>
      <circle r="2.1" fill={`url(#${idp}-halo)`} style={blend} />
      <circle r="1" fill={`url(#${idp}-in)`} style={blend} />
      <circle r="1.05" fill="none" stroke={`url(#${idp}-rim)`} strokeWidth="0.3" opacity="0.16" filter={`url(#${idp}-b2)`} style={blend} />
      <circle r="1.03" fill="none" stroke={`url(#${idp}-rim)`} strokeWidth="0.07" opacity="0.3" filter={`url(#${idp}-b1)`} style={blend} />
      <g fill="none" strokeLinecap="round" style={blend}>
        {dots(seed).map((b, i) => (
          <path key={i} d={pathOf(b)} stroke={exprToCss(layerColor(b.layer, theme.mode))} strokeWidth={b.r * 2} opacity={b.alpha} />
        ))}
      </g>
    </svg>
  );
};

export const renderStatic = (theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG} style={{ containerType: 'size' }}>{sphereSvg(theme, opts.seed)}</Root>
);

export const css = (): string => rootCss(ID, BG).replace('isolation: isolate;', 'isolation: isolate;\n  container-type: size;') +
  `\n.kc-atm--${ID} [data-kc-sphere] {\n  position: absolute;\n  left: ${LAYOUT_CSS.left};\n  top: ${LAYOUT_CSS.top};\n` +
  `  width: ${VIEW * LAYOUT_CSS.R}cqmin;\n  height: ${VIEW * LAYOUT_CSS.R}cqmin;\n  transform: translate(-50%, -50%);\n}` +
  `\n.kc-atm--${ID} [data-kc-sphere] > * {\n  mix-blend-mode: var(--kc-blend);\n}`;
