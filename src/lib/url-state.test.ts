import { describe, expect, it } from 'vitest';
import type { LabState } from '../contracts';
import { comboCode, DEFAULT_STATE, parseState, serializeState } from './url-state';
import { mulberry32 } from './prng';

const pad = (n: number): string => String(n).padStart(2, '0');
const randomState = (rnd: () => number): LabState => {
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)]!;
  return {
    view: pick(['combinador', 'galerias', 'ficha'] as const),
    palette: `C${pad(1 + Math.floor(rnd() * 22))}` as LabState['palette'],
    type: `T${pad(Math.floor(rnd() * 15))}` as LabState['type'],
    atmosphere: `A${pad(1 + Math.floor(rnd() * 14))}` as LabState['atmosphere'],
    glass: `G${pad(1 + Math.floor(rnd() * 10))}` as LabState['glass'],
    mode: pick(['light', 'dark'] as const),
    motion: pick(['static', 'dynamic'] as const),
    speed: pick([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]),
    veil: rnd() < 0.5 ? null : Math.floor(rnd() * 101),
    blur: rnd() < 0.5 ? null : Math.floor(rnd() * 61),
    template: pick(['hero', 'order-card'] as const),
    seed: Math.floor(rnd() * 100000),
    gallery: pick(['T', 'C', 'A', 'G'] as const),
    reg: pick(['all', 'enterprise', 'equilibrio', 'pyme'] as const),
    ficha: rnd() < 0.5 ? null : `A${pad(1 + Math.floor(rnd() * 14))}`,
  };
};
const env = { reducedMotion: false };

describe('url-state', () => {
  it('round-trip en 50 estados aleatorios', () => {
    const rnd = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const s = randomState(rnd);
      expect(parseState(serializeState(s), env)).toEqual(s);
    }
  });
  it('el estado por defecto serializa a vacío y se recupera', () => {
    expect(serializeState(DEFAULT_STATE)).toBe('');
    expect(parseState('', env)).toEqual(DEFAULT_STATE);
  });
  it('parámetros inválidos caen al defecto', () => {
    const s = parseState('?c=C99&t=XX&a=A00&g=G11&m=sepia&mv=z&sp=3&v=500&b=-2&tpl=x&s=abc&gt=Q&r=zz&view=nada&id=%3Cb%3E', env);
    expect(s).toEqual(DEFAULT_STATE);
  });
  it('reducedMotion fuerza static solo si mv no viene', () => {
    expect(parseState('', { reducedMotion: true }).motion).toBe('static');
    expect(parseState('?mv=d', { reducedMotion: true }).motion).toBe('dynamic');
  });
  it('comboCode', () => {
    expect(comboCode(DEFAULT_STATE)).toBe('C20 · T00 · A05 · G01');
  });
});
