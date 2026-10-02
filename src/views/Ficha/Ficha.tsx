import { useState, type ReactNode } from 'react';
import type { AtmosphereLayer, GlassLayer, LabState, Palette, TypeSystem } from '../../contracts';
import { PALETTES } from '../../data/palettes';
import { TYPE_SYSTEMS } from '../../data/typography';
import { ATMOSPHERES } from '../../layers/atmospheres';
import { GLASSES } from '../../layers/glass';
import { Glass } from '../../layers/glass/Glass';
import { AtmosphereView } from '../../runtime/AtmosphereView';
import { copyText } from '../../lib/clipboard';
import { contrastRatio } from '../../theme/contrast';
import { toCssVars } from '../../theme/css-vars';
import { deriveTheme } from '../../theme/derive';
import { ThemeScope } from '../../theme/ThemeScope';
import type { ViewProps } from '../Combinador/Combinador';
import { RegBar } from '../Combinador/Selector';
import { hasDynamic, useResolved } from '../shared';
import styles from './Ficha.module.css';

export type FichaItem =
  | { kind: 'C'; item: Palette } | { kind: 'T'; item: TypeSystem }
  | { kind: 'A'; item: AtmosphereLayer } | { kind: 'G'; item: GlassLayer };

/** Resuelve un id (C05, T14, A05, G07) según su prefijo; null si no existe. */
export const resolveFicha = (id: string | null): FichaItem | null => {
  if (!id) return null;
  const m = /^([CTAG])\d{2}$/.exec(id);
  if (!m) return null;
  switch (m[1]) {
    case 'C': { const item = PALETTES.find((x) => x.id === id); return item ? { kind: 'C', item } : null; }
    case 'T': { const item = TYPE_SYSTEMS.find((x) => x.id === id); return item ? { kind: 'T', item } : null; }
    case 'A': { const item = ATMOSPHERES.find((x) => x.id === id); return item ? { kind: 'A', item } : null; }
    default: { const item = GLASSES.find((x) => x.id === id); return item ? { kind: 'G', item } : null; }
  }
};

function CodeBlock({ title, code }: { title: string; code: string }): ReactNode {
  const [msg, setMsg] = useState('');
  return (
    <section className={styles.block}>
      <div className={styles.blockHead}>
        <h3>{title}</h3>
        <button type="button" className="ui-btn" onClick={async () => {
          try { await copyText(code); setMsg('Copiado'); } catch { setMsg('No se pudo copiar'); }
          setTimeout(() => setMsg(''), 2000);
        }}>Copiar</button>
        <span role="status" aria-live="polite" className={styles.flash}>{msg}</span>
      </div>
      <pre className="ui-pre" tabIndex={0}>{code}</pre>
    </section>
  );
}

const Facts = ({ rows }: { rows: readonly (readonly [string, ReactNode])[] }): ReactNode => (
  <dl className={styles.facts}>
    {rows.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
  </dl>
);

const ROLES = ['bg', 'surface', 'ink', 'muted', 'primary', 'accent'] as const;

function PaletteBody({ p }: { p: Palette }): ReactNode {
  const json = JSON.stringify({ id: p.id, name: p.name, reg: p.reg, light: p.light, dark: p.dark }, null, 2);
  return (
    <>
      <section className={styles.block}>
        <h3>Roles y contraste contra el fondo</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Rol</th><th scope="col">Claro</th><th scope="col">Contraste</th><th scope="col">Oscuro</th><th scope="col">Contraste</th></tr></thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r}>
                  <th scope="row">{r}</th>
                  <td><span className={styles.chip} style={{ background: p.light[r] }} aria-hidden="true" /><span className="ui-code">{p.light[r]}</span></td>
                  <td>{r === 'bg' ? '—' : `${contrastRatio(p.light[r], p.light.bg).toFixed(2)}:1`}</td>
                  <td><span className={styles.chip} style={{ background: p.dark[r] }} aria-hidden="true" /><span className="ui-code">{p.dark[r]}</span></td>
                  <td>{r === 'bg' ? '—' : `${contrastRatio(p.dark[r], p.dark.bg).toFixed(2)}:1`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <CodeBlock title="JSON de la paleta" code={json} />
    </>
  );
}

function TypeBody({ t }: { t: TypeSystem }): ReactNode {
  const probe = PALETTES[0];
  const vars = probe ? Object.entries(toCssVars(deriveTheme(probe, 'light'), t)).filter(([k]) => /font|display|label/.test(k)).map(([k, v]) => `  ${k}: ${v};`).join('\n') : '';
  return (
    <>
      <CodeBlock title="Consulta de Google Fonts" code={`https://fonts.googleapis.com/css2?${t.googleFontsQuery}&display=swap`} />
      <CodeBlock title="Variables CSS" code={`:root {\n${vars}\n}`} />
    </>
  );
}

export function Ficha({ state, setState }: ViewProps): ReactNode {
  const resolved = useResolved(state);
  const [live, setLive] = useState(false);
  const found = resolveFicha(state.ficha);
  const use = () => {
    if (!found) return;
    const patch: Partial<LabState> = {
      view: 'combinador',
      ...(found.kind === 'C' ? { palette: found.item.id } : {}),
      ...(found.kind === 'T' ? { type: found.item.id } : {}),
      ...(found.kind === 'A' ? { atmosphere: found.item.id } : {}),
      ...(found.kind === 'G' ? { glass: found.item.id } : {}),
    };
    setState(patch, { push: true });
  };

  if (!state.ficha) return (
    <div className="ui-empty" role="status">
      <p>Elija un elemento para ver su ficha.</p>
      <p><a href="?view=galerias" onClick={(e) => { e.preventDefault(); setState({ view: 'galerias' }, { push: true }); }}>Ir a las galerías</a></p>
    </div>
  );
  if (!found || !resolved) return (
    <div className="ui-empty" role="alert">
      <p>No encontrado: «{state.ficha}».</p>
      <p><a href="?view=galerias" onClick={(e) => { e.preventDefault(); setState({ view: 'galerias' }, { push: true }); }}>Volver a las galerías</a></p>
    </div>
  );

  const { theme, type, atmosphere, glass } = resolved;
  const name = found.item.name;
  const reg = found.item.reg;
  const params = glass ? { veil: state.veil ?? glass.defaults.veil, blur: state.blur ?? glass.defaults.blur } : null;
  let preview: ReactNode = null;
  const stage = (kind: 'A' | 'G'): ReactNode => {
    const a = kind === 'A' ? (found.item as AtmosphereLayer) : atmosphere;
    const g = kind === 'G' ? (found.item as GlassLayer) : glass;
    return (
      <ThemeScope theme={theme} type={type} className={styles.stageScope}>
        <div className={styles.stage}>
          {a ? <AtmosphereView atmosphere={a} theme={theme} seed={state.seed} motion={kind === 'A' && live ? 'dynamic' : 'static'} params={{ speed: state.speed, density: 1, pointer: null }} />
            : <div className={styles.stageNote}>Sin atmósfera registrada</div>}
          {g && (
            <div className={styles.glassPos}>
              <Glass glass={g} params={kind === 'G' ? g.defaults : (params ?? g.defaults)} className={styles.glassBox}>
                <p className={styles.gTitle}>Panadería La Espiga · 4 sedes</p>
                <p className={styles.gText}>Pedidos de hoy · 38 · +12 % frente a ayer</p>
              </Glass>
            </div>
          )}
        </div>
      </ThemeScope>
    );
  };
  if (found.kind === 'C') {
    preview = (['light', 'dark'] as const).map((m) => (
      <div key={m} className={styles.palRow}>{ROLES.map((r) => <span key={r} style={{ background: found.item.id && (found.item as Palette)[m][r] }} title={`${r} ${(found.item as Palette)[m][r]}`} />)}</div>
    ));
  } else if (found.kind === 'T') {
    preview = (
      <ThemeScope theme={theme} type={found.item} className={styles.specimen}>
        <p className={styles.specLabel}>Software a la medida · Bogotá</p>
        <p className={styles.specHead}>Sus pedidos dejan de vivir en un {found.item.accent ? <em style={{ fontFamily: 'var(--kc-font-accent)', fontWeight: 500 }}>celular</em> : <strong>celular</strong>}.</p>
        <p className={styles.specText}>Pedidos, domicilios y cartera de sus sedes en un solo sistema, a precio cerrado.</p>
      </ThemeScope>
    );
  } else preview = stage(found.kind);

  return (
    <article className={styles.page} aria-labelledby="ficha-h">
      <header className={styles.head}>
        <span className={`ui-code ${styles.id}`}>{found.item.id}</span>
        <h1 id="ficha-h">{name}</h1>
        <div className={styles.headActions}>
          {found.kind === 'A' && hasDynamic(found.item) && (
            <button type="button" className="ui-btn" aria-pressed={live} onClick={() => setLive((v) => !v)}>{live ? 'Ver estática' : 'Ver dinámica'}</button>
          )}
          <button type="button" className="ui-btn ui-btn--primary" onClick={use}>Usar en el combinador</button>
        </div>
      </header>

      <div className={styles.cols}>
        <div className={styles.previewCol}>{preview}</div>
        <div className={styles.info}>
          {found.kind === 'C' && <Facts rows={[['Concepto', found.item.concept], ['Riesgo', found.item.risk]]} />}
          {found.kind === 'T' && <Facts rows={[['Concepto', found.item.concept], ['Precaución', found.item.caution], ['Fuente', found.item.source]]} />}
          {found.kind === 'A' && <Facts rows={[['Descripción', found.item.description], ['Dónde usar', found.item.useIn], ['Qué evitar', found.item.avoid], ['Peso', found.item.weight]]} />}
          {found.kind === 'G' && <Facts rows={[
            ['Descripción', found.item.description], ['Dónde usar', found.item.useIn], ['Qué evitar', found.item.avoid],
            ['Valores por defecto', `velo ${found.item.defaults.veil}% · desenfoque ${found.item.defaults.blur} px`],
            ['Desenfoque recomendado', found.item.recommendedBlur !== found.item.defaults.blur ? `${found.item.recommendedBlur} px (difiere del CSS probado)` : `${found.item.recommendedBlur} px`],
          ]} />}
          <div><span className="ui-label">Registro</span><RegBar reg={reg} /></div>
        </div>
      </div>

      {found.kind === 'C' && <PaletteBody p={found.item} />}
      {found.kind === 'T' && <TypeBody t={found.item} />}
      {found.kind === 'A' && <CodeBlock title="CSS estático" code={found.item.staticCss()} />}
      {found.kind === 'G' && <CodeBlock title="CSS del vidrio" code={found.item.css} />}
    </article>
  );
}
