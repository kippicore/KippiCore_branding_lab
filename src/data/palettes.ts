import type { Hex, Palette, PaletteId, RoleKey, Roles } from '../contracts';
import raw from './palettes.json';
import meta from './palette-meta.json';

const ROLE_KEYS: readonly RoleKey[] = ['bg', 'surface', 'ink', 'muted', 'primary', 'accent'];
const HEX = /^#[0-9A-F]{6}$/;

const assertRoles = (id: string, mode: string, r: unknown): Roles => {
  const o = r as Record<string, unknown>;
  for (const k of ROLE_KEYS) {
    if (typeof o?.[k] !== 'string' || !HEX.test(o[k] as string)) throw new Error(`Paleta ${id} (${mode}): rol ${k} inválido`);
  }
  return o as unknown as Roles;
};

/** Valida una entrada del JSON y le añade concepto y riesgo de la spec (§2). */
export function assertPalette(p: unknown): Palette {
  const o = p as { id: string; name: string; reg: number; light: unknown; dark: unknown };
  const m = (meta as Record<string, { concept: string; risk: string }>)[o.id];
  if (!/^C\d\d$/.test(o.id) || !o.name || typeof o.reg !== 'number' || !m) throw new Error(`Paleta inválida: ${String(o.id)}`);
  return {
    id: o.id as PaletteId, name: o.name, reg: o.reg, concept: m.concept, risk: m.risk,
    light: assertRoles(o.id, 'light', o.light), dark: assertRoles(o.id, 'dark', o.dark),
  };
}

export const PALETTES: readonly Palette[] = (raw as unknown[]).map(assertPalette);

export const getPalette = (id: PaletteId): Palette => {
  const p = PALETTES.find((x) => x.id === id);
  if (!p) throw new Error(`Paleta desconocida: ${id}`);
  return p;
};

export type { Hex };
