import { useEffect, useRef, type ReactNode } from 'react';
import { parseState } from '../../lib/url-state';
import { ensureFonts } from '../../theme/fonts';
import { resolveState } from '../shared';
import { Stage } from '../Combinador/Stage';

declare global { interface Window { __kcReady?: boolean } }

/** Ruta de capturas (?view=snap): solo el escenario a 960×600, sin interfaz. Estático salvo mv=d explícito. */
export function Snapshot(): ReactNode {
  const search = window.location.search;
  const s = parseState(search, { reducedMotion: false });
  const motion = new URLSearchParams(search).get('mv') === 'd' ? 'dynamic' : 'static';
  const r = resolveState(s);
  const done = useRef(false);

  useEffect(() => {
    if (!r || done.current) return;
    done.current = true;
    window.__kcReady = false;
    document.documentElement.style.background = 'transparent';
    void (async () => {
      await ensureFonts(r.type);
      await document.fonts?.ready;
      await new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
      window.__kcReady = true;
    })();
  }, [r]);

  if (!r) return <p>Sin datos de paletas o tipografías.</p>;
  return (
    <div style={{ width: 960, height: 600, margin: 0 }} data-kc-snapshot>
      <Stage state={{ ...s, motion }} resolved={r} size={{ w: 960, h: 600 }} />
    </div>
  );
}
