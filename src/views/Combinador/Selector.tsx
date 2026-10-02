import { useId, type ReactNode } from 'react';
import styles from './Combinador.module.css';

export interface SelectorOption { value: string; label: string }

export interface SelectorProps {
  label: string;
  value: string;
  options: readonly SelectorOption[];
  onChange: (v: string) => void;
  /** Registro 0–100 (Enterprise ↔ Pyme); null = sin registro. undefined = sin barra. */
  reg?: number | null;
}

export function RegBar({ reg }: { reg: number | null }): ReactNode {
  if (reg === null) return <p className={styles.regNone}>Sin registro</p>;
  return (
    <div className={styles.reg} role="img" aria-label={`Registro ${reg} de 100: de Enterprise a Pyme`}>
      <div className={styles.regTrack}><span className={styles.regDot} style={{ left: `${Math.min(100, Math.max(0, reg))}%` }} /></div>
      <div className={styles.regLabels}><span>Enterprise</span><span className="ui-code">{reg}</span><span>Pyme</span></div>
    </div>
  );
}

/** Selector nativo con flechas ‹ › a los lados (ciclo circular). */
export function Selector({ label, value, options, onChange, reg }: SelectorProps): ReactNode {
  const id = useId();
  const empty = options.length === 0;
  const idx = options.findIndex((o) => o.value === value);
  const go = (d: 1 | -1) => {
    if (empty) return;
    const n = options[(Math.max(idx, 0) + d + options.length) % options.length];
    if (n) onChange(n.value);
  };
  return (
    <div className={styles.field}>
      <label className="ui-label" htmlFor={id}>{label}</label>
      <div className={styles.selRow}>
        <button type="button" className="ui-btn ui-btn--icon" onClick={() => go(-1)} disabled={empty} aria-label={`${label}: anterior`}>‹</button>
        <select id={id} className="ui-select" value={empty ? '' : value} disabled={empty} onChange={(e) => onChange(e.target.value)}>
          {empty ? <option value="">Sin elementos</option> : options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" className="ui-btn ui-btn--icon" onClick={() => go(1)} disabled={empty} aria-label={`${label}: siguiente`}>›</button>
      </div>
      {reg !== undefined && <RegBar reg={reg} />}
    </div>
  );
}
