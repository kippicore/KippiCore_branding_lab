// A16 Plancton: dibujo en canvas 2D con sprites de halo precalculados (compartido por paint.ts y dynamic.ts).
import type { Hex } from '../../../contracts';
import { withAlpha } from '../../../theme/color';
import { ANGLE, CENTER, HAZE, LEVELS, PROFILE_STOPS, TAU, levelS, particleDraw, profile, type Draw, type Field } from './field';

export interface Sprites { dots: HTMLCanvasElement[][]; haze: HTMLCanvasElement | null }
const SPRITE_PX = 64;

const mk = (): { c: HTMLCanvasElement; g: CanvasRenderingContext2D } | null => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE_PX;
  const g = c.getContext('2d');
  return g ? { c, g } : null;
};
const radial = (g: CanvasRenderingContext2D, hex: Hex, a: (r: number) => number): void => {
  const h = SPRITE_PX / 2;
  const gr = g.createRadialGradient(h, h, 0, h, h, h);
  for (let i = 0; i < PROFILE_STOPS; i++) { const r = i / (PROFILE_STOPS - 1); gr.addColorStop(r, withAlpha(hex, Math.min(1, a(r)))); }
  g.fillStyle = gr; g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
};

/** colors = [glow2, glow, glowMix] (índices de Field.col). */
export const buildSprites = (colors: readonly [Hex, Hex, Hex]): Sprites => {
  const dots = colors.map((hex) => Array.from({ length: LEVELS }, (_, l) => {
    const s = mk(); if (!s) return null as never;
    const lv = levelS(l); radial(s.g, hex, (r) => profile(lv, r)); return s.c;
  }));
  const hz = mk();
  if (hz) radial(hz.g, colors[2], (r) => Math.pow(1 - r, 2) * (1 - r * 0.2));
  return { dots, haze: hz?.c ?? null };
};

export interface SceneOpts { w: number; h: number; tSec: number; count: number; dark: boolean; bg: Hex; blend: GlobalCompositeOperation }

/** Fondo + bruma + partículas (3 pasadas por capa, de lejos a cerca). */
export function drawScene(ctx: CanvasRenderingContext2D, f: Field, sp: Sprites, o: SceneOpts): void {
  const { w, h, tSec, count } = o;
  const S = Math.hypot(w, h);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = o.bg; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = o.blend;
  const gain = o.dark ? 1 : 0.85;
  if (sp.haze) {
    const ca = Math.cos(ANGLE), sa = Math.sin(ANGLE);
    const breathe = 0.85 + 0.15 * Math.sin((TAU * tSec) / 30);
    for (const [u, v, len, wid, a] of HAZE) {
      ctx.save();
      ctx.translate(CENTER.x * w + S * (u * ca - v * sa), CENTER.y * h + S * (u * sa + v * ca));
      ctx.rotate(ANGLE);
      ctx.globalAlpha = a * breathe * gain;
      ctx.drawImage(sp.haze, (-len * S) / 2, (-wid * S) / 2, len * S, wid * S);
      ctx.restore();
    }
  }
  const d: Draw = { x: 0, y: 0, rad: 0, alpha: 0, col: 0, lvl: 0, layer: 0 };
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < count; i++) {
      if (f.layer[i] !== layer || !particleDraw(f, i, tSec, w, h, d)) continue;
      const img = sp.dots[d.col]?.[d.lvl];
      if (!img) continue;
      ctx.globalAlpha = Math.min(1, d.alpha * gain);
      ctx.drawImage(img, d.x - d.rad, d.y - d.rad, d.rad * 2, d.rad * 2);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
