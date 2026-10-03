import type { ReactNode } from 'react';
import type { Hex, Theme } from './theme';
import type { DynamicLayerFactory } from './dynamic';

export type AtmosphereId = 'A01' | 'A02' | 'A03' | 'A04' | 'A06' | 'A08' | 'A10' | 'A11' | 'A12' | 'A13' | 'A14' | 'A15' | 'A16' | 'A17' | 'A18' | 'A19' | 'A20';
export type GlassId = 'G01' | 'G02' | 'G03' | 'G04' | 'G05' | 'G06' | 'G07' | 'G08';
export type LayerKind = 'atmosphere' | 'glass' | 'texture';

export interface Size { readonly w: number; readonly h: number }
export interface Rect { readonly x: number; readonly y: number; readonly w: number; readonly h: number }

export interface LayerMeta {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly kind: LayerKind;
  readonly reg: number | null;
  readonly description: string;
  readonly useIn?: string;
  readonly avoid?: string;
}

export interface StaticOpts { readonly seed: number }

export interface AtmosphereLayer extends LayerMeta {
  readonly kind: 'atmosphere';
  readonly id: AtmosphereId;
  readonly weight: number;                                   // «peso» de la spec
  /** CSS/SVG puro. Usa var(--kc-*) para los colores: recolorea sin re-render. */
  renderStatic(theme: Theme, opts: StaticOpts): ReactNode;
  /** El mismo cuadro, pintado en Canvas 2D con colores resueltos del theme.
   *  Debe coincidir visualmente con renderStatic (ver §7.3). `tMs` solo lo usan
   *  las capas dinámicas de tecnología 'css' para reproducir un instante. */
  paint(ctx: CanvasRenderingContext2D, theme: Theme, size: Size,
        opts: StaticOpts & { readonly tMs?: number }): Promise<void>;
  /** Snippet CSS legible para Ficha y exportación (generado, con var(--kc-*)). */
  staticCss(): string;
  readonly dynamic?: DynamicLayerFactory;                    // lo inyecta el registro dinámico
}

export interface GlassParams { readonly veil: number; readonly blur: number }  // veil 0–100, blur px

export interface GlassModel {
  /** Filtro del backdrop tal como lo aplica el CSS del vidrio. */
  readonly saturate: number;
  readonly brightness: number;
  /** Velo: color y alfa compuestos sobre el fondo desenfocado. */
  veil(theme: Theme, p: GlassParams): { readonly color: Hex; readonly alpha: number };
  /** G08: fracción de desenfoque en la altura normalizada y (0 arriba, 1 abajo). */
  blurMaskAt?(yNorm: number): number;
  /** G09: true donde el grabado deja ver el fondo nítido (sin velo ni blur). */
  sharpAt?(x: number, y: number): boolean;
  /** Capas encima del velo (brillos, estrías, tintes, paños). Solo blanco/negro/theme. */
  paintOverlays?(ctx: CanvasRenderingContext2D, theme: Theme, rect: Rect, p: GlassParams): void;
}

export interface GlassLayer extends LayerMeta {
  readonly kind: 'glass';
  readonly id: GlassId;
  readonly defaults: GlassParams;
  readonly recommendedBlur: number;
  readonly className: string;            // 'kc-glass--G03'
  readonly css: string;                  // contenido del .css del vidrio (import ?raw)
  readonly text: 'theme' | 'smoke';      // G05 usa onSmoke / mutedOnSmoke
  readonly model: GlassModel;
}
