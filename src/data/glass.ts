import type { GlassId, GlassParams } from '../contracts';

/** Metadatos de los vidrios (spec §4.1). `defaults.blur` = el desenfoque del CSS probado;
 *  `recommendedBlur` = el «recomendado» de la spec (se muestra en la Ficha). */
export interface GlassMeta {
  readonly id: GlassId;
  readonly name: string;
  readonly subtitle: string;
  readonly reg: number;
  readonly description: string;
  readonly useIn: string;
  readonly avoid: string;
  readonly defaults: GlassParams;
  readonly recommendedBlur: number;
}

export const GLASS_META: readonly GlassMeta[] = [
  { id: 'G01', name: 'Esmerilado clásico', subtitle: 'Velo parejo y filo de luz', reg: 55,
    description: 'El vidrio esmerilado de siempre: desenfoque parejo, un velo claro y un filo de luz de un píxel. Es la base de las otras nueve.',
    useIn: 'Tarjetas flotantes, menús, modales y overlays de demos.',
    avoid: 'Por sí solo es muy común: la diferencia tiene que venir del color de fondo y de la tipografía.',
    defaults: { blur: 18, veil: 55 }, recommendedBlur: 18 },
  { id: 'G02', name: 'Vidrio líquido', subtitle: 'Brillo especular, bordes vivos', reg: 65,
    description: 'La lectura de KippiCore del lenguaje que Apple llamó Liquid Glass: menos desenfoque, más saturación, un brillo especular arriba y bordes que atrapan la luz. Se siente como un objeto, no como una capa.',
    useIn: 'Botones principales, barras de navegación, controles flotantes de la app.',
    avoid: 'Apple recibió críticas fuertes de legibilidad con este estilo y recomienda usarlo con moderación: solo en controles, nunca en párrafos.',
    defaults: { blur: 9, veil: 45 }, recommendedBlur: 16 },
  { id: 'G03', name: 'Vidrio acanalado', subtitle: 'Estrías verticales de vitrina', reg: 45,
    description: 'El vidrio estriado de las puertas y vitrinas de los años setenta, hoy muy de arquitectura: el fondo se lee en franjas verticales. Tiene textura física sin perder sobriedad.',
    useIn: 'Fondos de secciones, portadas, separadores, piezas impresas en acrílico.',
    avoid: 'Las estrías compiten con el texto pequeño: sube el velo o deja el texto en un bloque más opaco.',
    defaults: { blur: 8, veil: 52 }, recommendedBlur: 20 },
  { id: 'G04', name: 'Esmerilado con grano', subtitle: 'Vidrio mate con ruido fino', reg: 60,
    description: 'El esmerilado clásico con un grano fino por encima: deja de verse digital y se siente como vidrio arenado o papel vegetal. Une el cristal con la tendencia táctil de 2026.',
    useIn: 'Web, redes, portadas; es la versión más cálida.',
    avoid: 'Sobre pantallas de baja calidad el grano puede verse como suciedad: mantenerlo sutil.',
    defaults: { blur: 20, veil: 56 }, recommendedBlur: 20 },
  { id: 'G05', name: 'Vidrio ahumado', subtitle: 'Oscuro, sobrio, enterprise', reg: 15,
    description: 'Vidrio tintado oscuro, como el de una sala de juntas o un automóvil: el fondo se intuye y el texto claro manda. Es la variante más seria y la que mejor contraste da.',
    useIn: 'Propuestas enterprise, dashboards, presentaciones, modo oscuro.',
    avoid: 'En modo claro se vuelve una mancha oscura: úsalo como acento, no como superficie principal.',
    defaults: { blur: 22, veil: 55 }, recommendedBlur: 22 },
  { id: 'G06', name: 'Escarcha', subtitle: 'Bordes empañados, centro claro', reg: 55,
    description: 'Vidrio empañado por el frío: más desenfoque, más brillo y los bordes blanquecinos, como una ventana en el páramo. Muy limpio y luminoso.',
    useIn: 'Modales, onboarding, pantallas de bienvenida, modo claro.',
    avoid: 'Pierde fuerza en modo oscuro; el halo blanco puede verse lechoso si el velo es alto.',
    defaults: { blur: 24, veil: 48 }, recommendedBlur: 16 },
  { id: 'G07', name: 'Vidrio dicroico', subtitle: 'Filo iridiscente que cambia de color', reg: 70,
    description: 'El vidrio dicroico refleja colores distintos según el ángulo. Aquí aparece como un filo iridiscente y un velo tornasol muy suave: futurista y premium sin perder la base sobria.',
    useIn: 'Lanzamientos, tarjetas destacadas, planes premium, eventos.',
    avoid: 'Si se usa en todas las tarjetas pierde lo especial: reservarlo para lo que debe destacar.',
    defaults: { blur: 18, veil: 52 }, recommendedBlur: 18 },
  { id: 'G08', name: 'Desenfoque progresivo', subtitle: 'Se aclara de arriba hacia abajo', reg: 50,
    description: 'El desenfoque es fuerte arriba y se desvanece hacia abajo, como en los encabezados de las apps modernas. El vidrio deja de ser una caja y se funde con el contenido.',
    useIn: 'Barras de navegación fijas, encabezados de tablas largas, pies de imagen.',
    avoid: 'La parte baja queda casi transparente: el texto importante va arriba.',
    defaults: { blur: 24, veil: 52 }, recommendedBlur: 24 },
  { id: 'G09', name: 'Grabado al ácido', subtitle: 'Rayas transparentes sobre esmerilado', reg: 35,
    description: 'El vidrio de las puertas de oficina con un patrón grabado: el esmerilado tiene líneas finas que dejan ver el fondo nítido. Se puede grabar cualquier patrón, incluso el isotipo.',
    useIn: 'Señalética, oficinas, portadas institucionales, papelería en acetato.',
    avoid: 'Las líneas nítidas pueden pasar por detrás del texto: mantenerlas finas y espaciadas.',
    defaults: { blur: 20, veil: 56 }, recommendedBlur: 20 },
  { id: 'G10', name: 'Vitral', subtitle: 'Paños de color con emplomado', reg: 80,
    description: 'Paños de vidrio de colores separados por líneas de plomo, como los vitrales de las iglesias coloniales. Usa los colores de la marca como vidrio teñido: cálido, festivo y muy reconocible.',
    useIn: 'Campañas, redes, temporada de fin de año, piezas para pymes.',
    avoid: 'Es el más decorativo: en interfaces densas cansa y en enterprise puede leerse como juguete.',
    defaults: { blur: 18, veil: 52 }, recommendedBlur: 18 },
];
