import type { ReactNode } from 'react';
import type { TemplateProps } from '../../contracts';
import { Glass } from '../../layers/glass/Glass';
import { COPY } from '../copy';
import { Headline, Status } from '../shared';
import css from './Hero.module.css';

/** Portada web: barra y tarjeta son vidrios HERMANOS (nunca anidados). */
export function Hero({ glass, glassParams, type }: TemplateProps): ReactNode {
  const b = COPY.board;
  return (
    <div className={css.root} data-text={glass.text}>
      <Glass glass={glass} params={glassParams} className={`${css.nav}`}>
        <span className={css.brand}>{COPY.brand}</span>
        <nav className={css.links} aria-label="Principal">
          {COPY.nav.map((l) => <a key={l} href="#" onClick={(e) => e.preventDefault()}>{l}</a>)}
        </nav>
        <button type="button" className={css.navBtn}>{COPY.navCta}</button>
      </Glass>

      <div className={css.body}>
        <section className={css.copy}>
          <p className={css.kicker}>{COPY.kicker}</p>
          <Headline type={type} className={`${css.title}`} />
          <p className={css.sub}>{COPY.subtitle}</p>
          <div className={css.actions}>
            <button type="button" className={css.primary}>{COPY.ctaPrimary}</button>
            <button type="button" className={css.secondary}>{COPY.ctaSecondary}</button>
          </div>
        </section>

        <Glass glass={glass} params={glassParams} className={`${css.card}`}>
          <div className={css.read} data-kc-probe="primary">
            <header className={css.cardHead}>
              <h2>{b.title}</h2>
              <p data-kc-probe="muted">{b.sub}</p>
            </header>
            <div className={css.kpis}>
              {b.kpis.map((k) => (
                <div key={k.label} className={css.kpi}>
                  <span className={css.label}>{k.label}</span>
                  <strong>{k.value}</strong>
                  <small>{k.note}</small>
                </div>
              ))}
            </div>
            <ul className={css.rows}>
              {b.rows.map((r) => (
                <li key={r.id}>
                  <span className={css.num}>{r.id}</span>
                  <span className={css.what}><b>{r.place}</b><em>{r.detail}</em></span>
                  <time className={css.num}>{r.time}</time>
                  <Status tone={r.tone}>{r.status}</Status>
                </li>
              ))}
            </ul>
          </div>
        </Glass>
      </div>
    </div>
  );
}
