import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { LabState } from '../../contracts';
import { DEFAULT_STATE, comboCode } from '../../lib/url-state';
import { handleShortcutEvent, resolveShortcut, type ShortcutLists } from '../../app/shortcuts';
import { filterByReg, regBand } from '../Galerias/filter';

vi.mock('../../layers/atmospheres', () => ({ ATMOSPHERES: [], getAtmosphere: () => { throw new Error('x'); } }));
vi.mock('../../layers/glass', () => ({ GLASSES: [], getGlass: () => { throw new Error('x'); } }));
vi.mock('../../layers/glass/Glass', () => ({ Glass: () => null }));
vi.mock('../../runtime/AtmosphereView', () => ({ AtmosphereView: () => null }));
vi.mock('../../lib/clipboard', () => ({ copyText: vi.fn(async () => {}) }));

import { Ficha, resolveFicha } from '../Ficha/Ficha';
import { CodeBar, fullCode } from '../Combinador/CodeBar';

const S: LabState = { ...DEFAULT_STATE };
const L: ShortcutLists = { types: ['T00', 'T02', 'T03'], palettes: ['C05', 'C08'], atmospheres: ['A01', 'A02'], glasses: ['G01', 'G02'] };
beforeEach(() => cleanup());

describe('atajos', () => {
  it('cambian el estado correcto', () => {
    expect(resolveShortcut('t', { ...S, type: 'T00' }, L)).toEqual({ patch: { type: 'T02' } });
    expect(resolveShortcut('T', { ...S, type: 'T00' }, L)).toEqual({ patch: { type: 'T03' } });
    expect(resolveShortcut('c', { ...S, palette: 'C08' }, L)).toEqual({ patch: { palette: 'C05' } });
    expect(resolveShortcut('m', { ...S, mode: 'dark' }, L)).toEqual({ patch: { mode: 'light' } });
    expect(resolveShortcut('d', { ...S, motion: 'dynamic' }, L)).toEqual({ patch: { motion: 'static' } });
    expect(resolveShortcut(']', { ...S, speed: 1 }, L)).toEqual({ patch: { speed: 1.25 } });
    expect(resolveShortcut('[', { ...S, speed: 0.25 }, L)).toEqual({ patch: { speed: 0.25 } });
    expect(resolveShortcut('2', S, L)).toEqual({ patch: { template: 'order-card' } });
    expect(resolveShortcut('?', S, L)).toEqual({ help: true });
  });
  it('se ignoran dentro de campos y con modificadores', () => {
    const input = document.createElement('input'); input.type = 'text';
    const select = document.createElement('select');
    expect(handleShortcutEvent({ key: 't', ctrlKey: false, metaKey: false, altKey: false, target: input }, S, L)).toBeNull();
    expect(handleShortcutEvent({ key: 't', ctrlKey: false, metaKey: false, altKey: false, target: select }, S, L)).toBeNull();
    expect(handleShortcutEvent({ key: 't', ctrlKey: true, metaKey: false, altKey: false, target: document.body }, S, L)).toBeNull();
  });
  it('listas vacías no producen cambios', () => {
    expect(resolveShortcut('a', S, { ...L, atmospheres: [] })).toBeNull();
  });
});

describe('filtro de registro', () => {
  const items = [{ reg: 35 }, { reg: 36 }, { reg: 64 }, { reg: 65 }, { reg: null }];
  it('aplica los rangos del plan §3.5', () => {
    expect(regBand(35)).toBe('enterprise'); expect(regBand(36)).toBe('equilibrio');
    expect(regBand(64)).toBe('equilibrio'); expect(regBand(65)).toBe('pyme');
    expect(filterByReg(items, 'enterprise')).toHaveLength(1);
    expect(filterByReg(items, 'equilibrio')).toHaveLength(2);
    expect(filterByReg(items, 'pyme')).toHaveLength(1);
    expect(filterByReg(items, 'all')).toHaveLength(5);
  });
});

describe('Ficha', () => {
  it('resuelve paletas y tipografías; ids inválidos dan null', () => {
    expect(resolveFicha('C05')?.kind).toBe('C');
    expect(resolveFicha('T14')?.kind).toBe('T');
    expect(resolveFicha('A99')).toBeNull();   // registro vacío en este test
    expect(resolveFicha('G01')).toBeNull();
    expect(resolveFicha('X01')).toBeNull();
    expect(resolveFicha(null)).toBeNull();
  });
  it('muestra «no encontrado» para ids inválidos', () => {
    render(<Ficha state={{ ...S, view: 'ficha', ficha: 'Z99' }} setState={() => {}} />);
    expect(screen.getByRole('alert').textContent).toMatch(/No encontrado/);
  });
  it('renderiza la ficha de una paleta con tabla de contraste', () => {
    render(<Ficha state={{ ...S, view: 'ficha', ficha: 'C05' }} setState={() => {}} />);
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('Usar en el combinador')).toBeTruthy();
  });
});

describe('CodeBar', () => {
  it('coincide con comboCode', () => {
    render(<CodeBar state={S} />);
    const t = screen.getByTestId('combo-code').textContent ?? '';
    expect(t.startsWith(comboCode(S))).toBe(true);
    expect(t).toBe(fullCode(S));
    fireEvent.click(screen.getByText('Copiar código'));
  });
});
