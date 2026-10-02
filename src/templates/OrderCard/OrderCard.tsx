import type { ReactNode } from 'react';
import type { TemplateProps } from '../../contracts';
import { Glass } from '../../layers/glass/Glass';
import { COPY } from '../copy';
import { Status } from '../shared';
import css from './OrderCard.module.css';

/** Tarjeta de pedido suelta, centrada en el escenario. */
export function OrderCard({ glass, glassParams }: TemplateProps): ReactNode {
  const o = COPY.order;
  return (
    <div className={css.root} data-text={glass.text}>
      <Glass glass={glass} params={glassParams} className={`${css.card}`}>
        <article className={css.read} data-kc-probe="primary">
          <header className={css.head}>
            <span className={css.label}>{o.label}</span>
            <Status tone="primary">{o.status}</Status>
          </header>
          <h1 className={css.title}>
            {o.label} <span className={css.num}>{o.number}</span>
          </h1>
          <p className={css.when}>{o.delivered}</p>
          <hr className={css.rule} />
          <p className={css.business}>{o.business}</p>
          <p className={css.muted} data-kc-probe="muted">{o.branch}</p>
          <p className={css.channel}>{o.channel}</p>
          <footer className={css.total}>
            <span className={css.label}>{o.totalLabel}</span>
            <strong className={css.num}>{o.total}</strong>
          </footer>
        </article>
      </Glass>
    </div>
  );
}
