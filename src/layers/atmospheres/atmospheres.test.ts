import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ATMOSPHERE_META } from '../../data/atmospheres';
import { createRecordingContext } from '../../test/recording-context';
import { themeA, themeB } from '../../test/two-themes';
import { ATMOSPHERES, getAtmosphere } from './index';

const size = { w: 480, h: 300 };
const colorsOf = async (id: string, theme: typeof themeA, seed = 1) => {
  const r = createRecordingContext();
  await getAtmosphere(id as never).paint(r.ctx, theme, size, { seed });
  return r;
};
const rgbOf = (c: string): string | null => {
  let m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m) return (m[1] as string).toUpperCase();
  const q = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
  if (!q) return null;
  return [q[1], q[2], q[3]].map((v) => (+(v as string)).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const colorSet = (list: string[]) => new Set(list.map(rgbOf).filter((x): x is string => !!x).filter((x) => x !== 'FFFFFF' && x !== '000000'));

describe('registro', () => {
  it('14 atmósferas, ids únicos, peso de la spec', () => {
    expect(ATMOSPHERES).toHaveLength(14);
    expect(new Set(ATMOSPHERES.map((a) => a.id)).size).toBe(14);
    expect(ATMOSPHERES.map((a) => a.weight)).toEqual(ATMOSPHERE_META.map((m) => m.weight));
    expect(ATMOSPHERES.map((a) => a.weight)).toEqual([0.35, 0.7, 0.6, 0.3, 0.2, 0.25, 0.25, 0.5, 0.45, 0.6, 0.25, 0.55, 0.55, 0.5]);
    for (const a of ATMOSPHERES) expect(a.staticCss().length).toBeGreaterThan(20);
  });
});

describe('regla de oro estática', () => {
  it('el marcado no contiene hex ni rgb( salvo blanco/negro', () => {
    for (const a of ATMOSPHERES) {
      const html = renderToStaticMarkup(createElement('div', null, a.renderStatic(themeA, { seed: 1 })));
      const hex = (html.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((h) => !/^#(FFFFFF|000000)$/i.test(h) && !/^#(fff|000)$/i.test(h) && !/^#kc-/.test(h));
      const rgb = (html.match(/rgba?\([^)]*\)/g) ?? []).filter((r) => !/^rgba?\(\s*(255,\s*255,\s*255|0,\s*0,\s*0)/.test(r));
      expect({ id: a.id, hex, rgb }).toEqual({ id: a.id, hex: [], rgb: [] });
      expect(html).toContain('isolation:isolate');
    }
  });
  it('el código fuente no contiene literales de color', () => {
    const raw = {
      ...import.meta.glob('./**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
      ...import.meta.glob('../shared/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
    } as Record<string, string>;
    const files = Object.keys(raw).filter((f) => !/\.test\./.test(f));
    expect(files.length).toBeGreaterThan(30);
    for (const f of files) {
      const src = (raw[f] as string).replace(/#(FFFFFF|000000)\b/gi, '').replace(/rgba\(255,\s*255,\s*255|rgba\(0,\s*0,\s*0/g, '');
      const hits = src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])|\brgba?\(\s*\d|\bhsla?\(/g) ?? [];
      expect({ f, hits: hits.filter((h: string) => !/#kc/.test(h)) }).toEqual({ f, hits: [] });
    }
  });
});

describe('regla de oro canvas', () => {
  it('ningún color del tema A aparece con el tema B', async () => {
    for (const a of ATMOSPHERES) {
      const A = colorSet((await colorsOf(a.id, themeA)).colorsUsed());
      const B = colorSet((await colorsOf(a.id, themeB)).colorsUsed());
      expect(A.size, a.id).toBeGreaterThan(0);
      for (const c of A) expect(B.has(c), `${a.id} ${c}`).toBe(false);
    }
  });
});

describe('semilla', () => {
  it('misma semilla → mismas operaciones; otra → distintas (A04, A05)', async () => {
    for (const id of ['A04', 'A05']) {
      const a = (await colorsOf(id, themeA, 5)).colorsUsed().join('|');
      const b = (await colorsOf(id, themeA, 5)).colorsUsed().join('|');
      expect(a).toBe(b);
    }
    const pos = (id: string, seed: number) => JSON.stringify(getAtmosphere(id as never).renderStatic(themeA, { seed }), (_k: string, v: unknown) => (typeof v === 'function' ? undefined : v));
    for (const id of ['A04', 'A05']) expect(pos(id, 5)).not.toBe(pos(id, 6));
  });
});
