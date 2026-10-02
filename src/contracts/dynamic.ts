import type { Hex, Theme } from './theme';
import type { AtmosphereId, Size } from './layer';

export type DynamicTech = 'css' | 'canvas2d' | 'webgl';

export interface DynamicParams {
  readonly speed: number;                         // 0.25–2 (control global)
  readonly density: number;                       // 0.5–1.5, 1 = valor de diseño
  readonly pointer: { readonly x: number; readonly y: number } | null;  // 0..1 en el escenario; null = sin puntero
}

export interface DynamicInit {
  readonly theme: Theme;
  readonly seed: number;
  readonly params: DynamicParams;
}

export interface DynamicLayerFactory {
  readonly id: AtmosphereId;
  readonly tech: DynamicTech;
  readonly cycleMs: number;                       // duración de un ciclo completo (de MOTION.md); el medidor la usa
  readonly usesPointer: boolean;
  /** Carga perezosa (chunk aparte): OGL y shaders no entran en el JS inicial. */
  load(): Promise<{ create(init: DynamicInit): DynamicLayerInstance }>;
}

export interface DynamicLayerInstance {
  /** Crea su <canvas> o sus nodos dentro de host (position:absolute; inset:0). No arranca. */
  mount(host: HTMLElement): void;
  /** size en px CSS; dpr ya viene limitado a 1.5 por el host. Ajusta el backing store. */
  resize(size: Size, dpr: number): void;
  /** Cambia de paleta interpolando en OKLCH durante transitionMs (0 = inmediato). */
  setTheme(theme: Theme, transitionMs: number): void;
  setParams(p: Partial<DynamicParams>): void;
  /** Idempotentes. start() no crea un rAF propio: el ticker llama a frame(). */
  start(): void;
  stop(): void;
  /** tMs = tiempo de la capa ya escalado por speed y acumulado solo mientras corre;
   *  dtMs ≤ 50. El estado visible debe ser función determinista de (seed, tMs, params). */
  frame(tMs: number, dtMs: number): void;
  /** Cuadro actual a resolución CSS (dpr 1), para el medidor de legibilidad. */
  capture(): Promise<CanvasImageSource>;
  /** Libera canvas, contexto GL (WEBGL_lose_context), listeners y timers. Tras dispose nada funciona. */
  dispose(): void;
  /** Solo tests/desarrollo: colores que está usando ahora (hex). */
  inspectColors?(): readonly Hex[];
}
