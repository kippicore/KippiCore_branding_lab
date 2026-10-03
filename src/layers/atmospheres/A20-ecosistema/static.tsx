import type { CSSProperties, ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { CLIENTS } from '../../../data/clients';
import { exprToCss, type ColorExpr } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';
import { LIGHT } from '../A19-esfera/sphere';
import { rimExpr, sphereSvg } from '../A19-esfera/static';
import { cells, cellsAt, LAYOUT_CSS, STATIC_T, type CellPos } from './cells';

export const ID = 'A20' as const;
export const BG: ColorExpr = 'bgDeep';
/** Medio lado del lienzo SVG de las células, en radios de la esfera (el escenario visible cabe de sobra). */
const CV = 7;
const blend: CSSProperties = { mixBlendMode: 'var(--kc-blend)' as CSSProperties['mixBlendMode'] };
const ANG = Math.atan2(-LIGHT[1], LIGHT[0]);
const f = (v: number): number => +v.toFixed(4);

const kindColor = (k: 0 | 1): ColorExpr => (k === 0 ? 'glow' : 'glow2');

const Cell = ({ c, theme, k }: { c: CellPos; theme: Theme; k: number }): ReactNode => {
  const rim = exprToCss(rimExpr(theme.mode));
  const px = f(c.x), py = f(-c.y), r = f(c.r), a = f(c.alpha);
  const hl = (rad: number, a0: number, a1: number): string =>
    `M${f(px + rad * Math.cos(a0))} ${f(py + rad * Math.sin(a0))}A${f(rad)} ${f(rad)} 0 0 1 ${f(px + rad * Math.cos(a1))} ${f(py + rad * Math.sin(a1))}`;
  const ex = f(px + c.tx * c.trail), ey = f(py - c.ty * c.trail);
  return (
    <g opacity={a}>
      {c.trail > 0.03 && (
        <>
          <linearGradient id={`kc-a20-t${k}`} gradientUnits="userSpaceOnUse" x1={px} y1={py} x2={ex} y2={ey}>
            <stop offset="0" stopColor={rim} stopOpacity="0.38" /><stop offset="1" stopColor={rim} stopOpacity="0" />
          </linearGradient>
          <polygon points={`${f(px + c.ty * r * 0.5)},${f(py + c.tx * r * 0.5)} ${ex},${ey} ${f(px - c.ty * r * 0.5)},${f(py - c.tx * r * 0.5)}`} fill={`url(#kc-a20-t${k})`} />
        </>
      )}
      <circle cx={px} cy={py} r={f(r * 1.9)} fill={`url(#kc-a20-g${c.kind})`} />
      <circle cx={px} cy={py} r={r} fill="url(#kc-a20-body)" />
      <circle cx={px} cy={py} r={r} fill="none" stroke={rim} strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d={hl(r * 0.84, ANG - 0.55, ANG + 0.55)} fill="none" stroke={rim} strokeOpacity="0.75" strokeWidth={f(Math.max(0.01, r * 0.09))} strokeLinecap="round" />
      <circle cx={px} cy={py} r={f(r * 0.44)} fill={`url(#kc-a20-n${c.kind})`} />
      <circle cx={f(px + LIGHT[0] * r * 0.12)} cy={f(py - LIGHT[1] * r * 0.12)} r={f(r * 0.13)} fill={rim} fillOpacity="0.8" />
    </g>
  );
};

const Callout = ({ c, theme }: { c: CellPos; theme: Theme }): ReactNode => {
  const rim = exprToCss(rimExpr(theme.mode));
  const px = c.x, py = -c.y, hr = c.r * 1.55 + 0.012;
  const ang = Math.atan2(py, px) + (c.named % 2 === 0 ? 0.6 : -0.6);
  const L = 0.95, side = Math.cos(ang) >= 0 ? 1 : -1;
  const tx = px + Math.cos(ang) * L, ty = py + Math.sin(ang) * L, d = Math.hypot(tx - px, ty - py) || 1;
  const hex = Array.from({ length: 6 }, (_, k) => `${f(px + hr * Math.cos((Math.PI / 3) * k))},${f(py + hr * Math.sin((Math.PI / 3) * k))}`).join(' ');
  return (
    <g opacity={f(c.label)}>
      <polygon points={hex} fill="none" stroke={rim} strokeOpacity="0.88" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <path d={`M${f(px + ((tx - px) / d) * hr)} ${f(py + ((ty - py) / d) * hr)}L${f(tx)} ${f(ty)}`} stroke={rim} strokeOpacity="0.7" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
      <circle cx={f(tx)} cy={f(ty)} r="0.012" fill="none" stroke={rim} strokeOpacity="0.7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <text x={f(tx + side * 0.06)} y={f(ty)} fill={rim} fillOpacity="0.95" fontSize="0.088" textAnchor={side > 0 ? 'start' : 'end'} dominantBaseline="central"
        style={{ fontFamily: 'var(--kc-font-text, sans-serif)', fontWeight: 300, letterSpacing: '0.14em' }}>
        {(CLIENTS[c.named]?.name ?? '').toUpperCase()}
      </text>
    </g>
  );
};

const box: CSSProperties = {
  position: 'absolute', left: LAYOUT_CSS.left, top: LAYOUT_CSS.top, width: `${2 * CV * LAYOUT_CSS.R}cqmin`,
  height: `${2 * CV * LAYOUT_CSS.R}cqmin`, transform: 'translate(-50%, -50%)', pointerEvents: 'none',
};

export const renderStatic = (theme: Theme, opts: StaticOpts): ReactNode => {
  const list = cellsAt(cells(opts.seed), STATIC_T).filter((c) => c.alpha >= 0.02);
  const rim = exprToCss(rimExpr(theme.mode));
  const stops = (k: 0 | 1, a: number[]): ReactNode => a.map((o, i) => <stop key={i} offset={[0, 0.55, 1][i]} stopColor={exprToCss(kindColor(k))} stopOpacity={o} />);
  return (
    <Root id={ID} bg={BG} style={{ containerType: 'size' }}>
      {sphereSvg(theme, opts.seed, LAYOUT_CSS, 'kc-a20')}
      <svg data-kc-cells viewBox={`${-CV} ${-CV} ${2 * CV} ${2 * CV}`} style={box} aria-hidden="true">
        <defs>
          {([0, 1] as const).map((k) => (
            <radialGradient key={`g${k}`} id={`kc-a20-g${k}`}><stop offset="0" stopColor={exprToCss(kindColor(k))} stopOpacity="0.24" /><stop offset="1" stopColor={exprToCss(kindColor(k))} stopOpacity="0" /></radialGradient>
          ))}
          {([0, 1] as const).map((k) => <radialGradient key={`n${k}`} id={`kc-a20-n${k}`}>{stops(k, [1, 0.85, 0])}</radialGradient>)}
          <radialGradient id="kc-a20-body">
            <stop offset="0.2" stopColor={exprToCss('glowMix')} stopOpacity="0" />
            <stop offset="0.776" stopColor={exprToCss('glowMix')} stopOpacity="0.1" />
            <stop offset="1" stopColor={rim} stopOpacity="0.42" />
          </radialGradient>
        </defs>
        <g style={blend}>
          {list.map((c, k) => <Cell key={c.i} c={c} theme={theme} k={k} />)}
          {list.filter((c) => c.label > 0.01).map((c) => <Callout key={`l${c.i}`} c={c} theme={theme} />)}
        </g>
      </svg>
    </Root>
  );
};

export const css = (): string => rootCss(ID, BG).replace('isolation: isolate;', 'isolation: isolate;\n  container-type: size;') +
  `\n.kc-atm--${ID} [data-kc-sphere], .kc-atm--${ID} [data-kc-cells] {\n  position: absolute;\n  left: ${LAYOUT_CSS.left};\n  top: ${LAYOUT_CSS.top};\n  transform: translate(-50%, -50%);\n}` +
  `\n.kc-atm--${ID} [data-kc-sphere] {\n  width: ${3.8 * LAYOUT_CSS.R}cqmin;\n  height: ${3.8 * LAYOUT_CSS.R}cqmin;\n}` +
  `\n.kc-atm--${ID} [data-kc-cells] {\n  width: ${2 * CV * LAYOUT_CSS.R}cqmin;\n  height: ${2 * CV * LAYOUT_CSS.R}cqmin;\n}` +
  `\n.kc-atm--${ID} [data-kc-sphere] > *, .kc-atm--${ID} [data-kc-cells] > g {\n  mix-blend-mode: var(--kc-blend);\n}`;
