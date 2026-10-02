import { describe, expect, it, vi } from 'vitest';
import { themeA, themeB } from '../../../test/two-themes';
import { create } from './dynamic';

const params = { speed: 1, density: 1, pointer: null };

describe('A18 Resplandor', () => {
  it('determinista por semilla (inspectColors y frame sin superficie)', () => {
    const a = create({ theme: themeA, seed: 7, params }), b = create({ theme: themeA, seed: 7, params });
    a.frame(1234, 16); b.frame(1234, 16);
    expect(a.inspectColors!()).toEqual(b.inspectColors!());
  });
  it('no usa Date.now ni Math.random', () => {
    const d = vi.spyOn(Date, 'now'), r = vi.spyOn(Math, 'random');
    const i = create({ theme: themeA, seed: 3, params });
    i.frame(100, 16); i.setTheme(themeB, 0);
    expect(d).not.toHaveBeenCalled(); expect(r).not.toHaveBeenCalled();
    d.mockRestore(); r.mockRestore();
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
