import type { FontRole, TypeId, TypeSystem } from '../contracts';

type It = FontRole['italic'];
const role = (family: string, fallback: string, weights: number[], italic: It, singleWeight = false): FontRole => ({
  family,
  stack: `"${family}", ${fallback}`,
  weights,
  italic,
  ...(singleWeight ? { singleWeight: true } : {}),
});
const SANS = 'system-ui, sans-serif';
const MONO = 'ui-monospace, monospace';

const sys = (
  id: TypeId, name: string, reg: number, concept: string, caution: string,
  display: FontRole & { headingWeight: number; tracking: string; scale: number; uppercase?: boolean },
  text: FontRole, mono: FontRole, googleFontsQuery: string,
  extra: { accent?: FontRole & { use: string }; labelTracking?: string; source?: string } = {},
): TypeSystem => ({
  id, name, reg, concept, caution, display, text,
  mono: { ...mono, labelTracking: extra.labelTracking ?? '0.12em' },
  ...(extra.accent ? { accent: extra.accent } : {}),
  googleFontsQuery,
  ...(extra.source ? { source: extra.source } : {}),
});

export const TYPE_SYSTEMS: readonly TypeSystem[] = [
  sys('T00', 'Geist · base recomendada', 45,
    'Técnica, neutra y contemporánea. Es la tipografía de Vercel y la base del laboratorio de cristal.',
    'Geist no trae itálica en Google Fonts (el navegador la sintetiza).',
    { ...role('Geist', SANS, [400, 500, 600, 700], 'synthetic'), headingWeight: 700, tracking: '-0.035em', scale: 1 },
    role('Geist', SANS, [400, 500, 600, 700], 'synthetic'),
    role('Geist Mono', MONO, [400, 500], 'synthetic'),
    'family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500'),
];

export const getTypeSystem = (id: TypeId): TypeSystem => {
  const t = TYPE_SYSTEMS.find((x) => x.id === id);
  if (!t) throw new Error(`Tipografía desconocida: ${id}`);
  return t;
};
