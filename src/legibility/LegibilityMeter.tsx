import { useState, type CSSProperties, type ReactNode } from 'react';
import type { ContrastReading, LegibilityInput, LegibilityResult, Verdict } from '../contracts';
import { autoVeil } from './auto-veil';

const LABEL: Record<Verdict, string> = {
  excelente: 'Excelente', suficiente: 'Suficiente', 'solo-grande': 'Solo texto grande', insuficiente: 'Insuficiente',
};
const MARK: Record<Verdict, string> = { excelente: '●●●', suficiente: '●●○', 'solo-grande': '●○○', insuficiente: '○○○' };
// Semáforo de la herramienta (no es una capa de marca): verde / verde claro / ámbar / rojo.
const DOT: Record<Verdict, string> = { excelente: '#1E9E5A', suficiente: '#6BB04A', 'solo-grande': '#D99A1B', insuficiente: '#D64545' };

const row: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, lineHeight: 1.5 };

function Line({ name, r }: { name: string; r: ContrastReading }): ReactNode {
  return (
    <div style={row} data-kc-meter-row={name}>
      <span aria-hidden style={{ color: DOT[r.verdict], letterSpacing: 1 }}>{MARK[r.verdict]}</span>
      <strong style={{ minWidth: 72 }}>{name}</strong>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.worstRatio.toFixed(1)}:1</span>
      <span>{LABEL[r.verdict]}</span>
    </div>
  );
}

export interface LegibilityMeterProps {
  result: LegibilityResult | null;
  /** Entrada actual: necesaria para «Ajustar velo». */
  input?: LegibilityInput | null;
  onVeilChange?: (veil: number) => void;
}

export function LegibilityMeter({ result, input, onVeilChange }: LegibilityMeterProps): ReactNode {
  const [busy, setBusy] = useState(false);
  if (!result) return <div style={row} aria-busy="true">Midiendo legibilidad…</div>;
  const adjust = async (): Promise<void> => {
    if (!input || !onVeilChange) return;
    setBusy(true);
    try { onVeilChange((await autoVeil(input)).veil); } finally { setBusy(false); }
  };
  return (
    <div role="group" aria-label="Legibilidad medida" data-kc-meter style={{ display: 'grid', gap: 2 }}>
      <Line name="Principal" r={result.primary} />
      <Line name="Secundario" r={result.muted} />
      <div style={{ ...row, opacity: 0.7 }}>
        <span>Estimado por peso:</span>
        <s style={{ fontVariantNumeric: 'tabular-nums' }}>{result.estimatedByWeight.toFixed(1)}:1</s>
      </div>
      <button type="button" onClick={adjust} disabled={busy || !input || !onVeilChange} style={{ justifySelf: 'start', marginTop: 4 }}>
        {busy ? 'Ajustando…' : 'Ajustar velo'}
      </button>
    </div>
  );
}
