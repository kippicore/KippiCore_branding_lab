import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CLIENTS } from '../../../data/clients';
import { createRecordingContext } from '../../../test/recording-context';
import { themeA, themeB } from '../../../test/two-themes';
import { create } from './dynamic';
import { paint } from './paint';
import { CELL_T, cellAt, cells, cellsAt, labelWindow, LABEL_T, N_CELLS, STATIC_T } from './cells';
import { renderStatic } from './static';

const params = { speed: 1, density: 1, pointer: null };

describe('A20 ecosistema', () => {
  it('determinista por semilla; otra semilla cambia las células', () => {
    expect(cellsAt(cells(3), 12.5)).toEqual(cellsAt(cells(3), 12.5));
    expect(cellsAt(cells(3), 12.5)).not.toEqual(cellsAt(cells(4), 12.5));
  });
  it('hay N células y todos los clientes tienen una célula que los rotula', () => {
    const specs = cells(1);
    expect(specs).toHaveLength(N_CELLS);
    const named = specs.filter((c) => c.named >= 0).map((c) => c.named).sort();
    expect(named).toEqual(CLIENTS.map((_, i) => i));
    expect(specs.filter((c) => c.named >= 0).every((c) => !c.stream)).toBe(true);
  });
  it('se mueve y cierra el ciclo en CELL_T', () => {
    const specs = cells(2);
    let moved = 0;
    specs.forEach((c) => {
      const a = cellAt(c, 0), b = cellAt(c, 9), e = cellAt(c, CELL_T);
      if (Math.hypot(b.x - a.x, b.y - a.y) > 0.01) moved++;
      expect(e.x).toBeCloseTo(a.x, 4); expect(e.y).toBeCloseTo(a.y, 4); expect(e.label).toBeCloseTo(a.label, 6);
    });
    expect(moved).toBeGreaterThan(specs.length * 0.85);
  });
  it('los rótulos entran y salen: ventana escalonada y periódica', () => {
    expect(labelWindow(0, 5)).toBeGreaterThan(0.9);
    expect(labelWindow(0, 30)).toBe(0);
    expect(labelWindow(0, 5 + LABEL_T)).toBeCloseTo(labelWindow(0, 5), 6);
    const visible = [0, 1, 2, 3, 4, 5].filter((k) => labelWindow(k, STATIC_T) > 0.5);
    expect(visible.length).toBeGreaterThanOrEqual(2);
    expect(labelWindow(-1, 5)).toBe(0);
  });
  it('inspectColors cambia por completo tras setTheme(B, 0)', () => {
    const inst = create({ theme: themeA, seed: 1, params });
    const before = inst.inspectColors!();
    inst.setTheme(themeB, 0);
    const after = inst.inspectColors!();
    expect(after.length).toBe(before.length);
    after.forEach((c, i) => expect(c).not.toBe(before[i]));
  });
  it('estático sin literales de color y paint solo con colores del tema', async () => {
    const html = renderToStaticMarkup(createElement('div', null, renderStatic(themeA, { seed: 1 })));
    expect(html.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
    expect(html).toContain(CLIENTS[0]!.name.toUpperCase());
    const ra = createRecordingContext(), rb = createRecordingContext();
    await paint(ra.ctx, themeA, { w: 480, h: 300 }, { seed: 1 });
    await paint(rb.ctx, themeB, { w: 480, h: 300 }, { seed: 1 });
    const hexA = new Set(ra.colorsUsed().filter((c) => c.startsWith('#')));
    expect(hexA.size).toBeGreaterThan(2);
    for (const c of hexA) expect(rb.colorsUsed()).not.toContain(c);
  });
});
