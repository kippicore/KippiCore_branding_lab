import { describe, expect, it } from 'vitest';
import { PALETTES } from '../data/palettes';
import { TYPE_SYSTEMS } from '../data/typography';
import type { Hex, Mode } from '../contracts';
import { contrastRatio } from './contrast';
import { hexToOklch, oklchToHex } from './oklch';
import { mix } from './color';
import { deriveTheme, TONE_STEPS } from './derive';
import { toCssVars } from './css-vars';
import { lerpTheme } from './interpolate';
import { mulberry32, hashSeed } from '../lib/prng';
import { blurImageData, luminancePercentiles } from '../lib/imageops';

const MODES: Mode[] = ['light', 'dark'];
const img = (w: number, h: number, f: (i: number) => number): ImageData => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) data.set([f(i), f(i), f(i), 255], i * 4);
  return { data, width: w, height: h, colorSpace: 'srgb' } as unknown as ImageData;
};

describe('contraste', () => {
  it('casos conocidos', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });
  // Excepciones documentadas (no se cambia el dato); se informan en el informe de P1.
  const EXC_INK: string[] = [];
  const EXC_MUTED: string[] = ['C08:light']; // 5.38 < 5.4 (dato de la spec, no se modifica)
  it('22 paletas × 2 modos: ink/bg ≥ 13 y muted/bg ≥ 5.4', () => {
    expect(PALETTES).toHaveLength(22);
    const bad: string[] = [];
    for (const p of PALETTES) for (const m of MODES) {
      const r = m === 'dark' ? p.dark : p.light;
      const k = `${p.id}:${m}`;
      if (contrastRatio(r.ink, r.bg) < 13 && !EXC_INK.includes(k)) bad.push(`${k} ink ${contrastRatio(r.ink, r.bg).toFixed(2)}`);
      if (contrastRatio(r.muted, r.bg) < 5.4 && !EXC_MUTED.includes(k)) bad.push(`${k} muted ${contrastRatio(r.muted, r.bg).toFixed(2)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('derive', () => {
  const byId = (id: string) => PALETTES.find((p) => p.id === id)!;
  it('accentIsFillOnly en claro para C07, C11, C17, C18, C19', () => {
    for (const id of ['C07', 'C11', 'C17', 'C18', 'C19']) expect(deriveTheme(byId(id), 'light').derived.accentIsFillOnly).toBe(true);
  });
  it('coral (C05 claro) lleva tinta sobre primario', () => {
    const t = deriveTheme(byId('C05'), 'light');
    expect(t.derived.onPrimary).toBe(t.roles.ink);
  });
  it('escalas: 11 pasos, L decreciente, hex válidos', () => {
    for (const p of PALETTES) for (const m of MODES) {
      const t = deriveTheme(p, m);
      for (const sc of [t.derived.scales.primary, t.derived.scales.accent]) {
        expect(Object.keys(sc)).toHaveLength(11);
        const Ls = TONE_STEPS.map((s) => { expect(sc[s]).toMatch(/^#[0-9A-F]{6}$/); return hexToOklch(sc[s])[0]; });
        for (let i = 1; i < Ls.length; i++) expect(Ls[i]!).toBeLessThan(Ls[i - 1]!);
      }
    }
  });
  it('memoiza y lerpTheme interpola', () => {
    const a = deriveTheme(byId('C01'), 'light'), b = deriveTheme(byId('C05'), 'dark');
    expect(deriveTheme(byId('C01'), 'light')).toBe(a);
    expect(lerpTheme(a, b, 0)).toBe(a);
    expect(lerpTheme(a, b, 1)).toBe(b);
    expect(lerpTheme(a, b, 0.5).roles.bg).not.toBe(a.roles.bg);
  });
});

describe('oklch y mix', () => {
  it('rojo puro', () => {
    const [L, C, h] = hexToOklch('#FF0000');
    expect(L).toBeCloseTo(0.628, 2); expect(C).toBeCloseTo(0.258, 2); expect(h).toBeCloseTo(29.2, 0);
  });
  it('ida y vuelta de las 264 cifras (≤ 1/255 por canal)', () => {
    const all: Hex[] = PALETTES.flatMap((p) => [...Object.values(p.light), ...Object.values(p.dark)]);
    expect(all).toHaveLength(264);
    for (const h of all) {
      const [l, c, hu] = hexToOklch(h);
      const back = oklchToHex(l, c, hu);
      for (let i = 1; i < 7; i += 2) expect(Math.abs(parseInt(h.slice(i, i + 2), 16) - parseInt(back.slice(i, i + 2), 16))).toBeLessThanOrEqual(1);
    }
  });
  it('mix', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mix('#12AB34', '#FFFFFF', 1)).toBe('#12AB34');
  });
});

describe('prng e imageops', () => {
  it('mulberry32 estable', () => {
    const r = mulberry32(1);
    const first = Array.from({ length: 5 }, () => r());
    const r2 = mulberry32(1);
    expect(Array.from({ length: 5 }, () => r2())).toEqual(first);
    expect(first[0]).toBeCloseTo(0.6270739405881613, 12);
    expect(hashSeed('A05', 1)).toBe(hashSeed('A05', 1));
    expect(hashSeed('A05', 1)).not.toBe(hashSeed('A05', 2));
  });
  it('blur conserva la media de una imagen plana', () => {
    const out = blurImageData(img(20, 20, () => 100), 4);
    for (let i = 0; i < out.data.length; i += 4) expect(Math.abs((out.data[i] as number) - 100)).toBeLessThanOrEqual(1);
  });
  it('percentiles en degradado', () => {
    const g = img(100, 1, (i) => Math.round((i / 99) * 255));
    const [p10, p90] = luminancePercentiles(g, undefined, [10, 90]);
    expect(p10!).toBeLessThan(p90!);
    expect(luminancePercentiles(g, undefined, [0, 100])[1]).toBeCloseTo(1, 2);
  });
});

describe('toCssVars y tipografías', () => {
  it('claves completas y sin undefined', () => {
    const t = deriveTheme(PALETTES[0]!, 'dark');
    const v = toCssVars(t, TYPE_SYSTEMS[14]);
    const need = ['bg', 'surface', 'ink', 'muted', 'primary', 'accent', 'on-primary', 'on-accent', 'accent-text', 'glow', 'glow-2', 'glow-mix',
      'ambient', 'bg-deep', 'smoke-base', 'on-smoke', 'muted-on-smoke', 'blend', 'mode', 'font-display', 'font-text', 'font-mono', 'font-accent',
      'display-weight', 'display-tracking', 'display-scale', 'display-transform', 'label-tracking',
      ...TONE_STEPS.flatMap((s) => [`primary-${s}`, `accent-${s}`])];
    for (const k of need) expect(v[`--kc-${k}`], k).toBeTruthy();
    expect(Object.values(v).every((x) => x !== undefined)).toBe(true);
    expect(t.cssVars['--kc-bg']).toBe(t.roles.bg);
  });
  it('familias dentro de googleFontsQuery; T14 correcta', () => {
    expect(TYPE_SYSTEMS).toHaveLength(15);
    for (const s of TYPE_SYSTEMS) {
      const q = s.googleFontsQuery.replace(/\+/g, ' ');
      for (const r of [s.display, s.text, s.mono, s.accent]) if (r) expect(q, `${s.id} ${r.family}`).toContain(`family=${r.family}`);
    }
    const t14 = TYPE_SYSTEMS.find((s) => s.id === 'T14')!;
    expect(t14.display.family).toBe('Archivo');
    expect(t14.display.headingWeight).toBe(800);
    expect(t14.display.tracking).toBe('-0.035em');
    expect(t14.reg).toBe(40);
  });
});
