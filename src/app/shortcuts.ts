import type { AtmosphereId, GlassId, LabState, PaletteId, TemplateId, TypeId } from '../contracts';

export interface ShortcutLists {
  types: readonly TypeId[];
  palettes: readonly PaletteId[];
  atmospheres: readonly AtmosphereId[];
  glasses: readonly GlassId[];
}
export type ShortcutResult = { patch: Partial<LabState> } | { help: true } | null;
export interface Shortcut { label: string; description: string }

const cycle = <T,>(list: readonly T[], cur: T, dir: 1 | -1): T | null => {
  if (list.length === 0) return null;
  const i = list.indexOf(cur);
  return list[(i + dir + list.length * 2) % list.length] ?? null;
};
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const stepSpeed = (v: number, dir: 1 | -1): number => {
  const i = SPEEDS.reduce((best, x, k) => (Math.abs(x - v) < Math.abs((SPEEDS[best] ?? 1) - v) ? k : best), 0);
  return SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, i + dir))] ?? v;
};
const patchOf = <K extends keyof LabState>(key: K, v: LabState[K] | null): ShortcutResult => (v === null ? null : { patch: { [key]: v } });

/** Tabla única de la ayuda; la lógica vive en resolveShortcut. */
export const SHORTCUTS: readonly Shortcut[] = [
  { label: 't / T', description: 'Tipografía siguiente / anterior' },
  { label: 'c / C', description: 'Paleta siguiente / anterior' },
  { label: 'a / A', description: 'Atmósfera siguiente / anterior' },
  { label: 'g / G', description: 'Vidrio siguiente / anterior' },
  { label: 'm', description: 'Alternar claro / oscuro' },
  { label: 'd', description: 'Alternar estático / dinámico' },
  { label: '[ / ]', description: 'Velocidad menor / mayor' },
  { label: '1 / 2', description: 'Plantilla: portada web / tarjeta de pedido' },
  { label: '?', description: 'Mostrar esta ayuda' },
];

const TEMPLATE_KEYS: Record<string, TemplateId> = { '1': 'hero', '2': 'order-card' };

/** Tecla → resultado. Las mayúsculas van hacia atrás en los ciclos. */
export const resolveShortcut = (key: string, s: LabState, l: ShortcutLists): ShortcutResult => {
  const lower = key.toLowerCase();
  if (key === '?') return { help: true };
  if (key === '[' || key === ']') return { patch: { speed: stepSpeed(s.speed, key === ']' ? 1 : -1) } };
  const tpl = TEMPLATE_KEYS[key];
  if (tpl) return { patch: { template: tpl } };
  const dir: 1 | -1 = key !== lower ? -1 : 1;
  switch (lower) {
    case 't': return patchOf('type', cycle(l.types, s.type, dir));
    case 'c': return patchOf('palette', cycle(l.palettes, s.palette, dir));
    case 'a': return patchOf('atmosphere', cycle(l.atmospheres, s.atmosphere, dir));
    case 'g': return patchOf('glass', cycle(l.glasses, s.glass, dir));
    case 'm': return ({ patch: { mode: s.mode === 'dark' ? 'light' : 'dark' } });
    case 'd': return ({ patch: { motion: s.motion === 'dynamic' ? 'static' : 'dynamic' } });
    default: return null;
  }
};

/** true si el evento nace en un campo que consume teclas (texto, select, rango, editable). */
export const isTypingTarget = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !['checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type);
  return el.isContentEditable === true;
};

export const handleShortcutEvent = (e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'>, s: LabState, l: ShortcutLists): ShortcutResult => {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (isTypingTarget(e.target)) return null;
  return resolveShortcut(e.key, s, l);
};
