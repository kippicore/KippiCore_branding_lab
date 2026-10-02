import type { AtmosphereId, DynamicLayerFactory } from '../../contracts';

// Cada fábrica carga su capa con import() dinámico: OGL, shaders y simulación quedan fuera del JS inicial.
export const DYNAMIC_ATMOSPHERES: Partial<Record<AtmosphereId, DynamicLayerFactory>> = {
  A01: { id: 'A01', tech: 'webgl', cycleMs: 54000, usesPointer: false, load: () => import('./A01-aurora/dynamic') },
  // A10 usa WebGL (shader de MOTION.md §5) en lugar de CSS/WAAPI del plan: ver informe P3.
  A10: { id: 'A10', tech: 'webgl', cycleMs: 40000, usesPointer: false, load: () => import('./A10-plasma/dynamic') },
  A11: { id: 'A11', tech: 'css', cycleMs: 24000, usesPointer: true, load: () => import('./A11-rejilla/dynamic') },
};
