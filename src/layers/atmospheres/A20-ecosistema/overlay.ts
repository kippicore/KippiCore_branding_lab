// A20 Ecosistema: dibujo 2D de las células (burbuja + núcleo + estela) y de los rótulos hexagonales de clientes.
// Lo usan el dinámico (canvas encima de la esfera) y paint() (cuadro estático). Solo colores del tema.
import type { Hex, Size } from '../../../contracts';
import { CLIENTS } from '../../../data/clients';
import { mix, withAlpha } from '../../../theme/color';
import { LIGHT } from '../A19-esfera/sphere';
import { cellsAt, type CellPos, type CellSpec } from './cells';

export interface CellColors { glow: Hex; glow2: Hex; glowMix: Hex; rim: Hex }
export interface Geom { cx: number; cy: number; R: number }

/** `colors` = sphereColors(): [bgDeep, glow, glow2, glowMix, rim oscuro, rim claro]; dark 0..1 mezcla los dos rims. */
export const overlayColors = (colors: readonly Hex[], dark: number): CellColors =>
  ({ glow: colors[1]!, glow2: colors[2]!, glowMix: colors[3]!, rim: mix(colors[4]!, colors[5]!, dark) });

const ANG = Math.atan2(-LIGHT[1], LIGHT[0]);          // dirección de la luz en coordenadas de lienzo (y hacia abajo)
const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

const bubble = (ctx: CanvasRenderingContext2D, c: CellPos, px: number, py: number, rad: number, g: Geom, col: CellColors): void => {
  const a = c.alpha;
  const nuc = c.kind === 0 ? col.glow : col.glow2;
  const grad = (r0: number, r1: number, stops: [number, Hex, number][]): CanvasGradient => {
    const gr = ctx.createRadialGradient(px, py, r0, px, py, r1);
    for (const [at, hex, al] of stops) gr.addColorStop(at, withAlpha(hex, al * a));
    return gr;
  };
  if (c.trail > 0.03) {                                // estela hacia atrás, radial desde la esfera
    const L = c.trail * g.R, ex = px + c.tx * L, ey = py - c.ty * L;
    const lg = ctx.createLinearGradient(px, py, ex, ey);
    lg.addColorStop(0, withAlpha(col.rim, 0.38 * a)); lg.addColorStop(1, withAlpha(col.rim, 0));
    const nx = c.ty * rad * 0.5, ny = c.tx * rad * 0.5;                          // estela afilada: ancha en la célula, punta al final
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(px + nx, py + ny); ctx.lineTo(ex, ey); ctx.lineTo(px - nx, py - ny); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = grad(0, rad * 1.9, [[0, nuc, 0.24], [1, nuc, 0]]);          // resplandor del núcleo
  ctx.beginPath(); ctx.arc(px, py, rad * 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = grad(rad * 0.2, rad, [[0, col.glowMix, 0], [0.72, col.glowMix, 0.1], [1, col.rim, 0.42]]);   // cuerpo de la burbuja
  ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round';
  ctx.strokeStyle = withAlpha(col.rim, 0.5 * a); ctx.lineWidth = Math.max(0.8, rad * 0.045);
  ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = withAlpha(col.rim, 0.75 * a); ctx.lineWidth = Math.max(1, rad * 0.09);   // media luna del lado de la luz
  ctx.beginPath(); ctx.arc(px, py, rad * 0.84, ANG - 0.55, ANG + 0.55); ctx.stroke();
  ctx.fillStyle = grad(0, rad * 0.44, [[0, nuc, 1], [0.55, nuc, 0.85], [1, nuc, 0]]);        // núcleo
  ctx.beginPath(); ctx.arc(px, py, rad * 0.44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = withAlpha(col.rim, 0.8 * a);                                              // brillo del núcleo
  ctx.beginPath(); ctx.arc(px + LIGHT[0] * rad * 0.12, py - LIGHT[1] * rad * 0.12, rad * 0.13, 0, Math.PI * 2); ctx.fill();
};

const callout = (ctx: CanvasRenderingContext2D, c: CellPos, px: number, py: number, rad: number, g: Geom, size: Size, col: CellColors, family: string): void => {
  const edge = clamp(Math.min(px, py, size.w - px, size.h - py) / (0.1 * Math.min(size.w, size.h)), 0, 1);   // se desvanece cerca del borde
  const al = c.label * edge * edge * (3 - 2 * edge);
  if (al <= 0.01) return;
  const fs = clamp(g.R * 0.088, 11, 21);
  const hr = rad * 1.55 + 3;
  const text = (CLIENTS[c.named]?.name ?? '').toUpperCase();
  ctx.font = `300 ${fs}px ${family}`;
  const ls = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in ls) ls.letterSpacing = `${(fs * 0.14).toFixed(2)}px`;
  const tw = ctx.measureText(text)?.width ?? text.length * fs * 0.72;
  const L = clamp(g.R * 0.95, 70, 230), m = 16;
  // La línea guía sale hacia fuera de la esfera, inclinada a un lado u otro: se elige el lado que deja el rótulo dentro del cuadro.
  const base = Math.atan2(py - g.cy, px - g.cx), pref = c.named % 2 === 0 ? 0.6 : -0.6;
  const miss = (a: number): number => {
    const x = px + Math.cos(a) * L, y = py + Math.sin(a) * L, s = Math.cos(a) >= 0 ? 1 : -1;
    const wx = s > 0 ? x + 12 + tw - (size.w - m) : m - (x - 12 - tw);
    return Math.max(0, wx) + Math.max(0, m + fs - y) + Math.max(0, y - (size.h - m));
  };
  const ang = miss(base + pref) <= miss(base - pref) ? base + pref : base - pref;
  let tx = px + Math.cos(ang) * L, ty = py + Math.sin(ang) * L;
  const side = Math.cos(ang) >= 0 ? 1 : -1;
  if (side > 0) tx = Math.min(tx, size.w - m - 12 - tw); else tx = Math.max(tx, m + 12 + tw);
  ty = clamp(ty, m + fs, size.h - m);
  const dx = tx - px, dy = ty - py, d = Math.hypot(dx, dy) || 1;
  ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  ctx.strokeStyle = withAlpha(col.rim, 0.88 * al); ctx.lineWidth = 1.2;
  ctx.beginPath();                                                       // hexágono con vértice a los lados
  for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k; const x = px + hr * Math.cos(a), y = py + hr * Math.sin(a); if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = withAlpha(col.rim, 0.7 * al); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + (dx / d) * hr, py + (dy / d) * hr); ctx.lineTo(tx, ty); ctx.stroke();      // línea guía
  ctx.beginPath(); ctx.arc(tx, ty, 2.6, 0, Math.PI * 2); ctx.stroke();                                         // remate
  ctx.fillStyle = withAlpha(col.rim, 0.95 * al);
  ctx.textAlign = side > 0 ? 'left' : 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(text, tx + side * 10, ty);
  if ('letterSpacing' in ls) ls.letterSpacing = '0px';
};

/** Pinta todas las células de la más lejana a la más cercana y, encima, los rótulos de clientes. El modo de mezcla lo fija quien llama. */
export const paintCells = (ctx: CanvasRenderingContext2D, size: Size, g: Geom, t: number, tilt: readonly [number, number],
  specs: readonly CellSpec[], col: CellColors, family: string): void => {
  const list = cellsAt(specs, t, tilt);
  ctx.save();
  const at = (c: CellPos): [number, number, number] => [g.cx + c.x * g.R, g.cy - c.y * g.R, Math.max(2.5, c.r * g.R)];
  for (const c of list) {
    const [px, py, rad] = at(c);
    if (c.alpha < 0.01 || px < -rad * 3 || py < -rad * 3 || px > size.w + rad * 3 || py > size.h + rad * 3) continue;
    bubble(ctx, c, px, py, rad, g, col);
  }
  for (const c of list) {
    if (c.label <= 0.01) continue;
    const [px, py, rad] = at(c);
    callout(ctx, c, px, py, rad, g, size, col, family);
  }
  ctx.restore();
};
