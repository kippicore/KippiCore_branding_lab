import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { AtmosphereLayer } from '../contracts';
import { FADE_MS } from '../lib/rotation';
import { AtmosphereView, type AtmosphereViewProps } from './AtmosphereView';

const fill: CSSProperties = { position: 'absolute', inset: 0 };

/** Aparece desde transparente (si `fade`) sobre lo que ya hay; el fondo anterior queda debajo, opaco, hasta que termina. */
function FadeIn({ fade, children }: { fade: boolean; children: ReactNode }): ReactNode {
  const [on, setOn] = useState(!fade);
  useEffect(() => {
    if (on) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return <div style={{ ...fill, opacity: on ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}>{children}</div>;
}

/** Como AtmosphereView, pero al cambiar de atmósfera hace un fundido cruzado en vez de un corte. */
export function CrossfadeAtmosphere(props: AtmosphereViewProps): ReactNode {
  const { atmosphere } = props;
  const [shown, setShown] = useState<AtmosphereLayer>(atmosphere);
  const [leaving, setLeaving] = useState<AtmosphereLayer | null>(null);
  if (shown.id !== atmosphere.id) { setLeaving(shown); setShown(atmosphere); }     // derivado durante el render: sin cuadro intermedio
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), FADE_MS + 150);
    return () => window.clearTimeout(t);
  }, [leaving]);
  return (
    <div style={{ ...fill, overflow: 'hidden' }}>
      {leaving && <div key={leaving.id} style={fill}><AtmosphereView {...props} atmosphere={leaving} /></div>}
      <FadeIn key={shown.id} fade={leaving !== null}><AtmosphereView {...props} atmosphere={shown} /></FadeIn>
    </div>
  );
}
