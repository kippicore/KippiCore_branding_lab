import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import type { LabState, LegibilityInput, Rect } from '../../contracts';
import { AtmosphereView } from '../../runtime/AtmosphereView';
import { TEMPLATES } from '../../templates';
import { ThemeScope } from '../../theme/ThemeScope';
import { ensureFonts } from '../../theme/fonts';
import type { Resolved } from '../shared';
import styles from './Combinador.module.css';

export interface StageProps {
  state: LabState;
  resolved: Resolved;
  /** Tamaño fijo en px (Snapshot). Sin él, 16:10 adaptable. */
  size?: { w: number; h: number };
  stageRef?: Ref<HTMLDivElement>;
}

/** Composición del plan §8.1. Ni este nodo ni sus ancestros llevan filter/opacity/mask/backdrop-filter (R1). */
export function Stage({ state, resolved, size, stageRef }: StageProps): ReactNode {
  const { theme, type, atmosphere, glass } = resolved;
  const tpl = TEMPLATES[state.template];
  const params = glass ? { veil: state.veil ?? glass.defaults.veil, blur: state.blur ?? glass.defaults.blur } : null;
  const style: CSSProperties | undefined = size ? { width: size.w, height: size.h, aspectRatio: 'auto' } : undefined;

  useEffect(() => { void ensureFonts(type); }, [type]);

  return (
    <ThemeScope theme={theme} type={type} className={styles.scope}>
      <div ref={stageRef} className={styles.stage} style={style} data-kc-stage>
        {atmosphere ? (
          <AtmosphereView atmosphere={atmosphere} theme={theme} seed={state.seed} motion={state.motion}
            params={{ speed: state.speed, density: 1, pointer: null }} />
        ) : (
          <div className={styles.stageBg} aria-hidden="true" />
        )}
        {tpl && glass && params ? (
          <div className={styles.template}><tpl.Component glass={glass} glassParams={params} type={type} /></div>
        ) : (
          <div className={styles.stageEmpty} role="status">
            {!atmosphere && <p>Sin atmósfera registrada para {state.atmosphere}.</p>}
            {!glass && <p>Sin vidrio registrado para {state.glass}.</p>}
            {!tpl && <p>Sin plantilla registrada para «{state.template}».</p>}
          </div>
        )}
      </div>
    </ThemeScope>
  );
}

const rel = (r: DOMRect, o: DOMRect): Rect => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });

/** Mide los rects data-kc-probe relativos al escenario; remide al cambiar tamaño, plantilla o fuentes. */
export function useLegibilityInput(resolved: Resolved | null, state: LabState): { ref: (el: HTMLDivElement | null) => void; input: LegibilityInput | null } {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [rects, setRects] = useState<LegibilityInput | null>(null);
  const alive = useRef(true);
  const ref = useCallback((n: HTMLDivElement | null) => setEl(n), []);

  const atmosphere = resolved?.atmosphere;
  const glass = resolved?.glass;
  const theme = resolved?.theme;
  const typeId = resolved?.type.id;
  const veil = state.veil ?? glass?.defaults.veil;
  const blur = state.blur ?? glass?.defaults.blur;

  useEffect(() => {
    alive.current = true;
    if (!el || !atmosphere || !glass || !theme || veil === undefined || blur === undefined) { setRects(null); return; }
    const measure = () => {
      if (!alive.current) return;
      const st = el.getBoundingClientRect();
      const p = el.querySelector<HTMLElement>('[data-kc-probe="primary"]');
      const m = el.querySelector<HTMLElement>('[data-kc-probe="muted"]');
      if (!p || !m || st.width === 0) { setRects(null); return; }
      const g = p.closest<HTMLElement>('.kc-glass, [data-kc-glass]') ?? p;
      const next: LegibilityInput = {
        atmosphere, glass, theme, params: { veil, blur }, stage: { w: st.width, h: st.height },
        glassRect: rel(g.getBoundingClientRect(), st), primaryRect: rel(p.getBoundingClientRect(), st),
        mutedRect: rel(m.getBoundingClientRect(), st), seed: state.seed,
      };
      setRects(next);
    };
    let raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); });
    ro.observe(el);
    void document.fonts?.ready.then(measure);
    if (resolved) void ensureFonts(resolved.type).then(measure);
    return () => { alive.current = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [el, atmosphere, glass, theme, typeId, veil, blur, state.seed, state.template]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, input: rects };
}
