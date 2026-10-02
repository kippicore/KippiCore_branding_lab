import type { AtmosphereId, GlassId } from './layer';
import type { Mode, PaletteId } from './theme';
import type { TemplateId } from './template';
import type { TypeId } from './typography';

export type Motion = 'static' | 'dynamic';
export type ViewId = 'combinador' | 'galerias' | 'ficha';
export type GalleryTab = 'T' | 'C' | 'A' | 'G';
export type RegFilter = 'all' | 'enterprise' | 'equilibrio' | 'pyme';

export interface LabState {
  readonly view: ViewId;
  readonly palette: PaletteId;      // c
  readonly type: TypeId;            // t
  readonly atmosphere: AtmosphereId;// a
  readonly glass: GlassId;          // g
  readonly mode: Mode;              // m = light|dark
  readonly motion: Motion;          // mv = s|d
  readonly speed: number;           // sp (0.25–2, paso 0.25)
  readonly veil: number | null;     // v  (null = defaults del vidrio)
  readonly blur: number | null;     // b
  readonly template: TemplateId;    // tpl
  readonly seed: number;            // s
  readonly gallery: GalleryTab;     // gt
  readonly reg: RegFilter;          // r
  readonly ficha: string | null;    // id (A05, G07, C05, T14)
}
