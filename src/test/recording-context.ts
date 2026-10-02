// Contexto 2D falso que registra colores usados (regla de oro).
export interface RecordingContext { ctx: CanvasRenderingContext2D; colorsUsed(): string[] }
const PROPS = ['fillStyle', 'strokeStyle', 'shadowColor', 'filter', 'globalCompositeOperation'];
export function createRecordingContext(): RecordingContext {
  const used: string[] = [];
  const store: Record<string | symbol, unknown> = {};
  const gradient = { addColorStop(_o: number, c: string) { used.push(c); } };
  const ctx = new Proxy(store, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createConicGradient') return () => gradient;
      return () => undefined;
    },
    set(t, k, v) { if (typeof k === 'string' && PROPS.includes(k)) used.push(String(v)); t[k] = v; return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, colorsUsed: () => [...used] };
}
