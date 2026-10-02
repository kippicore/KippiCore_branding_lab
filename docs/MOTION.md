# KippiCore Branding Lab · Diseño de motion

> Especificación de movimiento para las atmósferas dinámicas del laboratorio. Complementa a `docs/KippiCore_Identidad_Visual_Laboratorio.md` (en adelante, **la spec**): §3 (atmósferas), §4.1 (vidrios), §5.3 (motor de temas), §5.4 (estático vs. dinámico) y §5.6 (legibilidad).
>
> Está escrita para que un agente la implemente **sin más contexto**. Cuando algo aquí contradiga a la spec, manda la spec en lo visual (recetas, colores, pesos) y este documento en lo temporal (periodos, easing, técnica, rendimiento). Si una decisión no está cubierta, aplica los principios de §1 y deja la duda anotada en `docs/decisiones.md`.
>
> Versión 0.1 · octubre 2026.

---

## Índice

0. Resumen ejecutivo y alcance
1. Principios de coreografía
2. Arquitectura común del motion (reloj, tween de tema, semillas, pausa, calidad)
3. A01 · Aurora (OGL/GLSL)
4. A05 · Bioluminiscencia, la insignia (Canvas 2D)
5. A10 · Plasma duotono (OGL/GLSL)
6. A11 · Rejilla iluminada (CSS + resorte en JS)
7. Reglas para A02–A04, A06–A09, A12–A14 (CSS animado)
8. Reglas para A15–A18 (etapa 4)
9. Legibilidad en dinámico (medida cada ~500 ms)
10. Micro-interacciones del laboratorio
11. Presupuesto de rendimiento y degradación
12. Premium vs. genérico: criterio y anti-ejemplos
13. Pruebas y criterios de aceptación del motion
Anexo A · Código de referencia (PRNG, ruido, OKLCH, resorte)

---

## 0. Resumen ejecutivo y alcance

| Atmósfera | Técnica | Protagonista del movimiento | Ciclo dominante | Reacciona al cursor |
|---|---|---|---|---|
| A01 Aurora | **OGL** (fragment shader de pantalla completa) + respaldo CSS | 4 luces que derivan por ruido simplex | 18–27 s | No |
| A05 Bioluminiscencia | **Canvas 2D** (sprites precalculados + líneas) | 34 partículas con deriva por campo de ruido, pulso y sinapsis | campo: ~40 s · pulso: 8–16 s | No |
| A10 Plasma duotono | **OGL** + respaldo CSS | 2 luces que orbitan; una tercera que deriva | órbita 40 s | No |
| A11 Rejilla iluminada | **CSS** (máscara + luces) con **resorte en JS** que escribe 2 variables | Spotlight con inercia; deambula solo sin puntero | deambular: 29 × 37 s | **Sí** |
| A02–A04, A06–A09, A12–A14 | **CSS animado** (solo `transform` y `opacity`) vía Web Animations API | según §7 | 16–60 s | No |
| A15–A18 | Etapa 4: ver §8 | | | A16 sí |

**Tres reglas que no se negocian:**

1. **El fotograma t = 0 del dinámico es idéntico al estático** (misma receta, misma semilla). Así el cambio estático↔dinámico es continuo y las pruebas visuales del estático también validan el arranque del dinámico.
2. **Todo color sale de los tokens del tema** (`--kc-*` en CSS, `ThemeFrame` en JS). Ningún literal de color en atmósferas, salvo blanco y negro dentro de fórmulas (screen/multiply, oscurecer hacia negro, contraste).
3. **El movimiento es una función del tiempo del laboratorio** (`labTime`), nunca del reloj de pared ni del número de fotogramas. Esto da: pausa sin saltos, regulador de velocidad sin saltos, y `seek(t)` para pruebas.

---

## 1. Principios de coreografía

Estas reglas aplican a todo lo que se mueve en el laboratorio, incluidas atmósferas futuras y texturas X.

### 1.1 Nada parpadea

- Ninguna región cambia de luminancia más rápido que **0.3 de alfa por segundo** (equivale a ~20 % de L por segundo en el peor caso). Un pulso de 0.45→1.0 de alfa necesita al menos ~2 s de subida.
- Nunca más de **3 destellos por segundo** en ninguna parte (WCAG 2.3.1); en la práctica, ninguno.
- Nada aparece ni desaparece de golpe: toda entrada o salida es un fundido de ≥ 600 ms (partículas que reaparecen, sinapsis que se forman, conexiones que se rompen).
- El grano animado (A03) se mueve a **8–12 fps con `steps()`**, nunca a 60 fps (el grano a 60 fps "hierve").

### 1.2 Ciclos largos y desfasados

- Movimiento compositivo (luces, órbitas, haces): **16–60 s por ciclo**.
- Micromovimiento (pulso de una partícula, respiración de un disco): **8–16 s**, con amplitud contenida.
- **Periodos primos o inconmensurables** entre capas de la misma atmósfera para que el conjunto no se repita a la vista: usa preferentemente 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59 s. Si la spec fija un rango (p. ej. "18–27 s"), reparte dentro de ese rango con valores no múltiplos entre sí (18, 21.5, 24.3, 27).
- **Fase inicial sembrada** por elemento (`φ = 2π · rng()`), salvo donde la regla "t = 0 ≡ estático" exige desplazamiento cero en t = 0 (entonces se resta el valor en t = 0, ver §2.4).

### 1.3 Amplitud y velocidad

| Magnitud | Máximo |
|---|---|
| Traslación de una luz | ±6 % del contenedor (x en % del ancho, y en % del alto) |
| Escala de una luz | 0.95–1.08 |
| Rotación de un haz o forma | ±4° (oscilante); rotación continua solo si es muy lenta (≥ 90 s/vuelta) |
| Velocidad lineal de cualquier elemento | ≤ 1.2 % del ancho por segundo |
| Cambio de alfa | ≤ 0.3 /s |

Prueba práctica: **un observador debe notar el movimiento a los 3–5 s de mirar, no en el primer instante.** Si se nota de inmediato, es demasiado rápido o demasiado amplio.

### 1.4 Masa y continuidad

- Las trayectorias tienen derivada continua (C¹ como mínimo): nada cambia de dirección en seco. Por eso el ping-pong `linear` está prohibido; los `alternate` usan easing senoidal (§1.5).
- Lo que sigue al cursor lo hace con un **resorte críticamente amortiguado**, nunca pegado al puntero ni con retraso mayor de ~1 s.

### 1.5 Easing (tokens de motion)

Defínelos una vez como variables CSS y como constantes TS (`src/motion/tokens.ts`). No son tokens de color: viven con prefijo `--kc-motion-*` y no dependen de la paleta.

| Token | Valor | Uso |
|---|---|---|
| `--kc-motion-ease-drift` | `cubic-bezier(.37, 0, .63, 1)` (easeInOutSine) | Toda deriva `alternate` de atmósferas |
| `--kc-motion-ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Transiciones de interfaz, tween de paleta |
| `--kc-motion-ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Entradas (hover, aparición de paneles) |
| `--kc-motion-ease-in` | `cubic-bezier(.4, 0, 1, 1)` | Salidas rápidas |
| `--kc-motion-linear` | `linear` | Solo rotaciones continuas y el reloj |
| `--kc-motion-dur-micro` | `120ms` | Pulsar un botón |
| `--kc-motion-dur-fast` | `160ms` | Cambio de un segmento de texto |
| `--kc-motion-dur-base` | `240ms` | Hover, foco |
| `--kc-motion-dur-theme` | `500ms` | Tween de paleta y de modo (rango permitido 400–600) |
| `--kc-motion-dur-fade` | `600ms` | Cambio de atmósfera, apariciones en atmósferas |

**Prohibido en atmósferas:** `ease-out-back`, bounce, elastic, overshoot, y cualquier easing que rebase el valor final.

**Equivalencia útil:** una animación CSS `alternate` de duración `T` con `cubic-bezier(.37,0,.63,1)` es, en la práctica, `p(t) = 0.5 − 0.5·cos(π·t/T)` (un coseno de periodo `2T`). Usa esa función pura en JS cuando necesites saber dónde está una capa CSS en el tiempo `t` (legibilidad, seek).

### 1.6 Jerarquía

- **Un protagonista por atmósfera.** Lo demás acompaña con menos amplitud o se queda quieto.
- **La zona de texto se mueve menos.** En A01 la izquierda queda en sombra a propósito; ninguna luz debe derivar hacia allí más de lo que permite su amplitud. Regla general: en la zona de texto (por defecto el 45 % izquierdo, o el rectángulo que declare la plantilla) la amplitud efectiva es ≤ 50 % de la del resto.
- **Solo A11 (y luego A16) reaccionan al cursor.** El resto es ambiental: no compite con el usuario.

---

## 2. Arquitectura común del motion

Estructura sugerida (encaja en §5.8 de la spec):

```
src/motion/
  tokens.ts         easing y duraciones (§1.5)
  clock.ts          un único bucle rAF para todo el laboratorio
  activity.ts       IntersectionObserver + visibilitychange + reduced-motion
  themeTween.ts     interpolación OKLCH de los roles y re-derivación por fotograma
  spring.ts         resorte críticamente amortiguado
  noise.ts          simplex sembrado (paquete simplex-noise) + helpers de deriva
  quality.ts        medidor de fps y escalones de calidad
  glsl/             common.glsl (hash, value noise, blend, luz, dither)
lib/prng.ts         mulberry32 + fnv1a (ya previsto en la spec)
```

### 2.1 Contrato de una atmósfera dinámica

`renderDynamic` de la interfaz `Layer` (§5.4 de la spec) devuelve un componente React que monta una **instancia imperativa**. Todas las dinámicas implementan:

```ts
interface DynamicInstance {
  /** Llamado por el reloj compartido. dt y time ya están escalados por la velocidad. */
  tick(dt: number, time: number): void;
  /** Llamado en cada fotograma mientras dura un tween de tema, y una vez al montar. */
  setTheme(frame: ThemeFrame): void;
  resize(cssW: number, cssH: number, dpr: number): void;   // dpr ya limitado a 1.5
  /** Lleva la instancia al tiempo t de forma determinista (pruebas, t = 0). */
  seek(time: number): void;
  /** Estado geométrico actual, para medir legibilidad sin leer la GPU (§9). */
  getFrameState(): AtmosphereFrame;
  setQuality(level: 0 | 1 | 2): void;   // 2 = completa (§11)
  destroy(): void;
}
```

**Receta = datos; movimiento = función.** Cada atmósfera tiene un único módulo `recipe.ts` con la receta estática como datos (lista de luces, partículas, etc.) que usan **a la vez** `renderStatic`, la dinámica y el medidor de legibilidad. La dinámica nunca redefine posiciones ni colores: solo les aplica `motion(t)`.

```ts
// Notación de la spec: luz(x, y, d, color, α)
interface Light { x: number; y: number; d: number; color: ColorRef; alpha: number }
type ColorRef = Role | { mix: [Role, Role, number] };   // mix en OKLab, igual que el estático
type Role = 'bg' | 'surface' | 'ink' | 'muted' | 'primary' | 'accent'
          | 'glow' | 'glow2' | 'glowMix' | 'ambient';
```

### 2.2 Reloj único

- Un solo `requestAnimationFrame` para todo el laboratorio (`clock.ts`). Cada instancia activa se suscribe; el reloj no corre si no hay suscriptores activos.
- `dtReal = min(now − last, 50 ms)` → evita saltos al volver de una pausa o de un tirón del navegador.
- **Velocidad integrada, no multiplicada:** `speedSmoothed` persigue al valor del regulador (0.25×–2×) con suavizado exponencial τ = 300 ms, y `labTime += dtReal · speedSmoothed`. **Nunca** `labTime = performance.now() · speed` (al mover el regulador todo saltaría).
- Rampa de arranque: al pasar a dinámico, `speedSmoothed` arranca en 0 y sube a la velocidad elegida en **1 200 ms** con `ease-out`. Al volver de una pausa, en **400 ms**.
- Cada instancia lleva su propio `time` (empieza en 0 al montarse) para que t = 0 ≡ estático.

### 2.3 Actividad: cuándo se mueve algo

Una instancia está **activa** solo si se cumplen las cuatro condiciones:

1. Es visible: `IntersectionObserver` con `threshold: 0` y `rootMargin: '100px'`.
2. La pestaña está visible: `document.visibilityState === 'visible'` (evento `visibilitychange`).
3. El modo global es Dinámico.
4. No hay `prefers-reduced-motion: reduce`, o el usuario lo anuló explícitamente en esta sesión (ver abajo).

Inactiva = `tick` deja de llamarse y el tiempo se congela (al volver continúa donde estaba; nada salta). Los recursos (contexto WebGL, sprites) se conservan; solo se destruyen al desmontar.

**Reduced-motion:** al cargar con `reduce`, el laboratorio arranca en Estático y el control muestra el aviso *"Movimiento reducido por tu sistema"*. Si el usuario elige Dinámico de forma explícita, se respeta, pero con velocidad máxima 0.5× y sin seguimiento del cursor (A11 deambula). Escuchar cambios de la media query en vivo: si pasa a `reduce`, volver a Estático con el fundido de §10.2.

### 2.4 Semillas (mulberry32) y deriva determinista

- Semilla por capa: `seed = fnv1a32(\`${layerId}:${userSeed ?? 0}\`)`. El `userSeed` viene de la URL (por defecto 0) para que una combinación compartida se vea igual.
- **Flujos separados por propósito**, para que cambiar la densidad no reordene todo: la partícula `i` toma sus atributos de `mulberry32(fnv1a32(\`${layerId}:${userSeed}:p:${i}\`))`. Así, subir de 34 a 50 partículas conserva las 34 primeras exactamente.
- Ruido: `simplex-noise` v4 (`createNoise2D`, `createNoise3D`) inicializado con `mulberry32(seed)`. Es pequeño (~2 KB) y determinista.
- **Deriva con cero en t = 0** (para cumplir t = 0 ≡ estático):

```ts
// Desplazamiento suave, acotado y nulo en t = 0.
// n: ruido 2D sembrado en [-1, 1]; T: periodo característico (s); A: amplitud.
function drift(n: Noise2D, t: number, T: number, lane: number, A: number) {
  const d = n(t / T, lane) - n(0, lane);
  return A * Math.tanh(1.25 * d);              // nunca rebasa ±A, C∞, cero en t = 0
}
// Escala asimétrica 0.95–1.08, = 1 en t = 0, sin quiebre en 0.
function driftScale(n: Noise2D, t: number, T: number, lane: number) {
  const k = Math.tanh(1.25 * (n(t / T, lane) - n(0, lane)));
  return 1 + 0.065 * k + 0.015 * k * k;          // k=−1 → 0.95 · k=0 → 1 · k=1 → 1.08
}
```

`lane` es un desplazamiento sembrado (p. ej. `rng() * 1000`) distinto para cada eje de cada luz.

### 2.5 Tokens que lee el motion (y solo esos)

`ThemeFrame` es el objeto JS que entrega el motor de temas (§5.3 de la spec), recalculado en cada fotograma del tween:

```ts
interface ThemeFrame {
  // sRGB codificado (gamma), componentes 0–1, listos para uniforms y para canvas
  bg: Vec3; surface: Vec3; ink: Vec3; muted: Vec3; primary: Vec3; accent: Vec3;
  glow: Vec3;      // = accent
  glow2: Vec3;     // = primary
  glowMix: Vec3;   // = mix(accent, primary, .5)
  ambient: Vec3;   // = mix(accent, bg, .15–.25)
  dark: number;    // 0 claro … 1 oscuro, interpolado durante el cambio de modo
  blendMode: 'screen' | 'multiply';   // discreto: screen en oscuro, multiply en claro
  css: Record<Role, string>;          // 'rgb(… / 1)' cacheado para Canvas 2D
}
```

En CSS, las mismas claves como `--kc-bg`, `--kc-surface`, `--kc-ink`, `--kc-muted`, `--kc-primary`, `--kc-accent`, `--kc-glow`, `--kc-glow2`, `--kc-glowMix`, `--kc-ambient`, `--kc-blendMode`.

Los `mix()` de las recetas se calculan **en OKLab** tanto en CSS (`color-mix(in oklab, …)`) como en JS (`mixOklab`), para que estático y dinámico coincidan. La única excepción es el velo del vidrio, que la spec define `in srgb` (§4.1): respétalo también en el medidor.

### 2.6 Transición entre paletas (400–600 ms, OKLCH)

**Una sola fuente de verdad:** `themeTween.ts` interpola en JS y en cada fotograma escribe **las variables CSS del contenedor y** emite el `ThemeFrame` a las instancias. Así CSS, canvas y shaders cambian sincronizados. No uses `transition` de CSS sobre las variables `--kc-*` además del tween (se desincronizarían); `@property` se registra igualmente (sintaxis `<color>`) para que las animaciones CSS de las atmósferas puedan interpolar dentro de sus keyframes.

Algoritmo:

1. Al cambiar paleta o modo: `from` = valores **actuales** (si hay un tween en curso, el valor interpolado de ese instante; nunca se reinicia desde el origen), `to` = roles de destino.
2. Duración **500 ms** (permitido 400–600), easing `cubic-bezier(.2, 0, 0, 1)`.
3. Interpola los **seis roles base** en OKLCH: L y C lineales; H por el **arco más corto**. Si uno de los dos extremos es casi acromático (`C < 0.02`), usa el matiz del otro para que no pase por un arcoíris.
4. Por fotograma: re-deriva `glow`, `glow2`, `glowMix`, `ambient` con las funciones puras de `derive.ts` a partir de los roles interpolados; convierte a sRGB con *gamut mapping* por reducción de croma (no recortes por canal).
5. `dark` se interpola linealmente de 0 a 1 (o al revés) con el mismo easing; los shaders lo usan para mezclar las fórmulas de screen y multiply de forma continua. `blendMode` (discreto, para Canvas 2D y CSS) cambia **en el punto medio**, oculto por el fundido de capa de §4.7.
6. **El movimiento no se reinicia** al cambiar de paleta: partículas, luces y órbitas siguen su curso. Solo cambian los colores.

Coste: 6 conversiones OKLCH↔sRGB y ~12 `setProperty` por fotograma durante 30 fotogramas. Despreciable.

### 2.7 WebGL compartido

- **Un único contexto WebGL** (OGL `Renderer`) para el escenario grande del Combinador; A01 y A10 son dos `Program` sobre el mismo `Triangle` de pantalla completa. Al cambiar entre ellas se renderizan las dos en el mismo canvas durante el fundido (la nueva con `uFade` y `gl.BLEND`).
- Miniaturas (Matriz, Galerías, Comparar) **siempre estáticas**. En Comparar, solo la tarjeta enfocada o con hover pasa a dinámico.
- `premultipliedAlpha: false`, `antialias: false`, `alpha: false` (la atmósfera pinta su propio `bg`), `powerPreference: 'low-power'`.
- Escuchar `webglcontextlost` → mostrar la versión CSS animada (respaldo) y reintentar en `webglcontextrestored`. Si no hay WebGL: CSS animado. Si tampoco aplica: estático.

### 2.8 Resolución

- `dpr = Math.min(window.devicePixelRatio, 1.5)`.
- Backing store = `cssSize × dpr × renderScale`.
  - `renderScale = 0.5` en A01 y A10 (campos de luz suaves: a media resolución con filtrado lineal no se nota y cuesta la cuarta parte).
  - `renderScale = 1.0` en A05 (núcleos y sinapsis necesitan nitidez).
  - A11 es CSS: no aplica.
- `ResizeObserver` sobre el contenedor; redimensionar con *debounce* de 100 ms, pero **sin** reiniciar el tiempo ni el estado.

---

## 3. A01 · Aurora

### 3.1 Intención

Luz difusa que entra por la derecha y deja la izquierda en sombra para el texto. Movimiento de "respiración de luz ambiental": casi imperceptible, profundo, calmado. Nada de "aurora boreal de salvapantallas".

### 3.2 Técnica

**OGL**, un fragment shader de pantalla completa (`Triangle`). Las posiciones y escalas de las luces se calculan **en JS** por fotograma (4 luces × 3 llamadas de ruido, trivial) y se pasan como uniforms; el shader solo compone. Respaldo: la misma receta en CSS con keyframes (§7) si WebGL no está disponible.

### 3.3 Receta (de la spec, en el orden de composición)

| # | luz(x, y, d) | color | α | Periodo T (s) |
|---|---|---|---|---|
| L0 | (78, 28, 78) | `accent` | .90 | 18 |
| L1 | (58, 78, 62) | mix(accent, primary, .45) | .55 | 21.5 |
| L2 | (98, 96, 60) | `primary` | .95 | 24.3 |
| L3 | (30, 40, 50) | mix(bg, accent, .85) | .60 | 27 |

Fondo: `bg`. Composición normal (`source-over`) en sRGB gamma, en este orden, igual que el apilado de capas CSS del estático.

### 3.4 Movimiento

Para cada luz `i` (unidades: x en % del ancho, y en % del alto, d en % del ancho):

```
x_i(t) = x_i + drift(n, t, T_i, laneX_i, 6)       // ±6 %
y_i(t) = y_i + drift(n, t, T_i, laneY_i, 6) · wy_i
s_i(t) = driftScale(n, t, T_i · 1.3, laneS_i)     // 0.95–1.08, periodo de escala más lento
```

- `wy_i = 0.6` para L0 y L2 (las luces que dan la dirección de la luz no deben subir/bajar tanto), `1` para L1 y L3.
- **Zona de sombra protegida:** si `x_i(t) < 40`, la amplitud horizontal hacia la izquierda se reduce a la mitad (aplica `drift` con `A = 3` para valores negativos). L3 vive en esa zona y es tenue a propósito: su α no se toca.
- Pulso de intensidad muy leve, solo en L0: `α0(t) = .90 · (1 − 0.06 · (0.5 − 0.5·cos(2π t / 41)))` (baja como mucho a .846, ciclo 41 s). Da la sensación de que la luz "respira" sin que se vea un pulso.
- **Deformación orgánica (opcional, nivel de calidad 2):** desplaza las coordenadas del píxel con ruido de valor de baja frecuencia, amplitud **1.5 % del ancho**, escala espacial 0.5 × ancho, velocidad 0.01 /s. Hace que los bordes de las luces no sean círculos perfectos. En t = 0 su efecto debe ser < 1 ΔE frente al estático; si no, multiplícalo por la rampa de arranque (`uWarpAmt` de 0 a 1 en 4 s).

### 3.5 Shader (núcleo)

```glsl
// common.glsl — compartido por A01 y A10
precision highp float;

// Hash sin seno (Dave Hoskins), estable entre GPUs.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// Ruido de valor 2D con interpolación suave.
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i), b = hash12(i + vec2(1, 0));
  float c = hash12(i + vec2(0, 1)), d = hash12(i + vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// luz(): réplica exacta de radial-gradient(circle, color 0, transparent 68%)
// sobre un cuadrado de lado d (farthest-corner = d·√2/2): el alfa llega a 0 en r = 0.4808·d.
float luz(vec2 px, vec2 c, float dPx, float alpha) {
  float r = length(px - c);
  return alpha * clamp(1.0 - r / (0.4808 * dPx), 0.0, 1.0);
}
// Mezclas de mix-blend-mode, en sRGB gamma (igual que el navegador).
vec3 blendScreen(vec3 b, vec3 s)   { return 1.0 - (1.0 - b) * (1.0 - s); }
vec3 blendMultiply(vec3 b, vec3 s) { return b * s; }
// Dither estático (no depende del tiempo: un dither animado "hierve").
vec3 dither(vec3 c, vec2 fragCoord) {
  return c + (hash12(fragCoord) + hash12(fragCoord + 17.17) - 1.0) / 255.0;  // triangular
}
```

```glsl
// A01 aurora.frag
uniform vec2  uRes;          // px del backing store
uniform float uScale;        // backing px por px CSS (dpr · renderScale)
uniform float uTime;
uniform float uWarpAmt;      // 0..1
uniform vec3  uBg;
uniform vec4  uL[4];         // (cx, cy, dPx·s, alpha) en px de backing; Float32Array plano
uniform vec3  uC[4];         // colores ya resueltos (sRGB gamma)
uniform float uFade;         // 0..1 para fundidos entre atmósferas
varying vec2  vUv;

void main() {
  vec2 px = vUv * uRes;
  px.y = uRes.y - px.y;                         // y hacia abajo, como CSS
  // deformación orgánica muy leve
  float w = uRes.x;
  vec2 q = px / (0.5 * w) + vec2(uTime * 0.01, -uTime * 0.007);
  px += uWarpAmt * 0.015 * w * (vec2(vnoise(q), vnoise(q + 7.3)) - 0.5) * 2.0;

  vec3 col = uBg;
  for (int i = 0; i < 4; i++) {
    float a = luz(px, uL[i].xy, uL[i].z, uL[i].w);
    col = mix(col, uC[i], a);                   // source-over
  }
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), uFade);
}
```

> Verifica la geometría de `luz()` contra la implementación estática real (centro con `translate(-50%, -50%)`, tamaño `d` en % del ancho). Si el estático usa otra convención, ajusta **el estático y el shader** desde la misma función de `recipe.ts`, no dos fórmulas distintas.

### 3.6 Lectura de tokens

Por fotograma de tween: `uBg = frame.bg`, `uC[0] = frame.accent` (= `glow`), `uC[1] = mixOklab(accent, primary, .45)`, `uC[2] = frame.primary`, `uC[3] = mixOklab(bg, accent, .85)`. Fuera de un tween los uniforms no cambian.

### 3.7 Presupuesto

≤ 1.5 ms de GPU por fotograma en un portátil de gama media con `renderScale 0.5`. Sin texturas, sin pasadas extra.

---

## 4. A05 · Bioluminiscencia (la insignia)

### 4.1 Intención

Fondo casi negro donde flotan luces pequeñas que respiran a su ritmo; cuando dos se acercan, aparece entre ellas un filamento finísimo, como una hifa de micelio que se conecta y se suelta. Debe sentirse **vivo pero tranquilo**, escaso, con profundidad. Es la atmósfera de la dirección D-D y la que define el criterio de aceptación de 60 fps (§5.10 de la spec).

### 4.2 Técnica

**Canvas 2D**, por tres razones: 34–72 partículas son triviales en CPU; el O(n²) de sinapsis con n ≤ 72 son ≤ 2 556 pares por fotograma; y los agentes lo pueden depurar sin shaders. El halo se dibuja con **sprites precalculados** (no `createRadialGradient` por partícula y fotograma).

Capas, de abajo arriba:

1. **Base CSS** (estática, con una sola animación CSS): `bgDeep` + la luz ambiental grande `luz(40, 70, 90, mix(accent, bg, .25), .7)`.
2. **Canvas de sinapsis** y **partículas** (un solo canvas; primero líneas, luego partículas).

### 4.3 Fondo

- `bgDeep`: en oscuro, `mixOklab(bg, negro, .35)` (la spec pide 30–40 %); en claro, `bg` tal cual. Con `dark` interpolado: `bgDeep = mixOklab(bg, negro, .35 · dark)`.
- La luz ambiental respira: `scale 1 → 1.05`, `alternate`, 34 s por tramo, `--kc-motion-ease-drift`, y deriva `translate(±2 %, ±1.5 %)` con periodos 43 s / 53 s. Solo `transform`.

### 4.4 Partículas: datos (deben coincidir con el estático)

Para `i` en `0 … N−1`, con `rng_i` del flujo de la partícula (§2.4):

| Atributo | Valor |
|---|---|
| `N` | 34 por defecto (= estático). Regulador de densidad 0.5×–2× → 17–68. Máximo absoluto 72. |
| Posición inicial | `x = rng_i()·100 %`, `y = rng_i()·100 %` (la misma secuencia que usa el estático) |
| Tamaño `size` | 1.2–3.6 % del ancho: `1.2 + 2.4 · rng_i()` |
| Profundidad `z` | derivada del tamaño: `z = (size − 1.2) / 2.4` ∈ [0, 1] (lo grande está "más cerca") |
| Color | `i % 4 === 0` → `glow2` (primary); el resto → `glow` (accent) |
| Núcleo y halo | Exactamente la receta de la spec: núcleo `color 0 8 %` y halo `color` a 45 % de alfa hasta 14 % (radios relativos al tamaño de la partícula). Reutiliza la misma función de dibujo que el estático para generar el sprite. |
| Fase de pulso `φ` | `2π · rng_i()` |
| Periodo de pulso `P` | `8 + 8 · rng_i()` s (8–16 s) |

> Orden de llamadas al PRNG: congélalo y documéntalo en `recipe.ts` (x, y, size, φ, P, …). Si el estático consume el PRNG en otro orden, el t = 0 no coincidirá.

### 4.5 Movimiento de partículas

**Integración con paso fijo** de 1/60 s (acumulador), para que el estado en el tiempo `t` sea el mismo a 30, 60 o 120 fps y para que `seek(t)` sea reproducible (simular desde 0 hasta `t` en pasos fijos; 30 s = 1 800 pasos × 34 partículas, < 5 ms).

**Campo de deriva (curl noise sobre simplex 3D):** divergencia cero, así las partículas fluyen sin amontonarse.

```ts
// Unidades: posiciones normalizadas u = x/W, v = y/W (ambas divididas por el ANCHO).
const F  = 1.6;          // ~1.6 "remolinos" por ancho de contenedor
const TT = 40;           // el campo evoluciona en ~40 s
const V0 = 0.006;        // 0.6 % del ancho por segundo
const EPS = 1e-3;

function curl(u: number, v: number, t: number): [number, number] {
  const z = t / TT;
  const dn_dv = (n3(u * F, (v + EPS) * F, z) - n3(u * F, (v - EPS) * F, z)) / (2 * EPS);
  const dn_du = (n3((u + EPS) * F, v * F, z) - n3((u - EPS) * F, v * F, z)) / (2 * EPS);
  return [dn_dv, -dn_du];                       // rotacional de un potencial escalar
}

function step(p: Particle, t: number, h: number) {
  const [cx, cy] = curl(p.u, p.v, t);
  const k = V0 * (0.6 + 0.8 * p.z) / F;        // parallax: lo cercano va más rápido
  let vx = cx * k, vy = cy * k - 0.0015 * (0.5 + p.z);   // flotabilidad leve hacia arriba
  // limitar a ≤ 1.2 % del ancho por segundo (§1.3)
  const sp = Math.hypot(vx, vy), vmax = 0.012;
  if (sp > vmax) { vx *= vmax / sp; vy *= vmax / sp; }
  p.u += vx * h * rampa;  p.v += vy * h * rampa; // rampa: 0→1 en 1.2 s al arrancar
  wrapSuave(p);                                  // ver abajo
}
```

**Bordes sin pop:** el dominio es el contenedor ampliado por un margen `m = radio máximo del halo + 2 %`. Una partícula que sale por un lado reaparece por el opuesto **fuera de la vista**, así nunca aparece ni desaparece dentro del encuadre. Además, en su primer segundo tras reaparecer, su alfa sube de 0 a 1 (por si el margen no bastara en contenedores muy anchos).

### 4.6 Pulso y destellos

**Pulso senoidal por partícula:**

```
b_i(t) = 0.45 + 0.55 · pow(0.5 + 0.5·sin(2π t / P_i + φ_i), 1.6)
```

- Rango 0.45–1.0; con `P ≥ 8 s` la tasa máxima de cambio es ≈ 0.27 /s → cumple "nada parpadea".
- El exponente 1.6 hace que pasen más tiempo tenues y el máximo sea breve: se lee como respiración, no como intermitente.
- **t = 0 ≡ estático:** el estático pinta `b = 1`. Para no saltar, el factor de pulso entra con la rampa de arranque: `bEf = mix(1, b_i(t), rampaPulso)`, con `rampaPulso` 0→1 en 3 s.
- El pulso afecta al **alfa del halo y del núcleo**, y al radio del halo (×0.92–1.0). Nunca al tamaño del núcleo.

**Destello ("una idea"), opcional en calidad 2:** con una agenda sembrada (proceso de Poisson, media **uno cada 9 s** en toda la escena), una partícula elegida al azar sube a `b = 1.25` en 1.2 s (`ease-out`) y vuelve en 2.8 s (`ease-in-out`). Mientras dura, sus sinapsis se iluminan ×1.6. Nunca dos destellos solapados. Es el único "evento" de la escena y debe pasar casi desapercibido.

### 4.7 Sinapsis

- **Umbral:** `D = 0.14 · min(W, H)` (14 % de la dimensión menor).
- **Alfa continuo**, sin histéresis ni pops, porque llega a cero exactamente en el umbral:

```
w_ij  = (1 − d_ij / D)²                      si d_ij < D, si no 0
α_ij  = 0.35 · w_ij · min(bEf_i, bEf_j) · rampaLineas
```

- **Grosor:** 0.75 px CSS (× dpr). En claro, 1 px.
- **Color:** si ambas son accent → `glow`; si alguna es primary → `glowMix`. En claro, `mixOklab(color, ink, .35)` para que la línea tenga definición sobre fondo claro.
- **Curvatura de hifa (calidad ≥ 1):** curva cuadrática con punto de control desplazado en perpendicular un `8 % · d_ij · s_ij`, con `s_ij ∈ [−1, 1]` sembrado por par (hash de `min(i,j), max(i,j)`) y ondulando lentamente: `s_ij(t) = s_ij · cos(2π t / 37)`. Una recta perfecta se lee "red de puntos genérica"; una curva sutil se lee micelio.
- **Densidad esperada:** con 34 partículas y `D = 14 %`, el grado medio queda en ~1–1.5 conexiones por partícula. Si el promedio pasa de 2.5 (contenedores muy cuadrados o densidad 2×), reduce `D` en proporción `D · sqrt(34 / N)`.
- `rampaLineas`: 0→1 en 1.2 s al pasar a dinámico (el estático no tiene sinapsis; entran con un fundido, no de golpe).
- Las sinapsis se dibujan **antes** que las partículas.

### 4.8 Dibujo y composición

- **Sprites:** un `OffscreenCanvas` (o canvas fuera del DOM) por color (`glow`, `glow2`) de 128 × 128 px con la receta del halo + núcleo en blanco de alfa → se pinta con `drawImage` escalado según `size · (0.7 + 0.6·z) · W` y `globalAlpha = bEf`. Durante un tween de tema, los dos sprites se regeneran en cada fotograma (dos `createRadialGradient` de 128 px: < 0.1 ms).
- **Modo de mezcla = token:** `ctx.globalCompositeOperation = frame.blendMode` (`'screen'` en oscuro, `'multiply'` en claro). En claro, multiplicar luces sobre un fondo claro no "brilla": se acepta (la spec ya advierte que la luz difusa pierde fuerza en claro, §6 D-D) y se compensa con halo α ×0.8 y núcleo `mixOklab(color, ink, .25)`.
- **Cambio de modo claro↔oscuro:** como `blendMode` es discreto, el canvas baja su opacidad CSS a 0 en 200 ms, cambia de modo de mezcla en el punto medio del tween y vuelve a 1 en 300 ms. El fondo hace el tween normal debajo.
- Limpieza por fotograma: `clearRect` y redibujar todo (sin estelas, sin `fillRect` translúcido: las estelas se leen como salvapantallas).

### 4.9 Presupuesto

≤ 2.5 ms de CPU por fotograma con N = 34 y calidad 2 (≈ 34 `drawImage` + ≤ 60 trazos cuadráticos). Medirlo con el medidor de fps (§11). Recordar que **G01 encima obliga al navegador a volver a desenfocar el fondo en cada fotograma** (`backdrop-filter` sobre contenido animado): es el mayor riesgo para los 60 fps. Medir A05 + G01 en el Combinador desde el primer día.

---

## 5. A10 · Plasma duotono

### 5.1 Intención

Dos luces grandes, una de cada color de marca, que giran despacio una alrededor de la otra; donde se tocan nace un tercer color. Energético, pero lento: un giro completo cada 40 s.

### 5.2 Técnica

**OGL**, mismo pipeline y `common.glsl` que A01. Respaldo CSS: las dos luces en un contenedor que rota (`rotate` 40 s lineal) con contrarrotación de cada luz para que no giren sobre sí mismas, y `mix-blend-mode: var(--kc-blendMode)`.

### 5.3 Receta y movimiento

| Luz | Base (x, y, d) | Color | α |
|---|---|---|---|
| P | (38, 46, 80) | `primary` (`glow2`) | 1.0 (o el del estático) |
| A | (66, 56, 78) | `accent` (`glow`) | 1.0 (o el del estático) |
| M | (85, 10, 40) | `glowMix` | .60 |

En **píxeles** (para que la órbita sea un círculo real en cualquier proporción):

```
C   = (P0 + A0) / 2                       // centro común; ≈ (52 %, 51 %)
h0  = P0 − C                              // semiseparación inicial en px
θ(t)= 2π · t / 40                         // rotación continua: aquí sí es lineal
s(t)= 1 + 0.18 · (0.5 − 0.5·cos(2π t / 53))   // la separación respira 1 → 1.18, ciclo 53 s
P(t)= C + R(θ) · h0 · s(t)
A(t)= C − R(θ) · h0 · s(t)                // opuesta
M(t)= M0 + (drift(t, 31, laneX, 4 %), drift(t, 43, laneY, 4 %))
```

- En t = 0: θ = 0, s = 1 → coincide con el estático.
- Escala de las dos grandes: `1 + 0.03 · sin(2π t / 29 + φ)` con `φ` elegido para que valga 1 en t = 0 (`φ = 0`) y desfasada en A (`φ = π`, lo que en t = 0 también da 1).
- **Bordes de plasma (calidad 2):** deformación de coordenadas con ruido de valor, amplitud **2.5 % del ancho**, escala 0.35 × ancho, velocidad 0.015 /s, con `uWarpAmt` entrando en 4 s. Hace que la zona de fusión tenga bordes vivos, no dos círculos perfectos.

### 5.4 Shader (núcleo)

```glsl
// A10 plasma.frag (incluye common.glsl)
uniform vec2  uRes;  uniform float uTime;  uniform float uWarpAmt;
uniform float uDark;                  // 0 claro … 1 oscuro (interpolado)
uniform vec3  uBg, uPrimary, uAccent, uGlowMix;
uniform vec4  uP, uA, uM;             // (cx, cy, dPx, alpha) en px
uniform float uFade;
varying vec2  vUv;

vec3 blendMode(vec3 b, vec3 s) {      // screen en oscuro, multiply en claro, continuo
  return mix(blendMultiply(b, s), blendScreen(b, s), uDark);
}
vec3 layer(vec3 b, vec3 s, float a) { // mix-blend-mode con alfa: (1−a)·Cb + a·B(Cb, Cs)
  return mix(b, blendMode(b, s), a);
}

void main() {
  vec2 px = vUv * uRes;  px.y = uRes.y - px.y;
  float w = uRes.x;
  vec2 q = px / (0.35 * w) + vec2(uTime * 0.015, uTime * -0.011);
  px += uWarpAmt * 0.025 * w * (vec2(vnoise(q), vnoise(q + 3.7)) - 0.5) * 2.0;

  vec3 col = uBg;
  col = layer(col, uPrimary, luz(px, uP.xy, uP.z, uP.w));
  col = layer(col, uAccent,  luz(px, uA.xy, uA.z, uA.w));
  col = layer(col, uGlowMix, luz(px, uM.xy, uM.z, uM.w));
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), uFade);
}
```

> Si el estático aplica el modo de mezcla solo a una de las luces (p. ej. la segunda) en vez de a las tres, replica exactamente su apilado: el shader debe reproducir el árbol de capas del estático, no "mejorarlo".

### 5.5 Presupuesto

≤ 1.5 ms de GPU con `renderScale 0.5`.

---

## 6. A11 · Rejilla iluminada

### 6.1 Intención

Una cuadrícula fina que solo existe donde cae la luz; la luz la lleva el cursor como una linterna con peso. Cuando nadie la mueve, la linterna pasea sola por el lado derecho. Técnico, preciso, sin frialdad.

### 6.2 Técnica

**CSS puro para el dibujo** + **un resorte en JS** que escribe dos pares de variables (`--mx/--my` para la máscara, `--lx/--ly` para la luz) en el contenedor. Sin canvas, sin WebGL. Coste por fotograma: 4 `setProperty` + recomposición.

```css
.a11 { --mx: 65%; --my: 40%; --lx: 65%; --ly: 40%; --r: 0px; /* --r se calcula en JS */ }
.a11__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right,  color-mix(in oklab, var(--kc-ink) 14%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--kc-ink) 14%, transparent) 1px, transparent 1px);
  background-size: 44px 44px;
  /* radio EXPLÍCITO: con "farthest-corner" el radio cambiaría al mover el centro y la máscara "respiraría" */
  mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 0, transparent 100%);
}
.a11__light { /* luz(65, 40, 70, accent, .55): mismo luz() del estático, centrada en --lx/--ly */
  left: var(--lx); top: var(--ly); translate: -50% -50%;
}
```

- `--r` = 60 % de la distancia de la esquina más lejana **desde la posición estática (65 %, 40 %)**, calculada en JS en cada `resize`. Así t = 0 coincide con el estático y el radio no cambia al mover el foco.
- La luz se mueve con `left/top` vía variables solo si se mide que no causa *layout*; si lo hace, usar `transform: translate(calc(var(--lx) − 65%), …)` sobre la posición estática. Preferir `transform`.
- La luz secundaria `luz(95, 95, 50, primary, .5)` no sigue al cursor: deriva sola ±3 % con periodos 47 s / 59 s (CSS, `alternate`, easing drift).
- **Detalle premium opcional (calidad 2):** una segunda capa de **puntos en las intersecciones** (`radial-gradient` de 1.5 px en `ink` 30 %, mismo `background-size: 44px`), enmascarada con un radio de **0.35 · --r**. El centro del foco se ve "más definido" que el borde.
- Alinear la rejilla a píxel: `background-position: 0.5px 0.5px` solo si en DPR 1 las líneas salen borrosas; verificar en DPR 1, 1.5 y 2.

### 6.3 Resorte con inercia

Resorte **críticamente amortiguado** (sin rebote), integrado con el `dt` real (no escalado por la velocidad del laboratorio: el cursor es del usuario).

| Elemento | ω (rad/s) | Asentamiento aprox. | Por qué |
|---|---|---|---|
| Máscara de la rejilla (`--mx/--my`) | 7.0 | ~0.65 s | Responde rápido: es lo "técnico" |
| Luz de acento (`--lx/--ly`) | 4.5 | ~1.0 s | Va detrás de la rejilla: crea profundidad (parallax por retraso) |

```ts
// Resorte críticamente amortiguado, integración semi-implícita estable para dt ≤ 50 ms.
function springStep(s: { x: number; v: number }, target: number, omega: number, dt: number) {
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega, hoo = dt * oo, hhoo = dt * hoo;
  const detInv = 1 / (f + hhoo);
  const x = (f * s.x + dt * s.v + hhoo * target) * detInv;
  const v = (s.v + hoo * (target - s.x)) * detInv;
  s.x = x; s.v = v;
}
```

Escribe la variable solo si cambió > 0.1 px. Si ambos resortes están en reposo (|v| y |x − target| < 0.05 px) **y** no hay deambulación (p. ej. reduced-motion), detén su rAF.

### 6.4 Objetivo: cursor o deambulación

- **Puntero:** `pointermove` pasivo en `window`, convertido a coordenadas del contenedor. Solo `pointerType === 'mouse' | 'pen'`. En táctil (o `(hover: none)`), nunca sigue al dedo: solo deambula.
- **Deambulación** (sin puntero dentro del contenedor durante 2.5 s, al salir o en táctil):

```
xw(t) = 65 + 14 · sin(2π t / 29 + φx)      // % del ancho
yw(t) = 40 + 10 · sin(2π t / 37 + φy)      // % del alto
```

con `φx, φy` sembrados tales que en t = 0 la posición sea (65, 40) (usa `sin(… ) − sin(φ)`, o elige `φ = 0` para ambas). Usa el `labTime` (sí respeta el regulador de velocidad).

- **Traspaso sin saltos:** al dejar el puntero, el objetivo se mezcla del último punto del cursor a la trayectoria de deambulación con `k` de 0 a 1 en **1.5 s** (`ease-in-out`): `target = mix(lastPointer, wander(t), k)`. Al entrar el puntero, el objetivo pasa al cursor directamente; el resorte suaviza.
- **Límites:** el objetivo se recorta al contenedor ±10 %.
- **Protección del texto:** si el centro de la luz cae dentro de la zona de texto (45 % izquierdo o el rectángulo de la plantilla), su α baja de .55 a **.35** de forma continua (`α = .55 − .20 · solape`, con `solape` = 0…1 según la distancia al borde de la zona en una franja de 10 %). La rejilla no se atenúa.

### 6.5 Presupuesto

≤ 0.5 ms de CPU por fotograma. Ninguna propiedad de *layout* animada. `will-change: mask-position` no existe: no la pongas; `will-change: transform` solo en `.a11__light`.

---

## 7. Reglas para A02–A04, A06–A09, A12–A14 (CSS animado)

### 7.1 Reglas comunes

1. **Solo `transform` y `opacity`** (compositor). Nunca animar `filter`, `backdrop-filter`, `background-position` de capas grandes (excepción: el grano de A03, que es un mosaico pequeño), `width/height/top/left`, `mask-*` ni `box-shadow`.
2. **Web Animations API** (`element.animate`) en vez de keyframes en hojas de estilo: permite pausar todo con la API de actividad (§2.3), aplicar el regulador de velocidad con `animation.playbackRate` (interpolado, τ = 300 ms) y leer `currentTime` para el medidor de legibilidad.
3. Cada animación declara su **función pura equivalente** en `motion.ts` (§1.5): el medidor y `seek(t)` la usan.
4. `alternate` + `cubic-bezier(.37, 0, .63, 1)`; rotación continua `linear`.
5. Duraciones primas o inconmensurables entre capas (§1.2); delays negativos sembrados para desfasar **solo** si el desfase no rompe t = 0 ≡ estático. Si la rompe, desfasar con periodos distintos en lugar de delays.
6. Las capas usan los colores de la receta mediante variables `--kc-*` (y `color-mix(in oklab, …)`), por eso el tween de tema las recolorea sin tocar las animaciones.
7. Respaldo para A01/A10 cuando no hay WebGL: misma receta, mismas amplitudes y periodos de sus secciones, implementada como aquí.

### 7.2 Parámetros por atmósfera

| Atmósfera | Movimiento | Parámetros |
|---|---|---|
| **A02 Malla** | Las 4 luces de esquina orbitan en círculos pequeños, cada una en su sentido | Radio de órbita 8 % · periodos 29 / 37 / 43 / 53 s · sentidos alternos · `rotate` de un contenedor + contrarrotación (círculo exacto, lineal). La versión WebGL estilo Stripe queda para la etapa 4. |
| **A03 Grano** | Deriva de luces + grano vivo | Luces: ±5 %, 23 / 31 / 41 s. Grano: mosaico SVG `feTurbulence` de 256 px rasterizado una vez a imagen; `background-position` salta entre **8 desplazamientos sembrados** con `steps(1)` cada **100 ms** (rango de la spec 80–120 ms). En reduced-motion o modo estático: grano fijo. |
| **A04 Bokeh** | Flotación vertical + "respiración" de enfoque | `translateY` ±4 % y vaivén `translateX` ±1.5 %, periodos sembrados en 19–47 s por disco. **Enfoque:** no animar `filter: blur`; cada disco tiene dos versiones apiladas (nítida y con 3 px de desenfoque, prerrenderizada) y se hace **fundido de opacidad** entre ellas con periodo 17–29 s y fase propia. Visualmente equivale a "blur 0→3 px" y cuesta casi nada. |
| **A06 Haz** | El haz oscila; polvo en el cono | `rotate` ±4°, 20 s por tramo, `transform-origin` en el vértice del cono (12 %, −6 %). Polvo: 14 motas de 0.15–0.35 % en `mix(accent, ink, .3)` α .15–.4, que avanzan a lo largo del eje del cono 30–50 s y aparecen/desaparecen con fundido de 1.5 s en los extremos; Canvas 2D ligero o elementos con `transform` (≤ 14). |
| **A07 Eclipse** | La corona respira; llamaradas giran | Corona `scale` 1 → 1.04, 24 s por tramo. Llamaradas: capa cónica extra en `glow` α ≤ .25 que rota **90 s por vuelta**, `linear`, enmascarada al anillo. El disco y su filo no se mueven (es el ancla del logo). |
| **A08 Seda** | Las bandas ondulan | En la etapa 2, **sin morph de trazados** (re-desenfocar el SVG en cada fotograma es caro): cada curva es una capa ya desenfocada que se anima con `translate` ±4 %, `rotate` ±2° y `scaleY` .96–1.06, periodos 23 / 29 / 37 s. El *flow field* WebGL, en la etapa 4. |
| **A09 Horizonte** | El sol sube y baja; el cielo se templa con él | Ciclo **60 s** (30 s por tramo, `alternate`): sol `translateY` ±8 %. Temperatura: una capa con el degradado cálido encima del cielo cuya opacidad sigue la altura del sol, 0.6 (alto) → 1.0 (bajo), con la misma función. La línea de horizonte no se mueve. |
| **A12 Manchas** | Deriva lenta | Rango de la spec 16–25 s: 17 / 19 / 23 / 25 s, ±5 %, escala .97–1.04. Las manchas son nítidas: el movimiento debe ser más contenido que en las luces difusas. |
| **A13 Tipografía** | Marquesina muy lenta | Tres líneas, `translateX` con direcciones alternas: ±4 % / ±6 % / ±3 %, periodos 30 / 34 / 38 s (`alternate`). Sin `transform` sub-píxel en reposo: al parar (estático) redondear. |
| **A14 Datos** | El gráfico se actualiza | **Evento discreto**, no ciclo: cada **4.5 s** cambian como mucho 4 barras (paseo aleatorio sembrado, acotado al 15–95 % de la altura) y la polilínea. Transición **600 ms** `cubic-bezier(.2, 0, 0, 1)` con escalonado de 30 ms por barra; el círculo de acento se desliza al último punto. Las barras se animan con `scaleY` (`transform-origin: bottom`), nunca con `height`. |

---

## 8. Reglas para A15–A18 (etapa 4)

| Atmósfera | Técnica | Parámetros |
|---|---|---|
| **A15 Niebla de páramo** | CSS (3 capas) | Parallax lento: `translateX` ±5 / ±8 / ±12 % para el plano lejano / medio / cercano, periodos **59 / 47 / 41 s** (lo cercano, más rápido). Opacidades de la spec (.25 / .40 / .60) con respiración ±0.05 en 53 s. |
| **A16 Constelación** | **Reutilizar el motor de A05** (`ParticleField`) con otros parámetros | Partículas sin halo grande (nodos), sinapsis más visibles (α .5), `D = 0.18 · min(W, H)`. **Cursor:** atracción en radio 18 % del ancho con fuerza que cae como `(1 − r/R)²`, desplazamiento máximo 3 %, y todo mediado por resorte (ω = 3). Las conexiones aparecen y desaparecen solo por el alfa continuo de §4.7. Por eso A05 debe programarse como motor parametrizable desde el principio. |
| **A17 Cáusticas** | OGL | Cáustica clásica por iteración de senos o por Voronoi animado; velocidad **0.2×** de la natural (un "ciclo" perceptible ≈ 30 s); color = `mix(bg, accent, f(intensidad))`, `renderScale 0.5`; textura pregenerada para el estático = fotograma t = 0. |
| **A18 Ondas de interferencia** | OGL o Canvas 2D | Anillos desde dos focos (primary y accent), longitud de onda 4 % del ancho, propagación **2 % del ancho por segundo**, α .08–.12, atenuación con la distancia `1 / (1 + r/0.4W)`. El moiré nace solo; no añadir nada más. |

---

## 9. Legibilidad en dinámico (medida cada ~500 ms)

La spec (§5.6) pide medir, no estimar. En dinámico, el fondo cambia; el medidor muestra el **peor valor del ciclo**.

### 9.1 Qué se mide

El rectángulo exacto de cada bloque de texto de la plantilla activa (titular = texto principal, cuerpo/etiquetas = texto secundario), encima del vidrio activo.

### 9.2 Cómo (sin leer la GPU del escenario)

1. Cada `DynamicInstance` entrega `getFrameState()`: la receta **en el tiempo actual** (luces con posición/escala/alfa, partículas con posición/brillo, posición del foco en A11, etc.). Las capas CSS la obtienen de su función pura con el `currentTime` de sus animaciones.
2. Un **rasterizador común** (`legibility/rasterize.ts`, Canvas 2D) pinta ese estado en un `OffscreenCanvas` limitado a la región del texto **más un margen igual al radio de desenfoque del vidrio**, a resolución reducida (lado mayor ≤ 96 px).
3. Aplica el vidrio: desenfoque gaussiano con radio `blur × escala` (`ctx.filter = 'blur(…)'`; si no está soportado, *box blur* de 3 pasadas) y luego el velo `color-mix(in srgb, surface velo%, transparent)` compuesto en sRGB, como el CSS real. Incluye el `saturate()` del vidrio si lo tiene (matriz de saturación en sRGB lineal).
4. Luminancia relativa WCAG por píxel → percentiles **P10 y P90**.
5. Contraste WCAG de `ink` (principal) y `muted` (secundario) contra **ambos** percentiles; se queda el peor.
6. **Ventana del peor del ciclo:** guarda las muestras de los últimos `W` segundos, con `W = periodo dominante de la atmósfera` (A01: 27 s · A05: 40 s · A10: 40 s · A11: 37 s · CSS: su periodo mayor, máx. 60 s). Muestra: **peor del ciclo** (grande, con semáforo) y **actual** (pequeño). La ventana se vacía al cambiar cualquier parte de la combinación, y se marca "midiendo…" hasta llenar al menos un ciclo.
7. El botón **"Ajustar velo"** usa el peor del ciclo, no el actual.

### 9.3 Cadencia y presupuesto

- Una medición cada **500 ms** del tiempo real (no del `labTime`), programada con `requestIdleCallback` (timeout 200 ms) y **saltada** si el último fotograma tardó > 14 ms.
- Coste objetivo **≤ 1.5 ms** por medición. Si se pasa, reducir la región a 64 px de lado.
- En estático: una sola medición por cambio.

### 9.4 Validación del rasterizador

En modo desarrollo, un botón *"Comparar con GPU"* lee la región real del canvas del escenario (`gl.readPixels` justo después de dibujar, o `drawImage` del canvas 2D a un canvas pequeño) y muestra la diferencia de P10/P90. Tolerancia: **|ΔL| ≤ 3 %**. Esto cubre el "verificar a mano en 5 casos" de la spec (§5.10) para el dinámico.

---

## 10. Micro-interacciones del laboratorio

El laboratorio tiene que sentirse como un producto de KippiCore: preciso y tranquilo. Todas usan los tokens de §1.5.

### 10.1 Transición entre paletas (C) y modo (claro/oscuro)

- Tween de §2.6: **500 ms**, `ease-standard`, en OKLCH, todo a la vez (interfaz de muestra, atmósfera, partículas, vidrios, texturas). Nada se recarga, nada se reinicia.
- El código de la combinación (`C05 · T00 · A05 · G01`) actualiza **solo el segmento que cambió**: el valor viejo sube 4 px y se desvanece (120 ms, `ease-in`) y el nuevo entra desde 4 px abajo (160 ms, `ease-out`). Ancho de los segmentos fijo (cifras tabulares) para que nada salte.
- Cambios rápidos con teclado (flechas mantenidas): cada nuevo cambio parte del valor interpolado actual (§2.6, paso 1). Si llegan más de 4 cambios por segundo, la duración baja a **240 ms** para que el color no se quede "atrás" del selector.
- Reduced-motion: el color sigue interpolando (no es movimiento), pero en 200 ms.

### 10.2 Estático ↔ dinámico

- **A dinámico:** la instancia se monta debajo del estático, hace `seek(0)` (idéntico al estático), se hace visible y el estático se retira (sin fundido visible, porque coinciden). Después el reloj arranca con la **rampa de 1.2 s** (§2.2): el movimiento "despierta", no arranca de golpe. Sinapsis y pulso entran con sus propias rampas (1.2 s y 3 s).
- **A estático:** la velocidad baja a 0 en **600 ms** (`ease-in-out`); luego el estático (t = 0) aparece encima con fundido de **400 ms**, y la instancia se desmonta. Como el fotograma congelado no es t = 0, ese fundido es lo único que se ve: debe ser suave, no un corte.
- El interruptor muestra el estado con un icono que no se anima más de 240 ms.

### 10.3 Cambio de atmósfera (A) y de vidrio (G)

- **Atmósfera:** fundido cruzado de **600 ms** (`ease-in-out`); la nueva entra en t = 0 y empieza su rampa. Durante el fundido corren las dos (presupuesto doble momentáneo, aceptado). Si ambas son WebGL, en el mismo contexto (§2.7).
- **Vidrio:** cambiar las variables del vidrio (velo, desenfoque, radio) con 240 ms `ease-standard` cuando sean interpolables (`@property` registradas para `--glass-veil`, `--glass-blur`, `--glass-radius`); los pseudoelementos que no lo sean, fundido de opacidad de 160 ms. No interpolar `backdrop-filter` durante más de 240 ms (es caro).
- **Tipografía (T):** no se puede interpolar entre fuentes: fundido del bloque de texto en 240 ms, con las métricas de la nueva fuente ya cargadas (precargar las 14 familias en idle) para evitar saltos de *layout*.

### 10.4 Hover de tarjetas de vidrio

| Estado | Cambio | Duración / easing |
|---|---|---|
| Hover (entrada) | `translateY(-2px)`; sombra externa: desplazamiento y desenfoque ×1.25; filo de luz (`inset 0 0 0 1px`) de α .55 → .75 | 240 ms `ease-out` |
| Hover (salida) | vuelta al reposo | 320 ms `ease-standard` (salir más lento que entrar se siente más caro) |
| Brillo especular (G02, G16) | el `::before` se desplaza hacia el puntero, máx. ±8 % del ancho, con resorte ω = 6 | continuo mientras hay hover |
| Pulsado | `translateY(0) scale(.995)` | 120 ms `ease-in` |
| Foco visible (teclado) | lo mismo que hover + anillo de 2 px en `accentAsText` con desfase de 3 px | 160 ms |
| G07 dicroico | el `conic-gradient` del filo rota 20° con `@property --angle` mientras hay hover | 600 ms `ease-out` (no gira solo) |

**Prohibido:** `scale` > 1.01, inclinación 3D > 1.5°, reflejos que barren la tarjeta, rebotes. En táctil, ningún estado de hover persistente.

### 10.5 Otros

- **Regulador de velocidad:** el valor nuevo se aplica suavizado (τ = 300 ms) para que arrastrar el control no dé tirones (§2.2).
- **Matriz y galerías:** las miniaturas estáticas aparecen con fundido de 160 ms escalonado 20 ms por celda (máx. 300 ms de escalonado total); nunca animación de entrada en scroll.
- **Medidor de legibilidad:** el número cambia con fundido de 160 ms; el semáforo cambia de color con el mismo tween OKLCH de 240 ms. El número **no** cuenta hacia arriba ni abajo (contadores animados distraen de un dato).

---

## 11. Presupuesto de rendimiento y degradación

### 11.1 Objetivo

**60 fps sostenidos** (p95 de tiempo de fotograma ≤ 16.7 ms) en el Combinador con **A05 dinámica + G01** en un portátil de gama media (referencia: MacBook Air M1 o Intel Iris Xe, Chrome y Safari actuales), a 1440 × 900.

| Componente | Presupuesto por fotograma |
|---|---|
| A01 / A10 | ≤ 1.5 ms GPU (`renderScale 0.5`) |
| A05 | ≤ 2.5 ms CPU (N = 34, calidad 2) |
| A11 | ≤ 0.5 ms CPU |
| CSS animadas | solo compositor; 0 ms de *layout*/*paint* por fotograma (verificar en DevTools > Rendering > Paint flashing) |
| Tween de tema | ≤ 0.5 ms CPU por fotograma durante 500 ms |
| Medidor de legibilidad | ≤ 1.5 ms cada 500 ms, en idle |

### 11.2 Escalones de calidad (`quality.ts`)

Medidor de fps (visible en desarrollo, siempre activo internamente). Si la media de tiempo de fotograma supera **18 ms durante 2 s**, baja un escalón; si queda por debajo de **12 ms durante 10 s**, sube uno. Nunca se cambia de escalón durante un tween ni durante un fundido.

| Nivel | A01 / A10 | A05 | A11 |
|---|---|---|---|
| 2 (completa) | `renderScale .5`, deformación activa | N completo, curvatura de hifas, destellos | puntos en intersecciones |
| 1 | `renderScale .375`, sin deformación | N × 0.75, sinapsis rectas, sin destellos | sin puntos |
| 0 | respaldo CSS | N × 0.5, sin sinapsis | igual que 1 |

### 11.3 Reglas fijas

- DPR máximo **1.5**.
- Pausa por `IntersectionObserver` y `visibilitychange` (§2.3). Nada consume CPU con la pestaña oculta.
- Un solo rAF (§2.2) y un solo contexto WebGL (§2.7).
- Cero asignaciones por fotograma en los bucles calientes (arreglos preasignados, `Float32Array` para uniforms y partículas): evita pausas del recolector de basura.
- El JS del motion (sin OGL) ≤ 15 KB comprimido; OGL ≈ 10–12 KB por partes (importar solo `Renderer`, `Program`, `Mesh`, `Triangle`). Cargar OGL **de forma diferida** al primer uso de una atmósfera WebGL para no tocar el presupuesto inicial de 250 KB (§5.7 de la spec).

---

## 12. Premium vs. genérico

### 12.1 Criterio

Una atmósfera se ve **premium** cuando cumple las cinco pruebas:

1. **Prueba del póster:** cualquier fotograma, congelado, sería una buena imagen estática. (Si solo funciona en movimiento, el movimiento está tapando una composición débil.)
2. **Prueba de los 5 segundos:** el movimiento se descubre, no se anuncia (§1.3).
3. **Prueba del texto:** con el titular encima, el ojo va al texto, no al fondo. El medidor (§9) mantiene el peor del ciclo en el mismo semáforo que el estático.
4. **Prueba de la paleta:** cambiar entre las 22 paletas en claro y oscuro nunca produce un color que no sea de la marca, ni un fotograma con bandas, ni un salto.
5. **Prueba de la tarde:** se puede dejar abierta una hora en una pantalla de oficina sin cansar ni distraer.

### 12.2 Anti-ejemplos (se ve genérico) → qué hacer

| Genérico | Por qué se nota | Premium |
|---|---|---|
| Red de puntos tipo *particles.js*: muchos puntos iguales, líneas rectas por todas partes, repulsión al cursor | Plantilla de 2015; densidad uniforme; "tecnología" de catálogo | Pocas partículas (34), tamaños y profundidades distintas, sinapsis escasas (~1 por partícula) y curvas, sin cursor en A05 |
| Degradados con bandas visibles | Delata 8 bits sin cuidado, sobre todo en oscuro | Dither triangular estático en shaders; en CSS, añadir el grano X de muy baja α si aparecen bandas |
| Blobs que giran en círculos perfectos y obvios | El ojo detecta la geometría y el bucle | Deriva por ruido, periodos primos, deformación de bordes de 1.5–2.5 % |
| Ciclos cortos (< 10 s) o ping-pong `linear` | Se siente nervioso; el rebote al final se ve | 16–60 s, `alternate` con easing senoidal, trayectorias C¹ |
| `hue-rotate`, arcoíris, neones fuera de paleta | Rompe la regla de tokens y el registro enterprise | Solo `--kc-*`; el "tercer color" de A10 nace de la mezcla, no se inventa |
| Spotlight pegado al cursor, o con un retraso gomoso > 1 s | Sin inercia se ve barato; con demasiada, torpe | Resorte críticamente amortiguado ω 4.5–7, sin rebote, con parallax por retraso |
| Tarjetas con *tilt* 3D de 10–15° y reflejo que barre | "Dribbble 2019" | `translateY(-2px)`, filo de luz que sube de α, especular con ±8 % |
| Todo se mueve a la vez y al mismo ritmo | Coreografía de salvapantallas | Un protagonista, el resto quieto o más lento, fases sembradas |
| Grano que hierve a 60 fps | Ruido de TV | Grano a 10 fps con `steps()` |
| Estelas de partículas (`fillRect` translúcido) | Salvapantallas de Windows | `clearRect` y redibujo limpio |
| Animar `filter: blur` en capas grandes | Tirones y ventiladores | Fundido de opacidad entre versiones prerrenderizadas |
| Arranque de golpe al activar el dinámico | Se ve "encendido", no vivo | Rampa de 1.2 s desde t = 0 ≡ estático |
| Pops de partículas en los bordes o de líneas en el umbral | Rompe la ilusión de continuidad | Margen fuera de vista y alfa continuo `(1 − d/D)²` |

---

## 13. Pruebas y criterios de aceptación del motion

### 13.1 Ganchos de prueba

- `?t=12.5` en la URL (o `window.__lab.seek(12.5)` en desarrollo) congela todas las instancias en ese tiempo, sin rampa. `?t=0` debe ser idéntico al estático.
- `?seed=…` cambia la semilla de usuario.
- `window.__lab.fps()` devuelve la ventana de tiempos de fotograma.

### 13.2 Pruebas automáticas

| Prueba | Criterio |
|---|---|
| **Unitarias** de `prng`, `drift`, `driftScale`, `springStep`, tween OKLCH (arco más corto, acromáticos) | Deterministas; `drift(t=0) = 0`; `driftScale(t=0) = 1`; resorte sin rebasamiento |
| **Determinismo A05** | `seek(30)` dos veces → mismas posiciones (ε = 1e-9); a 30 y 60 fps simulados, mismo estado en t = 30 |
| **t = 0 ≡ estático** (Playwright) | Para A01, A05, A10, A11 y las CSS: captura del estático vs. dinámico con `?t=0`, en 22 paletas × 2 modos: ΔE2000 medio ≤ 1.5, máximo ≤ 4 (el dither explica el resto) |
| **Solo tokens** | Inyectar una paleta sintética (seis colores muy distintos) y verificar que ningún píxel del dinámico en `?t=10` cae fuera del casco de colores alcanzable mezclando esos roles con blanco y negro |
| **Visuales en el tiempo** | Capturas en `?t=0`, `?t=15`, `?t=30` de cada atmósfera dinámica, en 2 paletas de referencia (C05 y C20) × 2 modos |
| **Pausa** | Con el escenario fuera de la vista o la pestaña oculta, 0 callbacks de rAF en 2 s |
| **Reduced-motion** | Con `reduce` emulado: arranca en Estático y muestra el aviso |

### 13.3 Aceptación manual

- A05 + G01 en el Combinador, 60 s grabados con el panel de rendimiento: p95 ≤ 16.7 ms.
- Cambiar paleta 10 veces seguidas con el teclado: sin saltos, sin reinicio del movimiento, recoloreado completo en ≤ 600 ms.
- Activar y desactivar el dinámico 5 veces: ningún corte visible.
- A11: el foco nunca "respira" al moverse, deambula solo tras 2.5 s y el traspaso cursor → deambulación no tiene saltos.
- Comparar el medidor de legibilidad del dinámico con la lectura de GPU en 5 casos (§9.4): |ΔL| ≤ 3 %.

---

## Anexo A · Código de referencia

### A.1 PRNG y hash

```ts
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fnv1a32(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
```

### A.2 Ruido sembrado

```ts
import { createNoise2D, createNoise3D } from 'simplex-noise';
export const makeNoise = (seed: number) => ({
  n2: createNoise2D(mulberry32(seed)),
  n3: createNoise3D(mulberry32(seed ^ 0x9e3779b9)),
});
```

### A.3 Interpolación OKLCH (esqueleto)

```ts
// oklch: [L 0–1, C ≥ 0, H grados]
export function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch {
  let ha = a[2], hb = b[2];
  if (a[1] < 0.02) ha = hb;          // acromático: adopta el matiz del otro
  if (b[1] < 0.02) hb = ha;
  let dh = ((hb - ha + 540) % 360) - 180;   // arco más corto
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (ha + dh * t + 360) % 360];
}
// Después: oklch → oklab → sRGB lineal → gamut map (reducir C hasta que quepa) → sRGB gamma.
```

### A.4 Bucle del reloj (esqueleto)

```ts
let last = 0, speed = 0, target = 1;
function frame(now: number) {
  const dtReal = Math.min((now - last) / 1000, 0.05); last = now;
  speed += (target - speed) * (1 - Math.exp(-dtReal / 0.3));   // τ = 300 ms
  for (const inst of activeInstances) {
    const dt = dtReal * speed * inst.ramp();                    // rampa de arranque 0→1
    inst.time += dt;
    inst.tick(dt, inst.time);
  }
  if (activeInstances.size) requestAnimationFrame(frame);
}
```

---

**Pendiente de decidir (anotar en `docs/decisiones.md` al implementar):** si A05 pasa a WebGL en la etapa 4 (sprites instanciados con mezcla aditiva y *bloom* barato) si Canvas 2D no llega a 60 fps con G01 en Safari; y si A02 y A08 justifican su versión WebGL o se quedan en CSS.
