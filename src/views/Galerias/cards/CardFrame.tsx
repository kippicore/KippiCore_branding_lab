import type { ReactNode, Ref } from 'react';
import type { LabState } from '../../../contracts';
import { RegBar } from '../../Combinador/Selector';
import styles from '../Galerias.module.css';

export interface CardActions { onFicha: (id: string) => void; onUse: (id: string) => void }

export function CardFrame({ id, name, reg, preview, actions, cardRef, children }: {
  id: string; name: string; reg: number | null; preview: ReactNode; actions: CardActions; cardRef?: Ref<HTMLElement>; children?: ReactNode;
}): ReactNode {
  return (
    <article className={styles.card} ref={cardRef}>
      <div className={styles.preview}>{preview}</div>
      <div className={styles.body}>
        <header className={styles.cardHead}><span className={`ui-code ${styles.cardId}`}>{id}</span><h3>{name}</h3></header>
        {children}
        <RegBar reg={reg} />
        <div className={styles.actions}>
          <button type="button" className="ui-btn" onClick={() => actions.onFicha(id)} aria-label={`Ver ficha de ${id}`}>Ver ficha</button>
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => actions.onUse(id)} aria-label={`Usar ${id} en el combinador`}>Usar en el combinador</button>
        </div>
      </div>
    </article>
  );
}
export type { LabState };
