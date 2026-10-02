import type { ReactNode } from 'react';
import type { AtmosphereLayer, GlassLayer, LabState, Theme, TypeSystem } from '../../../contracts';
import { Glass } from '../../../layers/glass/Glass';
import { ThemeScope } from '../../../theme/ThemeScope';
import { CardFrame, type CardActions } from './CardFrame';
import styles from '../Galerias.module.css';

export function GlassCard({ glass, atmosphere, theme, type, seed, actions }: {
  glass: GlassLayer; atmosphere: AtmosphereLayer | undefined; theme: Theme; type: TypeSystem; seed: LabState['seed']; actions: CardActions;
}): ReactNode {
  return (
    <CardFrame id={glass.id} name={glass.name} reg={glass.reg} actions={actions}
      preview={
        <ThemeScope theme={theme} type={type} className={styles.mini}>
          <div className={styles.miniInner}>{atmosphere?.renderStatic(theme, { seed })}</div>
          <div className={styles.glassPos}>
            <Glass glass={glass} params={glass.defaults} className={styles.glassBox}>
              <p className={styles.glassTitle}>Panadería La Espiga · 4 sedes</p>
              <p className={styles.glassText}>Pedidos de hoy · 38 · +12 % frente a ayer</p>
            </Glass>
          </div>
        </ThemeScope>
      }>
      <p className={styles.desc}>{glass.subtitle ?? glass.description}</p>
      <p className={styles.flags}><span className="ui-pill">velo {glass.defaults.veil}%</span><span className="ui-pill">blur {glass.defaults.blur} px</span></p>
    </CardFrame>
  );
}
