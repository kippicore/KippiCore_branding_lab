import { useEffect, useRef, type ReactNode } from 'react';
import type { ViewId } from '../contracts';
import { FpsMeter } from '../runtime/FpsMeter';
import { SHORTCUTS } from './shortcuts';
import styles from './Shell.module.css';

const NAV: readonly { view: ViewId; label: string }[] = [
  { view: 'combinador', label: 'Combinador' },
  { view: 'galerias', label: 'Galerías' },
  { view: 'ficha', label: 'Ficha' },
];

export function Shell({ view, onHelp, onNavigate, children }: { view: ViewId; onHelp: () => void; onNavigate: (v: ViewId) => void; children: ReactNode }): ReactNode {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#contenido">Saltar al contenido</a>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <div>
            <strong>KippiCore</strong>
            <span className={styles.sub}>Laboratorio de marca</span>
          </div>
        </div>
        <nav aria-label="Vistas">
          <ul className={styles.nav}>
            {NAV.map((n) => (
              <li key={n.view}>
                <a href={`?view=${n.view}`} aria-current={view === n.view ? 'page' : undefined}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate(n.view);
                  }}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="ui-btn ui-btn--ghost" onClick={onHelp} aria-keyshortcuts="?">
          Atajos <kbd className={styles.kbd}>?</kbd>
        </button>
      </header>
      <main id="contenido" className={styles.main}>{children}</main>
      {import.meta.env.DEV && <FpsMeter />}
    </div>
  );
}

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }): ReactNode {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => { window.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="ayuda-titulo" className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 id="ayuda-titulo">Atajos de teclado</h2>
        <p className={styles.note}>Activos en el Combinador; se ignoran dentro de campos de texto y listas.</p>
        <dl className={styles.keys}>
          {SHORTCUTS.map((s) => (<div key={s.label}><dt><kbd className={styles.kbd}>{s.label}</kbd></dt><dd>{s.description}</dd></div>))}
        </dl>
        <button ref={closeRef} type="button" className="ui-btn ui-btn--primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
