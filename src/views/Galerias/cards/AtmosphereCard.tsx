import type { ReactNode } from 'react';
import type { AtmosphereLayer, LabState, Theme, TypeSystem } from '../../../contracts';
import { ThemeScope } from '../../../theme/ThemeScope';
import { hasDynamic } from '../../shared';
import { CardFrame, type CardActions } from './CardFrame';
import styles from '../Galerias.module.css';

export function AtmosphereCard({ atmosphere, theme, type, seed, actions }: { atmosphere: AtmosphereLayer; theme: Theme; type: TypeSystem; seed: LabState['seed']; actions: CardActions }): ReactNode {
  return (
    <CardFrame id={atmosphere.id} name={atmosphere.name} reg={atmosphere.reg} actions={actions}
      preview={
        <ThemeScope theme={theme} type={type} className={styles.mini}>
          <div className={styles.miniInner}>{atmosphere.renderStatic(theme, { seed })}</div>
        </ThemeScope>
      }>
      <p className={styles.desc}>{atmosphere.subtitle ?? atmosphere.description}</p>
      <p className={styles.flags}>
        <span className="ui-pill">peso {atmosphere.weight}</span>
        {hasDynamic(atmosphere) && <span className="ui-pill">dinámica</span>}
      </p>
    </CardFrame>
  );
}
