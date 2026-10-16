import { describe, expect, it } from 'vitest';
import { pickAt } from './rotation';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const seq = (seed: number, n: number): string[] => Array.from({ length: n }, (_, i) => pickAt(IDS, seed, i));

describe('rotación equitativa', () => {
  it('es determinista por semilla y otra semilla cambia el orden', () => {
    expect(seq(7, 40)).toEqual(seq(7, 40));
    expect(seq(7, 11)).not.toEqual(seq(8, 11));
  });
  it('cada ronda de N pasos usa todas las opciones exactamente una vez', () => {
    const s = seq(3, IDS.length * 6);
    for (let r = 0; r < 6; r++) expect([...s.slice(r * IDS.length, (r + 1) * IDS.length)].sort()).toEqual([...IDS].sort());
  });
  it('nunca hay dos iguales seguidas, tampoco entre rondas', () => {
    for (const seed of [1, 2, 3, 99, 12345]) {
      const s = seq(seed, IDS.length * 20);
      for (let i = 1; i < s.length; i++) expect(s[i]).not.toBe(s[i - 1]);
    }
  });
  it('una sola opción: siempre esa; lista vacía falla', () => {
    expect(pickAt(['x'], 1, 5)).toBe('x');
    expect(() => pickAt([], 1, 0)).toThrow();
  });
});
