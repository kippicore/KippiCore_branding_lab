// Ciclo de vida de una capa dinámica (PLAN §4.4): carga perezosa, actividad, resize, tema, puntero y limpieza.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AtmosphereLayer, DynamicLayerFactory, DynamicLayerInstance, Theme } from '../contracts';
import { ticker as globalTicker, type Ticker } from '../lib/ticker';
import { DYNAMIC_ATMOSPHERES } from '../layers/atmospheres/dynamic-registry';

export const MAX_DPR = 1.5;
export const THEME_TWEEN_MS = 500;

export interface DynamicHostProps {
  atmosphere: Pick<AtmosphereLayer, 'id' | 'dynamic'>;
  theme: Theme;
  seed: number;
  speed: number;
  density?: number;
  /** Para pruebas: fábrica y reloj inyectados. */
  factory?: DynamicLayerFactory;
  ticker?: Ticker;
  onInstance?: (inst: DynamicLayerInstance | null) => void;
}

const reducedQuery = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function DynamicHost(props: DynamicHostProps): ReactNode {
  const { atmosphere, theme, seed, speed, density = 1 } = props;
  const factory = props.factory ?? DYNAMIC_ATMOSPHERES[atmosphere.id] ?? atmosphere.dynamic;
  const tk = props.ticker ?? globalTicker;
  const hostRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<DynamicLayerInstance | null>(null);
  const latest = useRef({ theme, speed, density });
  latest.current = { theme, speed, density };
  const appliedTheme = useRef<Theme | null>(null);
  const onInstance = useRef(props.onInstance);
  onInstance.current = props.onInstance;
  const [reduced, setReduced] = useState(() => reducedQuery()?.matches ?? false);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    const mq = reducedQuery();
    if (!mq) return;
    const on = (): void => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !factory || reduced) return;
    let cancelled = false, inst: DynamicLayerInstance | null = null;
    let visible = typeof IntersectionObserver === 'undefined';
    let tabVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    let running = false, rafResize = 0, io: IntersectionObserver | null = null, ro: ResizeObserver | null = null;
    const stage = host.parentElement ?? host;
    setLost(false);

    const dpr = (): number => Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const measure = (): { w: number; h: number } => ({ w: host.clientWidth, h: host.clientHeight });
    const sync = (): void => {
      if (!inst) return;
      const want = visible && tabVisible;
      if (want && !running) { running = true; inst.start(); tk.add(inst, { speed: latest.current.speed }); }
      else if (!want && running) { running = false; tk.remove(inst); inst.stop(); }
    };
    const teardown = (): void => {
      if (!inst) return;
      const i = inst; inst = null; instRef.current = null;
      if (running) { running = false; tk.remove(i); i.stop(); }
      i.dispose();
      onInstance.current?.(null);
    };
    const onVis = (): void => { tabVisible = document.visibilityState !== 'hidden'; sync(); };
    const onLost = (e: Event): void => { e.preventDefault(); teardown(); setLost(true); };
    const onMove = (e: PointerEvent): void => {
      if (!inst || e.pointerType === 'touch') return;
      const r = stage.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      inst.setParams({ pointer: { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } });
    };
    const onLeave = (): void => inst?.setParams({ pointer: null });

    host.addEventListener('webglcontextlost', onLost, true);
    document.addEventListener('visibilitychange', onVis);
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1]?.isIntersecting ?? visible; sync(); }, { rootMargin: '100px', threshold: 0 });
      io.observe(host);
    }
    if (factory.usesPointer && !window.matchMedia?.('(hover: none)').matches) {
      stage.addEventListener('pointermove', onMove, { passive: true });
      stage.addEventListener('pointerleave', onLeave);
    }

    factory.load().then(({ create }) => {
      if (cancelled) return;
      const l = latest.current;
      try {
        inst = create({ theme: l.theme, seed, params: { speed: l.speed, density: l.density, pointer: null } });
        inst.mount(host);
        const s = measure();
        inst.resize(s, dpr());
        inst.setTheme(l.theme, 0);
      } catch {
        teardown(); inst?.dispose(); inst = null; setLost(true);
        return;
      }
      instRef.current = inst; appliedTheme.current = l.theme;
      onInstance.current?.(inst);
      ro = new ResizeObserver(() => {
        if (rafResize) return;                                    // throttle a 1 rAF
        rafResize = requestAnimationFrame(() => { rafResize = 0; inst?.resize(measure(), dpr()); });
      });
      ro.observe(host);
      sync();
      requestAnimationFrame(() => { if (!cancelled) host.style.opacity = '1'; });   // fundido en el propio nodo dinámico
    }).catch(() => { if (!cancelled) setLost(true); });

    return () => {
      cancelled = true;
      io?.disconnect(); ro?.disconnect();
      if (rafResize) cancelAnimationFrame(rafResize);
      host.removeEventListener('webglcontextlost', onLost, true);
      document.removeEventListener('visibilitychange', onVis);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      teardown();
      host.style.opacity = '0';
    };
  }, [factory, seed, reduced, tk]);

  useEffect(() => {
    const inst = instRef.current;
    if (inst && appliedTheme.current !== theme) { appliedTheme.current = theme; inst.setTheme(theme, THEME_TWEEN_MS); }
  }, [theme]);

  useEffect(() => {
    const inst = instRef.current;
    if (!inst) return;
    inst.setParams({ speed, density });
    tk.setSpeed(inst, speed);
  }, [speed, density, tk]);

  if (!factory || reduced) return null;
  return (
    <>
      <div ref={hostRef} aria-hidden="true" data-kc-dynamic={atmosphere.id}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0, transition: 'opacity 600ms cubic-bezier(.2,0,0,1)' }} />
      {lost && <div role="status" style={{ position: 'absolute', left: 8, bottom: 8, font: '500 11px/1.4 system-ui, sans-serif', padding: '2px 8px',
        borderRadius: 6, color: '#FFFFFF', background: 'rgba(0,0,0,.55)', pointerEvents: 'none' }}>Animación no disponible: se muestra la versión estática.</div>}
    </>
  );
}
