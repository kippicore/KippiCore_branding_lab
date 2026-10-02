import type { Hex, Theme } from './theme';
import type { AtmosphereLayer, GlassLayer, GlassParams, Rect, Size } from './layer';

export type Verdict = 'excelente' | 'suficiente' | 'solo-grande' | 'insuficiente';
// ≥ 7 excelente · ≥ 4.5 suficiente · ≥ 3 solo texto grande · < 3 insuficiente

export interface ContrastReading {
  readonly textColor: Hex;
  readonly p10Luminance: number;     // luminancia relativa WCAG del fondo compuesto
  readonly p90Luminance: number;
  readonly worstRatio: number;       // mínimo de contraste contra p10 y p90
  readonly verdict: Verdict;
}

export interface LegibilityResult {
  readonly primary: ContrastReading;     // ink (u onSmoke) sobre el rect data-kc-probe="primary"
  readonly muted: ContrastReading;       // muted (o mutedOnSmoke) sobre el rect "muted"
  readonly estimatedByWeight: number;    // método viejo (color promedio con «peso»), solo para comparar
  readonly sampledPixels: number;
  readonly elapsedMs: number;
}

export interface LegibilityInput {
  readonly atmosphere: AtmosphereLayer;
  readonly glass: GlassLayer;
  readonly theme: Theme;
  readonly params: GlassParams;
  readonly stage: Size;                  // px CSS
  readonly glassRect: Rect;              // rect del vidrio que contiene el probe, en coords del escenario
  readonly primaryRect: Rect;
  readonly mutedRect: Rect;
  readonly seed: number;
  readonly frame?: CanvasImageSource;    // si hay dinámico: capture() actual
}
