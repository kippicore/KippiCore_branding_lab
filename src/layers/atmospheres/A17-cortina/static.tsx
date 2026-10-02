import type { ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import type { ColorExpr } from '../../shared/color-expr';
import { Root, rootCss } from '../../shared/root';
import { colorFor } from '../../shared/svg';

export const ID = 'A17' as const;
export const BG: ColorExpr = 'bgDeep';
export const VIEW = { w: 400, h: 300 } as const;
export const BLUR = 2.5;
export const GROUND = 262;

export interface Ray { x: number; w: number; top: number; bottom: number; color: ColorExpr; alpha: number }
export interface Scene { rays: Ray[]; stars: { x: number; y: number; r: number; a: number }[]; trees: [number, number][] }

/** Cortinas: rayos verticales cuyo borde inferior (nítido) ondula como tela; hacia arriba se desvanecen. */
export const scene = (seed: number): Scene => {
  const r = mulberry32(hashSeed('A17', seed));
  const ph = [r() * 6.28, r() * 6.28];
  const rays: Ray[] = [];
  for (let layer = 0; layer < 2; layer++) {
    for (let x = 20 + layer * 2; x < 390; x += 4.2) {
      const fold = Math.sin(x * 0.021 + ph[layer]!) + 0.5 * Math.sin(x * 0.057 + ph[layer]! * 1.7);
      const bottom = (layer ? 178 : 150) + fold * 22;
      const height = (layer ? 70 : 110) * (0.55 + 0.45 * r()) * (0.7 + 0.3 * Math.sin(x * 0.013 + ph[1 - layer]!));
      const t = 0.5 + 0.5 * fold / 1.5;
      const color: ColorExpr = t > 0.72 ? 'glowMix' : t > 0.3 ? 'glow' : 'glow2';
      rays.push({ x, w: 3 + r() * 2.2, top: bottom - height, bottom, color, alpha: (layer ? 0.5 : 0.85) * (0.55 + 0.45 * r()) });
    }
  }
  const stars = Array.from({ length: 90 }, () => ({ x: r() * 400, y: r() * 215, r: 0.45 + r() * 0.7, a: 0.3 + r() * 0.5 }));
  const trees: [number, number][] = [[-10, GROUND]];
  for (let x = -6; x < 412; x += 7 + r() * 6) {
    const h = 14 + r() * 26 + (x > 300 || x < 70 ? 14 : 0);
    trees.push([x, GROUND - 4], [x + 3.5, GROUND - h]);
  }
  trees.push([410, GROUND], [410, 300], [-10, 300]);
  return { rays, stars, trees };
};

export const COLORS: ColorExpr[] = ['glow', 'glow2', 'glowMix'];
const gid = (c: ColorExpr): string => `kc-a17-${c as string}`;

export const cortinaSvg = (seed: number, mode: 'vars' | 'resolved', theme?: Theme): string => {
  const s = scene(seed);
  const col = (e: ColorExpr) => colorFor(e, mode, theme);
  const defs = COLORS.map((c) =>
    `<linearGradient id="${gid(c)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col(c)}" stop-opacity="0"/>` +
    `<stop offset="0.7" stop-color="${col(c)}" stop-opacity="0.55"/><stop offset="1" stop-color="${col(c)}" stop-opacity="1"/></linearGradient>`).join('');
  const rays = s.rays.map((q) => `<rect x="${q.x.toFixed(1)}" y="${q.top.toFixed(1)}" width="${q.w.toFixed(1)}" height="${(q.bottom - q.top).toFixed(1)}" fill="url(#${gid(q.color)})" opacity="${q.alpha.toFixed(2)}"/>`).join('');
  const stars = s.stars.map((q) => `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${q.r.toFixed(2)}" fill="${col('ink')}" opacity="${q.a.toFixed(2)}"/>`).join('');
  const ground = `<polygon fill="${col('bgDeep')}" points="${s.trees.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">` +
    `<defs>${defs}<filter id="kc-a17-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${BLUR}"/></filter></defs>` +
    `<g>${stars}</g><g filter="url(#kc-a17-blur)" style="mix-blend-mode:var(--kc-blend)">${rays}</g>${ground}</svg>`;
};

export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <div data-kc-cortina style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: cortinaSvg(opts.seed, 'vars') }} />
  </Root>
);
export const css = (): string =>
  rootCss(ID, BG) + `\n/* SVG 400x300 (slice): estrellas ink · rayos verticales glow/glow2/glowMix con degradado vertical (feGaussianBlur ${BLUR}, blend theme) · silueta de abetos bgDeep */`;
