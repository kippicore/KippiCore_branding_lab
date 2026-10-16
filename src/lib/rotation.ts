// Rotación aleatoria y equitativa de fondos: una «ronda» es una permutación de todas las opciones, así que cada
// una sale exactamente una vez antes de que cualquiera se repita, y nunca dos iguales seguidas (ni entre rondas).
import { hashSeed, mulberry32 } from './prng';

export const ROTATION_MS = 20000;   // cuánto dura cada fondo
export const FADE_MS = 2200;        // fundido cruzado entre un fondo y el siguiente

const bag = <T,>(items: readonly T[], seed: number, round: number, avoidFirst: T | undefined): T[] => {
  const r = mulberry32(hashSeed('rotation', seed, round));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  if (a.length > 1 && avoidFirst !== undefined && a[0] === avoidFirst) [a[0], a[1]] = [a[1]!, a[0]!];
  return a;
};

/** El elemento del paso `step` (0, 1, 2…) de la secuencia sembrada por `seed`. Función pura. */
export const pickAt = <T,>(items: readonly T[], seed: number, step: number): T => {
  const n = items.length;
  if (n === 0) throw new Error('pickAt: lista vacía');
  const round = Math.floor(step / n);
  let last: T | undefined;
  for (let k = 0; k < round; k++) last = bag(items, seed, k, last)[n - 1];
  return bag(items, seed, round, last)[step % n]!;
};
