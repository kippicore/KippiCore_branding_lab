# Decisiones técnicas · KippiCore Branding Lab

> Registro de decisiones de arquitectura (requisito del §5.2 de la spec). Cada entrada dice qué se eligió, qué se descartó y por qué, en pocas líneas. El plan de implementación está en `docs/PLAN.md`; el diseño del movimiento, en `docs/MOTION.md`.
>
> Versión 1.0 · 1 de octubre de 2026. El stack base lo fijó Miguel; aquí se registran las razones y las decisiones de detalle que tomó el arquitecto.

Criterios de la spec, en orden: **1) fluidez** (60 fps, carga rápida) · **2) calidad visual** (shaders + CSS moderno) · **3) reutilización** (tokens, atmósferas y vidrios llevables a la web y a las demos) · **4) mantenimiento** (TypeScript estricto, datos separados).

---

## D1 · Base: Vite + React 19 + TypeScript estricto

**Elegido.** SPA estática con Vite, React 19 y `strict` + `noUncheckedIndexedAccess`.
**Por qué.** Arranque y recarga instantáneos; React es lo que el equipo usará en la web y en las demos (criterio 3), y los componentes de atmósfera y vidrio se pueden copiar tal cual. TypeScript estricto protege los contratos entre paquetes que escriben agentes distintos.
**Descartado.**
- *Next.js*: SSR, rutas y servidor no aportan nada a una herramienta interna sin datos; más peso y más configuración.
- *Astro*: excelente para la web pública futura, pero el laboratorio es casi todo interacción; las islas complican el estado global de la combinación.
- *SvelteKit / Solid*: más livianos, pero obligan a reescribir componentes al llevarlos a la web en React.
- *Vanilla TS + Web Components*: menos peso, pero más código propio para estado y listas; peor reutilización.

## D2 · Estilos: CSS con variables, CSS Modules para componentes y CSS global solo para vidrios

**Elegido.** Variables `--kc-*` generadas por el motor de temas; CSS Modules en interfaz y plantillas; un `.css` global por vidrio con clase `kc-glass--Gxx`, importado dos veces (aplicado y como texto con `?raw`).
**Por qué.** Las variables son el producto: lo que se exporta y lo que se llevará a la web. Recolorean sin re-render de React y se pueden interpolar con `@property`. El doble import de los vidrios garantiza que el CSS que se ve es exactamente el que se copia.
**Descartado.**
- *Tailwind 4*: sus tokens también son variables, pero los vidrios y atmósferas son CSS largo y específico (pseudoelementos, máscaras, `color-mix`) que en clases utilitarias se vuelve ilegible y no se puede exportar como snippet limpio.
- *CSS-in-JS (styled-components, Emotion)*: costo en tiempo de ejecución y peso; choca con el presupuesto de 250 KB.
- *vanilla-extract*: buen tipado, pero un paso de build más y menos transparente para el snippet exportable.

## D3 · WebGL: OGL

**Elegido.** OGL (~25 KB gzip, solo lo que se importa), cargado de forma perezosa con la capa que lo usa (A01 en esta ronda).
**Por qué.** Da renderer, programa, geometría y uniforms sin abstracciones de escena; perfecto para fondos de pantalla completa con un fragment shader. Encaja en el presupuesto de JS.
**Descartado.**
- *three.js / React Three Fiber*: pensados para escenas 3D; ~150 KB+ para dibujar un triángulo a pantalla completa.
- *regl*: tan liviano como OGL, pero sin mantenimiento activo desde hace años.
- *WebGPU*: soporte todavía desigual (Safari/Firefox) y sin ganancia visible para shaders 2D de este tamaño. Se reevalúa en la etapa 4 si hace falta cómputo (cáusticas, refracción).
- *WebGL crudo*: viable, pero repetir el código de buffers/programas en cada capa; OGL cuesta poco y lo ahorra.

## D4 · Partículas: Canvas 2D

**Elegido.** Canvas 2D para A05 (bioluminiscencia) y las futuras capas de partículas simples.
**Por qué.** Decenas de partículas y líneas a 60 fps sin shaders; código simple y determinista (fácil de testear con un contexto falso que registra las llamadas).
**Descartado.** *PixiJS* (pesado para esto); *WebGL con instancing* (más complejo; se usará si se pasa de ~300 partículas).

## D5 · Estado en la URL con un store propio

**Elegido.** Toda la combinación vive en la query string (`?c=C20&t=T00&a=A05…`); un hook propio sobre `useSyncExternalStore` + `popstate`.
**Por qué.** Compartir un enlace es un requisito (spec §5.5.1); si la URL es la fuente de verdad, no hay que sincronizar dos estados. Es poco código y cero dependencias.
**Descartado.** *Zustand / Redux* (un segundo estado que habría que espejar en la URL); *React Router* (solo hay tres vistas y un parámetro `view` basta); *hash* en lugar de query (funciona, pero la query es más legible y Vercel la sirve igual).

## D6 · Tests: Vitest + Playwright

**Elegido.** Vitest (jsdom/node) para lógica pura y componentes; Playwright (Chromium) para capturas, equivalencia DOM ↔ canvas, pausa real y FPS.
**Por qué.** Vitest comparte la configuración de Vite (sin transformaciones duplicadas). Playwright es el único que puede comprobar lo que de verdad importa aquí: píxeles, `backdrop-filter`, rendimiento. La spec pide tests visuales de cada atmósfera y vidrio en 22 paletas × 2 modos.
**Descartado.** *Jest* (configuración extra para ESM/TS/Vite); *Cypress* (más lento y menos preciso en capturas); *Storybook + Chromatic* (servicio externo y otra herramienta que mantener; los arneses `harness/*.html` cumplen su función).

## D7 · Despliegue: estático en Vercel

**Elegido.** `vite build` → `dist/` en Vercel, cuenta de KippiCore (no la de Ian), con reescritura a `index.html`.
**Por qué.** Sin servidor; vistas previas por rama gratis; es donde ya vive la demo de KippiCore.
**Descartado.** *Netlify / Cloudflare Pages* (equivalentes, pero dividir cuentas no aporta); *GitHub Pages* (sin vistas previas por rama y peor manejo de rutas).

## D8 · Color, contraste y OKLCH escritos a mano

**Elegido.** Módulos propios (`theme/color.ts`, `contrast.ts`, `oklch.ts`) de ~200 líneas con tests contra valores de referencia.
**Por qué.** Solo se necesitan cuatro operaciones (hex↔sRGB, mezcla sRGB, contraste WCAG 2.x, sRGB↔OKLCH con recorte de croma). Escribirlas evita 20–40 KB y deja el comportamiento exacto bajo control (la mezcla debe coincidir con `color-mix(in srgb)`).
**Descartado.** *culori* (completa pero grande para cuatro funciones; se adopta si los tests de OKLCH no cierran); *chroma.js* (sin OKLCH de primera clase); *APCA* como métrica principal (la spec fija WCAG 2.x; APCA se puede mostrar como dato secundario más adelante).

## D9 · Legibilidad: raster propio en canvas, no captura del DOM

**Elegido.** Cada atmósfera trae un `paint()` en Canvas 2D generado desde los mismos datos que su CSS; cada vidrio trae un `GlassModel` (desenfoque, saturación, velo, máscaras, capas) que el medidor aplica sobre ese raster. En dinámico se usa `capture()` del cuadro actual.
**Por qué.** La spec exige medir sobre lo que realmente se ve. Las librerías de captura del DOM (*html-to-image*, *html2canvas*) **no reproducen `backdrop-filter`** ni varios efectos de mezcla, que es precisamente lo que hay que medir. Un raster propio es exacto, rápido (solo la zona del texto) y verificable con tests de equivalencia DOM ↔ canvas.
**Descartado.** *html-to-image/html2canvas* (no ven el vidrio); *`getDisplayMedia`* (pide permiso al usuario cada vez); *estimación con color promedio* (el método viejo; se conserva solo como referencia tachada en el medidor).

## D10 · Animación de interfaz: CSS y Web Animations API en esta ronda; Motion en la etapa 6

**Por qué.** Las transiciones de esta ronda (cambio de paleta, aparición del canvas) se resuelven con `@property` y WAAPI sin costo de JS. *Motion* (antes Framer Motion) entra cuando haya transiciones de interfaz complejas (etapa 6), cargado de forma perezosa si el presupuesto lo exige.

## D11 · Detalles decididos por el arquitecto

- **La app vive en la raíz del repo**, no en `kippicore-lab/` (spec §5.8): el repo ya es exclusivo del laboratorio; una subcarpeta solo añadiría rutas.
- **`renderDynamic` de la spec se reemplaza por una fábrica con ciclo de vida** (`mount/resize/setTheme/setParams/start/stop/frame/capture/dispose`): React no gobierna bien contextos WebGL, pausa por visibilidad ni captura de cuadros. `renderStatic` se conserva.
- **Un solo bucle `requestAnimationFrame` global** (ticker) en lugar de uno por capa: pausa centralizada, medidor de FPS único, `dt` recortado.
- **Tecnología por capa dinámica:** A01 WebGL (deriva con ruido simplex), A05 Canvas 2D, A10 y A11 CSS/WAAPI (+ puntero en A11). Las capas CSS son las más baratas; WebGL solo donde aporta calidad.
- **DPR limitado a 1.5** en todo canvas vivo; el medidor siempre trabaja a dpr 1.
- **Movimiento determinista** (estado = f(semilla, tiempo)): permite capturas reproducibles y que el medidor reconstruya cualquier instante.
- **`mix()` siempre en sRGB** (como la spec y `color-mix(in srgb)`); las escalas tonales y las transiciones de paleta, en OKLCH.
- **T14 «KippiLex»** (Archivo 800 −0.035em + Inter + Playfair Display itálica + Space Mono, reg. 40) se añade solo como referencia de comparación: KippiCore decidió apartarse de la identidad de KippiLex, y Geist (T00) no es la tipografía de KippiLex.
- **Rangos de registro:** Enterprise ≤ 35, Equilibrio 36–64, Pyme ≥ 65 (coinciden con todas las etiquetas de la spec).
- **Desenfoque por defecto de los vidrios = el valor del CSS de la spec**, no el «recomendado» cuando difieren (G02, G03, G06); el recomendado se muestra en la Ficha.
- **Interfaz del laboratorio con tokens propios (`--ui-*`)**, independientes de la paleta que se prueba, para que el panel de control no cambie de color ni pierda contraste.
- **Valores por defecto = dirección D-D** (C20 · T00 · A05 · G01, oscuro, dinámico), la favorita de Miguel.
- **Fuentes por CDN de Google Fonts** en el laboratorio (carga bajo demanda de 15 sistemas); autohospedar con `@fontsource` queda para la web de producción.
