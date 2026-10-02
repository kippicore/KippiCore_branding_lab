import type { LegibilityInput, LegibilityResult } from '../contracts';
import { measureOnImage, type MeasureDeps } from './measure';
import { rasterizeStage } from './raster';

export const MAX_VEIL = 95;

export interface AutoVeilResult {
  readonly veil: number;
  readonly result: LegibilityResult;
  /** false si ni con 95 % se alcanza el objetivo (se devuelve 95). */
  readonly reached: boolean;
}

/**
 * Busca el velo mínimo (entero, ≥ el actual, ≤ 95 %) con el que el texto secundario
 * alcanza `target`. Supone contraste monótono creciente con el velo.
 */
export async function autoVeil(input: LegibilityInput, target = 4.5, deps: MeasureDeps = {}): Promise<AutoVeilResult> {
  const stage = await (deps.raster ?? rasterizeStage)(input);
  const overlays = deps.overlays ?? true;
  const at = (veil: number): LegibilityResult =>
    measureOnImage({ ...input, params: { ...input.params, veil } }, stage, undefined, overlays);
  const start = Math.min(MAX_VEIL, Math.max(0, Math.round(input.params.veil)));
  const first = at(start);
  if (first.muted.worstRatio >= target) return { veil: start, result: first, reached: true };
  let hiResult = at(MAX_VEIL);
  if (hiResult.muted.worstRatio < target) return { veil: MAX_VEIL, result: hiResult, reached: false };
  let lo = start, hi = MAX_VEIL; // lo no cumple, hi cumple
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    const r = at(mid);
    if (r.muted.worstRatio >= target) { hi = mid; hiResult = r; } else lo = mid;
  }
  return { veil: hi, result: hiResult, reached: true };
}
