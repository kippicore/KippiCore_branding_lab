import type { AtmosphereId, DynamicLayerFactory } from '../../contracts';

// Cada fábrica carga su capa con import() dinámico: OGL, shaders y simulación quedan fuera del JS inicial.
export const DYNAMIC_ATMOSPHERES: Partial<Record<AtmosphereId, DynamicLayerFactory>> = {
  A01: { id: 'A01', tech: 'webgl', cycleMs: 54000, usesPointer: false, load: () => import('./A01-aurora/dynamic') },
  // A10 usa WebGL (shader de MOTION.md §5) en lugar de CSS/WAAPI del plan: ver informe P3.
  A10: { id: 'A10', tech: 'webgl', cycleMs: 40000, usesPointer: false, load: () => import('./A10-plasma/dynamic') },
  A11: { id: 'A11', tech: 'css', cycleMs: 24000, usesPointer: true, load: () => import('./A11-rejilla/dynamic') },
  A15: { id: 'A15', tech: 'webgl', cycleMs: 14000, usesPointer: false, load: () => import('./A15-marea/dynamic') },
  A16: { id: 'A16', tech: 'canvas2d', cycleMs: 60000, usesPointer: false, load: () => import('./A16-plancton/dynamic') },
  A17: { id: 'A17', tech: 'webgl', cycleMs: 40000, usesPointer: false, load: () => import('./A17-cortina/dynamic') },
  A18: { id: 'A18', tech: 'webgl', cycleMs: 50000, usesPointer: false, load: () => import('./A18-resplandor/dynamic') },
  A19: { id: 'A19', tech: 'webgl', cycleMs: 90000, usesPointer: true, load: () => import('./A19-esfera/dynamic') },
  A20: { id: 'A20', tech: 'webgl', cycleMs: 90000, usesPointer: true, load: () => import('./A20-ecosistema/dynamic') },
};
