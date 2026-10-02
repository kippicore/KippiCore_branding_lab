import { useEffect, useMemo, useRef, useState } from 'react';
import type { AtmosphereLayer, GlassLayer, LabState, Palette, Theme, TypeSystem } from '../contracts';
import { PALETTES } from '../data/palettes';
import { TYPE_SYSTEMS } from '../data/typography';
import { ATMOSPHERES } from '../layers/atmospheres';
import { DYNAMIC_ATMOSPHERES } from '../layers/atmospheres/dynamic-registry';
import { GLASSES } from '../layers/glass';
import { deriveTheme } from '../theme/derive';

export const MODE_LABEL = { light: 'claro', dark: 'oscuro' } as const;
export const MOTION_LABEL = { static: 'estático', dynamic: 'dinámico' } as const;

export interface Resolved {
  palette: Palette;
  type: TypeSystem;
  atmosphere: AtmosphereLayer | undefined;
  glass: GlassLayer | undefined;
  theme: Theme;
}

/** Resuelve la combinación activa contra los registros (que pueden estar vacíos). */
export const resolveState = (s: Pick<LabState, 'palette' | 'type' | 'atmosphere' | 'glass' | 'mode'>): Resolved | null => {
  const palette = PALETTES.find((p) => p.id === s.palette) ?? PALETTES[0];
  const type = TYPE_SYSTEMS.find((t) => t.id === s.type) ?? TYPE_SYSTEMS[0];
  if (!palette || !type) return null;
  return {
    palette, type,
    atmosphere: ATMOSPHERES.find((a) => a.id === s.atmosphere),
    glass: GLASSES.find((g) => g.id === s.glass),
    theme: deriveTheme(palette, s.mode),
  };
};

export const useResolved = (s: LabState): Resolved | null =>
  useMemo(() => resolveState(s), [s.palette, s.type, s.atmosphere, s.glass, s.mode]); // eslint-disable-line react-hooks/exhaustive-deps

export const hasDynamic = (a: AtmosphereLayer): boolean => Boolean(DYNAMIC_ATMOSPHERES[a.id] ?? a.dynamic);

/** true cuando el elemento entra (una vez) en pantalla; sirve para cargar fuentes bajo demanda. */
export const useInView = <T extends Element>(margin = '200px'): [React.RefObject<T | null>, boolean] => {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen];
};

export const useReducedMotion = (): boolean => {
  const [r, setR] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
};
