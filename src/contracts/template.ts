import type { ReactNode } from 'react';
import type { GlassLayer, GlassParams } from './layer';
import type { TypeSystem } from './typography';

export type TemplateId = 'hero' | 'order-card';

export interface TemplateProps {
  readonly glass: GlassLayer;
  readonly glassParams: GlassParams;
  readonly type: TypeSystem;        // para saber si hay rol accent (Playfair/Caveat)
}

export interface TemplateDef {
  readonly id: TemplateId;
  readonly name: string;            // 'Portada web' | 'Tarjeta de pedido'
  readonly Component: (p: TemplateProps) => ReactNode;
}
