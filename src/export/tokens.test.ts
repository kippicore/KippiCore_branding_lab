import { describe, expect, it } from 'vitest';
import type { AtmosphereLayer, GlassLayer, LabState } from '../contracts';
import { getPalette } from '../data/palettes';
import { getTypeSystem } from '../data/typography';
import { parseState } from '../lib/url-state';
import { deriveTheme } from '../theme/derive';
import { buildTokenBundle, toCssFile, toJsonFile, tokenFileName } from './tokens';

const state: LabState = parseState('?c=C05&t=T00&a=A01&g=G01&m=light', { reducedMotion: false });
const pal = getPalette('C05');
const atmosphere = { id: 'A01', name: 'Aurora', staticCss: () => '.kc-a01 { background: var(--kc-ambient); }' } as unknown as AtmosphereLayer;
const glass = { id: 'G01', name: 'Esmerilado', css: '.kc-glass--G01 { backdrop-filter: blur(var(--kc-glass-blur)); }' } as unknown as GlassLayer;
const bundle = buildTokenBundle({
  theme: deriveTheme(pal, 'light'), type: getTypeSystem('T00'), atmosphere, glass,
  params: { veil: 55, blur: 18 }, state,
});

describe('export de tokens', () => {
  it('toCssFile: roles con los hex de la spec, fuentes y snapshot de cabecera', () => {
    const css = toCssFile(bundle);
    for (const [k, v] of Object.entries(pal.light)) {
      const cssKey = k === 'accent' || k === 'primary' || k === 'bg' || k === 'surface' || k === 'ink' || k === 'muted' ? k : k;
      expect(css).toContain(`--kc-${cssKey}: ${v};`);
    }
    expect(css).toContain('--kc-font-display:');
    expect(css).toContain('--kc-label-tracking:');
    expect(css).toContain('@import url(');
    expect(css.split(':root')[0]).toMatchSnapshot();
  });
  it('toJsonFile es JSON válido con el código de la combinación', () => {
    expect(JSON.parse(toJsonFile(bundle)).code).toBe('C05 · T00 · A01 · G01');
  });
  it('nombre de archivo', () => {
    expect(tokenFileName(bundle, 'css')).toBe('kippicore-C05-T00-A01-G01-light.css');
  });
});
