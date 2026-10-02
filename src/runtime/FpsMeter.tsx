import { useEffect, useState, type ReactNode } from 'react';

const enabled = (): boolean =>
  import.meta.env.DEV || (typeof location !== 'undefined' && new URLSearchParams(location.search).get('perf') === '1');

/** Contador de fps (media móvil de 1 s). Solo visible en desarrollo o con ?perf=1; el valor vive en window.__kcFps. */
export function FpsMeter(): ReactNode {
  const [fps, setFps] = useState(0);
  const on = enabled();
  useEffect(() => {
    if (!on) return;
    const id = window.setInterval(() => setFps(window.__kcFps ?? 0), 500);
    return () => window.clearInterval(id);
  }, [on]);
  if (!on) return null;
  return (
    <div aria-hidden="true" style={{ position: 'fixed', right: 8, bottom: 8, zIndex: 9999, padding: '2px 8px', borderRadius: 6,
      font: '600 11px/1.6 ui-monospace, monospace', color: '#FFFFFF', background: 'rgba(0,0,0,.6)', pointerEvents: 'none' }}>
      {fps.toFixed(0)} fps
    </div>
  );
}
