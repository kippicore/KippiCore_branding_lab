import { describe, expect, it } from 'vitest';
import { themeA, themeB } from '../../../test/two-themes';
import { create, tideState, CYCLE_MS } from './dynamic';

const params = { speed: 1, density: 1, pointer: null };

describe('A15 Marea luminosa', () => {
  it('determinista por semilla: mismo (seed, t) → mismo estado; otra semilla cambia el alcance', () => {
    for (const t of [0, 3100, 9000, 27500, 61000]) expect(tideState(4, t)).toEqual(tideState(4, t));
    const runs = (seed: number) => Array.from({ length: 6 }, (_, c) => tideState(seed, c * CYCLE_MS + 10).run);
    expect(runs(4)).not.toEqual(runs(5));
  });
  it('ciclo continuo: el borde vuelve a la retirada y la espuma se apaga al cerrar el ciclo', () => {
    const end = tideState(1, CYCLE_MS - 1), start = tideState(1, CYCLE_MS);
    expect(end.runup).toBeLessThan(0.01);
    expect(start.runup).toBeLessThan(0.01);
    expect(end.resid).toBeLessThan(0.01);
    expect(tideState(1, CYCLE_MS * 0.3).runup).toBeCloseTo(1, 3);
  });
  it('inspectColors cambia por completo tras setTheme(B, 0)', () => {
    const inst = create({ theme: themeA, seed: 1, params });
    const before = inst.inspectColors!();
    inst.setTheme(themeB, 0);
    const after = inst.inspectColors!();
    expect(after.length).toBe(before.length);
    after.forEach((c, i) => expect(c).not.toBe(before[i]));
    expect(after.every((c) => /^#[0-9A-F]{6}$/.test(c))).toBe(true);
  });
});
