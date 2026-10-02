import type { ContrastReading, Hex, LegibilityInput, LegibilityResult, Rect } from '../contracts';
import { luminancePercentiles } from '../lib/imageops';
import { mix } from '../theme/color';
import { contrastRatio, relativeLuminance, verdict } from '../theme/contrast';
import { composeGlass, makeImageData } from './glass-model';
import { rasterizeStage, type RasterFn } from './raster';

export interface MeasureDeps {
  /** Fondo del escenario; por defecto, la atmósfera pintada en canvas. */
  readonly raster?: RasterFn;
  /** false: omite `paintOverlays` (pruebas sin canvas). */
  readonly overlays?: boolean;
}

const MAX_SIDE = 256;

/** Submuestrea de forma regular el rect (coords del escenario) sobre la imagen del vidrio. */
const sample = (glassImg: ImageData, glassRect: Rect, r: Rect): ImageData => {
  const x0 = Math.max(0, Math.round(r.x - glassRect.x)), y0 = Math.max(0, Math.round(r.y - glassRect.y));
  const x1 = Math.min(glassImg.width, Math.round(r.x - glassRect.x + r.w));
  const y1 = Math.min(glassImg.height, Math.round(r.y - glassRect.y + r.h));
  const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
  const sx = Math.max(1, Math.ceil(w / MAX_SIDE)), sy = Math.max(1, Math.ceil(h / MAX_SIDE));
  const ow = Math.ceil(w / sx), oh = Math.ceil(h / sy);
  const out = new Uint8ClampedArray(ow * oh * 4);
  for (let j = 0; j < oh; j++) {
    for (let i = 0; i < ow; i++) {
      const px = Math.min(glassImg.width - 1, x0 + i * sx), py = Math.min(glassImg.height - 1, y0 + j * sy);
      const si = (py * glassImg.width + px) * 4, di = (j * ow + i) * 4;
      for (let c = 0; c < 4; c++) out[di + c] = glassImg.data[si + c] as number;
    }
  }
  return makeImageData(out, ow, oh);
};

const ratioFromLum = (lText: number, lBg: number): number =>
  (Math.max(lText, lBg) + 0.05) / (Math.min(lText, lBg) + 0.05);

const readingFor = (img: ImageData, textColor: Hex): ContrastReading => {
  const [p10, p90] = luminancePercentiles(img, undefined, [10, 90]) as [number, number];
  const lText = relativeLuminance(textColor);
  const worstRatio = Math.min(ratioFromLum(lText, p10), ratioFromLum(lText, p90));
  return { textColor, p10Luminance: p10, p90Luminance: p90, worstRatio, verdict: verdict(worstRatio) };
};

/** Color de texto principal y secundario según el vidrio. */
export const textColors = (input: Pick<LegibilityInput, 'glass' | 'theme'>): { primary: Hex; muted: Hex } => {
  const d = input.theme.derived, r = input.theme.roles;
  return input.glass.text === 'smoke' ? { primary: d.onSmoke, muted: d.mutedOnSmoke } : { primary: r.ink, muted: r.muted };
};

/** Medidor «real» (spec §5.6): compone fondo + vidrio y mide p10/p90 de luminancia bajo cada texto. */
export async function measureLegibility(input: LegibilityInput, deps: MeasureDeps = {}): Promise<LegibilityResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const stage = await (deps.raster ?? rasterizeStage)(input);
  return measureOnImage(input, stage, t0, deps.overlays ?? true);
}

/** Variante síncrona sobre un fondo ya rasterizado (la usa autoVeil para no repintar). */
export function measureOnImage(input: LegibilityInput, stage: ImageData, t0?: number, overlays = true): LegibilityResult {
  const start = t0 ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const glassImg = composeGlass(stage, input, overlays);
  const colors = textColors(input);
  const primaryImg = sample(glassImg, input.glassRect, input.primaryRect);
  const mutedImg = sample(glassImg, input.glassRect, input.mutedRect);
  const veil = input.glass.model.veil(input.theme, input.params);
  const base = mix(input.theme.derived.glowMix, input.theme.roles.bg, input.atmosphere.weight);
  const estBg = mix(veil.color, base, veil.alpha);
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    primary: readingFor(primaryImg, colors.primary),
    muted: readingFor(mutedImg, colors.muted),
    estimatedByWeight: contrastRatio(colors.primary, estBg),
    sampledPixels: primaryImg.width * primaryImg.height + mutedImg.width * mutedImg.height,
    elapsedMs: now - start,
  };
}
