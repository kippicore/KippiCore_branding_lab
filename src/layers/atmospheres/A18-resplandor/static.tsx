import type { CSSProperties, ReactNode } from 'react';
import type { StaticOpts, Theme } from '../../../contracts';
import { hashSeed, mulberry32 } from '../../../lib/prng';
import { exprToCss, exprToCssAlpha, type ColorExpr } from '../../shared/color-expr';
import { Lights, lightsToCss, type Light } from '../../shared/light';
import { Root, rootCss } from '../../shared/root';

export const ID = 'A18' as const;
export const BG: ColorExpr = 'bgDeep';
/** Línea de horizonte (% de la altura) y foco de los rayos (por debajo del horizonte). */
export const HORIZON = 84;
export const FOCUS_Y = 106;

/** Resplandor base (ascendente accent → primary) y nubes de luz. */
export const items = (_seed: number): Light[] => [
  { x: 50, y: 90, d: 150, color: 'accent', alpha: 0.9, blend: 'theme', profile: [[1, 0], [0.5, 30], [0, 68]] },
  { x: 50, y: 56, d: 130, color: 'primary', alpha: 0.5, blend: 'theme' },
  { x: 28, y: 74, d: 46, color: { mix: ['accent', 'primary', 0.5] }, alpha: 0.45, blur: 18, blend: 'theme' },
  { x: 72, y: 66, d: 54, color: { mix: ['accent', 'primary', 0.5] }, alpha: 0.4, blur: 22, blend: 'theme' },
  { x: 48, y: 80, d: 36, color: 'accent', alpha: 0.5, blur: 14, blend: 'theme' },
];

export interface Ray { angle: number; width: number; alpha: number }
/** Abanico de rayos desde el foco: ángulo (grados), ancho (% de w) y alfa; determinista por semilla. */
export const rays = (seed: number): Ray[] => {
  const r = mulberry32(hashSeed(ID, seed));
  const out: Ray[] = [];
  const n = 13;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1) - 0.5;
    out.push({ angle: k * 70 + (r() - 0.5) * 6, width: 3 + r() * 6, alpha: (0.22 + r() * 0.3) * (1 - Math.abs(k) * 0.9) });
  }
  return out;
};
export interface Star { x: number; y: number; r: number; a: number }
export const stars = (seed: number): Star[] => {
  const r = mulberry32(hashSeed(ID, seed, 'stars'));
  return Array.from({ length: 70 }, () => {
    const y = r() * (HORIZON - 6);
    const x = r() * 100;
    return { x, y, r: 0.35 + r() * r() * 1.1, a: (0.35 + r() * 0.55) * Math.min(1, 0.35 + (HORIZON - y) / 70 * 0.9) };
  });
};

const rayStyle = (ray: Ray): CSSProperties => ({
  position: 'absolute', left: '50%', top: `${FOCUS_Y - 150}%`, width: `${ray.width}%`, height: '150%',
  transformOrigin: '50% 100%', transform: `translateX(-50%) rotate(${ray.angle.toFixed(2)}deg)`,
  background: `linear-gradient(to top, ${exprToCssAlpha('accent', 0.9)} 0%, ${exprToCssAlpha({ mix: ['accent', 'primary', 0.4] }, 0.55)} 45%, transparent 85%)`,
  opacity: ray.alpha, filter: 'blur(8px)', mixBlendMode: 'var(--kc-blend)' as CSSProperties['mixBlendMode'], pointerEvents: 'none',
});
const horizonBg = `linear-gradient(to bottom, transparent 0%, ${exprToCssAlpha(BG, 0.92)} 35%, ${exprToCss(BG)} 100%)`;

export const renderStatic = (_theme: Theme, opts: StaticOpts): ReactNode => (
  <Root id={ID} bg={BG}>
    <Lights items={items(opts.seed)} />
    {rays(opts.seed).map((ray, i) => <div key={i} data-kc-ray style={rayStyle(ray)} />)}
    <svg data-kc-stars viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars(opts.seed).map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.r * 0.3} ry={s.r * 0.5} opacity={s.a} style={{ fill: exprToCss('ink') }} />
      ))}
    </svg>
    <div data-kc-horizon style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${100 - HORIZON + 4}%`, background: horizonBg, pointerEvents: 'none' }} />
  </Root>
);

export const css = (): string => {
  const rs = rays(1).map((ray, i) =>
    `.kc-ray-${i + 1} {\n  position: absolute;\n  left: 50%;\n  top: ${FOCUS_Y - 150}%;\n  width: ${ray.width}%;\n  height: 150%;\n  transform-origin: 50% 100%;\n  transform: translateX(-50%) rotate(${ray.angle.toFixed(2)}deg);\n  opacity: ${ray.alpha};\n  filter: blur(8px);\n  mix-blend-mode: var(--kc-blend);\n}`).join('\n');
  return rootCss(ID, BG) + '\n' + lightsToCss(items(1)) + '\n' + rs +
    `\n.kc-horizon {\n  position: absolute;\n  left: 0; right: 0; bottom: 0;\n  height: ${100 - HORIZON + 4}%;\n  background: ${horizonBg};\n}`;
};
