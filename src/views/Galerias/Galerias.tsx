import type { ReactNode } from 'react';
import type { GalleryTab, LabState, RegFilter } from '../../contracts';
import { PALETTES } from '../../data/palettes';
import { TYPE_SYSTEMS } from '../../data/typography';
import { ATMOSPHERES } from '../../layers/atmospheres';
import { GLASSES } from '../../layers/glass';
import type { ViewProps } from '../Combinador/Combinador';
import { useResolved } from '../shared';
import { AtmosphereCard } from './cards/AtmosphereCard';
import type { CardActions } from './cards/CardFrame';
import { GlassCard } from './cards/GlassCard';
import { PaletteCard } from './cards/PaletteCard';
import { TypeCard } from './cards/TypeCard';
import { filterByReg } from './filter';
import styles from './Galerias.module.css';

const TABS: readonly { id: GalleryTab; label: string }[] = [
  { id: 'T', label: 'Tipografías' }, { id: 'C', label: 'Paletas' }, { id: 'A', label: 'Atmósferas' }, { id: 'G', label: 'Vidrios' },
];
const REGS: readonly { id: RegFilter; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'enterprise', label: 'Enterprise' }, { id: 'equilibrio', label: 'Equilibrio' }, { id: 'pyme', label: 'Pyme' },
];

export function Galerias({ state, setState }: ViewProps): ReactNode {
  const resolved = useResolved(state);
  const actions: CardActions = {
    onFicha: (id) => setState({ view: 'ficha', ficha: id }, { push: true }),
    onUse: (id) => {
      const k = id.charAt(0);
      const patch: Partial<LabState> = {
        view: 'combinador',
        ...(k === 'T' ? { type: id as LabState['type'] } : {}),
        ...(k === 'C' ? { palette: id as LabState['palette'] } : {}),
        ...(k === 'A' ? { atmosphere: id as LabState['atmosphere'] } : {}),
        ...(k === 'G' ? { glass: id as LabState['glass'] } : {}),
      };
      setState(patch, { push: true });
    },
  };

  let cards: ReactNode[] = [];
  let count = 0;
  if (resolved) {
    const { theme, type, atmosphere } = resolved;
    if (state.gallery === 'T') { const l = filterByReg(TYPE_SYSTEMS, state.reg); count = l.length; cards = l.map((t) => <TypeCard key={t.id} type={t} theme={theme} actions={actions} />); }
    if (state.gallery === 'C') { const l = filterByReg(PALETTES, state.reg); count = l.length; cards = l.map((p) => <PaletteCard key={p.id} palette={p} actions={actions} />); }
    if (state.gallery === 'A') { const l = filterByReg(ATMOSPHERES, state.reg); count = l.length; cards = l.map((a) => <AtmosphereCard key={a.id} atmosphere={a} theme={theme} type={type} seed={state.seed} actions={actions} />); }
    if (state.gallery === 'G') { const l = filterByReg(GLASSES, state.reg); count = l.length; cards = l.map((g) => <GlassCard key={g.id} glass={g} atmosphere={atmosphere} theme={theme} type={type} seed={state.seed} actions={actions} />); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className="ui-seg" role="tablist" aria-label="Galería">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={state.gallery === t.id} onClick={() => setState({ gallery: t.id })}>{t.label}</button>
          ))}
        </div>
        <div className={styles.filter}>
          <label className="ui-label" htmlFor="gal-reg" style={{ margin: 0 }}>Registro</label>
          <select id="gal-reg" className="ui-select" value={state.reg} onChange={(e) => setState({ reg: e.target.value as RegFilter })}>
            {REGS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <p className={styles.count} role="status" aria-live="polite">{count} {count === 1 ? 'elemento' : 'elementos'}</p>
      {cards.length === 0
        ? <p className="ui-empty">Sin elementos para esta galería y este filtro de registro.</p>
        : <div className={styles.grid} role="tabpanel">{cards}</div>}
    </div>
  );
}
