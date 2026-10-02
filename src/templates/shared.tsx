import type { ReactNode } from 'react';
import type { TypeSystem } from '../contracts';
import { COPY, type StatusTone } from './copy';
import s from './shared.module.css';

export const Status = ({ tone, children }: { tone: StatusTone; children: ReactNode }): ReactNode => (
  <span className={s.status} data-tone={tone}><i aria-hidden="true" />{children}</span>
);

/** Titular con UNA palabra en el rol accent solo si el sistema lo tiene (T13 Caveat, T14 Playfair). */
export const Headline = ({ type, className }: { type: TypeSystem; className: string }): ReactNode => {
  const h = COPY.headline;
  return (
    <h1 className={className}>
      {h.before}
      {type.accent
        ? <span className={s.accent} data-kc-accent data-accent-family={type.accent.family}>{h.accent}</span>
        : <span>{h.accent}</span>}
      {h.after}
    </h1>
  );
};
