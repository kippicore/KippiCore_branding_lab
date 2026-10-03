// A20 Ecosistema: modelo de las células-cliente que rodean la esfera. Todo es función pura de (seed, t, tilt):
// lo comparten el dinámico (Canvas 2D sobre la esfera), el paint y el estático. Sin Date.now ni Math.random.
// Unidades: radios de la esfera, y hacia arriba, z hacia la cámara. Todo cierra en CELL_T (= cycleMs del registro).
import { CLIENTS } from '../../../data/clients';
import { hashSeed, mulberry32 } from '../../../lib/prng';

export const TAU = Math.PI * 2;
export const CELL_T = 90;       // s: todas las órbitas dan un número entero de vueltas
export const STREAM_T = 30;     // s: ciclo de las células que salen disparadas hacia la cámara (divide a 90)
export const LABEL_T = 45;      // s: periodo de cada rótulo (divide a 90)
export const LABEL_ON = 18;     // s: cuánto dura visible cada rótulo
export const N_CELLS = 56;
/** Instante del cuadro estático: dos rótulos de cliente a la vista. */
export const STATIC_T = 12;
export const CAM_C = 9;         // cámara de las células, en radios
export const LAYOUT = { cxFrac: 0.62, rFrac: 0.27, edge: 1.55 } as const;   // centro, radio (× lado menor) y margen derecho (× R)

/** Centro y radio (px CSS): derecha-centro, escala por el lado menor, sin salirse por la derecha. */
export const layout = (size: { w: number; h: number }): { cx: number; cy: number; R: number } => {
  const R = LAYOUT.rFrac * Math.min(size.w, size.h);
  return { cx: Math.min(LAYOUT.cxFrac * size.w, size.w - LAYOUT.edge * R), cy: 0.5 * size.h, R };
};
/** CSS equivalente de layout() dentro de un contenedor con container-type: size. */
export const LAYOUT_CSS = { left: `min(${LAYOUT.cxFrac * 100}%, calc(100% - ${+(LAYOUT.edge * LAYOUT.rFrac * 100).toFixed(2)}cqmin))`, top: '50%', R: LAYOUT.rFrac * 100 } as const;

type V3 = readonly [number, number, number];
export interface CellSpec {
  i: number; dir: V3; axis: V3; rho: number; w: number; kind: 0 | 1; size: number;
  stream: boolean; ph: number; named: number;            // named = índice en CLIENTS, o -1
}

const unit = (r: () => number): V3 => { const z = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - z * z); return [Math.cos(a) * s, Math.sin(a) * s, z]; };

export const cells = (seed: number): CellSpec[] => {
  const r = mulberry32(hashSeed('A20', seed, 'cells'));
  const out: CellSpec[] = [];
  let named = 0;
  for (let i = 0; i < N_CELLS; i++) {
    const stream = i % 4 === 3;
    const isNamed = !stream && named < CLIENTS.length && i % 3 === 0;   // los rotulados se reparten entre las que orbitan
    let dir = unit(r);
    if (stream) dir = [dir[0], dir[1], Math.abs(dir[2]) * 0.8 + 0.1];     // las que salen disparadas miran hacia la cámara
    const axis = unit(r);
    const rho = isNamed ? 1.5 + 0.55 * r() : 1.5 + 2.1 * Math.sqrt(r());
    const m = (1 + Math.floor(r() * 3)) * (r() < 0.5 ? -1 : 1);
    out.push({
      i, dir, axis, rho, w: (TAU * m) / CELL_T, kind: r() < 0.5 ? 0 : 1, size: 0.058 + 0.085 * r(),
      stream, ph: r(), named: isNamed ? named++ : -1,
    });
  }
  return out;
};

const smooth = (a: number, b: number, x: number): number => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Visibilidad (0..1) del rótulo del cliente nº k en el instante t: ventanas escalonadas que se repiten cada LABEL_T. */
export const labelWindow = (k: number, t: number): number => {
  if (k < 0) return 0;
  const u = ((((t - (k * LABEL_T) / Math.max(1, CLIENTS.length)) / LABEL_T) % 1) + 1) % 1;
  const on = LABEL_ON / LABEL_T;
  return smooth(0, 0.04, u) * (1 - smooth(on - 0.04, on, u));
};

export interface CellPos {
  i: number; x: number; y: number; z: number; s: number; r: number; alpha: number; kind: 0 | 1;
  stream: boolean; trail: number; tx: number; ty: number;   // estela: longitud (radios) y dirección (unitaria, hacia atrás)
  named: number; label: number;                              // label: ventana del rótulo (0 si no es cliente rotulado)
}

const rotY = (p: number[], a: number): void => { const c = Math.cos(a), s = Math.sin(a), x = p[0]!; p[0] = c * x + s * p[2]!; p[2] = -s * x + c * p[2]!; };
const rotX = (p: number[], a: number): void => { const c = Math.cos(a), s = Math.sin(a), y = p[1]!; p[1] = c * y - s * p[2]!; p[2] = s * y + c * p[2]!; };

export const cellAt = (c: CellSpec, t: number, tilt: readonly [number, number] = [0, 0]): CellPos => {
  let p: number[];
  let life = 1, grow = 1, trail = 0;
  if (c.stream) {
    const u = (((t / STREAM_T + c.ph) % 1) + 1) % 1;
    const rad = 1.25 + 3.0 * Math.pow(u, 1.15);
    p = [c.dir[0] * rad, c.dir[1] * rad, c.dir[2] * rad];
    life = smooth(0, 0.1, u) * (1 - smooth(0.8, 1, u));
    grow = 0.8 + 0.7 * u;
    trail = 0.12 + 0.9 * u;
  } else {
    const a = c.w * t, cs = Math.cos(a), sn = Math.sin(a), [kx, ky, kz] = c.axis, [vx, vy, vz] = c.dir;
    const d = kx * vx + ky * vy + kz * vz;
    const cx = ky * vz - kz * vy, cy = kz * vx - kx * vz, cz = kx * vy - ky * vx;
    p = [(vx * cs + cx * sn + kx * d * (1 - cs)) * c.rho, (vy * cs + cy * sn + ky * d * (1 - cs)) * c.rho, (vz * cs + cz * sn + kz * d * (1 - cs)) * c.rho];
  }
  rotX(p, tilt[1]); rotY(p, tilt[0]);
  const z = p[2]!, s = CAM_C / (CAM_C - Math.min(z, CAM_C - 1));
  const x = p[0]! * s, y = p[1]! * s, rr = Math.hypot(x, y) || 1e-4;
  const dep = Math.min(1, Math.max(0, (z + 3.6) / 7.2));
  // Detrás de la esfera, la célula se ve a través del polvo: más tenue dentro del disco.
  const hidden = z < 0 ? 0.35 + 0.65 * smooth(0.9, 1.2, rr) : 1;
  return {
    i: c.i, x, y, z, s, r: c.size * s * grow, alpha: (0.45 + 0.55 * dep) * life * hidden, kind: c.kind,
    stream: c.stream, trail: trail * s, tx: -x / rr, ty: -y / rr, named: c.named,
    label: c.named >= 0 ? labelWindow(c.named, t) * (z < -0.2 ? 0 : 1) * hidden : 0,
  };
};

/** Todas las células en el instante t, de la más lejana a la más cercana (orden de pintado). */
export const cellsAt = (specs: readonly CellSpec[], t: number, tilt: readonly [number, number] = [0, 0]): CellPos[] =>
  specs.map((c) => cellAt(c, t, tilt)).sort((a, b) => a.z - b.z);
