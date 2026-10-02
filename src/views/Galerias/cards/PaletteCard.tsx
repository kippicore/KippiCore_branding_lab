import type { ReactNode } from 'react';
import type { Mode, Palette } from '../../../contracts';
import { deriveTheme } from '../../../theme/derive';
import { MODE_LABEL } from '../../shared';
import { CardFrame, type CardActions } from './CardFrame';
import styles from '../Galerias.module.css';

const ROLES = ['bg', 'surface', 'ink', 'muted', 'primary', 'accent'] as const;

export function PaletteCard({ palette, actions }: { palette: Palette; actions: CardActions }): ReactNode {
  const fillOnly = (['light', 'dark'] as Mode[]).some((m) => deriveTheme(palette, m).derived.accentIsFillOnly);
  return (
    <CardFrame id={palette.id} name={palette.name} reg={palette.reg} actions={actions}
      preview={
        <div className={styles.swatches}>
          {(['light', 'dark'] as Mode[]).map((m) => (
            <div key={m} className={styles.swatchRow} role="img" aria-label={`Paleta ${palette.id} en ${MODE_LABEL[m]}: ${ROLES.map((r) => `${r} ${palette[m][r]}`).join(', ')}`}>
              {ROLES.map((r) => <span key={r} style={{ background: palette[m][r] }} title={`${r} ${palette[m][r]}`} />)}
            </div>
          ))}
        </div>
      }>
      <p className={styles.desc}>{palette.concept}</p>
      {fillOnly && <p className={styles.flags}><span className="ui-pill">acento solo relleno</span></p>}
    </CardFrame>
  );
}
