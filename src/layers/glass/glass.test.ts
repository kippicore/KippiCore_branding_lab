// @ts-ignore: el proyecto no instala @types/node; solo se usa en esta prueba
import { readdirSync, readFileSync } from 'node:fs';
// @ts-ignore
import { dirname, join } from 'node:path';
// @ts-ignore
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GLASSES, getGlass } from './index';
import { createRecordingContext } from '../../test/recording-context';
import { themeA, themeB } from '../../test/two-themes';

// Regla de oro (spec §5.3.4): solo blanco, negro y transparent; todo lo demás, por var(--kc-*).
// En Vitest `?raw` sobre .css llega vacío (el CSS se procesa); se lee del disco. En Vite sí llega.
const dir = dirname(fileURLToPath(import.meta.url));
const CSS: Record<string, string> = Object.fromEntries(readdirSync(dir).filter((d: string) => /^G\d\d-/.test(d))
  .map((d: string) => [d.slice(0, 3), readFileSync(join(dir, d, 'glass.css'), 'utf8')]));
const stripComments = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '');
const isWhiteOrBlack = (c: string): boolean => /^rgba?\(\s*(255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)\s*[,)]/.test(c.trim());

describe('vidrios G01–G08', () => {
  it('hay 10 vidrios con ids únicos y CSS no vacío', () => {
    expect(GLASSES.map((g) => g.id)).toEqual(['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08']);
    for (const g of GLASSES) { expect(CSS[g.id]).toContain(g.className); expect(CSS[g.id]).toContain('backdrop-filter'); }
  });

  it('regla de oro: el CSS no contiene colores salvo blanco/negro/transparent', () => {
    for (const g of GLASSES) {
      const css = stripComments(CSS[g.id] as string);
      const hexes = (css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((h) => !/^#(0{3}|0{6}|f{3}|f{6})$/i.test(h));
      expect(hexes, `${g.id} hex`).toEqual([]);
      const fns = css.match(/\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\([^)]*\)/g) ?? [];
      expect(fns.filter((c) => !isWhiteOrBlack(c)), `${g.id} funciones de color`).toEqual([]);
      expect(css, `${g.id} nombres`).not.toMatch(/:[^;{}]*\b(red|blue|green|yellow|orange|purple|pink|gray|grey|navy|teal|gold|silver)\b/i);
    }
  });

  it('el velo y el desenfoque salen de variables; G05 usa la base del ahumado por variable', () => {
    for (const g of GLASSES) expect(CSS[g.id]).toContain('--kc-glass-blur');
    expect(CSS.G05).toContain('var(--kc-smoke-base)');
    expect(getGlass('G05').text).toBe('smoke');
  });

  it('paintOverlays con dos temas no comparte colores de tema', () => {
    const rect = { x: 0, y: 0, w: 240, h: 140 };
    for (const g of GLASSES) {
      if (!g.model.paintOverlays) continue;
      const used = (theme: typeof themeA): Set<string> => {
        const rec = createRecordingContext();
        g.model.paintOverlays?.(rec.ctx, theme, rect, g.defaults);
        return new Set(rec.colorsUsed().filter((c) => /^(#|rgb)/.test(c) && !isWhiteOrBlack(c)));
      };
      const a = used(themeA), b = used(themeB);
      for (const c of a) expect(b.has(c), `${g.id} comparte ${c}`).toBe(false);
    }
    // G07 sí pinta colores de tema
    for (const id of ['G07'] as const) {
      const rec = createRecordingContext();
      getGlass(id).model.paintOverlays?.(rec.ctx, themeA, rect, getGlass(id).defaults);
      expect(rec.colorsUsed().some((c) => !isWhiteOrBlack(c))).toBe(true);
    }
  });

  it('máscara de G08', () => {
    const g08 = getGlass('G08').model.blurMaskAt!;
    expect(g08(0)).toBe(1); expect(g08(0.35)).toBe(1); expect(g08(1)).toBeCloseTo(0.25);
  });
});
