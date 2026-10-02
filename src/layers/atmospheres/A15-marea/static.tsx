// A15 Marea luminosa (estática): orilla en diagonal (abajo-izq → arriba-dcha) con espuma de luz sobre arena bgDeep.
import type { ColorExpr } from '../../shared/color-expr';
import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';
import { colorFor, type SvgMode } from '../../shared/svg';

export const ID = 'A15' as const;
export const BG: ColorExpr = 'bgDeep';
export const VIEW = { w: 400, h: 300 } as const;
export const HORIZON_Y = 60;                      // 20 % desde arriba (= yh 0.8 del shader)
const B = [30, 300] as const;                     // la orilla toca el borde inferior
const V = [264, 60] as const;                     // punto de fuga en el horizonte
const DIR = [V[0] - B[0], V[1] - B[1]] as const;
const LEN = Math.hypot(DIR[0], DIR[1]);
const N = [-DIR[1] / LEN, DIR[0] / LEN] as const; // normal hacia el mar (abajo-dcha)

export const SEA_COLOR: ColorExpr = { mix: ['glow2', 'bgDeep', 0.08] };
export const HALO_COLOR: ColorExpr = 'glowMix';
export const CORE_COLOR: ColorExpr = 'glow';
export const SPRAY_COLOR: ColorExpr = { mix: ['white', 'glow', 0.45] };
export const HALO_BLUR = 5;

export interface Stroke { pts: [number, number][]; width: number; color: ColorExpr; alpha: number; blur: number }
export interface Dot { x: number; y: number; r: number; alpha: number }
export interface Scene { sea: [number, number][]; strokes: Stroke[]; dots: Dot[] }

const at = (t: number, off: number): [number, number] => {
  const s = 1 - 0.95 * t;                         // escala de perspectiva
  return [B[0] + DIR[0] * t + N[0] * off * s, B[1] + DIR[1] * t + N[1] * off * s];
};
const line = (f: (t: number) => number, tMax = 0.9): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= 45; i++) { const t = (i / 45) * tMax; out.push(at(t, f(t))); }
  return out;
};

export const scene = (seed: number): Scene => {
  const r = mulberry32(hashSeed('A15', seed));
  const p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
  const edge = (t: number) => -14 + 9 * Math.sin(t * 17 + p1) + 4 * Math.sin(t * 37 + p2);
  const crest = (k: number) => (t: number) => 34 + 46 * k + 6 * Math.sin(t * 11 + p3 + k * 2.1);
  const strokes: Stroke[] = [
    { pts: line(edge), width: 16, color: HALO_COLOR, alpha: 0.55, blur: HALO_BLUR },
    { pts: line(edge), width: 1.6, color: CORE_COLOR, alpha: 1, blur: 0 },
  ];
  for (let k = 0; k < 3; k++) {
    const a = 0.42 - k * 0.12;
    strokes.push({ pts: line(crest(k), 0.88), width: 8 - 2 * k, color: HALO_COLOR, alpha: a * 0.6, blur: HALO_BLUR });
    strokes.push({ pts: line(crest(k), 0.88), width: 1, color: CORE_COLOR, alpha: a, blur: 0 });
  }
  const dots: Dot[] = [];
  for (let i = 0; i < 90; i++) {
    const t = r() * 0.85;
    const off = edge(t) - 2 + r() * 20;
    const [x, y] = at(t, off);
    dots.push({ x, y, r: (0.4 + r() * 1.1) * (1 - 0.7 * t), alpha: 0.35 + r() * 0.65 });
  }
  return { sea: [[B[0], B[1]], [V[0], V[1]], [VIEW.w, HORIZON_Y], [VIEW.w, VIEW.h]], strokes, dots };
};

/** Luz ambiental cálida en el horizonte (sobre el agua lejana). */
export const lights = (): Light[] => [
  { x: 84, y: 20, d: 56, color: 'ambient', alpha: 0.5, blend: 'theme' },
  { x: 70, y: 74, d: 70, color: 'glow2', alpha: 0.18, blend: 'theme' },
];

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export const mareaSvg = (seed: number, mode: SvgMode, theme?: Theme): string => {
  const s = scene(seed);
  const c = (e: ColorExpr) => colorFor(e, mode, theme);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">` +
    `<defs><filter id="kc-marea-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${HALO_BLUR}"/></filter></defs>` +
    `<polygon points="${pts(s.sea)}" fill="${c(SEA_COLOR)}"/>` +
    `<g style="mix-blend-mode:var(--kc-blend)" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    s.strokes.map((k) => `<polyline points="${pts(k.pts)}" stroke="${c(k.color)}" stroke-width="${k.width}" opacity="${k.alpha.toFixed(2)}"${k.blur ? ' filter="url(#kc-marea-blur)"' : ''}/>`).join('') +
    s.dots.map((d) => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r.toFixed(2)}" fill="${c(SPRAY_COLOR)}" stroke="none" opacity="${d.alpha.toFixed(2)}"/>`).join('') +
    `</g></svg>`;
};

export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <div data-kc-marea style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: mareaSvg(opts.seed, 'vars') }} />
    <Lights items={lights()} />
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + '\n' + lightsToCss(lights()) +
  `\n/* SVG 400x300 (slice): mar ${JSON.stringify(SEA_COLOR)} · espuma glowMix (blur ${HALO_BLUR}) + borde glow · spray mix(white, glow) · mix-blend-mode: var(--kc-blend) */`;
