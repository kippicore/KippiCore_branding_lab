import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { GlassLayer, GlassParams } from '../../contracts';
import './glass-base.css';
import './G01-esmerilado/glass.css';
import './G02-liquido/glass.css';
import './G03-acanalado/glass.css';
import './G04-grano/glass.css';
import './G05-ahumado/glass.css';
import './G06-escarcha/glass.css';
import './G07-dicroico/glass.css';
import './G08-progresivo/glass.css';
import './G09-grabado/glass.css';
import './G10-vitral/glass.css';

export interface GlassProps {
  glass: GlassLayer;
  params: GlassParams;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Contenedor de vidrio: aplica velo y desenfoque por variables CSS. */
export function Glass({ glass, params, as: Tag = 'div', className, style, children }: GlassProps): ReactNode {
  const vars = { '--kc-glass-veil': `${params.veil}%`, '--kc-glass-blur': `${params.blur}px`, ...style } as CSSProperties;
  return (
    <Tag className={['kc-glass', glass.className, className].filter(Boolean).join(' ')} style={vars} data-kc-glass={glass.id}>
      {children}
    </Tag>
  );
}
