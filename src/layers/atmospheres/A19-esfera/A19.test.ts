import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createRecordingContext } from '../../../test/recording-context';
import { themeA, themeB } from '../../../test/two-themes';
import { create } from './dynamic';
import { paint } from './paint';
import { cloud, ROT_T, sample, waves } from './sphere';
import { dots, renderStatic } from './static';

const params = { speed: 1, density: 1, pointer: null };
const frameOf = (seed: number, t: number) => {
  const w = waves(seed), c = cloud(seed, 400);
  return Array.from({ length: c.n }, (_, i) => sample(w, c, i, t));
};

describe('A19 esfera', () => {
  it('determinista por semilla; otra semilla cambia el cuadro', () => {
    expect(frameOf(3, 12.5)).toEqual(frameOf(3, 12.5));
    expect(frameOf(3, 12.5)).not.toEqual(frameOf(4, 12.5));
    expect(JSON.stringify(dots(7))).toBe(JSON.stringify(dots(7)));
  });
  it('el movimiento se mueve y cierra el ciclo en ROT_T', () => {
    const a = frameOf(1, 0), b = frameOf(1, 7), c = frameOf(1, ROT_T);
    expect(b[10]!.x).not.toBeCloseTo(a[10]!.x, 3);
    a.forEach((s, i) => { expect(c[i]!.x).toBeCloseTo(s.x, 4); expect(c[i]!.fil).toBeCloseTo(s.fil, 4); });
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
  it('estático sin literales de color y paint solo con colores del tema', async () => {
    const html = renderToStaticMarkup(createElement('div', null, renderStatic(themeA, { seed: 1 })));
    expect(html.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
    const ra = createRecordingContext(), rb = createRecordingContext();
    await paint(ra.ctx, themeA, { w: 480, h: 300 }, { seed: 1 });
    await paint(rb.ctx, themeB, { w: 480, h: 300 }, { seed: 1 });
    const hexA = new Set(ra.colorsUsed().filter((c) => c.startsWith('#')));
    expect(hexA.size).toBeGreaterThan(2);
    for (const c of hexA) expect(rb.colorsUsed()).not.toContain(c);
  });
});
