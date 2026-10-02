import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DynamicLayerFactory, DynamicLayerInstance } from '../contracts';
import { createTicker, type Tickable } from '../lib/ticker';
import { themeA, themeB } from '../test/two-themes';
import { DynamicHost } from './DynamicHost';
import { Sim } from '../layers/atmospheres/A05-bioluminiscencia/sim';
import { create as createBio } from '../layers/atmospheres/A05-bioluminiscencia/dynamic';
import { create as createAurora } from '../layers/atmospheres/A01-aurora/dynamic';
import { create as createPlasma } from '../layers/atmospheres/A10-plasma/dynamic';
import { create as createRejilla } from '../layers/atmospheres/A11-rejilla/dynamic';

const fakeEnv = () => ({ request: vi.fn(() => 1), cancel: vi.fn() });
const params = { speed: 1, density: 1, pointer: null };

function mockInstance(): DynamicLayerInstance & Record<string, ReturnType<typeof vi.fn>> {
  return { mount: vi.fn(), resize: vi.fn(), setTheme: vi.fn(), setParams: vi.fn(), start: vi.fn(), stop: vi.fn(), frame: vi.fn(),
    capture: vi.fn(), dispose: vi.fn() } as never;
}
let ioCb: ((e: { isIntersecting: boolean }[]) => void) | null = null;
const emitVisible = (v: boolean) => act(() => { ioCb?.([{ isIntersecting: v }]); });

function setup(over: { reduced?: boolean } = {}) {
  const inst = mockInstance();
  const create = vi.fn(() => inst);
  const factory: DynamicLayerFactory = { id: 'A05', tech: 'css', cycleMs: 1000, usesPointer: false, load: async () => ({ create }) };
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: !!over.reduced && q.includes('reduce'), addEventListener() {}, removeEventListener() {} }));
  const env = fakeEnv();
  const tk = createTicker(env);
  const ui = <DynamicHost atmosphere={{ id: 'A05' }} theme={themeA} seed={1} speed={1} factory={factory} ticker={tk} />;
  return { inst, create, tk, ui };
}
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => {
  ioCb = null;
  vi.stubGlobal('IntersectionObserver', class { constructor(cb: never) { ioCb = cb; } observe() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('DynamicHost', () => {
  it('con prefers-reduced-motion no llama a create()', async () => {
    const { create, ui } = setup({ reduced: true });
    render(ui); await flush();
    expect(create).not.toHaveBeenCalled();
  });
  it('arranca visible, para al salir de pantalla y con pestaña oculta', async () => {
    const { inst, ui } = setup();
    render(ui); await flush();
    expect(inst.start).not.toHaveBeenCalled();          // aún no es visible
    emitVisible(true);
    expect(inst.start).toHaveBeenCalledTimes(1);
    emitVisible(false);
    expect(inst.stop).toHaveBeenCalledTimes(1);
    emitVisible(true);
    let hidden = false;
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
    hidden = true; act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(inst.stop).toHaveBeenCalledTimes(2);
    hidden = false; act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(inst.start).toHaveBeenCalledTimes(3);
  });
  it('al desmontar hace stop y dispose exactamente una vez', async () => {
    const { inst, ui } = setup();
    const r = render(ui); await flush(); emitVisible(true);
    r.unmount();
    expect(inst.stop).toHaveBeenCalledTimes(1);
    expect(inst.dispose).toHaveBeenCalledTimes(1);
  });
  it('resize recibe dpr ≤ 1.5 aunque devicePixelRatio = 3', async () => {
    vi.stubGlobal('devicePixelRatio', 3);
    const { inst, ui } = setup();
    render(ui); await flush();
    expect(inst.resize).toHaveBeenCalled();
    for (const c of (inst.resize as unknown as { mock: { calls: number[][] } }).mock.calls) expect(c[1]).toBeLessThanOrEqual(1.5);
  });
});

describe('Ticker', () => {
  const mk = () => { const env = fakeEnv(); return createTicker(env); };
  it('recorta dt a 50 ms', () => {
    const tk = mk(); const seen: number[] = [];
    const a: Tickable = { frame: (_t, dt) => seen.push(dt) };
    tk.add(a, { rampMs: 0, smoothMs: 0 });
    tk.tick(0); tk.tick(2000);
    expect(seen).toEqual([0, 50]);
  });
  it('speed = 2 duplica el avance de t', () => {
    const tk = mk(); const t: Record<string, number> = {};
    const a: Tickable = { frame: (x) => { t.a = x; } }, b: Tickable = { frame: (x) => { t.b = x; } };
    tk.add(a, { speed: 1, rampMs: 0, smoothMs: 0 }); tk.add(b, { speed: 2, rampMs: 0, smoothMs: 0 });
    for (let i = 0; i <= 10; i++) tk.tick(i * 16);
    expect(t.b).toBeCloseTo(2 * t.a!, 6);
  });
  it('se detiene solo cuando no quedan instancias y el tiempo se congela en pausa', () => {
    const env = fakeEnv(); const tk = createTicker(env);
    const a: Tickable = { frame() {} };
    tk.add(a, { rampMs: 0 }); tk.tick(0); tk.tick(30);
    const t = tk.timeOf(a);
    tk.remove(a);
    expect(env.cancel).toHaveBeenCalled(); expect(tk.running).toBe(false);
    tk.add(a, { rampMs: 0 }); tk.tick(1_000_000);
    expect(tk.timeOf(a)).toBe(t);                       // sin salto al volver
  });
});

describe('A05 determinismo', () => {
  it('misma semilla y tMs → mismas posiciones; otra semilla → distintas', () => {
    const run = (seed: number) => { const s = new Sim(seed, 0.625); s.advanceTo(8000); return s.particles.map((p) => [p.x, p.y]); };
    expect(run(7)).toEqual(run(7));
    expect(run(7)).not.toEqual(run(8));
  });
  it('el resultado no depende de cómo se parta el avance en cuadros', () => {
    const a = new Sim(3, 0.6); a.advanceTo(5000);
    const b = new Sim(3, 0.6); for (let t = 0; t <= 5000; t += 37) b.advanceTo(t); b.advanceTo(5000);
    expect(b.particles.map((p) => p.x)).toEqual(a.particles.map((p) => p.x));
  });
  it('t = 0 coincide con la posición inicial del estático y las 34 primeras sobreviven a la densidad', () => {
    const a = new Sim(5, 0.6, 34), b = new Sim(5, 0.6, 50);
    expect(a.particles.slice(0, 34).map((p) => [p.x, p.y])).toEqual(b.particles.slice(0, 34).map((p) => [p.x, p.y]));
    expect(a.brightness(0, 0)).toBe(1);
  });
});

describe('regla de oro dinámica', () => {
  const init = (theme = themeA) => ({ theme, seed: 1, params });
  const names = ['A01', 'A05', 'A10', 'A11'] as const;
  const makers = { A01: createAurora, A05: createBio, A10: createPlasma, A11: createRejilla };
  for (const n of names) {
    it(`${n}: inspectColors cambia por completo tras setTheme(B, 0)`, () => {
      const inst = makers[n](init());
      if (n === 'A05' || n === 'A11') inst.mount(document.createElement('div'));
      const before = inst.inspectColors!();
      inst.setTheme(themeB, 0);
      const after = inst.inspectColors!();
      expect(after.length).toBe(before.length);
      after.forEach((c, i) => expect(c).not.toBe(before[i]));
      expect(after.every((c) => /^#[0-9A-F]{6}$/.test(c))).toBe(true);
    });
  }
});
