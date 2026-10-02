import type { GlassModel, GlassParams, Hex, Rect, Theme } from '../../contracts';
import { SMOKE_BASE } from '../../theme/derive';

/** Velo plano: superficie del tema con alfa = velo/100 (como glassBg()). */
export const flatVeil = (theme: Theme, p: GlassParams): { color: Hex; alpha: number } =>
  ({ color: theme.roles.surface, alpha: Math.min(1, Math.max(0, p.veil / 100)) });

/** Velo del ahumado: base #0B0D12, alfa = min(1, velo/100 + .25) (como smoke()). */
export const smokeVeil = (_theme: Theme, p: GlassParams): { color: Hex; alpha: number } =>
  ({ color: SMOKE_BASE, alpha: Math.min(1, p.veil / 100 + 0.25) });

export const white = (a: number): string => `rgba(255,255,255,${a})`;
export const black = (a: number): string => `rgba(0,0,0,${a})`;

export const model = (m: Partial<GlassModel> & { saturate: number; brightness: number }): GlassModel =>
  ({ veil: flatVeil, ...m });

/** Gradiente lineal con la geometría de CSS (ángulo 0 = arriba, sentido horario). */
export const cssLinear = (ctx: CanvasRenderingContext2D, r: Rect, angleDeg: number): { g: CanvasGradient; len: number } => {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(r.w * dx) + Math.abs(r.h * dy);
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return { g: ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2), len };
};

/** Resplandor interior (equivalente a `inset 0 0 Npx color`): cuatro rampas desde los bordes. */
export const insetGlow = (ctx: CanvasRenderingContext2D, r: Rect, size: number, alpha: number): void => {
  const sides: [number, number, number, number, number, number, number, number][] = [
    [r.x, r.y, r.x, r.y + size, r.x, r.y, r.w, size],
    [r.x, r.y + r.h, r.x, r.y + r.h - size, r.x, r.y + r.h - size, r.w, size],
    [r.x, r.y, r.x + size, r.y, r.x, r.y, size, r.h],
    [r.x + r.w, r.y, r.x + r.w - size, r.y, r.x + r.w - size, r.y, size, r.h],
  ];
  for (const [x0, y0, x1, y1, fx, fy, fw, fh] of sides) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, white(alpha));
    g.addColorStop(1, white(0));
    ctx.fillStyle = g;
    ctx.fillRect(fx, fy, fw, fh);
  }
};

/** Filo de 1 px interior. */
export const insetEdge = (ctx: CanvasRenderingContext2D, r: Rect, color: string, w = 1): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.strokeRect(r.x + w / 2, r.y + w / 2, r.w - w, r.h - w);
};

/** Rellena `r` con una elipse radial (centro y radios en px) de `inner` a `outer`. */
export const ellipseFill = (
  ctx: CanvasRenderingContext2D, r: Rect, cx: number, cy: number, rx: number, ry: number,
  stops: readonly (readonly [number, string])[],
): void => {
  ctx.save();
  ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
  ctx.translate(cx, cy); ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect((r.x - cx) / rx, (r.y - cy) / ry, r.w / rx, r.h / ry);
  ctx.restore();
};
