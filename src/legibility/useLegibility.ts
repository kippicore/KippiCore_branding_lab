import { useEffect, useRef, useState } from 'react';
import type { ContrastReading, LegibilityInput, LegibilityResult } from '../contracts';
import { verdict } from '../theme/contrast';
import { measureLegibility } from './measure';

export interface UseLegibilityOpts {
  /** Hay capa dinámica: mide cada 500 ms con `getFrame()` y conserva el peor valor de `cycleMs`. */
  readonly dynamic?: boolean;
  readonly cycleMs?: number;
  readonly getFrame?: () => CanvasImageSource | undefined;
}

type Idle = (cb: () => void) => () => void;
const idle: Idle = (cb) => {
  const w = globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
  if (w.requestIdleCallback) {
    const h = w.requestIdleCallback(cb, { timeout: 400 });
    return () => w.cancelIdleCallback?.(h);
  }
  const h = setTimeout(cb, 0);
  return () => clearTimeout(h);
};

const worseReading = (a: ContrastReading, b: ContrastReading): ContrastReading => (b.worstRatio < a.worstRatio ? b : a);

/** El peor resultado (por lectura) entre dos mediciones. */
export const worstOf = (a: LegibilityResult, b: LegibilityResult): LegibilityResult => {
  const primary = worseReading(a.primary, b.primary), muted = worseReading(a.muted, b.muted);
  return {
    primary: { ...primary, verdict: verdict(primary.worstRatio) },
    muted: { ...muted, verdict: verdict(muted.worstRatio) },
    estimatedByWeight: b.estimatedByWeight,
    sampledPixels: b.sampledPixels,
    elapsedMs: b.elapsedMs,
  };
};

const keyOf = (i: LegibilityInput): string => JSON.stringify([
  i.atmosphere.id, i.glass.id, i.theme.paletteId, i.theme.mode, i.params, i.stage, i.glassRect, i.primaryRect, i.mutedRect, i.seed,
]);

/** Medidor reactivo. Nunca bloquea un frame: mide en idle. Devuelve null hasta la primera lectura. */
export function useLegibility(input: LegibilityInput | null, opts: UseLegibilityOpts = {}): LegibilityResult | null {
  const [result, setResult] = useState<LegibilityResult | null>(null);
  const [fontsTick, setFontsTick] = useState(0);
  const inputRef = useRef(input);
  inputRef.current = input;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const key = input ? keyOf(input) : '';
  const dynamic = !!opts.dynamic;

  useEffect(() => {
    let alive = true;
    (globalThis.document as Document | undefined)?.fonts?.ready.then(() => { if (alive) setFontsTick((n) => n + 1); }).catch(() => {});
    return () => { alive = false; };
  }, [key]);

  useEffect(() => {
    if (!inputRef.current) { setResult(null); return; }
    let alive = true;
    let cancelIdle: (() => void) | undefined;
    let busy = false;
    const history: { t: number; r: LegibilityResult }[] = [];
    setResult(null);

    const run = (): void => {
      const cur = inputRef.current;
      if (!cur || busy) return;
      busy = true;
      cancelIdle = idle(() => {
        const frame = dynamic ? optsRef.current.getFrame?.() : undefined;
        measureLegibility(frame ? { ...cur, frame } : cur)
          .then((r) => {
            if (!alive) return;
            if (!dynamic) { setResult(r); return; }
            const now = Date.now(), win = optsRef.current.cycleMs ?? 4000;
            history.push({ t: now, r });
            while (history.length > 1 && (history[0] as { t: number }).t < now - win) history.shift();
            setResult(history.map((h) => h.r).reduce(worstOf));
          })
          .catch(() => {})
          .finally(() => { busy = false; });
      });
    };

    if (dynamic) {
      run();
      const id = setInterval(run, 500);
      return () => { alive = false; clearInterval(id); cancelIdle?.(); };
    }
    const timer = setTimeout(run, 150); // debounce
    return () => { alive = false; clearTimeout(timer); cancelIdle?.(); };
  }, [key, dynamic, fontsTick]);

  return result;
}
