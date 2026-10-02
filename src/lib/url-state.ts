import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type {
  AtmosphereId, GalleryTab, GlassId, LabState, Mode, Motion, PaletteId, RegFilter, TemplateId, TypeId, ViewId,
} from '../contracts';

/** Defaults: dirección D-D de la spec (plan §4.6). */
export const DEFAULT_STATE: LabState = {
  view: 'combinador', palette: 'C20', type: 'T00', atmosphere: 'A05', glass: 'G01', mode: 'dark',
  motion: 'dynamic', speed: 1, veil: null, blur: null, template: 'hero', seed: 1, gallery: 'T', reg: 'all', ficha: null,
};

const oneOf = <T extends string>(v: string | null, list: readonly T[], d: T): T =>
  v !== null && (list as readonly string[]).includes(v) ? (v as T) : d;
const idIn = <T extends string>(v: string | null, re: RegExp, max: number, d: T, min = 1): T => {
  if (v === null || !re.test(v)) return d;
  const n = Number(v.slice(1));
  return n >= min && n <= max ? (v as T) : d;
};
const num = (v: string | null, min: number, max: number): number | null => {
  if (v === null || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

/** Texto de la URL → estado. Cualquier valor inválido cae al defecto, sin error. */
export function parseState(search: string, env: { reducedMotion: boolean }): LabState {
  const q = new URLSearchParams(search);
  const d = DEFAULT_STATE;
  const mv = q.get('mv');
  const motion: Motion = mv === 's' ? 'static' : mv === 'd' ? 'dynamic' : env.reducedMotion ? 'static' : d.motion;
  const sp = num(q.get('sp'), 0.25, 2);
  const id = q.get('id');
  return {
    view: oneOf<ViewId>(q.get('view'), ['combinador', 'galerias', 'ficha'], d.view),
    palette: idIn<PaletteId>(q.get('c'), /^C\d\d$/, 22, d.palette),
    type: idIn<TypeId>(q.get('t'), /^T\d\d$/, 14, d.type, 0),
    atmosphere: idIn<AtmosphereId>(q.get('a'), /^A\d\d$/, 14, d.atmosphere),
    glass: idIn<GlassId>(q.get('g'), /^G\d\d$/, 10, d.glass),
    mode: oneOf<Mode>(q.get('m'), ['light', 'dark'], d.mode),
    motion,
    speed: sp !== null && Number.isInteger(sp * 4) ? sp : d.speed,
    veil: num(q.get('v'), 0, 100),
    blur: num(q.get('b'), 0, 80),
    template: oneOf<TemplateId>(q.get('tpl'), ['hero', 'order-card'], d.template),
    seed: (() => { const s = num(q.get('s'), 0, 4294967295); return s !== null && Number.isInteger(s) ? s : d.seed; })(),
    gallery: oneOf<GalleryTab>(q.get('gt'), ['T', 'C', 'A', 'G'], d.gallery),
    reg: oneOf<RegFilter>(q.get('r'), ['all', 'enterprise', 'equilibrio', 'pyme'], d.reg),
    ficha: id !== null && /^[CTAG]\d\d$/.test(id) ? id : null,
  };
}

/** Estado → query (con «?» inicial; vacía si todo es el defecto). Solo escribe lo que difiere. */
export function serializeState(s: LabState): string {
  const d = DEFAULT_STATE;
  const q = new URLSearchParams();
  const put = (k: string, v: string | number | null, dv: string | number | null): void => {
    if (v !== null && v !== dv) q.set(k, String(v));
  };
  put('view', s.view, d.view);
  put('c', s.palette, d.palette);
  put('t', s.type, d.type);
  put('a', s.atmosphere, d.atmosphere);
  put('g', s.glass, d.glass);
  put('m', s.mode, d.mode);
  put('mv', s.motion === 'static' ? 's' : 'd', 'd');
  put('sp', s.speed, d.speed);
  put('v', s.veil, null);
  put('b', s.blur, null);
  put('tpl', s.template, d.template);
  put('s', s.seed, d.seed);
  put('gt', s.gallery, d.gallery);
  put('r', s.reg, d.reg);
  put('id', s.ficha, null);
  const out = q.toString();
  return out ? `?${out}` : '';
}

/** «C20 · T00 · A05 · G01» */
export const comboCode = (s: Pick<LabState, 'palette' | 'type' | 'atmosphere' | 'glass'>): string =>
  `${s.palette} · ${s.type} · ${s.atmosphere} · ${s.glass}`;

// --- Hook sobre location (useSyncExternalStore + popstate) ---
const listeners = new Set<() => void>();
const subscribe = (cb: () => void): (() => void) => {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => { listeners.delete(cb); window.removeEventListener('popstate', cb); };
};
const getSearch = (): string => window.location.search;
const getServerSearch = (): string => '';
const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useLabState(): [LabState, (patch: Partial<LabState>, opts?: { push?: boolean }) => void] {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const state = useMemo(() => parseState(search, { reducedMotion: reducedMotion() }), [search]);
  const set = useCallback((patch: Partial<LabState>, opts?: { push?: boolean }) => {
    const cur = parseState(window.location.search, { reducedMotion: reducedMotion() });
    const url = `${window.location.pathname}${serializeState({ ...cur, ...patch })}${window.location.hash}`;
    if (opts?.push) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    listeners.forEach((cb) => cb());
  }, []);
  return [state, set];
}
