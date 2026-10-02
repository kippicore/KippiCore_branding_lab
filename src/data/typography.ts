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
const SERIF = 'Georgia, serif';
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
    'Geist no trae itálica en Google Fonts (el navegador la sintetiza). No es la tipografía de KippiLex (ver T14).',
    { ...role('Geist', SANS, [400, 500, 600, 700], 'synthetic'), headingWeight: 700, tracking: '-0.035em', scale: 1 },
    role('Geist', SANS, [400, 500, 600, 700], 'synthetic'),
    role('Geist Mono', MONO, [400, 500], 'synthetic'),
    'family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500'),
  sys('T02', 'Serif blando', 70,
    'Fraunces tiene remates suaves, casi redondeados: cálida y con carácter, cercana sin ser infantil. Hanken lee limpio en pantalla.',
    'Fraunces es variable: admite desde un titular sobrio hasta uno muy expresivo.',
    { ...role('Fraunces', SERIF, [400, 700, 800], 'native'), headingWeight: 800, tracking: '-0.02em', scale: 1 },
    role('Hanken Grotesk', SANS, [400, 600], 'native'),
    role('IBM Plex Mono', MONO, [400, 600], 'native'),
    'family=Fraunces:ital,wght@0,400;0,700;0,800;1,400&family=Hanken+Grotesk:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400'),
  sys('T03', 'Superfamilia corporativa', 10,
    'Plex Sans, Serif y Mono fueron diseñadas juntas: coherencia total entre documento, interfaz y código. Máxima confianza, cero riesgo.',
    'Es reconocible como la tipografía de IBM. Segura, pero con poca personalidad propia.',
    { ...role('IBM Plex Sans', SANS, [400, 600, 700], 'native'), headingWeight: 700, tracking: '-0.02em', scale: 1 },
    role('IBM Plex Serif', SERIF, [400, 600], 'native'),
    role('IBM Plex Mono', MONO, [400, 600], 'native'),
    'family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400'),
  sys('T06', 'Caslon institucional', 15,
    'Caslon es la letra de los documentos públicos del siglo XVIII: autoridad, contrato, permanencia. Conecta con el lado jurídico de la sociedad.',
    'Puede leerse anticuada si se usa en todo; el titular en Caslon y la interfaz en Franklin la mantienen contemporánea.',
    { ...role('Libre Caslon Text', SERIF, [400, 700], 'native'), headingWeight: 400, tracking: '-0.01em', scale: 0.92 },
    role('Libre Franklin', SANS, [400, 600], 'native'),
    role('DM Mono', MONO, [400, 500], 'native'),
    'family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500;1,400'),
  sys('T07', 'Geométrica ancha', 85,
    'Unbounded es ancha y redonda: amistosa, legible de lejos, muy visible en redes y en pantallas de punto de venta.',
    'Sin itálica nativa; ocupa mucho ancho. Para titulares cortos, nunca para párrafos.',
    { ...role('Unbounded', SANS, [400, 700, 800], 'synthetic'), headingWeight: 700, tracking: '-0.02em', scale: 0.8 },
    role('Manrope', SANS, [400, 600, 700], 'synthetic'),
    role('Azeret Mono', MONO, [400, 600], 'native'),
    'family=Unbounded:wght@400;700;800&family=Manrope:wght@400;600;700&family=Azeret+Mono:ital,wght@0,400;0,600;1,400'),
  sys('T09', 'Estudio de arte', 75,
    'Syne se ensancha de forma extrema en sus pesos altos: suena a estudio creativo, a galería. Distinta a todo el software colombiano.',
    'Sin itálica nativa. Riesgo de leerse como agencia de diseño y no como empresa de ingeniería.',
    { ...role('Syne', SANS, [400, 700, 800], 'synthetic'), headingWeight: 800, tracking: '-0.02em', scale: 0.95 },
    role('Familjen Grotesk', SANS, [400, 700], 'native'),
    role('Fragment Mono', MONO, [400], 'native'),
    'family=Syne:wght@400;700;800&family=Familjen+Grotesk:ital,wght@0,400;0,700;1,400&family=Fragment+Mono:ital@0;1'),
  sys('T10', 'Tablero industrial', 35,
    'Barlow se inspira en la señalización vial: condensada, eficiente, cabe mucho en poco espacio. Lee como un tablero de control.',
    'Muy buena para dashboards y datos densos; la versión condensada en mayúsculas es su firma.',
    { ...role('Barlow Condensed', SANS, [500, 700, 800], 'native'), headingWeight: 800, tracking: '0em', scale: 1.15, uppercase: true },
    role('Barlow', SANS, [400, 600], 'native'),
    role('Red Hat Mono', MONO, [400, 600], 'native'),
    'family=Barlow+Condensed:ital,wght@0,500;0,700;0,800;1,500&family=Barlow:ital,wght@0,400;0,600;1,400&family=Red+Hat+Mono:ital,wght@0,400;0,600;1,400'),
  sys('T11', 'Alto contraste', 25,
    'Bodoni de moda y lujo, una sans limpia y una máquina de escribir para los datos. La opción más sofisticada y teatral.',
    'Bodoni sufre en tamaños pequeños y en pantallas de baja resolución: solo para titulares de 32 px en adelante.',
    { ...role('Bodoni Moda', SERIF, [400, 700], 'native'), headingWeight: 400, tracking: '-0.01em', scale: 1.05 },
    role('Albert Sans', SANS, [400, 600], 'native'),
    role('Courier Prime', MONO, [400, 700], 'native'),
    'family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Albert+Sans:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400'),
  sys('T14', 'KippiLex · Toga y Código', 40,
    'Sistema tipográfico de KippiLex (Toga = peso jurídico, Código = impulso tecnológico). Está aquí para comparar: responde la decisión abierta 1 de la spec (§7). KippiLex no usa Geist.',
    'Referencia, no candidata: KippiCore decidió apartarse de la identidad de KippiLex. Archivo nunca por debajo de 18 px ni con tracking positivo; Playfair nunca compone números.',
    { ...role('Archivo', SANS, [600, 700, 800], 'none'), headingWeight: 800, tracking: '-0.035em', scale: 1 },
    role('Inter', SANS, [400, 500, 600], 'synthetic'),
    role('Space Mono', MONO, [400, 700], 'none'),
    'family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,500;1,600&family=Space+Mono:wght@400;700',
    {
      labelTracking: '0.18em',
      source: 'KippiLex/Contexto/06_identidad-visual.md §39',
      accent: {
        ...role('Playfair Display', SERIF, [500, 600], 'native'),
        use: 'Solo una palabra o frase corta dentro de un titular, citas y portadas. Nunca números, nunca párrafos ni botones.',
      },
    }),
];

export const getTypeSystem = (id: TypeId): TypeSystem => {
  const t = TYPE_SYSTEMS.find((x) => x.id === id);
  if (!t) throw new Error(`Tipografía desconocida: ${id}`);
  return t;
};
