import { describe, expect, it } from 'vitest';
import type { AtmosphereLayer, LegibilityInput } from '../contracts';
import { getGlass } from '../layers/glass';
import { contrastRatio, verdict } from '../theme/contrast';
import { themeA } from '../test/two-themes';
import { autoVeil } from './auto-veil';
import { makeImageData } from './glass-model';
import { measureLegibility, type MeasureDeps } from './measure';

const W = 200, H = 120;
const flat = (v: number): ImageData => {
  const d = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < d.length; i += 4) { d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255; }
  return makeImageData(d, W, H);
};
const deps = (v: number): MeasureDeps => ({ raster: async () => flat(v), overlays: false });
const input = (veil: number, glassId: 'G01' | 'G05' = 'G01'): LegibilityInput => ({
  atmosphere: { id: 'A01', weight: 0.5 } as unknown as AtmosphereLayer,
  glass: getGlass(glassId), theme: themeA, params: { veil, blur: 18 },
  stage: { w: W, h: H }, glassRect: { x: 0, y: 0, w: W, h: H },
  primaryRect: { x: 10, y: 10, w: 100, h: 20 }, mutedRect: { x: 10, y: 50, w: 100, h: 20 }, seed: 1,
});

describe('measureLegibility', () => {
  it('fondo plano sin velo = contraste calculado a mano (± 0.05)', async () => {
    const r = await measureLegibility(input(0), deps(128));
    expect(Math.abs(r.primary.worstRatio - contrastRatio(themeA.roles.ink, '#808080'))).toBeLessThan(0.05);
    expect(Math.abs(r.muted.worstRatio - contrastRatio(themeA.roles.muted, '#808080'))).toBeLessThan(0.05);
    expect(r.sampledPixels).toBeGreaterThan(0);
  });

  it('velo 100 % sobre cualquier fondo = contraste ink/surface', async () => {
    for (const v of [0, 90, 255]) {
      const r = await measureLegibility(input(100), deps(v));
      expect(Math.abs(r.primary.worstRatio - contrastRatio(themeA.roles.ink, themeA.roles.surface))).toBeLessThan(0.05);
      expect(Math.abs(r.muted.worstRatio - contrastRatio(themeA.roles.muted, themeA.roles.surface))).toBeLessThan(0.05);
    }
  });

  it('G05 usa onSmoke como texto', async () => {
    const r = await measureLegibility(input(55, 'G05'), deps(200));
    expect(r.primary.textColor).toBe(themeA.derived.onSmoke);
    expect(r.muted.textColor).toBe(themeA.derived.mutedOnSmoke);
  });
});

describe('autoVeil', () => {
  it('el contraste es monótono con el velo y autoVeil se detiene en el primero que cumple', async () => {
    let prev = 0;
    for (let v = 0; v <= 95; v += 5) {
      const r = await measureLegibility(input(v), deps(128));
      expect(r.muted.worstRatio).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = r.muted.worstRatio;
    }
    const res = await autoVeil(input(0), 4.5, deps(128));
    expect(res.reached).toBe(true);
    expect(res.result.muted.worstRatio).toBeGreaterThanOrEqual(4.5);
    if (res.veil > 0) {
      const below = await measureLegibility(input(res.veil - 1), deps(128));
      expect(below.muted.worstRatio).toBeLessThan(4.5);
    }
  });

  it('si el velo actual ya cumple, no lo sube; si no se alcanza, reached = false', async () => {
    expect((await autoVeil(input(95), 4.5, deps(128))).veil).toBe(95);
    const imposible = await autoVeil(input(10), 21, deps(128));
    expect(imposible.reached).toBe(false);
    expect(imposible.veil).toBe(95);
  });
});

describe('veredicto', () => {
  it('umbrales exactos', () => {
    expect(verdict(6.99)).toBe('suficiente');
    expect(verdict(7)).toBe('excelente');
    expect(verdict(4.5)).toBe('suficiente');
    expect(verdict(4.49)).toBe('solo-grande');
    expect(verdict(3)).toBe('solo-grande');
    expect(verdict(2.99)).toBe('insuficiente');
  });
});
