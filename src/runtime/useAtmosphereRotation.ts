// Rota los fondos al azar y de forma equitativa (ver lib/rotation). El orden cambia en cada visita (sal aleatoria de la
// sesión, solo de interfaz: las capas siguen siendo deterministas); se pausa con la pestaña oculta o si no está activa.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { pickAt, ROTATION_MS } from '../lib/rotation';

export interface Rotation<T> { current: T; skip: () => void }

export function useAtmosphereRotation<T>(items: readonly T[], enabled: boolean, periodMs = ROTATION_MS): Rotation<T> {
  const [salt] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const [step, setStep] = useState(0);
  const skip = useCallback(() => setStep((s) => s + 1), []);

  useEffect(() => {
    if (!enabled || items.length < 2) return;
    let timer = 0;
    const arm = (): void => { window.clearTimeout(timer); timer = window.setTimeout(() => { setStep((s) => s + 1); arm(); }, periodMs); };
    const onVis = (): void => { if (document.visibilityState === 'hidden') window.clearTimeout(timer); else arm(); };
    if (document.visibilityState !== 'hidden') arm();
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
  }, [enabled, items.length, periodMs, step]);   // `step` reinicia la cuenta tras un «siguiente» manual

  const current = useMemo(() => pickAt(items, salt, step), [items, salt, step]);
  return { current, skip };
}
