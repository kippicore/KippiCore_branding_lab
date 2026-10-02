import { useState, type ReactNode } from 'react';
import type { LabState } from '../../contracts';
import { copyText } from '../../lib/clipboard';
import { comboCode } from '../../lib/url-state';
import { MODE_LABEL, MOTION_LABEL } from '../shared';
import styles from './Combinador.module.css';

export const fullCode = (s: Pick<LabState, 'palette' | 'type' | 'atmosphere' | 'glass' | 'mode' | 'motion'>): string =>
  `${comboCode(s)} · ${MODE_LABEL[s.mode]} · ${MOTION_LABEL[s.motion]}`;

export function CodeBar({ state }: { state: LabState }): ReactNode {
  const [msg, setMsg] = useState('');
  const code = fullCode(state);
  const run = async (text: string, ok: string) => {
    try { await copyText(text); setMsg(ok); } catch { setMsg('No se pudo copiar'); }
    setTimeout(() => setMsg(''), 2200);
  };
  return (
    <div className={styles.codeBar}>
      <code className={`ui-code ${styles.code}`} data-testid="combo-code">{code}</code>
      <div className={styles.codeActions}>
        <button type="button" className="ui-btn" onClick={() => run(code, 'Código copiado')}>Copiar código</button>
        <button type="button" className="ui-btn" onClick={() => run(window.location.href, 'Enlace copiado')}>Copiar enlace</button>
      </div>
      <span role="status" aria-live="polite" className={styles.flash}>{msg}</span>
    </div>
  );
}
