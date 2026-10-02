import type { GlassLayer, GlassParams, LegibilityInput, Theme } from '../contracts';
import { blurImageData, saturateBrightness } from '../lib/imageops';
import { hexToRgb01 } from '../theme/color';
import { createCanvas } from './raster';

type GlassArgs = Pick<LegibilityInput, 'glass' | 'theme' | 'params' | 'glassRect'>;

export const makeImageData = (data: Uint8ClampedArray<ArrayBuffer>, w: number, h: number): ImageData =>
  typeof ImageData !== 'undefined'
    ? new ImageData(data, w, h)
    : ({ data, width: w, height: h, colorSpace: 'srgb' } as unknown as ImageData);

/** Recorte con bordes replicados (fuera del escenario se repite el píxel del borde). */
const crop = (src: ImageData, x0: number, y0: number, w: number, h: number): ImageData => {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(src.height - 1, Math.max(0, y0 + y));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(src.width - 1, Math.max(0, x0 + x));
      const si = (sy * src.width + sx) * 4, di = (y * w + x) * 4;
      out[di] = src.data[si] as number; out[di + 1] = src.data[si + 1] as number;
      out[di + 2] = src.data[si + 2] as number; out[di + 3] = 255;
    }
  }
  return makeImageData(out, w, h);
};

/** G08: el CSS desvanece también el velo (degradado de velo → transparente de arriba abajo). */
const veilFade = (glass: GlassLayer, yNorm: number): number => (glass.id === 'G08' ? 1 - yNorm : 1);

/** Pinta los overlays del vidrio con canvas si existe; si no, devuelve la imagen tal cual. */
const applyOverlays = (img: ImageData, glass: GlassLayer, theme: Theme, p: GlassParams): ImageData => {
  if (!glass.model.paintOverlays) return img;
  const c = createCanvas(img.width, img.height);
  if (!c) return img;
  const ctx = c.ctx as CanvasRenderingContext2D;
  ctx.putImageData(img, 0, 0);
  glass.model.paintOverlays(ctx, theme, { x: 0, y: 0, w: img.width, h: img.height }, p);
  return ctx.getImageData(0, 0, img.width, img.height);
};

/**
 * Reproduce lo que el navegador compone dentro del vidrio: backdrop (desenfoque + saturación/brillo),
 * velo y overlays. Devuelve los píxeles del `glassRect` (coordenadas locales al vidrio).
 */
export const composeGlass = (stage: ImageData, a: GlassArgs, overlays = true): ImageData => {
  const { glass, theme, params, glassRect } = a;
  const gx = Math.round(glassRect.x), gy = Math.round(glassRect.y);
  const gw = Math.max(1, Math.round(glassRect.w)), gh = Math.max(1, Math.round(glassRect.h));
  const m = Math.ceil(params.blur * 2);
  const sharp = crop(stage, gx - m, gy - m, gw + 2 * m, gh + 2 * m);
  const filtered = saturateBrightness(blurImageData(sharp, params.blur), glass.model.saturate, glass.model.brightness);
  const veil = glass.model.veil(theme, params);
  const [vr, vg, vb] = hexToRgb01(veil.color).map((c) => c * 255) as [number, number, number];
  const W = gw + 2 * m;
  const out = new Uint8ClampedArray(gw * gh * 4);
  for (let y = 0; y < gh; y++) {
    const yn = (y + 0.5) / gh;
    const k = glass.model.blurMaskAt ? glass.model.blurMaskAt(yn) : 1;
    const alpha = Math.min(1, veil.alpha * veilFade(glass, yn));
    for (let x = 0; x < gw; x++) {
      const si = ((y + m) * W + (x + m)) * 4, di = (y * gw + x) * 4;
      if (glass.model.sharpAt?.(x, y)) {
        // grabado: fondo nítido, sin velo ni desenfoque (peor caso real)
        for (let c = 0; c < 3; c++) out[di + c] = sharp.data[si + c] as number;
      } else {
        const v = [vr, vg, vb];
        for (let c = 0; c < 3; c++) {
          const s = sharp.data[si + c] as number, f = filtered.data[si + c] as number;
          const back = s * (1 - k) + Math.min(255, f) * k;
          out[di + c] = back * (1 - alpha) + (v[c] as number) * alpha;
        }
      }
      out[di + 3] = 255;
    }
  }
  const img = makeImageData(out, gw, gh);
  return overlays ? applyOverlays(img, glass, theme, params) : img;
};
