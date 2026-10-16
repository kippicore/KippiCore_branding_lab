import type { AtmosphereId } from '../contracts';

export interface AtmosphereMeta {
  id: AtmosphereId; name: string; subtitle: string; reg: number | null; weight: number;
  description: string; staticRecipe: string; dynamicNote: string;
}

export const ATMOSPHERE_META: readonly AtmosphereMeta[] = [
  { id: 'A01', name: 'Aurora', subtitle: 'X01', reg: null, weight: 0.35, description: 'Luz difusa que entra por un lado y deja el otro en sombra. Profunda, calmada, con dirección.',
    staticRecipe: 'bg · luz(78,28,78,accent,.9) · luz(58,78,62,mix(accent,primary,.45),.55) · luz(98,96,60,primary,.95) · luz(30,40,50,mix(bg,accent,.85),.6). El lado izquierdo queda en sombra: ahí va el texto.',
    dynamicNote: 'Las luces derivan despacio (translate ±6 %, scale .95–1.08, 18–27 s, alternate, desfasadas).' },
  { id: 'A02', name: 'Malla de gradiente', subtitle: 'Mesh', reg: null, weight: 0.7, description: 'Cuatro colores que se funden de esquina a esquina, sin bordes. Versátil y limpio.',
    staticRecipe: 'base mix(primary,accent,.5) · luz(0,0,130,primary,1) · luz(100,0,120,accent,1) · luz(0,100,120,mix(primary,bg,.5),1) · luz(100,100,130,mix(accent,primary,.4),1).',
    dynamicNote: 'Cuatro puntos de control que orbitan (WebGL) o luces CSS que derivan.' },
  { id: 'A03', name: 'Gradiente con grano', subtitle: 'Grainy', reg: null, weight: 0.6, description: 'La malla con un grano fuerte encima, como impresión o fotografía analógica.',
    staticRecipe: 'luz(15,20,110,primary,1) · luz(85,25,100,accent,.95) · luz(60,95,110,mix(accent,primary,.5),.9) + ruido feTurbulence (baseFrequency .75, 3 octavas) con mix-blend-mode: overlay, α .9.',
    dynamicNote: 'Deriva de luces + grano vivo (saltos de 80–120 ms con steps()).' },
  { id: 'A04', name: 'Bokeh', subtitle: 'Lente', reg: null, weight: 0.3, description: 'Puntos de luz desenfocados, como luces de ciudad vistas a través de una lente abierta.',
    staticRecipe: 'luz(70,60,90,mix(accent,bg,.35),.6) + 16 discos de 6–22 % con borde semiduro (color 0 52%, transparent 70%), α .25–.75, colores rotando accent / primary / mix. Semilla fija.',
    dynamicNote: 'Flotación vertical lenta + respiración de enfoque (blur 0→3 px) desfasada por disco.' },
  { id: 'A06', name: 'Haz de luz', subtitle: 'Volumétrico', reg: null, weight: 0.25, description: 'Un rayo de luz en diagonal desde arriba, como en un escenario. Dramático y elegante.',
    staticRecipe: 'conic-gradient(from 145deg at 12% -6%, transparent 0deg, accent·55% 10deg, mix(accent,primary)·35% 22deg, transparent 38deg), blur(28px), inset −20% · luz(55,105,90,primary,.55) · luz(20,8,40,accent,.5).',
    dynamicNote: 'El haz oscila ±4° (20 s) y flotan partículas de polvo dentro del cono.' },
  { id: 'A10', name: 'Plasma duotono', subtitle: 'Fusión', reg: null, weight: 0.6, description: 'Dos colores que se funden y producen un tercero donde se tocan.',
    staticRecipe: 'Dos luces grandes primary (38,46,80) y accent (66,56,78) con mix-blend-mode screen en oscuro / multiply en claro · luz(85,10,40,mix,.6).',
    dynamicNote: 'Las dos luces orbitan una alrededor de la otra (40 s).' },
  { id: 'A11', name: 'Rejilla iluminada', subtitle: 'Tech', reg: null, weight: 0.25, description: 'Una cuadrícula fina que solo se ve donde cae la luz.',
    staticRecipe: 'Cuadrícula de 44 px en ink·14 % con máscara radial en (65 %,40 %) · luz(65,40,70,accent,.55) · luz(95,95,50,primary,.5).',
    dynamicNote: 'La máscara y la luz siguen al cursor (spotlight) y deambulan solas sin puntero.' },
  { id: 'A16', name: 'Plancton', subtitle: 'Corriente', reg: null, weight: 0.2, description: 'Miles de partículas de luz arrastradas por una corriente diagonal, con profundidad de campo: nítidas en el centro, difusas en los bordes.',
    staticRecipe: 'bgDeep · banda diagonal densa de puntos glow · puntos dispersos glow2 con tamaño y desenfoque según profundidad.',
    dynamicNote: 'Partículas fluyen por un campo curl con tres capas de profundidad, parpadeo suave y enfoque que respira.' },
  { id: 'A17', name: 'Cortina boreal', subtitle: 'Aurora', reg: null, weight: 0.3, description: 'Cortinas verticales de luz que se pliegan y ondulan sobre un cielo con estrellas y una línea de horizonte oscura.',
    staticRecipe: 'bgDeep · cortinas verticales (glow, mix glow/glow2) con pliegues · estrellas pequeñas · silueta de horizonte en bgDeep.',
    dynamicNote: 'Shader de cortinas deformadas por fbm que ondulan y se pliegan (≈40 s), estrellas que titilan.' },
  { id: 'A19', name: 'Esfera de partículas', subtitle: 'Orbe', reg: null, weight: 0.25, description: 'Una esfera hecha de polvo de luz con borde brillante y filamentos que giran por dentro. Centro natural para el logo.',
    staticRecipe: 'bgDeep · esfera de puntos glow con luz de borde (rim) en un lado y filamentos glow2.',
    dynamicNote: 'La esfera gira despacio, los filamentos fluyen por su superficie y el rim respira (≈30 s).' },
  { id: 'A20', name: 'Ecosistema', subtitle: 'Clientes en órbita', reg: null, weight: 0.2, description: 'La esfera de partículas rodeada de células translúcidas: cada una es un cliente de KippiCore (panaderías, conjuntos, comercios). Algunas se señalan con un rótulo hexagonal y su nombre.',
    staticRecipe: 'bgDeep · esfera de puntos glow · células con burbuja, núcleo glow/glow2 y estelas · rótulos hexagonales con línea guía (nombres en src/data/clients.ts).',
    dynamicNote: 'Las células orbitan la esfera, algunas salen disparadas hacia la cámara con estela y los rótulos de clientes entran y salen cada ≈45 s.' },
];
