import { useEffect, type ReactNode } from 'react';
import type { Theme, TypeSystem } from '../../../contracts';
import { ThemeScope } from '../../../theme/ThemeScope';
import { ensureFonts } from '../../../theme/fonts';
import { useInView } from '../../shared';
import { CardFrame, type CardActions } from './CardFrame';
import styles from '../Galerias.module.css';

export function TypeCard({ type, theme, actions }: { type: TypeSystem; theme: Theme; actions: CardActions }): ReactNode {
  const [ref, seen] = useInView<HTMLElement>();
  useEffect(() => { if (seen) void ensureFonts(type); }, [seen, type]);
  const flags = [
    ...(type.display.italic === 'synthetic' || type.text.italic === 'synthetic' ? ['itálica sintética'] : []),
    ...(type.display.singleWeight ? ['un solo peso'] : []),
  ];
  return (
    <CardFrame id={type.id} name={type.name} reg={type.reg} actions={actions} cardRef={ref}
      preview={
        <ThemeScope theme={theme} type={type} className={styles.specimen}>
          <p className={styles.specLabel}>Software a la medida · Bogotá</p>
          <p className={styles.specHead}>
            Sus pedidos dejan de vivir en un {type.accent ? <em style={{ fontFamily: 'var(--kc-font-accent)', fontStyle: 'italic', fontWeight: 500 }}>celular</em> : <strong>celular</strong>}.
          </p>
          <p className={styles.specText}>Pedidos, domicilios y cartera de sus sedes en un solo sistema, a precio cerrado.</p>
        </ThemeScope>
      }>
      <p className={styles.desc}>{type.display.family} · {type.text.family} · {type.mono.family}</p>
      {flags.length > 0 && <p className={styles.flags}>{flags.map((f) => <span key={f} className="ui-pill">{f}</span>)}</p>}
    </CardFrame>
  );
}
