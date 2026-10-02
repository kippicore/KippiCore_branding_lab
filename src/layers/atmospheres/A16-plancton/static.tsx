import type { ReactNode } from 'react';
import type { Size, StaticOpts, Theme } from '../../../contracts';
import type { ColorExpr } from '../../shared/color-expr';
import { exprToCss } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';
import { ANGLE, BASE_PARTICLES, CENTER, HAZE, LEVELS, PROFILE_STOPS, createField, levelS, particleDraw, profile, type Draw } from './field';

export const ID = 'A16' as const;
export const BG: ColorExpr = 'bgDeep';
export const VIEW: Size = { w: 1600, h: 1000 };
const COLS: readonly ColorExpr[] = ['glow2', 'glow', 'glowMix'];

/** Partículas del estado inicial en el viewBox de la estática (ordenadas de lejos a cerca). */
export const staticDots = (seed: number): Draw[] => {
  const f = createField(seed, BASE_PARTICLES);
  const out: Draw[] = [];
  for (let i = 0; i < f.n; i++) { const d = { x: 0, y: 0, rad: 0, alpha: 0, col: 0, lvl: 0, layer: 0 }; if (particleDraw(f, i, 0, VIEW.w, VIEW.h, d)) out.push(d); }
  return out.sort((a, b) => a.layer - b.layer);
};

const stops = (e: ColorExpr, fn: (r: number) => number): ReactNode[] =>
  Array.from({ length: PROFILE_STOPS }, (_, i) => {
    const r = i / (PROFILE_STOPS - 1);
    return <stop key={i} offset={r} style={{ stopColor: exprToCss(e) }} stopOpacity={+Math.min(1, fn(r)).toFixed(3)} />;
  });

export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => {
  const S = Math.hypot(VIEW.w, VIEW.h), ca = Math.cos(ANGLE), sa = Math.sin(ANGLE);
  return (
    <Root id={ID} bg={BG}>
      <svg data-kc-light viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} preserveAspectRatio="xMidYMid slice" width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, mixBlendMode: 'var(--kc-blend)' as never }}>
        <defs>
          {COLS.map((e, c) => Array.from({ length: LEVELS }, (_, l) => (
            <radialGradient key={`${c}-${l}`} id={`kc16-${c}-${l}`}>{stops(e, (r) => profile(levelS(l), r))}</radialGradient>
          )))}
          <radialGradient id="kc16-haze">{stops('glowMix', (r) => Math.pow(1 - r, 2) * (1 - r * 0.2))}</radialGradient>
        </defs>
        {HAZE.map(([u, v, len, wid, a], i) => (
          <ellipse key={`h${i}`} cx={(CENTER.x * VIEW.w + S * (u * ca - v * sa)).toFixed(1)} cy={(CENTER.y * VIEW.h + S * (u * sa + v * ca)).toFixed(1)}
            rx={(len * S / 2).toFixed(1)} ry={(wid * S / 2).toFixed(1)} fill="url(#kc16-haze)" opacity={a}
            transform={`rotate(${(ANGLE * 180 / Math.PI).toFixed(2)} ${(CENTER.x * VIEW.w + S * (u * ca - v * sa)).toFixed(1)} ${(CENTER.y * VIEW.h + S * (u * sa + v * ca)).toFixed(1)})`} />
        ))}
        {staticDots(opts.seed).map((d, i) => (
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.rad.toFixed(1)} fill={`url(#kc16-${d.col}-${d.lvl})`} opacity={+d.alpha.toFixed(3)} />
        ))}
      </svg>
    </Root>
  );
};
export const css = (): string => rootCss(ID, BG) + `\n.kc-atm--${ID} > svg {\n  position: absolute;\n  inset: 0;\n  mix-blend-mode: var(--kc-blend);\n}`;
