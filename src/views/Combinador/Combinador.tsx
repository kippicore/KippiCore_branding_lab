import type { ReactNode } from 'react';
import type { LabState, TemplateId } from '../../contracts';
import { PALETTES } from '../../data/palettes';
import { TYPE_SYSTEMS } from '../../data/typography';
import { ATMOSPHERES } from '../../layers/atmospheres';
import { GLASSES } from '../../layers/glass';
import { LegibilityMeter } from '../../legibility/LegibilityMeter';
import { useLegibility } from '../../legibility/useLegibility';
import { TEMPLATES } from '../../templates';
import { hasDynamic, useReducedMotion, useResolved } from '../shared';
import { CodeBar } from './CodeBar';
import { ExportPanel } from './ExportPanel';
import { Selector, type SelectorOption } from './Selector';
import { Stage, useLegibilityInput } from './Stage';
import styles from './Combinador.module.css';

export interface ViewProps { state: LabState; setState: (patch: Partial<LabState>, opts?: { push?: boolean }) => void }

const TEMPLATE_TABS: readonly { id: TemplateId; name: string }[] = [
  { id: 'hero', name: 'Portada web' },
  { id: 'order-card', name: 'Tarjeta de pedido' },
];

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void;
}): ReactNode {
  return (
    <div className={styles.field}>
      <span className="ui-label" id={`seg-${label}`}>{label}</span>
      <div className="ui-seg" role="group" aria-labelledby={`seg-${label}`}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

export function Combinador({ state, setState }: ViewProps): ReactNode {
  const resolved = useResolved(state);
  const reduced = useReducedMotion();
  const { ref, input } = useLegibilityInput(resolved, state);
  const legibility = useLegibility(input);

  const typeOpts: SelectorOption[] = TYPE_SYSTEMS.map((t) => ({ value: t.id, label: `${t.id} · ${t.name}` }));
  const palOpts: SelectorOption[] = PALETTES.map((p) => ({ value: p.id, label: `${p.id} · ${p.name}` }));
  const atmOpts: SelectorOption[] = ATMOSPHERES.map((a) => ({ value: a.id, label: `${a.id} · ${a.name}${hasDynamic(a) ? ' · dinámica' : ''}` }));
  const glassOpts: SelectorOption[] = GLASSES.map((g) => ({ value: g.id, label: `${g.id} · ${g.name}` }));
  const glass = resolved?.glass;
  const veil = state.veil ?? glass?.defaults.veil ?? 50;
  const blur = state.blur ?? glass?.defaults.blur ?? 16;

  if (!resolved) return <p className="ui-empty" role="status">Sin paletas ni tipografías cargadas.</p>;
  const { palette, type, atmosphere } = resolved;

  return (
    <div className={styles.layout}>
      <aside className={styles.controls} aria-label="Controles de la combinación">
        <Selector label="Tipografía" value={state.type} options={typeOpts} reg={type.reg} onChange={(v) => setState({ type: v as LabState['type'] })} />
        <Selector label="Paleta" value={state.palette} options={palOpts} reg={palette.reg} onChange={(v) => setState({ palette: v as LabState['palette'] })} />
        <Selector label="Atmósfera" value={state.atmosphere} options={atmOpts} reg={atmosphere ? atmosphere.reg : null} onChange={(v) => setState({ atmosphere: v as LabState['atmosphere'] })} />
        <Selector label="Vidrio" value={state.glass} options={glassOpts} reg={glass ? glass.reg : null} onChange={(v) => setState({ glass: v as LabState['glass'] })} />

        <Segmented label="Modo" value={state.mode} onChange={(mode) => setState({ mode })}
          options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]} />
        <Segmented label="Movimiento" value={state.motion} onChange={(motion) => setState({ motion })}
          options={[{ value: 'static', label: 'Estático' }, { value: 'dynamic', label: 'Dinámico' }]} />
        {reduced && <p className={styles.hint} role="status">Reducir movimiento está activo: la atmósfera se muestra estática.</p>}

        {state.motion === 'dynamic' && (
          <div className={styles.field}>
            <label className="ui-label" htmlFor="ctl-speed">Velocidad · {state.speed}×</label>
            <input id="ctl-speed" className="ui-range" type="range" min={0.25} max={2} step={0.25} value={state.speed}
              onChange={(e) => setState({ speed: Number(e.target.value) })} />
          </div>
        )}

        <fieldset className={styles.glassSet} disabled={!glass}>
          <legend className="ui-label">Vidrio · ajustes</legend>
          <div className={styles.field}>
            <label className={styles.rangeLabel} htmlFor="ctl-veil"><span>Velo</span><span className="ui-code">{veil}%</span></label>
            <input id="ctl-veil" className="ui-range" type="range" min={0} max={100} step={1} value={veil}
              onChange={(e) => setState({ veil: Number(e.target.value) })} />
          </div>
          <div className={styles.field}>
            <label className={styles.rangeLabel} htmlFor="ctl-blur"><span>Desenfoque</span><span className="ui-code">{blur} px</span></label>
            <input id="ctl-blur" className="ui-range" type="range" min={0} max={40} step={1} value={blur}
              onChange={(e) => setState({ blur: Number(e.target.value) })} />
          </div>
          <button type="button" className="ui-btn" disabled={state.veil === null && state.blur === null}
            onClick={() => setState({ veil: null, blur: null })}>Restablecer</button>
        </fieldset>
      </aside>

      <section className={styles.right} aria-label="Escenario">
        <div className={styles.tabs} role="group" aria-label="Plantilla">
          <div className="ui-seg">
            {TEMPLATE_TABS.map((t) => (
              <button key={t.id} type="button" aria-pressed={state.template === t.id} onClick={() => setState({ template: t.id })}>
                {TEMPLATES[t.id]?.name ?? t.name}
              </button>
            ))}
          </div>
        </div>
        <Stage state={state} resolved={resolved} stageRef={ref} />
        <CodeBar state={state} />
        <div className={styles.bottom}>
          <section className={styles.panel} aria-labelledby="leg-h">
            <h3 id="leg-h" className={styles.h3}>Legibilidad</h3>
            <div aria-live="polite">
              {input ? <LegibilityMeter result={legibility} /> : <p className={styles.hint}>Sin medición: el escenario aún no tiene una plantilla y un vidrio registrados.</p>}
            </div>
          </section>
          <ExportPanel state={state} resolved={resolved} />
        </div>
      </section>
    </div>
  );
}
