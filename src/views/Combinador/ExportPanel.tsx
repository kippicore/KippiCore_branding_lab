import { useState, type ReactNode } from 'react';
import type { LabState } from '../../contracts';
import { buildTokenBundle, toCssFile, toJsonFile } from '../../export/tokens';
import { copyText } from '../../lib/clipboard';
import { downloadText } from '../../lib/download';
import { comboCode } from '../../lib/url-state';
import type { Resolved } from '../shared';
import styles from './Combinador.module.css';

export const exportFileName = (s: LabState, ext: 'css' | 'json'): string =>
  `kippicore-${comboCode(s).replace(/ · /g, '-')}-${s.mode}.${ext}`;

export function ExportPanel({ state, resolved }: { state: LabState; resolved: Resolved }): ReactNode {
  const [msg, setMsg] = useState('');
  const { glass, atmosphere } = resolved;
  const ready = Boolean(glass && atmosphere);
  const build = () => {
    if (!glass || !atmosphere) throw new Error('Faltan la atmósfera o el vidrio');
    return buildTokenBundle({
      theme: resolved.theme, type: resolved.type, atmosphere, glass,
      params: { veil: state.veil ?? glass.defaults.veil, blur: state.blur ?? glass.defaults.blur }, state,
    });
  };
  const act = async (fn: () => void | Promise<void>, ok: string) => {
    try { await fn(); setMsg(ok); } catch (e) { setMsg(e instanceof Error ? e.message : 'No se pudo exportar'); }
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <section className={styles.panel} aria-labelledby="exp-h">
      <h3 id="exp-h" className={styles.h3}>Exportar</h3>
      <div className={styles.codeActions}>
        <button type="button" className="ui-btn" disabled={!ready}
          onClick={() => act(() => downloadText(exportFileName(state, 'css'), toCssFile(build()), 'text/css;charset=utf-8'), 'CSS descargado')}>Descargar CSS</button>
        <button type="button" className="ui-btn" disabled={!ready}
          onClick={() => act(() => downloadText(exportFileName(state, 'json'), toJsonFile(build()), 'application/json'), 'JSON descargado')}>Descargar JSON</button>
        <button type="button" className="ui-btn" disabled={!ready}
          onClick={() => act(() => copyText(toCssFile(build())), 'CSS copiado')}>Copiar CSS</button>
      </div>
      {!ready && <p className={styles.hint}>Disponible cuando la atmósfera y el vidrio activos estén registrados.</p>}
      <span role="status" aria-live="polite" className={styles.flash}>{msg}</span>
    </section>
  );
}
