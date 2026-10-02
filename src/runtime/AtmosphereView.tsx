import { useEffect, type ReactNode } from 'react';
import type { AtmosphereLayer, DynamicLayerInstance, DynamicParams, Motion, Theme } from '../contracts';
import { DynamicHost } from './DynamicHost';

export interface AtmosphereViewProps {
  atmosphere: AtmosphereLayer;
  theme: Theme;
  motion: Motion;
  /** Forma del contrato: `params`; `speed`/`density` sueltos también valen. El puntero lo lee el host del escenario. */
  params?: Pick<DynamicParams, 'speed' | 'density'> & Partial<DynamicParams>;
  speed?: number;
  density?: number;
  seed: number;
  /** Entrega al medidor de legibilidad `() => capture()` (o null si es estático). */
  onFrameSource?: (src: (() => Promise<CanvasImageSource>) | null) => void;
}

/** Estático siempre debajo (respaldo); si el movimiento es dinámico, el host dinámico encima. */
export function AtmosphereView({ atmosphere, theme, motion, params, seed, onFrameSource, ...rest }: AtmosphereViewProps): ReactNode {
  const dynamic = motion === 'dynamic';
  const speed = params?.speed ?? rest.speed ?? 1, density = params?.density ?? rest.density ?? 1;
  useEffect(() => { if (!dynamic) onFrameSource?.(null); }, [dynamic, onFrameSource]);
  const onInstance = (inst: DynamicLayerInstance | null): void => onFrameSource?.(inst ? () => inst.capture() : null);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {atmosphere.renderStatic(theme, { seed })}
      {dynamic && <DynamicHost atmosphere={atmosphere} theme={theme} seed={seed} speed={speed} density={density} onInstance={onInstance} />}
    </div>
  );
}
