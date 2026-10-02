import { describe, expect, it } from 'vitest';
import { themeA, themeB } from '../../../test/two-themes';
import { createField, stepField, STEP_MS, MAX_PARTICLES } from './field';
import { create } from './dynamic';

const params = { speed: 1, density: 1, pointer: null };
const run = (seed: number, steps: number) => {
  const f = createField(seed);
  for (let i = 1; i <= steps; i++) stepField(f, (i * STEP_MS) / 1000, STEP_MS / 1000);
  return Array.from(f.u.slice(0, 40)).concat(Array.from(f.v.slice(0, 40)));
};

describe('A16 Plancton', () => {
  it('es determinista por semilla', () => {
    expect(run(7, 300)).toEqual(run(7, 300));
    expect(run(7, 300)).not.toEqual(run(8, 300));
  });
  it('no supera 900 partículas y las posiciones son finitas', () => {
    const f = createField(3);
    expect(f.n).toBeLessThanOrEqual(900);
    expect(f.n).toBe(MAX_PARTICLES);
    for (let i = 1; i <= 600; i++) stepField(f, (i * STEP_MS) / 1000, STEP_MS / 1000);
    expect(Array.from(f.u).every(Number.isFinite) && Array.from(f.v).every(Number.isFinite)).toBe(true);
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
  it('mount/frame/capture/dispose no lanzan', async () => {
    const inst = create({ theme: themeB, seed: 2, params });
    const host = document.createElement('div');
    inst.mount(host); inst.resize({ w: 320, h: 200 }, 1); inst.start();
    inst.frame(0, 16); inst.frame(5000, 50); inst.setParams({ density: 1.5 }); inst.frame(5050, 50);
    await inst.capture();
    inst.stop(); inst.dispose();
  });
});
