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

describe('A19 esfera: redondez', () => {
  it('la cáscara es una esfera exacta (radio 3D = 1) en cualquier instante y con inclinación del puntero', () => {
    const w = waves(5), c = cloud(5, 3000);
    for (const t of [0, 7.3, 31, 64.9]) {
      for (let i = 0; i < c.n; i++) {
        const len0 = Math.hypot(c.pos[i * 3]!, c.pos[i * 3 + 1]!, c.pos[i * 3 + 2]!);
        if (len0 < 0.999 || c.rand[i * 4 + 1]! > 0.5) continue;                  // solo cáscara; sin polvo interior ni partículas que se desprenden
        const s = sample(w, c, i, t, [0.1, -0.08]);
        expect(Math.hypot(s.x / s.s, s.y / s.s, s.z)).toBeCloseTo(1, 3);
      }
    }
  });
  it('el polvo interior queda dentro y lo que se desprende es una fracción pequeña', () => {
    const c = cloud(5, 9000);
    let out = 0;
    for (let i = 0; i < c.n; i++) {
      const len0 = Math.hypot(c.pos[i * 3]!, c.pos[i * 3 + 1]!, c.pos[i * 3 + 2]!);
      if (c.rand[i * 4 + 1]! > 0.5) out++; else expect(len0).toBeLessThanOrEqual(1.0001);
    }
    expect(out / c.n).toBeLessThan(0.025);
  });
});
