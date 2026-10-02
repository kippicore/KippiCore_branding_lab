# KippiCore Branding Lab · Plan de implementación (ronda 1: etapas 1–3)

> Plan para agentes ejecutores que **no** tienen el contexto de la conversación. Es autosuficiente: si algo no está aquí, está en la especificación `docs/KippiCore_Identidad_Visual_Laboratorio.md` (en adelante **la spec**, con referencias `§n` y números de línea). Las decisiones de stack y sus alternativas están en `docs/decisiones.md`. El diseño del movimiento de las atmósferas dinámicas está en `docs/MOTION.md` (lo escribe otro agente en paralelo; este plan solo fija el **contrato técnico** de esas capas).
>
> Versión 1.0 · 1 de octubre de 2026. Idioma del producto y de los textos de interfaz: español (Colombia). Idioma del código (identificadores): inglés; comentarios en español.

---

## 0. Reglas para quien ejecuta

1. **No hagas commits ni push** salvo que Miguel lo autorice en el chat. Si trabajas en un worktree, deja los cambios sin confirmar y repórtalos.
2. **Solo toca los archivos de tu paquete** (tabla del §6). Si necesitas cambiar un archivo ajeno o un contrato de `src/contracts/`, no lo cambies: escríbelo en tu informe final como «petición de cambio de contrato».
3. **Ninguna dependencia nueva.** El paquete P0 instala todas las dependencias permitidas (§2.2). Si crees que falta una, repórtalo.
4. **Regla de oro (spec §5.3.4):** atmósferas, vidrios, plantillas y capas dinámicas **solo** leen colores del `Theme` (en CSS, las variables `--kc-*`). Ningún hex, `rgb()` ni nombre de color en el código de capas, salvo blanco (`#FFFFFF`, `rgba(255,255,255,α)`), negro (`#000000`, `rgba(0,0,0,α)`), `transparent` y la base del ahumado `#0B0D12` (definida una sola vez en `theme/derive.ts`). Hay tests que lo verifican.
5. **Textos reales de KippiCore**, nunca lorem ipsum (§8.4 de este plan).
6. Al terminar, entrega un informe con: archivos creados, resultado de `npm run typecheck`, `npm test`, `npm run build`, rutas de las capturas que tomaste y cualquier desviación del plan.

---

## 1. Alcance de esta ronda

Corresponde a las etapas 1–3 del §5.9 de la spec.

**Dentro:**

| Bloque | Qué | Fuente en la spec |
|---|---|---|
| Motor de temas | `palette + mode → Theme` (roles, derivados, escalas OKLCH, variables CSS, objeto JS) | §5.3 (l. 1493–1507) |
| Datos | 22 paletas C01–C22 | §2 (l. 196–1033; JSON listo en l. 568–1032) |
| Tipografías | T00–T13 + **T14 «KippiLex»** (nueva, §3.3 de este plan) | §1 (l. 37–192) |
| Atmósferas | A01–A14 **estáticas**; A01, A05, A10, A11 **dinámicas** | §3 (l. 1037–1160) |
| Vidrios | G01–G10 (estáticos; ninguno es dinámico en esta ronda) | §4.1 (l. 1188–1404) |
| Legibilidad | Medidor real por canvas + «Ajustar velo» | §5.6 (l. 1549–1558) |
| Exportar | Tokens CSS y JSON de la combinación activa | §5.5.7 |
| Vistas | Combinador, Galerías (T, C, A, G) y Ficha, en versión mínima | §5.5 |
| Plantillas | Portada web y Tarjeta de pedido | §5.5.2 |
| Estado | Toda la combinación en la URL | §5.5.1 |
| Despliegue | Build estático listo para Vercel | — |

**Fuera (no lo hagas):** A15–A18, dinámicos de A02–A04/A06–A09/A12–A14, G11–G20, texturas X01–X40, Matriz, Comparar, Favoritos, exportar PNG y `.md`, transiciones pulidas con Motion, plantillas Dashboard/Instagram/Diapositiva/Tarjeta de presentación/Firma. El código debe dejar el hueco preparado (registros tipados) pero sin implementar.

---

## 2. Stack fijado y configuración

### 2.1 Stack (fijado por Miguel; justificación en `docs/decisiones.md`)

- **Vite** (última estable ≥ 7) + **React 19** + **TypeScript** estricto.
- **CSS con variables**, sin Tailwind. CSS Modules (`*.module.css`) para componentes de interfaz y plantillas; CSS global con clases `kc-…` **solo** para vidrios (porque el mismo archivo se exporta como snippet con `?raw`).
- **OGL** para WebGL (solo A01 dinámica en esta ronda). **Canvas 2D** para partículas (A05).
- **Estado en la URL** (query string) con un store mínimo propio sobre `useSyncExternalStore`. Sin router, sin Zustand.
- **Vitest** (unitarios, entorno `jsdom` para componentes, `node` para lógica pura) + **Playwright** (capturas y pruebas de navegador, solo Chromium).
- **Despliegue estático en Vercel** (cuenta de KippiCore, no la de Ian). Solo se despliega con autorización de Miguel.
- Fuentes: Google Fonts por CDN, cargadas bajo demanda por sistema tipográfico (en producción futura: autohospedar).

### 2.2 Dependencias permitidas (las instala P0)

- `dependencies`: `react`, `react-dom`, `ogl`.
- `devDependencies`: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `vitest`, `jsdom`, `@testing-library/react`, `@playwright/test`.
- Nada más. Conversión de color, OKLCH, contraste, PRNG, desenfoque y percentiles se escriben a mano (son pequeños y se testean).

### 2.3 `tsconfig.json`

`strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `noFallthroughCasesInSwitch: true`, `verbatimModuleSyntax: true`, `resolveJsonModule: true`, `jsx: "react-jsx"`, `target/lib: ES2022 + DOM + DOM.Iterable`, `moduleResolution: "bundler"`. Sin `any` explícito (si es inevitable, comentario `// any justificado: …` en la misma línea).

### 2.4 Scripts de `package.json`

| Script | Comando |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `typecheck` | `tsc -b --noEmit` (o `tsc --noEmit -p .`) |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `e2e` | `playwright test` |
| `capture` | `playwright test --grep @capture` |
| `size` | `node scripts/size.mjs` (suma gzip de `dist/assets/*.js` del chunk inicial; falla si > 250 KB) |

### 2.5 Vite

- Entrada de producción: solo `index.html`.
- **Arneses de desarrollo** (`harness/*.html`): páginas que cada paquete usa para verse y capturarse de forma aislada, antes de que existan las vistas. Se sirven con `npm run dev` (Vite sirve cualquier `.html` de la raíz del proyecto) y **no** entran al build de producción.
- Imports `?raw` para `.css` de vidrios y `.glsl` de shaders.
- Playwright: `webServer: { command: 'npm run dev -- --port 5199 --strictPort', port: 5199, reuseExistingServer: true }`, viewport por defecto 1280×800, `deviceScaleFactor: 1`.

### 2.6 `vercel.json`

```json
{ "buildCommand": "npm run build", "outputDirectory": "dist", "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## 3. Datos

### 3.1 Paletas

- `src/data/palettes.json`: copiar **literalmente** el JSON de la spec (l. 568–1032). Los 22 objetos `{ id, name, reg, light{6 roles}, dark{6 roles} }`.
- `src/data/palettes.ts`: importa el JSON, lo valida en tiempo de carga (función `assertPalette`) y añade por paleta `concept` y `risk` copiados de las fichas de la spec (§2, «Detalle de cada paleta»). Exporta `PALETTES: readonly Palette[]` y `getPalette(id)`.

### 3.2 Tipografías T00–T13

`src/data/typography.ts` con un `TypeSystem` por sistema (contrato en §4.2). Datos de la spec §1 (l. 47–184): familias de los tres niveles, pesos, peso del titular, tracking, escala relativa, registro, concepto, «ojo» y la consulta de Google Fonts **tal cual**. Marcar explícitamente:

- `italic: 'synthetic'` en los roles sin itálica real: Geist (T00, T13), Space Grotesk (T04), Bricolage (T05), Unbounded (T07), Syne (T09), Young Serif (T12), y cualquier familia cuya consulta no cargue `ital`.
- `singleWeight: true` en Instrument Serif (T01) y Young Serif (T12).
- T10: `uppercase: true` en display.
- T13: rol `accent` = Caveat, con `use: 'Solo anotaciones, nunca párrafos'`.
- Etiquetas: tracking `+0.12em` por defecto (spec §1, reglas).

### 3.3 T14 «KippiLex» (nueva)

Fuente: `~/Desktop/KippiLex/Contexto/06_identidad-visual.md`, §39 «Toga y Código». Datos ya extraídos (no hace falta abrir el archivo):

| Campo | Valor |
|---|---|
| `id` / `name` | `T14` / `KippiLex · Toga y Código` |
| `reg` | 40 (Equilibrio) |
| display | **Archivo**, peso de titular **800**, tracking **−0.035em**, escala 1, pesos cargados 600/700/800, itálica: `none` (no se usa) |
| text | **Inter**, 400/500/600, itálica `synthetic` (no se carga) |
| accent | **Playfair Display**, **solo itálica** (500 por defecto, 600 sobre oscuro). `use`: «Solo una palabra o frase corta dentro de un titular, citas y portadas. Nunca números, nunca párrafos ni botones.» |
| mono (etiquetas) | **Space Mono** 400/700, MAYÚSCULAS, tracking **+0.18em** |
| Google Fonts | `family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,500;1,600&family=Space+Mono:wght@400;700` |
| concept | «Sistema tipográfico de KippiLex (Toga = peso jurídico, Código = impulso tecnológico). Está aquí para comparar: responde la decisión abierta 1 de la spec (§7). KippiLex no usa Geist.» |
| caution | «Referencia, no candidata: KippiCore decidió apartarse de la identidad de KippiLex. Archivo nunca por debajo de 18 px ni con tracking positivo; Playfair nunca compone números.» |
| source | `KippiLex/Contexto/06_identidad-visual.md §39` |

Nota para T00: la spec (l. 53) pide confirmar si Geist es la de KippiLex. **No lo es**: KippiLex usa Archivo + Inter + Playfair Display + Space Mono. Reflejarlo en el `caution` de T00: «No es la tipografía de KippiLex (ver T14).»

### 3.4 Atmósferas y vidrios (metadatos)

- `src/data/atmospheres.ts`: `id, name, subtitle, reg?, weight, description, staticRecipe (texto de la spec), dynamicNote` para A01–A14 (spec §3). El registro (`reg`) de las atmósferas no viene en la spec: dejar `reg: null` y mostrar «sin registro».
- `src/data/glass.ts`: `id, name, subtitle, reg, description, useIn, avoid, defaults { blur, veil }` para G01–G10 (spec §4.1, «Valores recomendados»). **Ojo:** el bloque CSS de algunos vidrios usa un desenfoque distinto del «recomendado» (G02: 9 px vs 16; G03: 8 vs 20; G06: 24 vs 16). Regla: `defaults.blur` = el valor del CSS (es el que se probó visualmente); el «recomendado» se guarda como `recommendedBlur` y se muestra en la Ficha.

### 3.5 Rangos de registro (filtro de Galerías)

`Enterprise` ≤ 35 · `Equilibrio` 36–64 · `Pyme` ≥ 65 (coincide con todas las etiquetas de la spec).

---

## 4. Contratos (TypeScript)

Viven en `src/contracts/` (los escribe P0 **exactamente así** y quedan congelados durante la ronda). Todos los paquetes importan de `src/contracts/index.ts`.

### 4.1 `contracts/theme.ts`

```ts
export type Hex = `#${string}`;                    // siempre #RRGGBB en mayúsculas
export type Mode = 'light' | 'dark';
export type RoleKey = 'bg' | 'surface' | 'ink' | 'muted' | 'primary' | 'accent';
export type Roles = Readonly<Record<RoleKey, Hex>>;

export type PaletteId =
  | 'C01' | 'C02' | 'C03' | 'C04' | 'C05' | 'C06' | 'C07' | 'C08' | 'C09' | 'C10' | 'C11'
  | 'C12' | 'C13' | 'C14' | 'C15' | 'C16' | 'C17' | 'C18' | 'C19' | 'C20' | 'C21' | 'C22';

export interface Palette {
  readonly id: PaletteId;
  readonly name: string;
  readonly reg: number;                            // 0 enterprise … 100 pyme
  readonly concept: string;
  readonly risk: string;
  readonly light: Roles;
  readonly dark: Roles;
}

export type ToneStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type ToneScale = Readonly<Record<ToneStep, Hex>>;

export interface Derived {
  readonly onPrimary: Hex;          // el de más contraste entre #FFFFFF, ink y bg
  readonly onAccent: Hex;           // ídem
  readonly accentAsText: Hex;       // accent si contraste(accent, bg) ≥ 4.5; si no, primary
  readonly accentIsFillOnly: boolean;
  readonly glow: Hex;               // = accent
  readonly glow2: Hex;              // = primary
  readonly glowMix: Hex;            // = mix(accent, primary, .5)
  readonly ambient: Hex;            // = mix(accent, bg, .2)
  readonly bgDeep: Hex;             // dark: mix(bg, #000000, .65); light: = bg   (A05)
  readonly smokeBase: Hex;          // = #0B0D12 (constante única, G05)
  readonly onSmoke: Hex;            // = mix(#FFFFFF, ink, .92)
  readonly mutedOnSmoke: Hex;       // = mix(#FFFFFF, muted, .72)
  readonly blendMode: 'screen' | 'multiply';   // dark → screen; light → multiply
  readonly scales: { readonly primary: ToneScale; readonly accent: ToneScale };
}

export type Rgb01 = readonly [number, number, number];  // sRGB gamma, 0..1 (para shaders)

export type ThemeColorKey = RoleKey | 'glow' | 'glow2' | 'glowMix' | 'ambient' | 'bgDeep'
  | 'onPrimary' | 'onAccent' | 'accentAsText' | 'onSmoke' | 'mutedOnSmoke';

export interface Theme {
  readonly paletteId: PaletteId;
  readonly mode: Mode;
  readonly roles: Roles;
  readonly derived: Derived;
  readonly rgb: Readonly<Record<ThemeColorKey, Rgb01>>;
  readonly cssVars: Readonly<Record<`--kc-${string}`, string>>;   // ver §4.1.1
}
```

**`mix(a, b, t)`**: interpolación lineal **en sRGB gamma** con `t` = proporción de `a` (la notación de la spec, l. 1041). Es la misma operación que `color-mix(in srgb, a t%, b)`. Usar siempre `in srgb` en CSS para que CSS y canvas coincidan.

**Escalas tonales (OKLCH):** para `primary` y `accent`, conservar el tono (h) y el croma (C) del color base; fijar la luminosidad L por paso: 50→0.97, 100→0.93, 200→0.87, 300→0.79, 400→0.70, 500→0.61, 600→0.53, 700→0.45, 800→0.37, 900→0.29, 950→0.22; si el resultado cae fuera de sRGB, reducir C por bisección hasta que entre.

#### 4.1.1 Variables CSS (salida de `toCssVars(theme, type?)`)

Colores: `--kc-bg --kc-surface --kc-ink --kc-muted --kc-primary --kc-accent --kc-on-primary --kc-on-accent --kc-accent-text --kc-glow --kc-glow-2 --kc-glow-mix --kc-ambient --kc-bg-deep --kc-smoke-base --kc-on-smoke --kc-muted-on-smoke --kc-primary-50 … --kc-primary-950 --kc-accent-50 … --kc-accent-950`.
Otros: `--kc-blend` (`screen`|`multiply`), `--kc-mode` (`light`|`dark`).
Tipografía (si se pasa `type`): `--kc-font-display --kc-font-text --kc-font-mono --kc-font-accent --kc-display-weight --kc-display-tracking --kc-display-scale --kc-display-transform --kc-label-tracking`.
Vidrio (las pone el componente `<Glass>`, no el tema): `--kc-glass-veil` (porcentaje, p. ej. `55%`) y `--kc-glass-blur` (p. ej. `18px`).

Las variables de color se registran con `CSS.registerProperty` (`syntax: '<color>'`, `inherits: true`) para que el cambio de paleta se interpole con `transition: … 500ms` (requisito §5.3.5 de la spec; el pulido fino queda para la etapa 6).

### 4.2 `contracts/typography.ts`

```ts
export type TypeId = 'T00' | 'T01' | 'T02' | 'T03' | 'T04' | 'T05' | 'T06' | 'T07'
  | 'T08' | 'T09' | 'T10' | 'T11' | 'T12' | 'T13' | 'T14';

export interface FontRole {
  readonly family: string;                 // nombre exacto en Google Fonts
  readonly stack: string;                  // `"Geist", system-ui, sans-serif`
  readonly weights: readonly number[];
  readonly italic: 'native' | 'synthetic' | 'none';
  readonly singleWeight?: boolean;
}

export interface TypeSystem {
  readonly id: TypeId;
  readonly name: string;
  readonly reg: number;
  readonly concept: string;
  readonly caution: string;
  readonly display: FontRole & {
    readonly headingWeight: number;
    readonly tracking: string;             // '-0.035em'
    readonly scale: number;                // escala relativa de la spec
    readonly uppercase?: boolean;          // T10
  };
  readonly text: FontRole;
  readonly mono: FontRole & { readonly labelTracking: string };   // '0.12em' | '0.18em'
  readonly accent?: FontRole & { readonly use: string };          // T13 Caveat, T14 Playfair
  readonly googleFontsQuery: string;       // la parte después de css2?
  readonly source?: string;
}
```

### 4.3 `contracts/layer.ts`

Adapta la interfaz `Layer` de la spec (§5.4, l. 1513–1524): `renderStatic` se mantiene; `renderDynamic` se sustituye por una **fábrica con ciclo de vida** (§4.4) porque React no basta para gobernar WebGL/canvas, pausa y captura.

```ts
import type { ReactNode } from 'react';
import type { Hex, Theme } from './theme';
import type { DynamicLayerFactory } from './dynamic';

export type AtmosphereId = 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07'
  | 'A08' | 'A09' | 'A10' | 'A11' | 'A12' | 'A13' | 'A14';
export type GlassId = 'G01' | 'G02' | 'G03' | 'G04' | 'G05' | 'G06' | 'G07' | 'G08' | 'G09' | 'G10';
export type LayerKind = 'atmosphere' | 'glass' | 'texture';

export interface Size { readonly w: number; readonly h: number }
export interface Rect { readonly x: number; readonly y: number; readonly w: number; readonly h: number }

export interface LayerMeta {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly kind: LayerKind;
  readonly reg: number | null;
  readonly description: string;
  readonly useIn?: string;
  readonly avoid?: string;
}

export interface StaticOpts { readonly seed: number }

export interface AtmosphereLayer extends LayerMeta {
  readonly kind: 'atmosphere';
  readonly id: AtmosphereId;
  readonly weight: number;                                   // «peso» de la spec
  /** CSS/SVG puro. Usa var(--kc-*) para los colores: recolorea sin re-render. */
  renderStatic(theme: Theme, opts: StaticOpts): ReactNode;
  /** El mismo cuadro, pintado en Canvas 2D con colores resueltos del theme.
   *  Debe coincidir visualmente con renderStatic (ver §7.3). `tMs` solo lo usan
   *  las capas dinámicas de tecnología 'css' para reproducir un instante. */
  paint(ctx: CanvasRenderingContext2D, theme: Theme, size: Size,
        opts: StaticOpts & { readonly tMs?: number }): Promise<void>;
  /** Snippet CSS legible para Ficha y exportación (generado, con var(--kc-*)). */
  staticCss(): string;
  readonly dynamic?: DynamicLayerFactory;                    // lo inyecta el registro dinámico
}

export interface GlassParams { readonly veil: number; readonly blur: number }  // veil 0–100, blur px

export interface GlassModel {
  /** Filtro del backdrop tal como lo aplica el CSS del vidrio. */
  readonly saturate: number;
  readonly brightness: number;
  /** Velo: color y alfa compuestos sobre el fondo desenfocado. */
  veil(theme: Theme, p: GlassParams): { readonly color: Hex; readonly alpha: number };
  /** G08: fracción de desenfoque en la altura normalizada y (0 arriba, 1 abajo). */
  blurMaskAt?(yNorm: number): number;
  /** G09: true donde el grabado deja ver el fondo nítido (sin velo ni blur). */
  sharpAt?(x: number, y: number): boolean;
  /** Capas encima del velo (brillos, estrías, tintes, paños). Solo blanco/negro/theme. */
  paintOverlays?(ctx: CanvasRenderingContext2D, theme: Theme, rect: Rect, p: GlassParams): void;
}

export interface GlassLayer extends LayerMeta {
  readonly kind: 'glass';
  readonly id: GlassId;
  readonly defaults: GlassParams;
  readonly recommendedBlur: number;
  readonly className: string;            // 'kc-glass--G03'
  readonly css: string;                  // contenido del .css del vidrio (import ?raw)
  readonly text: 'theme' | 'smoke';      // G05 usa onSmoke / mutedOnSmoke
  readonly model: GlassModel;
}
```

### 4.4 `contracts/dynamic.ts` — contrato de cada capa dinámica

```ts
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
```

**Ciclo de vida (lo garantiza `runtime/DynamicHost.tsx`, paquete P3):**

```
montaje del host
  └─ siempre: renderStatic(theme) debajo (respaldo, reduced-motion, pérdida de contexto)
  └─ si movimiento = dinámico y no hay prefers-reduced-motion y la capa tiene `dynamic`:
       load() → create(init) → mount(host) → resize(size, min(devicePixelRatio, 1.5)) → setTheme(theme, 0)
       └─ visible (IntersectionObserver, rootMargin 100px) y pestaña visible → start()
cambios
  ├─ ResizeObserver (throttle a 1 rAF)       → resize()
  ├─ cambio de paleta/modo                   → setTheme(theme, 500)
  ├─ speed / density / pointer               → setParams()
  ├─ sale de pantalla o pestaña oculta       → stop()   (y vuelve: start())
  ├─ webglcontextlost                        → stop(); dispose(); queda el estático + aviso
  └─ prefers-reduced-motion pasa a activo    → stop(); dispose()
desmontaje o cambio de atmósfera             → stop(); dispose()
```

- El host hace aparecer el canvas dinámico con una transición de opacidad **en el propio nodo dinámico** (nunca en un ancestro del vidrio; ver riesgo R1).
- Un único bucle `requestAnimationFrame` global (`lib/ticker.ts`) llama `frame()` de las instancias arrancadas. Acumula `tMs += dt × speed` por instancia; `dt` se recorta a 50 ms (al volver de una pestaña oculta no hay salto).
- Puntero: el host escucha `pointermove`/`pointerleave` sobre el escenario solo si `usesPointer`, normaliza a 0..1 y llama `setParams({ pointer })`.

**Contrato por capa dinámica de esta ronda.** El *qué se mueve y cómo* (curvas, tiempos, amplitudes, densidades, comportamiento del puntero) lo define **`docs/MOTION.md`**; si MOTION.md no existe aún, usar los valores del §3 de la spec. La tecnología la fija este plan:

| Capa | `tech` | `cycleMs` (por defecto si MOTION.md no dice otra cosa) | `usesPointer` | Uniforms / colores leídos del Theme | `capture()` | Notas |
|---|---|---|---|---|---|---|
| **A01 Aurora** | `webgl` (OGL, un triángulo a pantalla completa) | 54 000 (MCM de 18–27 s) | no | `bg, accent, primary, glowMix, mix(bg, accent, .85)` como `vec3` sRGB | `createImageBitmap(gl.canvas)` **inmediatamente después** de dibujar, dentro del mismo `frame` (no requiere `preserveDrawingBuffer`) | Las 4 luces de la receta estática con deriva por ruido simplex; la luz en sombra a la izquierda se conserva (ahí va el texto). Shader en `.glsl` importado con `?raw`. |
| **A05 Bioluminiscencia** | `canvas2d` | 30 000 | no | `bgDeep, accent, primary, ambient` | copia del canvas propio reescalado a dpr 1 | Atmósfera insignia. 34 partículas × `density`; deriva por campo de ruido con semilla, pulso senoidal, líneas de «sinapsis» entre partículas cercanas (O(n²) aceptable hasta 80). Posición = f(seed, tMs) para que sea determinista. |
| **A10 Plasma duotono** | `css` (Web Animations API sobre los nodos de luz) | 40 000 | no | `var(--kc-primary)`, `var(--kc-accent)`, `var(--kc-blend)` | `paint(ctx, theme, size, { tMs })` de la capa estática con la posición orbital de `tMs` | Las dos luces orbitan. `stop()` = `animation.pause()`; `frame()` sincroniza `currentTime` cada ~1 s para no desfasar. |
| **A11 Rejilla iluminada** | `css` + JS (variables `--kc-spot-x/--kc-spot-y` en el nodo de la capa) | 24 000 | **sí** | `var(--kc-ink)`, `var(--kc-accent)`, `var(--kc-primary)` | `paint(…, { tMs })` con la posición del foco actual | Foco (máscara + luz) sigue al puntero con resorte; sin puntero, deambula (Lissajous lento). Las variables se escriben en el nodo de la capa, nunca en un ancestro del vidrio. |

Todas: si `params.speed` cambia, el estado no salta (solo cambia el ritmo de `tMs`). Ninguna parpadea: amplitudes y ciclos según MOTION.md (spec: 16–60 s por ciclo).

### 4.5 `contracts/template.ts`

```ts
export type TemplateId = 'hero' | 'order-card';

export interface TemplateProps {
  readonly glass: GlassLayer;
  readonly glassParams: GlassParams;
  readonly type: TypeSystem;        // para saber si hay rol accent (Playfair/Caveat)
}

export interface TemplateDef {
  readonly id: TemplateId;
  readonly name: string;            // 'Portada web' | 'Tarjeta de pedido'
  readonly Component: (p: TemplateProps) => ReactNode;
}
```

Reglas de plantilla:
- Colores y fuentes **solo** vía `var(--kc-*)`; el tema lo pone `ThemeScope` en un ancestro.
- Cada plantilla marca **un** bloque de lectura principal dentro de un vidrio con `data-kc-probe="primary"` y, dentro de él, el texto secundario con `data-kc-probe="muted"`. El medidor mide esos rectángulos.
- Nunca anidar `<Glass>` dentro de `<Glass>` (riesgo R1).
- El escenario no fija tamaño: la plantilla se adapta a su contenedor (`container-type: inline-size`, unidades `cqw`).

### 4.6 `contracts/state.ts`

```ts
export type Motion = 'static' | 'dynamic';
export type ViewId = 'combinador' | 'galerias' | 'ficha';
export type GalleryTab = 'T' | 'C' | 'A' | 'G';
export type RegFilter = 'all' | 'enterprise' | 'equilibrio' | 'pyme';

export interface LabState {
  readonly view: ViewId;
  readonly palette: PaletteId;      // c
  readonly type: TypeId;            // t
  readonly atmosphere: AtmosphereId;// a
  readonly glass: GlassId;          // g
  readonly mode: Mode;              // m = light|dark
  readonly motion: Motion;          // mv = s|d
  readonly speed: number;           // sp (0.25–2, paso 0.25)
  readonly veil: number | null;     // v  (null = defaults del vidrio)
  readonly blur: number | null;     // b
  readonly template: TemplateId;    // tpl
  readonly seed: number;            // s
  readonly gallery: GalleryTab;     // gt
  readonly reg: RegFilter;          // r
  readonly ficha: string | null;    // id (A05, G07, C05, T14)
}
```

URL de ejemplo: `/?c=C20&t=T00&a=A05&g=G01&m=dark&mv=d&sp=1&tpl=hero` · Ficha: `/?view=ficha&id=A05` · Galería: `/?view=galerias&gt=A&r=pyme`.
**Valores por defecto** (dirección D-D de la spec, la favorita de Miguel): `c=C20 t=T00 a=A05 g=G01 m=dark mv=d sp=1 tpl=hero s=1 view=combinador`. Si `prefers-reduced-motion`, `mv=s`. Parámetros inválidos → valor por defecto, sin error. Solo se escriben en la URL los que difieren del defecto. Cambios de combinación → `history.replaceState`; cambio de vista → `history.pushState` (atrás funciona).

### 4.7 `contracts/legibility.ts`

```ts
export type Verdict = 'excelente' | 'suficiente' | 'solo-grande' | 'insuficiente';
// ≥ 7 excelente · ≥ 4.5 suficiente · ≥ 3 solo texto grande · < 3 insuficiente

export interface ContrastReading {
  readonly textColor: Hex;
  readonly p10Luminance: number;     // luminancia relativa WCAG del fondo compuesto
  readonly p90Luminance: number;
  readonly worstRatio: number;       // mínimo de contraste contra p10 y p90
  readonly verdict: Verdict;
}

export interface LegibilityResult {
  readonly primary: ContrastReading;     // ink (u onSmoke) sobre el rect data-kc-probe="primary"
  readonly muted: ContrastReading;       // muted (o mutedOnSmoke) sobre el rect "muted"
  readonly estimatedByWeight: number;    // método viejo (color promedio con «peso»), solo para comparar
  readonly sampledPixels: number;
  readonly elapsedMs: number;
}

export interface LegibilityInput {
  readonly atmosphere: AtmosphereLayer;
  readonly glass: GlassLayer;
  readonly theme: Theme;
  readonly params: GlassParams;
  readonly stage: Size;                  // px CSS
  readonly glassRect: Rect;              // rect del vidrio que contiene el probe, en coords del escenario
  readonly primaryRect: Rect;
  readonly mutedRect: Rect;
  readonly seed: number;
  readonly frame?: CanvasImageSource;    // si hay dinámico: capture() actual
}
```

### 4.8 Utilidades compartidas (firmas fijas)

| Archivo | Firmas |
|---|---|
| `lib/prng.ts` | `mulberry32(seed: number): () => number` · `hashSeed(...parts: (string \| number)[]): number` (FNV-1a 32 bits) |
| `lib/imageops.ts` | `blurImageData(img: ImageData, radiusPx: number): ImageData` (3 pasadas de caja ≈ gaussiana, radio = blur CSS) · `saturateBrightness(img, sat, bright): ImageData` (matrices de `filter` CSS) · `luminancePercentiles(img, mask?, ps: number[]): number[]` |
| `theme/color.ts` | `hexToRgb01`, `rgb01ToHex`, `mix(a: Hex, b: Hex, t: number): Hex`, `withAlpha(h: Hex, a: number): string` |
| `theme/contrast.ts` | `relativeLuminance(h: Hex \| Rgb01): number` · `contrastRatio(a, b): number` · `pickBestContrast(on: Hex, candidates: Hex[]): Hex` · `verdict(ratio): Verdict` |
| `theme/oklch.ts` | `hexToOklch`, `oklchToHex` (con recorte de croma), `lerpOklch(a: Hex, b: Hex, t): Hex` |
| `theme/derive.ts` | `deriveTheme(p: Palette, m: Mode): Theme` (memoizado por `id+mode`) · `glassBg(veil: number): string` → `color-mix(in srgb, var(--kc-surface) ${veil}%, transparent)` · `smoke(veil: number): string` → `rgba(11,13,18, ${min(1, veil/100 + .25)})` |
| `theme/css-vars.ts` | `toCssVars(theme: Theme, type?: TypeSystem): Record<string, string>` · `registerThemeProperties(): void` (idempotente) |
| `theme/ThemeScope.tsx` | `<ThemeScope theme type? as? className?>` aplica `cssVars` como `style` y `data-kc-mode` |
| `theme/fonts.ts` | `ensureFonts(t: TypeSystem): Promise<void>` (inyecta un `<link>` por sistema una sola vez y espera `document.fonts.load` de display/text/mono/accent) |
| `layers/shared/color-expr.ts` | `type ColorExpr = ThemeColorKey \| 'white' \| 'black' \| { mix: [ColorExpr, ColorExpr, number] }` · `exprToCss(e): string` (var/`color-mix(in srgb …)`) · `exprToHex(e, theme): Hex` |
| `layers/shared/light.tsx` | `interface Light { x; y; d; color: ColorExpr; alpha; blur?: number; blend?: 'screen'\|'multiply'\|'theme' }` · `<Lights items>` (divs absolutos) · `paintLights(ctx, theme, size, items)` · `lightsToCss(items): string` |

---

## 5. Estructura de carpetas (exacta)

La app vive en la **raíz del repo** (no en una subcarpeta `kippicore-lab/` como sugería la spec §5.8; ver `decisiones.md`). Entre corchetes, el paquete dueño.

```
KippiCore_branding_lab/
  index.html                         [P0 → P6 ajusta título/meta]
  package.json  package-lock.json    [P0]
  tsconfig.json  tsconfig.node.json  [P0]
  vite.config.ts  vitest.config.ts   [P0]
  playwright.config.ts               [P0]
  vercel.json  .gitignore            [P0]   (.gitignore: node_modules, dist, captures, test-results, playwright-report)
  scripts/size.mjs                   [P0]
  docs/  PLAN.md · decisiones.md · MOTION.md · KippiCore_Identidad_Visual_Laboratorio.md
  harness/
    theme.html        theme.tsx        [P1]   paletas × modos, derivados y escalas
    atmospheres.html  atmospheres.tsx  [P2]   A01–A14 estáticas + paint() lado a lado
    dynamic.html      dynamic.tsx      [P3]   A01/A05/A10/A11 dinámicas + FPS
    glass.html        glass.tsx        [P4]   G01–G10 sobre una atmósfera + medidor
    templates.html    templates.tsx    [P5]   Portada y Tarjeta + export
  e2e/
    theme.spec.ts                      [P1]
    atmospheres.spec.ts                [P2]
    dynamic.spec.ts                    [P3]
    glass.spec.ts  legibility.spec.ts  [P4]
    templates.spec.ts                  [P5]
    app.spec.ts  capture.spec.ts       [P6]
  src/
    main.tsx                           [P0 stub → P6]
    vite-env.d.ts                      [P0]
    contracts/  theme.ts typography.ts layer.ts dynamic.ts template.ts state.ts legibility.ts index.ts   [P0, congelado]
    data/
      palettes.json  palettes.ts  typography.ts            [P1]
      atmospheres.ts                                       [P2]
      glass.ts                                             [P4]
    theme/  color.ts contrast.ts oklch.ts derive.ts css-vars.ts ThemeScope.tsx fonts.ts interpolate.ts   [P1]
    lib/
      prng.ts imageops.ts                                  [P1]
      ticker.ts fps.ts                                     [P3]
      url-state.ts clipboard.ts download.ts                [P5]
    layers/
      shared/  color-expr.ts light.tsx svg.ts grain.ts     [P2]
      atmospheres/
        index.ts                                           [P2]  registro: ATMOSPHERES, getAtmosphere(id)
        dynamic-registry.ts                                [P3]  DYNAMIC_ATMOSPHERES: Partial<Record<AtmosphereId, DynamicLayerFactory>>
        A01-aurora/            static.tsx paint.ts         [P2] · dynamic.ts aurora.frag.glsl aurora.vert.glsl [P3]
        A02-malla/             static.tsx paint.ts         [P2]
        A03-grano/             static.tsx paint.ts         [P2]
        A04-bokeh/             static.tsx paint.ts         [P2]
        A05-bioluminiscencia/  static.tsx paint.ts         [P2] · dynamic.ts [P3]
        A06-haz/               static.tsx paint.ts         [P2]
        A07-eclipse/           static.tsx paint.ts         [P2]
        A08-seda/              static.tsx paint.ts         [P2]
        A09-horizonte/         static.tsx paint.ts         [P2]
        A10-plasma/            static.tsx paint.ts         [P2] · dynamic.ts [P3]
        A11-rejilla/           static.tsx paint.ts         [P2] · dynamic.ts [P3]
        A12-manchas/           static.tsx paint.ts         [P2]
        A13-tipografia/        static.tsx paint.ts         [P2]
        A14-datos/             static.tsx paint.ts         [P2]
      glass/
        index.ts  Glass.tsx  glass-base.css                [P4]
        G01-esmerilado/ … G10-vitral/   glass.css  model.ts  [P4]
    runtime/  DynamicHost.tsx  AtmosphereView.tsx  FpsMeter.tsx   [P3]
    legibility/  raster.ts glass-model.ts measure.ts auto-veil.ts useLegibility.ts LegibilityMeter.tsx   [P4]
    templates/  index.ts copy.ts  Hero/Hero.tsx Hero.module.css  OrderCard/OrderCard.tsx OrderCard.module.css   [P5]
    export/  tokens.ts                                     [P5]
    views/
      Combinador/  Combinador.tsx Combinador.module.css Selector.tsx Stage.tsx CodeBar.tsx ExportPanel.tsx   [P6]
      Galerias/    Galerias.tsx Galerias.module.css cards/ (TypeCard PaletteCard AtmosphereCard GlassCard)   [P6]
      Ficha/       Ficha.tsx Ficha.module.css              [P6]
      Snapshot/    Snapshot.tsx                            [P6]  (?view=snap para capturas)
    app/  App.tsx Shell.tsx shortcuts.ts                   [P6]
    styles/  reset.css [P0] · ui.css [P6]
    test/  setup.ts recording-context.ts two-themes.ts     [P0]
  **/*.test.ts(x) junto a cada módulo, del mismo dueño que el módulo.
```

**Stubs de P0.** Todo archivo que un paquete importa de otro existe desde P0 como *stub tipado* (misma firma, cuerpo `throw new Error('pendiente: P1')` o registro vacío `[]`/`{}`). Así cada paquete compila contra los contratos aunque los demás no hayan terminado. El dueño sustituye el stub completo. Lista de stubs: `theme/*`, `data/palettes.ts`, `data/typography.ts`, `lib/prng.ts`, `lib/imageops.ts`, `layers/shared/color-expr.ts`, `layers/shared/light.tsx`, `layers/atmospheres/index.ts`, `layers/atmospheres/dynamic-registry.ts`, `layers/glass/index.ts`, `layers/glass/Glass.tsx`, `runtime/AtmosphereView.tsx`, `runtime/FpsMeter.tsx`, `legibility/useLegibility.ts`, `legibility/LegibilityMeter.tsx`, `templates/index.ts`, `export/tokens.ts`, `lib/url-state.ts`, `lib/clipboard.ts`, `lib/download.ts`.

**Utilidades de test de P0** (`src/test/`):
- `recording-context.ts`: un `CanvasRenderingContext2D` falso (Proxy) que registra cada asignación de `fillStyle`, `strokeStyle`, `shadowColor`, `filter`, `globalCompositeOperation` y cada `addColorStop(offset, color)` de gradientes. Expone `colorsUsed(): string[]`.
- `two-themes.ts`: dos `Theme` sintéticos (A y B) con los seis roles totalmente distintos entre sí, para los tests de la regla de oro.
- `setup.ts`: `@testing-library` + polyfills mínimos (`CSS.registerProperty` no-op, `ResizeObserver`, `IntersectionObserver` simulados).

---

## 6. Paquetes de trabajo

Orden: **P0 primero (secuencial, corto)** → **P1–P6 en paralelo** → **I (integración)**. Los archivos de P1–P6 son disjuntos (§5). Recomendación de aislamiento: un `git worktree` por paquete (`wp/P1-tema`, …) creado desde el estado de P0, solo si Miguel autoriza el commit base; si no, todos en el mismo árbol (funciona porque los archivos son disjuntos), y cada paquete ejecuta sus tests con filtro de ruta (`npx vitest run src/theme`), dejando `typecheck` global para el final de su trabajo.

### P0 · Fundación (secuencial, ~1 h)

**Archivos:** los marcados [P0] en §5, `src/contracts/*` (copiados de §4 **literalmente**), todos los stubs y `src/test/*`.
**Tareas:** crear el proyecto Vite React TS en la raíz (sin borrar `docs/` ni `README.md`), instalar exactamente las dependencias de §2.2, configurar §2.3–2.6, `npx playwright install chromium` (descarga del navegador: pedir permiso si el entorno lo exige), `index.html` con `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com`, `lang="es-CO"`, `src/styles/reset.css` (reset moderno breve).
**Verificación:** `npm run typecheck`, `npm test` (pasa con 0 o 1 test trivial), `npm run build`, `npm run dev` abre una página en blanco sin errores de consola.

### P1 · Motor de temas, datos y utilidades puras

**Archivos:** `src/data/palettes.json`, `palettes.ts`, `typography.ts`; `src/theme/*`; `src/lib/prng.ts`, `src/lib/imageops.ts`; `harness/theme.*`; `e2e/theme.spec.ts`; tests junto a cada módulo.
**Tareas:**
1. Datos de §3.1–3.3 (22 paletas, T00–T14).
2. `color.ts`, `contrast.ts` (WCAG 2.x), `oklch.ts` (sRGB ↔ lineal ↔ OKLab ↔ OKLCH, recorte de croma por bisección).
3. `derive.ts` según §4.1 (fórmulas exactas allí). Memoizar.
4. `css-vars.ts` con la lista exacta de §4.1.1 y `registerThemeProperties()`.
5. `ThemeScope.tsx` (aplica variables con `transition` de 500 ms en las de color registradas).
6. `interpolate.ts`: `lerpTheme(a: Theme, b: Theme, t): Theme` interpolando cada color en OKLCH (lo usan las capas dinámicas en `setTheme`).
7. `fonts.ts` (§4.8).
8. `prng.ts`, `imageops.ts` (§4.8).
9. Arnés `harness/theme.html`: cuadrícula de las 22 paletas × 2 modos con los 6 roles, derivados (marca «solo relleno» si `accentIsFillOnly`), escalas 50–950 y un especimen de cada tipografía T00–T14.

**Tests (Vitest):**
- `contrastRatio('#000000','#FFFFFF') = 21`; casos conocidos con tolerancia 0.01.
- Para las 22 paletas × 2 modos: `ink/bg ≥ 13` y `muted/bg ≥ 5.4` (spec §2). Si alguna falla, **no cambiar el dato**: dejar el test con la lista de excepciones y reportarlo.
- `accentIsFillOnly` en modo claro es `true` al menos para C07 (lima), C11 (maíz), C17 (mandarina), C18 (lavanda) y C19 (pistacho). Imprimir la lista completa calculada en el informe.
- `deriveTheme(C05, light).derived.onPrimary === roles.ink` (el coral no lleva texto blanco, spec l. 300).
- OKLCH: `#FF0000 → L≈0.628, C≈0.258, h≈29.2`; ida y vuelta de las 264 cifras de las paletas con error ≤ 1/255 por canal.
- Escalas: 11 pasos, L monótona decreciente, todos dentro de sRGB.
- `mix('#000000','#FFFFFF',.5) === '#808080'` (redondeo documentado) y `mix(a,b,1) === a`.
- `mulberry32(1)` produce la misma secuencia siempre (fijar los 5 primeros valores); `hashSeed('A05', 1)` estable.
- `blurImageData` conserva la media de una imagen plana; `luminancePercentiles` en un degradado conocido.
- `toCssVars` contiene todas las claves de §4.1.1 y ningún valor `undefined`.
- Todos los `TypeSystem` tienen las familias de sus roles dentro de `googleFontsQuery`; T14 existe con Archivo 800 / −0.035em / reg 40.

**Capturas:** `e2e/theme.spec.ts @capture` → `captures/P1/theme-light.png`, `theme-dark.png` del arnés.
**Hecho cuando:** tests verdes, `typecheck` y `build` limpios, capturas revisadas a ojo (las 22 paletas se ven y los «solo relleno» están marcados).

### P2 · Atmósferas estáticas A01–A14 (CSS/SVG + `paint()` en canvas)

**Archivos:** `src/data/atmospheres.ts`; `src/layers/shared/*`; `src/layers/atmospheres/index.ts`; en cada carpeta `A0x-…/` los archivos `static.tsx` y `paint.ts`; `harness/atmospheres.*`; `e2e/atmospheres.spec.ts`; tests.
**Tareas:**
1. `color-expr.ts` y `light.tsx` (§4.8). `luz(x, y, d, color, α)` de la spec = `Light { x, y, d, color, alpha }`: div absoluto de ancho `d%` del contenedor, `aspect-ratio: 1`, centrado en `(x%, y%)`, `background: radial-gradient(circle, <color> 0, <color con alfa 0> 68%)`, `opacity: α`. En canvas: `createRadialGradient` con radio `d/2 % del ancho` y los mismos topes.
2. Una carpeta por atmósfera siguiendo **exactamente** la receta estática de la spec §3 (l. 1050–1160). `renderStatic` usa `var(--kc-*)`/`exprToCss`; `paint` usa `exprToHex(theme)`. Las piezas comunes:
   - `svg.ts`: constructor de SVG en dos modos, `'vars'` (para el DOM, con `var(--kc-…)`) y `'resolved'` (hex del theme, para dibujarlo en canvas como `Image` desde `data:` URL). Lo usan A03 (grano `feTurbulence`), A08 (seda) y A14 (datos).
   - `grain.ts`: ruido `feTurbulence` (baseFrequency .75, 3 octavas, `seed` fijo) para A03; en canvas, `globalCompositeOperation = 'overlay'`.
   - A04 (16 discos) y A05 (34 partículas): posiciones/tamaños/colores con `mulberry32(hashSeed(id, seed))`.
   - A06: `conic-gradient` + `blur(28px)`; en canvas, `createConicGradient` + `ctx.filter` (si `ctx.filter` no existe, `blurImageData`).
   - A10: `mix-blend-mode: var(--kc-blend)`; en canvas `globalCompositeOperation` = `theme.derived.blendMode`.
   - A11: cuadrícula de 44 px en `ink` al 14 % con `mask-image` radial; en canvas, dibujar la rejilla y aplicar la máscara con `destination-in`. Exponer las variables `--kc-spot-x/--kc-spot-y` (por defecto 65 % / 40 %) en el nodo raíz de la capa: P3 las mueve.
   - A13: textos «KippiCore», «sistemas», «a la medida» con `var(--kc-font-display)`; `paint` espera `document.fonts.ready` antes de dibujar.
   - Cada nodo raíz de atmósfera: `position:absolute; inset:0; overflow:hidden; isolation:isolate; background: var(--kc-bg)`. **Prohibido** en la raíz: `filter`, `opacity < 1`, `mask`, `backdrop-filter`, `mix-blend-mode`, `will-change` (riesgo R1). Esos efectos van en los hijos.
   - En CSS y canvas, los «transparentes» de los degradados se escriben como **el mismo color con alfa 0** (no `transparent`) para que canvas no mezcle hacia negro (riesgo R6).
3. `staticCss()` generado desde los datos (`lightsToCss`), no escrito a mano.
4. `index.ts`: `ATMOSPHERES: readonly AtmosphereLayer[]` y `getAtmosphere(id)`; fusiona `dynamic` desde `DYNAMIC_ATMOSPHERES` (stub vacío hasta que llegue P3).
5. Arnés: para la paleta/modo de la query (`?c=C05&m=dark`), una cuadrícula de 14 celdas con dos mitades: izquierda `renderStatic`, derecha `paint` en un canvas del mismo tamaño (480×300).

**Tests (Vitest):**
- **Regla de oro, estática:** `renderToStaticMarkup(renderStatic(themeA))` de las 14 no contiene hex ni `rgb(` salvo blanco/negro (regex sobre el marcado); y el código fuente de `layers/atmospheres/**` no contiene literales de color (test que lee los archivos con `fs`).
- **Regla de oro, canvas:** `paint()` con `recording-context` y los temas A y B de `two-themes.ts`: ningún color usado con A aparece con B (salvo blanco/negro/alfa 0), y todos los colores usados con A son derivables del tema A.
- Semilla: dos llamadas a `paint` con la misma semilla producen la misma secuencia de operaciones; con otra semilla, distinta (A04, A05).
- Registro: 14 atmósferas, ids únicos, `weight` igual al de la spec.

**Playwright:** `e2e/atmospheres.spec.ts`:
- `@capture`: arnés en C05 claro, C05 oscuro, C20 oscuro, C11 claro → `captures/P2/<paleta>-<modo>.png`.
- **Equivalencia DOM ↔ canvas** (crítico para el medidor): para cada atmósfera en C05 oscuro y C03 claro, capturar la mitad DOM y la mitad canvas, dividir en una rejilla de 8×5 y comparar la luminancia media por celda: diferencia ≤ 0.04 (luminancia relativa) en ≥ 90 % de las celdas. Reportar la peor atmósfera.
**Hecho cuando:** tests y equivalencia en verde, capturas revisadas contra las recetas.

### P3 · Runtime dinámico + A01, A05, A10, A11 dinámicas

Leer **`docs/MOTION.md`** antes de empezar; manda en todo lo que sea movimiento. Este paquete implementa el contrato del §4.4.
**Archivos:** `src/lib/ticker.ts`, `src/lib/fps.ts`; `src/runtime/*`; `src/layers/atmospheres/dynamic-registry.ts`; `dynamic.ts` (+ `.glsl` en A01) en A01, A05, A10, A11; `harness/dynamic.*`; `e2e/dynamic.spec.ts`; tests.
**Tareas:**
1. `ticker.ts`: un único rAF; `add(instance)`/`remove`; `t` acumulado por instancia × speed; `dt` ≤ 50 ms; se detiene solo cuando no hay instancias.
2. `fps.ts` + `FpsMeter.tsx`: media móvil de 1 s; visible solo con `import.meta.env.DEV` o `?perf=1`; expone `window.__kcFps` (número) para Playwright.
3. `DynamicHost.tsx`: el ciclo de vida del §4.4 completo (IntersectionObserver, `visibilitychange`, ResizeObserver, `matchMedia('(prefers-reduced-motion: reduce)')` con escucha de cambios, DPR = `min(devicePixelRatio, 1.5)`, pérdida de contexto WebGL, puntero).
4. `AtmosphereView.tsx`: `({ atmosphere, theme, motion, speed, seed, onFrameSource? })` → estático, o estático + `DynamicHost`. `onFrameSource` entrega al medidor una función `() => instance.capture()` (o `null` si es estático).
5. Las cuatro capas según la tabla del §4.4. A01: OGL `Renderer({ dpr, alpha: false, antialias: false, powerPreference: 'low-power' })`, `Triangle` + `Program`, uniforms `uTime, uRes, uBg, uAccent, uPrimary, uMix, uShade, uSeed`; los shaders reproducen la composición de la receta estática (para que el salto estático → dinámico no se note). A05: canvas 2D con `globalCompositeOperation='lighter'` solo en modo oscuro (en claro, `source-over`). `setTheme(theme, ms)` interpola con `lerpTheme` dentro de `frame()`.
6. `dynamic-registry.ts`: `DYNAMIC_ATMOSPHERES` con las cuatro fábricas; `load()` con `import()` dinámico (chunk aparte).
7. Arnés: las 4 dinámicas en 2×2 a 640×400 con selector de paleta/modo, velocidad, botón para simular «fuera de pantalla» (scroll) y el FpsMeter.

**Tests (Vitest, jsdom con timers falsos):**
- Host: con `prefers-reduced-motion` no llama `create()`; al salir de pantalla llama `stop()`; con pestaña oculta `stop()`; al desmontar `stop()` y `dispose()` exactamente una vez; `resize` recibe `dpr ≤ 1.5` aunque `devicePixelRatio = 3`.
- Ticker: con `dt` de 2 s, el `dtMs` entregado es 50; `speed = 2` duplica el avance de `t`.
- Determinismo: A05 con la misma semilla y `tMs` produce las mismas posiciones (`recording-context`).
- Regla de oro dinámica: A05 y A10/A11 con temas A y B → `inspectColors()` cambia por completo tras `setTheme(B, 0)`. A01: `inspectColors()` devuelve los hex de sus uniforms.

**Playwright (`e2e/dynamic.spec.ts`):**
- `@capture`: cuadros a t = 0 s y t = 5 s (forzar `tMs` con `?t=5000`) → `captures/P3/`.
- Pausa real: tras hacer scroll para sacar la capa de la vista, el número de `frame()` (contador expuesto en `window.__kcFrames`) no aumenta en 1 s.
- Rendimiento: A05 en 1280×800 durante 5 s, `window.__kcFps` medio ≥ 55 en la máquina de pruebas (si la máquina es lenta, reportar la cifra en vez de fallar).
**Hecho cuando:** tests verdes, capturas revisadas, cifras de FPS en el informe y confirmación explícita de qué partes de MOTION.md se implementaron y cuáles no.

### P4 · Vidrios G01–G10 + medidor de legibilidad real

**Archivos:** `src/data/glass.ts`; `src/layers/glass/*` (incluye `Glass.tsx`, `glass-base.css`, y en cada `G0x-…/` `glass.css` + `model.ts`); `src/legibility/*`; `harness/glass.*`; `e2e/glass.spec.ts`, `e2e/legibility.spec.ts`; tests.
**Tareas:**
1. `glass-base.css`: `.kc-glass { position: relative; isolation: isolate; border-radius: 18px; color: var(--kc-ink) } .kc-glass > * { position: relative; z-index: 2 }` y el prefijo `-webkit-backdrop-filter` junto a cada `backdrop-filter`.
2. Un `glass.css` por vidrio, traducción **literal** del CSS de la spec §4.1 con tres sustituciones: `var(--surface)` → `var(--kc-surface)`; velo y desenfoque → `var(--kc-glass-veil)` / `var(--kc-glass-blur)`; G10 `--tinta/--primario/--acento` → `--kc-ink/--kc-primary/--kc-accent`. G04 genera el ruido con un SVG `feTurbulence` en `data:` URL. G05 redefine localmente `--kc-ink: var(--kc-on-smoke); --kc-muted: var(--kc-muted-on-smoke)` y usa `smoke()` para su fondo. G08 y G09 ponen el `backdrop-filter` en `::before` (spec l. 1404). G10 dibuja el emplomado en `::after`.
3. `Glass.tsx`: `<Glass layer params as? className? children>` → `class="kc-glass kc-glass--G0x"`, `style={{ '--kc-glass-veil': veil+'%', '--kc-glass-blur': blur+'px' }}`, `data-kc-glass="G0x"`. Importa el `.css` del vidrio; `index.ts` lo importa además con `?raw` para `GlassLayer.css`.
4. `model.ts` de cada vidrio (§4.3 `GlassModel`): saturación/brillo, velo, máscaras y `paintOverlays` que reproducen en canvas lo que el CSS pinta encima del backdrop (brillo especular de G02, estrías de G03, grano de G04, halo de G06, tinte y filo de G07, paños y plomo de G10).
5. **Medidor** (spec §5.6):
   - `raster.ts`: pinta el fondo del escenario a dpr 1 en un `OffscreenCanvas` (o canvas fuera del DOM): si hay `frame` (dinámico) lo dibuja; si no, `atmosphere.paint(theme, stage, { seed })`.
   - `glass-model.ts`: recorta `glassRect` + margen de 2× blur; aplica `blur` (con `ctx.filter` si existe, si no `blurImageData`), luego `saturateBrightness`, luego compone el velo (`model.veil`) y `paintOverlays`. G08: mezcla por fila entre nítido y desenfocado según `blurMaskAt`. G09: donde `sharpAt` es true, usa el píxel nítido sin velo (peor caso real).
   - `measure.ts`: `measureLegibility(input): Promise<LegibilityResult>`; luminancias p10/p90 en `primaryRect` y `mutedRect` (si el área supera 256×256, submuestrear de forma regular); `worstRatio = min(contraste(texto, p10), contraste(texto, p90))`; texto = `ink`/`muted` u `onSmoke`/`mutedOnSmoke` según `glass.text`. `estimatedByWeight`: mezcla `surface` (velo) sobre `mix(glowMix, bg, weight)` y su contraste (el método viejo, para comparar).
   - `auto-veil.ts`: `autoVeil(input, target = 4.5)`: búsqueda binaria del velo entre el actual y 95 % (paso mínimo 1 %) hasta que `muted.worstRatio ≥ target`; devuelve `{ veil, result, reached }`.
   - `useLegibility.ts`: estático → recalcula con *debounce* de 150 ms al cambiar algo (incluido `document.fonts.ready` y el `ResizeObserver` del escenario); dinámico → cada 500 ms con `capture()`, conserva el **peor valor** de una ventana de `cycleMs` y se reinicia al cambiar la combinación. Nunca bloquea un frame: medir dentro de `requestIdleCallback` (con respaldo `setTimeout`).
   - `LegibilityMeter.tsx`: semáforo para texto principal y secundario (cifra con 1 decimal, verdicto en palabras, no solo color), el valor estimado tachado al lado y el botón **«Ajustar velo»** que llama `onVeilChange(veil)`.
6. Arnés: atmósfera elegible (por defecto A01) a 960×600, los 10 vidrios en una rejilla de tarjetas con texto real (§8.4) y, debajo de cada uno, su lectura del medidor y su botón «Ajustar velo».

**Tests (Vitest):**
- Regla de oro: el CSS de los 10 vidrios no contiene colores salvo blanco/negro/`transparent` (la base del ahumado entra por variable); `paintOverlays` con temas A y B no comparte colores de tema.
- `measureLegibility` con un fondo plano sintético conocido (canvas falso o `ImageData` construido a mano): coincide con `contrastRatio` calculado a mano (± 0.05).
- Velo 100 % sobre cualquier fondo → contraste = `contrastRatio(ink, surface)`.
- `autoVeil` es monótono y se detiene en el primer velo que cumple.
- Verdicto en los umbrales exactos (6.99 → suficiente; 7 → excelente; 4.5; 3).

**Playwright:**
- `glass.spec.ts @capture`: los 10 vidrios sobre A01 y A13 en C05 oscuro y C03 claro → `captures/P4/`. Comprobación DOM: ningún `.kc-glass` tiene ancestro `.kc-glass`, y ningún ancestro del vidrio hasta el escenario tiene `filter`, `opacity < 1`, `backdrop-filter`, `mask`, `clip-path`, `mix-blend-mode` o `will-change` con alguno de ellos (calculado con `getComputedStyle`).
- `legibility.spec.ts` — **medido = real**: para 5 casos fijos (A01+G01 C05 oscuro · A05+G05 C20 oscuro · A13+G03 C03 claro · A02+G08 C07 claro · A11+G09 C09 claro), tomar una captura del navegador, calcular p10/p90 de luminancia sobre los mismos rects **excluyendo los píxeles del texto** (renderizar el escenario una vez con el texto en `color: transparent`) y comparar con el medidor: diferencia de `worstRatio` ≤ 10 %. Escribir la tabla en el informe.
**Hecho cuando:** tests verdes, los 5 casos dentro de tolerancia (o explicados), capturas revisadas.

### P5 · Estado en URL, plantillas y exportación

**Archivos:** `src/lib/url-state.ts`, `clipboard.ts`, `download.ts`; `src/templates/*`; `src/export/tokens.ts`; `harness/templates.*`; `e2e/templates.spec.ts`; tests.
**Tareas:**
1. `url-state.ts`: `parseState(search: string, env: { reducedMotion: boolean }): LabState`, `serializeState(s: LabState): string` (omite defectos), `useLabState(): [LabState, (patch: Partial<LabState>, opts?: { push?: boolean }) => void]` sobre `useSyncExternalStore` + `popstate`. `comboCode(s): string` → `C20 · T00 · A05 · G01`.
2. `clipboard.ts` (`navigator.clipboard.writeText` con respaldo `execCommand`), `download.ts` (`Blob` + `URL.createObjectURL` + `<a download>`).
3. Plantillas (contrato §4.5) con textos de §8.4:
   - **Portada web (`hero`)**: barra superior en vidrio (marca «KippiCore» compuesta en la fuente display, 4 enlaces, botón), *kicker* en etiqueta mono, titular con `text-wrap: balance` donde **una sola palabra** va en el rol `accent` si el sistema lo tiene (Playfair itálica en T14, Caveat como anotación en T13; nunca un número), subtítulo, dos botones (`primary` con `--kc-on-primary`; secundario con borde), y a la derecha la **tarjeta de pedidos en vidrio** (KPIs + 4 filas) que lleva `data-kc-probe`. **Ojo:** la barra y la tarjeta son vidrios hermanos, nunca anidados.
   - **Tarjeta de pedido (`order-card`)**: una tarjeta de vidrio centrada «Pedido #4821 · Entregado 22:14» con su detalle; lleva `data-kc-probe`.
   - Cifras con `font-variant-numeric: tabular-nums`; etiquetas en mono, MAYÚSCULAS, 11 px, `letter-spacing: var(--kc-label-tracking)`; titular con `font-weight: var(--kc-display-weight)`, `letter-spacing: var(--kc-display-tracking)`, `text-transform: var(--kc-display-transform)`.
4. `export/tokens.ts`:
   - `buildTokenBundle({ theme, type, atmosphere, glass, params, state }): TokenBundle` con `{ code, mode, palette: { id, name, roles, derived, scales }, typography: { id, name, display, text, mono, accent?, googleFontsQuery }, atmosphere: { id, name, css: staticCss() }, glass: { id, name, veil, blur, css } }`.
   - `toCssFile(bundle): string`: comentario de cabecera con el código y la URL, `:root { --kc-… }` (todas las variables de §4.1.1 incluidas las tipográficas), el `@import` de Google Fonts y el CSS del vidrio.
   - `toJsonFile(bundle): string` (JSON con 2 espacios).
   - Nombre de archivo: `kippicore-C20-T00-A05-G01-dark.css|json`.
5. Arnés: las dos plantillas sobre un fondo plano `var(--kc-bg)` (sin atmósfera) en 3 temas, y botones de exportar que muestran el texto generado en un `<pre>`.

**Tests (Vitest):**
- `parseState(serializeState(s))` = `s` para 50 estados aleatorios (con `mulberry32`); parámetros inválidos → defectos; `reducedMotion` fuerza `motion='static'` solo si `mv` no viene en la URL.
- Plantillas con `renderToStaticMarkup`: sin literales de color; exactamente un `data-kc-probe="primary"` y uno `"muted"`; ningún `[data-kc-glass] [data-kc-glass]`; ningún número dentro del elemento de acento.
- `toCssFile` para C01 claro + T00 + A01 + G01: *snapshot* estable; contiene las 6 variables de rol con los hex de la spec.
- `toJsonFile` es JSON válido y `JSON.parse(...).code === 'C01 · T00 · A01 · G01'`.

**Capturas:** `captures/P5/hero-<tema>.png`, `order-card-<tema>.png` en C05 claro, C20 oscuro, C04 claro con T00, T02 y T14.
**Hecho cuando:** tests verdes y capturas revisadas (las tipografías cambian, el acento aparece solo en T13/T14, nada de lorem).

### P6 · Aplicación y vistas (Combinador, Galerías, Ficha, Snapshot)

Compila contra los stubs de P0; hasta la integración verá registros vacíos o errores de stub en tiempo de ejecución, así que debe programar con estados vacíos («sin elementos») y probar con datos falsos locales en sus tests.
**Archivos:** `src/main.tsx`, `src/app/*`, `src/views/*`, `src/styles/ui.css`, `index.html` (título «KippiCore · Laboratorio de marca», meta description), `e2e/app.spec.ts`, `e2e/capture.spec.ts`; tests.
**Tareas:**
1. `ui.css`: tokens de la interfaz del propio laboratorio (`--ui-bg, --ui-panel, --ui-ink, --ui-muted, --ui-line, --ui-focus, --ui-accent`) en claro y oscuro según `prefers-color-scheme`, con contraste AA medido (≥ 4.5 texto, ≥ 3 bordes de control y foco). La interfaz del laboratorio **no** usa `--kc-*`: así no cambia de color con la paleta que se está probando.
2. `Shell.tsx`: cabecera con navegación entre las tres vistas (`<nav>` con enlaces reales `?view=…`), atajos visibles (`?` abre la ayuda), `FpsMeter` en desarrollo.
3. **Combinador** (vista principal):
   - Columna izquierda: seis selectores nativos (`<select>` con flechas ‹ › a los lados) para **Tipografía, Paleta, Atmósfera, Vidrio**, conmutador **Claro/Oscuro**, conmutador **Estático/Dinámico** (con aviso «Reducir movimiento está activo» cuando aplique), regulador **Velocidad** 0.25×–2× (solo en dinámico), reguladores **Velo** y **Desenfoque** del vidrio con botón «Restablecer», y el registro (0–100) de cada elección en una barrita Enterprise ↔ Pyme. Las atmósferas con versión dinámica llevan la marca «dinámica» en el selector.
   - Derecha: pestañas de plantilla (**Portada web**, **Tarjeta de pedido**) y el **escenario**: `ThemeScope(theme, type)` → `div.stage` (relativo, 16:10, `container-type: inline-size`) → `AtmosphereView` + plantilla. El escenario y sus ancestros cumplen la regla del riesgo R1.
   - Debajo: barra de código `C20 · T00 · A05 · G01 · oscuro · dinámico` con **Copiar código** y **Copiar enlace**; `LegibilityMeter` (mide los rects `data-kc-probe` relativos al escenario, vía `getBoundingClientRect`); panel **Exportar** (Descargar CSS, Descargar JSON, Copiar CSS).
   - Atajos (inactivos si el foco está en un campo de texto o un `select` abierto): `t`/`T` tipografía siguiente/anterior, `c`/`C` paleta, `a`/`A` atmósfera, `g`/`G` vidrio, `m` modo, `d` estático/dinámico, `[`/`]` velocidad, `1`/`2` plantilla, `?` ayuda. Implementados en `app/shortcuts.ts` con una tabla única que también alimenta la ayuda.
4. **Galerías**: pestañas Tipografías · Paletas · Atmósferas · Vidrios; filtro por registro (Todos, Enterprise, Equilibrio, Pyme; §3.5). Tarjetas **siempre estáticas** (sin WebGL ni canvas vivos): Tipografía = especimen (titular, cuerpo, etiqueta, «itálica sintética»/«un solo peso» si aplica; fuentes cargadas con `ensureFonts` solo cuando la tarjeta entra en pantalla); Paleta = 6 roles en claro y oscuro + marca «acento solo relleno»; Atmósfera = `renderStatic` en miniatura con la paleta activa; Vidrio = el vidrio sobre la atmósfera activa con texto real. Cada tarjeta: código, nombre, registro, y dos acciones: **Ver ficha** y **Usar en el combinador**.
5. **Ficha** (`?view=ficha&id=…`): según el prefijo del id (C, T, A, G): nombre, descripción, dónde usar, qué evitar, registro, peso (atmósferas), valores recomendados (vidrios, mostrando `recommendedBlur` si difiere), vista previa grande (estática; botón para ver la dinámica si existe), y el código listo para copiar: paletas → tabla de roles con contraste contra `bg` y JSON de la paleta; tipografías → consulta de Google Fonts y variables CSS; atmósferas → `staticCss()`; vidrios → `css`. Botón **Usar en el combinador**.
6. **Snapshot** (`?view=snap&a=…&g=…&c=…&m=…&tpl=…&mv=s`): solo el escenario a 960×600, sin interfaz; pone `window.__kcReady = true` cuando `document.fonts.ready` y el primer pintado terminaron. Es la ruta de las capturas masivas.
7. Accesibilidad: todo operable con teclado, foco visible (`:focus-visible` con `--ui-focus`), `aria-live="polite"` en el veredicto del medidor, etiquetas `<label>` en todos los controles, `prefers-reduced-motion` respetado también en las transiciones de la interfaz.

**Tests (Vitest + Testing Library):** atajos cambian el estado correcto y se ignoran dentro de inputs; el filtro de registro filtra con los rangos de §3.5; la Ficha resuelve los 4 prefijos y muestra «no encontrado» para ids inválidos; la barra de código coincide con `comboCode`.
**Playwright:** `app.spec.ts`: navegación completa solo con teclado (Tab/flechas/atajos) cambia la URL y el escenario; recargar con la URL restaura la combinación; botón atrás vuelve de Ficha a Galerías. `capture.spec.ts` (`@capture`, se ejecuta en la integración): ver §7.2.
**Hecho cuando:** tests verdes con datos falsos; en integración, las vistas funcionan con los registros reales.

### I · Integración (un agente, después de P1–P6)

**Orden de fusión** (cada paso: `npm run typecheck && npm test && npm run build` antes del siguiente):
1. **P1** (todo depende del tema real).
2. **P2** (las atmósferas reales sustituyen el registro vacío).
3. **P4** (vidrios y medidor; necesitan `paint()` de P2 y `imageops` de P1).
4. **P3** (dinámicas; se enchufan vía `dynamic-registry.ts` en el registro de P2).
5. **P5** (URL, plantillas, exportación).
6. **P6** (vistas; ahora con datos reales).

**Tareas de integración:** eliminar cualquier stub restante (`grep -r "pendiente: P"` debe dar 0), resolver las peticiones de cambio de contrato que hayan llegado (decidir y documentar en `docs/decisiones.md`), ejecutar toda la batería de §7, revisar el presupuesto de JS, preparar el despliegue y escribir en `README.md` cómo correr, probar y desplegar. **El despliegue a Vercel (cuenta KippiCore) solo con autorización de Miguel.**

---

## 7. Verificación

### 7.1 Por paquete

Cada paquete entrega: `npm run typecheck` sin errores · sus tests de Vitest en verde · `npm run build` sin errores ni *warnings* de tipos · sus capturas en `captures/<paquete>/` revisadas a ojo (el agente las abre y describe en el informe qué ve y si coincide con la receta de la spec).

### 7.2 Batería de integración

1. `npm run typecheck`, `npm test`, `npm run build`, `npm run size` (JS inicial ≤ 250 KB gzip, sin contar fuentes; OGL y las capas dinámicas en chunks perezosos).
2. `npm run e2e` completo.
3. **Capturas masivas** (`capture.spec.ts`, ruta Snapshot, estático): 14 atmósferas × 22 paletas × 2 modos con G01 encima (616 imágenes, 480×300) y 10 vidrios × 22 × 2 sobre A01 (440). Se guardan en `captures/matrix/` (no se versionan). Revisar a ojo una muestra de 40 y reportar cualquier atmósfera que quede fija en un color al cambiar la paleta.
4. **Criterios de aceptación de la spec §5.10** aplicados a esta ronda:
   - Cambiar la paleta recolorea interfaz de muestra, atmósferas (incluidas las partículas de A05) y vidrios en < 600 ms sin recargar: medir en Playwright (cambio de `select` → color de un píxel conocido del escenario estabilizado) y reportar el tiempo.
   - A01, A05, A10 y A11 funcionan en estático y dinámico; el dinámico se pausa fuera de pantalla y con la pestaña oculta.
   - La combinación se comparte por URL (abrir la URL en una pestaña nueva reproduce el escenario) y se exporta como CSS y JSON.
   - Legibilidad medida = real: los 5 casos de P4 + verificación manual de Miguel (abrir 5 combinaciones, cuentagotas sobre el fondo junto al texto, comparar con el semáforo).
   - 60 fps sostenidos en el Combinador con A05 dinámica + G01 en un portátil de gama media: `window.__kcFps` medio ≥ 55 durante 10 s en 1440×900; reportar también con la pestaña Portada web abierta.
5. Lighthouse (o equivalente) de accesibilidad ≥ 95 en Combinador y Galerías.

---

## 8. Detalles de diseño que no deben perderse

### 8.1 Composición del escenario

```
ThemeScope (--kc-* y fuentes)          ← sin filter/opacity/mask/backdrop-filter/will-change
 └─ div.stage (relative, overflow hidden, container-type)
     ├─ AtmosphereView (absolute, inset 0, z 0)
     │    ├─ renderStatic(...)          ← siempre presente
     │    └─ DynamicHost (si dinámico) ← canvas/WebGL/nodos animados
     └─ Template (relative, z 1)
          ├─ Glass (barra)              ← hermanos, nunca anidados
          └─ Glass (tarjeta, data-kc-probe)
```

### 8.2 Transición de paleta

CSS: variables de color registradas con `@property`/`CSS.registerProperty` + `transition: 500ms` en `ThemeScope` (los navegadores interpolan colores en OKLab). Dinámicas: `setTheme(theme, 500)` interpola en OKLCH dentro de `frame()`. Si el dinámico está parado, aplica el tema de inmediato.

### 8.3 Fuentes

Una hoja de Google Fonts por sistema tipográfico, inyectada al seleccionarlo (`display=swap`). Después de `ensureFonts`, el medidor vuelve a medir (el texto cambia de tamaño y los rects de `data-kc-probe` también). Galerías: carga perezosa por tarjeta visible.

### 8.4 Textos reales (copiar en `templates/copy.ts`)

Tomados de los materiales de KippiCore (`KippiCore_Identidad_Visual.html`) y de la spec:

- Marca: **KippiCore** · *kicker*: «Software a la medida · Bogotá».
- Navegación: «Soluciones», «Casos», «Cómo trabajamos», «Precios» · botón «Agendar diagnóstico».
- Titular: «Sus pedidos dejan de vivir en un **celular**.» (la palabra en negrilla es la que toma el rol `accent` en T13/T14).
- Subtítulo: «Pedidos, domicilios y cartera de sus sedes en un solo sistema, a precio cerrado.»
- Botones: «Agendar diagnóstico» (primario) · «Ver un caso real» (secundario).
- Tarjeta de pedidos (vidrio): título «Panadería La Espiga · 4 sedes»; KPIs: «Pedidos de hoy · 38 · +12 % frente a ayer», «Domicilios en ruta · 7 · Próximo despacho: 11:40 a. m.»; filas (Pedido · Detalle · Hora · Estado): «1042 · Chapinero · Domicilio · 120 pandebonos · 09:42 · En ruta», «1041 · Cedritos · Mostrador · pedido para evento · 10:15 · Entregado», «1040 · Usaquén · Cliente institucional · factura · 11:03 · Confirmado», «1039 · Chapinero · Domicilio · pan tajado · 11:20 · Recibido».
- Tarjeta suelta: «Pedido #4821 · Entregado 22:14» · «Panadería La Espiga · Sede Chapinero» · «Domicilio · confirmado por WhatsApp a las 21:37» · «Total $ 184.000» · estado «Entregado».
- Formatos es-CO: `$ 184.000`, `11:40 a. m.`, `+12 %`.

### 8.5 Semillas

Semilla global `s` (URL, por defecto 1). Cada capa usa `mulberry32(hashSeed(layerId, s))`. Mismo enlace = mismo dibujo en cualquier equipo.

---

## 9. Riesgos y cómo se mitigan

| # | Riesgo | Mitigación concreta |
|---|---|---|
| **R1** | **`backdrop-filter` anidado / raíz de backdrop.** Un vidrio solo desenfoca lo pintado dentro de su *Backdrop Root*. Cualquier ancestro con `filter`, `opacity < 1`, `mask`, `clip-path`, `backdrop-filter`, `mix-blend-mode` o `will-change` de esas propiedades corta el fondo: el vidrio se ve vacío o plano. Un vidrio dentro de otro no ve la atmósfera. | Composición fija del §8.1; la raíz de atmósfera solo usa `isolation: isolate` (no crea raíz de backdrop); efectos en los hijos; fundidos de entrada en el nodo dinámico, nunca en un ancestro; G08/G09 desenfocan en `::before` (spec l. 1404); vidrios hermanos, nunca anidados; test DOM de P4 que recorre ancestros con `getComputedStyle`. |
| **R2** | **DPR.** Canvas a `devicePixelRatio` 2–3 multiplica por 4–9 el costo; el medidor podría muestrear a otra escala que la vista. | DPR del canvas vivo = `min(devicePixelRatio, 1.5)` (lo impone el host); el medidor trabaja siempre a dpr 1 en px CSS; `capture()` devuelve a resolución CSS; `resize` reajusta el *backing store* sin recrear el contexto; cambios de DPR (mover la ventana a otro monitor) se detectan con `matchMedia('(resolution: …dppx)')` y disparan `resize`. |
| **R3** | **Pausa fuera de pantalla y pestaña oculta.** Animaciones que siguen corriendo gastan batería y CPU; al volver, saltos de `dt`. | `IntersectionObserver` (rootMargin 100px) + `visibilitychange` → `stop()`; un solo rAF global que se apaga si no hay instancias; `dt ≤ 50 ms`; las capas `css` pausan sus `Animation`; test Playwright con contador de frames. |
| **R4** | **Contextos WebGL** (límite ~16 por página, pérdida de contexto en portátiles). | Solo una capa WebGL viva por vista en esta ronda (Combinador o Ficha); Galerías siempre estáticas; `dispose()` llama `WEBGL_lose_context`; ante `webglcontextlost` se queda el estático con aviso. |
| **R5** | **Medidor que no coincide con lo que se ve.** El raster en canvas es una reimplementación del CSS. | Un único origen de datos para ambos renderizadores (DSL de luces, SVG en dos modos); test de equivalencia DOM ↔ canvas por celdas (P2); 5 casos medido = real con captura del navegador (P4); verificación manual. |
| **R6** | **Degradados distintos en canvas y CSS** (CSS interpola con alfa premultiplicado; `transparent` en canvas tiende a gris/negro). | Siempre «mismo color con alfa 0» en lugar de `transparent` en los topes; `mix` siempre en sRGB en JS y `color-mix(in srgb …)` en CSS. |
| **R7** | **Safari**: `backdrop-filter` requiere prefijo; `ctx.filter` puede no existir; `OffscreenCanvas` limitado. | `-webkit-backdrop-filter` en todos los vidrios; detección `'filter' in ctx` con respaldo `blurImageData`; respaldo a canvas fuera del DOM si no hay `OffscreenCanvas`. Navegador de referencia: Chrome; Safari y Firefox se revisan a mano en la integración. |
| **R8** | **Fuentes que llegan tarde** cambian los rects medidos y el dibujo de A13 en canvas. | `ensureFonts` + re-medición en `document.fonts.ready`; `paint` de A13 espera las fuentes; Snapshot marca `__kcReady` solo después. |
| **R9** | **Presupuesto de JS** (< 250 KB gzip). | Sin librerías de color ni de animación; OGL y cada capa dinámica en `import()` perezoso; `npm run size` en la integración. |
| **R10** | **Medición que bloquea la animación** (leer píxeles cada 500 ms). | Medir en `requestIdleCallback`, solo sobre los rects del texto (no todo el escenario), submuestreo a ≤ 256×256, `getImageData` sobre canvas con `willReadFrequently: true`. |
| **R11** | **Agentes pisándose.** | Archivos disjuntos (§5), contratos congelados, stubs de P0, sin dependencias nuevas, peticiones de cambio por informe, orden de fusión fijo (§6 I). |
| **R12** | **Coherencia con MOTION.md** (se escribe en paralelo). | P3 lee MOTION.md al empezar; la tecnología y el contrato de este plan mandan; si MOTION.md pide algo incompatible (p. ej., estado no determinista), P3 lo reporta y propone el ajuste mínimo. |

---

## 10. Después de esta ronda (para no cerrar puertas)

- Etapa 4: el resto de dinámicas y A15–A18 se añaden como nuevas fábricas en `dynamic-registry.ts` y carpetas `A15-…`; G11–G20 extienden `GlassId`. Un contexto WebGL compartido (render a textura) cuando haya miniaturas dinámicas.
- Etapa 5: `kind: 'texture'` (X01–X40) reutiliza `LayerMeta`, `renderStatic`, `paint` y el mismo host dinámico; Matriz usa la ruta Snapshot en miniatura.
- Etapa 6: Motion para transiciones de interfaz, PNG (render del escenario a canvas reutilizando `paint` + vidrio de `legibility/glass-model.ts`), favoritos y comparar.
