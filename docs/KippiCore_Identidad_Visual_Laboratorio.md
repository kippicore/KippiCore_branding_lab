# KippiCore · Sistema de identidad visual y laboratorio

> Documento de traspaso para Claude Code. Resume la exploración de marca hecha en Claude (paletas, tipografías, fondos atmosféricos y texturas) y da las instrucciones para construir un **laboratorio interactivo** donde se combinen y se prueben, en versión estática y dinámica.
>
> Versión 0.4 · octubre 2026 · Bogotá. Idioma del producto: español (Colombia).

---

## 0. Contexto y criterio de diseño

**KippiCore** es un estudio de software a la medida para empresas colombianas, de Miguel e Ian (los mismos socios de KippiLex). Su oferta va desde automatizaciones y CRM para pymes (panaderías, tiendas naturistas, comercio de barrio) hasta ERP, CRM complejos e integraciones con IA para medianas empresas.

**El problema de diseño.** Una sola marca tiene que hablarle a dos compradores:

| Registro | Quién compra | Qué compra | Qué necesita ver |
|---|---|---|---|
| Enterprise | Gerente o comité | Reducción de riesgo | Método, solidez, permanencia |
| Pyme | El dueño del negocio | Cercanía y resultado rápido | Lenguaje claro, calidez, precio que no asusta |

**La respuesta del sistema: un núcleo fijo y un dial.** Fijo: logo, tipografía principal y neutros. Variable: intensidad del acento, textura, fondo y tono del texto. Cada opción de este documento tiene un valor `reg` de 0 a 100 (0 = enterprise, 100 = pyme) para ubicarla en ese dial.

**Principios que salieron de la investigación** (usarlos como criterio al construir y al decidir):

- **El color comunica por su tono, no solo por su matiz.** La saturación y la luminosidad cambian la personalidad percibida tanto como el matiz. Un verde muy oscuro y poco saturado transmite competencia; el mismo verde brillante, entusiasmo. Por eso cada paleta se diseña como una escala. _Fuente: Labrecque & Milne (2012), Exciting red and competent blue · Suk & Irtel (2009)._
- **El mar azul: confianza que ya no distingue.** La mitad de las 100 marcas tecnológicas más grandes usan azul, y la idea de que el azul es el color de la confianza está cuestionada metodológicamente. La confianza puede venir de colores profundos y sobrios de cualquier matiz. _Fuente: DeSantis Breindel vía SlashGear · revisión Coloring Trust._
- **Las letras tienen personalidad, y debe coincidir con el mensaje.** Los lectores atribuyen rasgos de carácter a cada tipografía, y cuando la letra contradice el texto el mensaje pierde fuerza. Las serifas evocan más atributos emocionales; las sans se perciben más técnicas. _Fuente: Brumberger (2003) · Tantillo et al. (1995) · Kostelnick & Roberts (1998)._
- **El modo oscuro es un diseño, no una inversión.** Fondos gris muy oscuro en vez de negro puro, texto casi blanco en vez de blanco, acentos más claros y menos saturados, y la elevación expresada con superficies más claras en lugar de sombras. _Fuente: Material Design · guías de Atmos y UX Planet._
- **2026: la textura vuelve como señal de autoría.** Grano, papel, trazo a mano e imperfección deliberada aparecen en casi todos los pronósticos como respuesta a lo demasiado liso del contenido generado. En paralelo crece la mitad sobria: retículas limpias y serifas simples. _Fuente: Creative Bloq, Kota, Canva Design Trends 2026._
- **El vidrio tiene un costo de legibilidad.** Liquid Glass de Apple recibió fuertes críticas por bajo contraste, y la propia Apple recomienda usarlo con moderación. Si KippiCore usa vidrio, será un acento, nunca una superficie de lectura. _Fuente: Apple, Meet Liquid Glass (WWDC 2025) · Infinum · MacStories._

**Códigos.** `T` = tipografía, `C` = color, `A` = atmósfera (fondo), `G` = vidrio/cristal, `X` = textura de la exploración. Una combinación se nombra así: `C05 · T00 · A01 · G01`.

**Dirección favorita hasta ahora.** Miguel se inclina por el cristal esmerilado sobre fondos de luz difusa (estilo "Aurora"/bioluminiscencia) con la tipografía Geist. Las tres direcciones de la exploración siguen abiertas (sección 6).

---

## 1. Sistemas tipográficos

Cada sistema tiene tres niveles:

- **Principal:** titulares, marca, cifras grandes.
- **Secundario:** lectura, interfaz, botones.
- **Apoyo:** datos, etiquetas, código, cifras tabulares (monoespaciada).

Todos se prueban en regular, negrilla, itálica, MAYÚSCULAS y minúsculas. Todas las familias son de Google Fonts (licencia OFL, uso comercial gratuito).

### T00 · Geist (base recomendada · la del laboratorio de cristal)

- **Principal y secundario:** Geist, pesos 400 / 500 / 600 / 700; titulares en 700 con tracking −0.035em.
- **Apoyo:** Geist Mono, pesos 400 / 500; etiquetas en mayúsculas con tracking +0.12em, 11 px.
- **Registro:** 45 (equilibrio). Técnica, neutra y contemporánea. Es la tipografía de Vercel.
- **Google Fonts:** `family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500`
- **Nota:** Miguel cree que es la tipografía de KippiLex; **confirmar** con los archivos de marca de KippiLex. Si KippiLex usa otra, agregarla como `T14` y compararlas en el laboratorio.
- **Ojo:** Geist no trae itálica en Google Fonts (el navegador la sintetiza). Si la itálica importa, usar la de la familia secundaria o marcarla como sintética en el laboratorio.

### T01 · Editorial técnico

- **Principal:** Instrument Serif · regular 400, negrilla 400, titular 400, tracking -0.01em, escala relativa 1.2
- **Secundario:** Instrument Sans
- **Apoyo:** JetBrains Mono
- **Registro:** 40 (Equilibrio)
- **Concepto:** Un serif condensado y elegante para titulares, una sans neutra para leer y la mono de los programadores para datos. Sofisticado sin ser frío.
- **Ojo:** Instrument Serif tiene un solo peso: la jerarquía se hace con tamaño e itálica, no con negrilla.
- **Google Fonts:** `family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:ital,wght@0,400;0,700;1,400`

### T02 · Serif blando

- **Principal:** Fraunces · regular 400, negrilla 800, titular 800, tracking -0.02em, escala relativa 1
- **Secundario:** Hanken Grotesk
- **Apoyo:** IBM Plex Mono
- **Registro:** 70 (Pyme)
- **Concepto:** Fraunces tiene remates suaves, casi redondeados: cálida y con carácter, cercana sin ser infantil. Hanken lee limpio en pantalla.
- **Ojo:** Fraunces es variable: admite desde un titular sobrio hasta uno muy expresivo.
- **Google Fonts:** `family=Fraunces:ital,wght@0,400;0,700;0,800;1,400&family=Hanken+Grotesk:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400`

### T03 · Superfamilia corporativa

- **Principal:** IBM Plex Sans · regular 400, negrilla 700, titular 700, tracking -0.02em, escala relativa 1
- **Secundario:** IBM Plex Serif
- **Apoyo:** IBM Plex Mono
- **Registro:** 10 (Enterprise)
- **Concepto:** Plex Sans, Serif y Mono fueron diseñadas juntas: coherencia total entre documento, interfaz y código. Máxima confianza, cero riesgo.
- **Ojo:** Es reconocible como la tipografía de IBM. Segura, pero con poca personalidad propia.
- **Google Fonts:** `family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400`

### T04 · Grotesca de laboratorio

- **Principal:** Space Grotesk · regular 400, negrilla 700, titular 700, tracking -0.03em, escala relativa 1 · sin itálica nativa
- **Secundario:** Public Sans
- **Apoyo:** Space Mono
- **Registro:** 65 (Pyme)
- **Concepto:** Space Grotesk conserva rarezas de su origen monoespaciado: se siente tecnológica y de startup. Public Sans aporta sobriedad.
- **Ojo:** Space Grotesk no trae itálica: el navegador la inclina artificialmente. Usar itálica solo en el texto secundario.
- **Google Fonts:** `family=Space+Grotesk:wght@400;700&family=Public+Sans:ital,wght@0,400;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400`

### T05 · Grotesca expresiva

- **Principal:** Bricolage Grotesque · regular 400, negrilla 800, titular 800, tracking -0.03em, escala relativa 1.02 · sin itálica nativa
- **Secundario:** Onest
- **Apoyo:** Martian Mono
- **Registro:** 80 (Pyme)
- **Concepto:** Bricolage cambia de proporción con el tamaño: en grande es dramática, en pequeño es amable. Personalidad fuerte y muy amigable para pyme.
- **Ojo:** Sin itálica nativa en el titular. Funciona mejor en peso alto y tamaño grande.
- **Google Fonts:** `family=Bricolage+Grotesque:wght@400;700;800&family=Onest:wght@400;600&family=Martian+Mono:wght@400;600`

### T06 · Caslon institucional

- **Principal:** Libre Caslon Text · regular 400, negrilla 700, titular 400, tracking -0.01em, escala relativa 0.92
- **Secundario:** Libre Franklin
- **Apoyo:** DM Mono
- **Registro:** 15 (Enterprise)
- **Concepto:** Caslon es la letra de los documentos públicos del siglo XVIII: autoridad, contrato, permanencia. Conecta con el lado jurídico de la sociedad.
- **Ojo:** Puede leerse anticuada si se usa en todo; el titular en Caslon y la interfaz en Franklin la mantienen contemporánea.
- **Google Fonts:** `family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500;1,400`

### T07 · Geométrica ancha

- **Principal:** Unbounded · regular 400, negrilla 800, titular 700, tracking -0.02em, escala relativa 0.8 · sin itálica nativa
- **Secundario:** Manrope
- **Apoyo:** Azeret Mono
- **Registro:** 85 (Pyme)
- **Concepto:** Unbounded es ancha y redonda: amistosa, legible de lejos, muy visible en redes y en pantallas de punto de venta.
- **Ojo:** Sin itálica nativa; ocupa mucho ancho. Para titulares cortos, nunca para párrafos.
- **Google Fonts:** `family=Unbounded:wght@400;700;800&family=Manrope:wght@400;600;700&family=Azeret+Mono:ital,wght@0,400;0,600;1,400`

### T08 · Diario de referencia

- **Principal:** Newsreader · regular 400, negrilla 700, titular 400, tracking -0.02em, escala relativa 1.08
- **Secundario:** Schibsted Grotesk
- **Apoyo:** Spline Sans Mono
- **Registro:** 30 (Enterprise)
- **Concepto:** Newsreader está diseñada para lectura periodística en pantalla; Schibsted nació para un grupo de medios. Transmite credibilidad informativa.
- **Ojo:** Excelente para propuestas, informes y casos de éxito; menos llamativa en piezas de redes.
- **Google Fonts:** `family=Newsreader:ital,wght@0,400;0,700;1,400&family=Schibsted+Grotesk:ital,wght@0,400;0,700;1,400&family=Spline+Sans+Mono:ital,wght@0,400;0,600;1,400`

### T09 · Estudio de arte

- **Principal:** Syne · regular 400, negrilla 800, titular 800, tracking -0.02em, escala relativa 0.95 · sin itálica nativa
- **Secundario:** Familjen Grotesk
- **Apoyo:** Fragment Mono
- **Registro:** 75 (Pyme)
- **Concepto:** Syne se ensancha de forma extrema en sus pesos altos: suena a estudio creativo, a galería. Distinta a todo el software colombiano.
- **Ojo:** Sin itálica nativa. Riesgo de leerse como agencia de diseño y no como empresa de ingeniería.
- **Google Fonts:** `family=Syne:wght@400;700;800&family=Familjen+Grotesk:ital,wght@0,400;0,700;1,400&family=Fragment+Mono:ital@0;1`

### T10 · Tablero industrial

- **Principal:** Barlow Condensed · regular 500, negrilla 800, titular 800, tracking 0em, escala relativa 1.15 · se usa en MAYÚSCULAS
- **Secundario:** Barlow
- **Apoyo:** Red Hat Mono
- **Registro:** 35 (Enterprise)
- **Concepto:** Barlow se inspira en la señalización vial: condensada, eficiente, cabe mucho en poco espacio. Lee como un tablero de control.
- **Ojo:** Muy buena para dashboards y datos densos; la versión condensada en mayúsculas es su firma.
- **Google Fonts:** `family=Barlow+Condensed:ital,wght@0,500;0,700;0,800;1,500&family=Barlow:ital,wght@0,400;0,600;1,400&family=Red+Hat+Mono:ital,wght@0,400;0,600;1,400`

### T11 · Alto contraste

- **Principal:** Bodoni Moda · regular 400, negrilla 700, titular 400, tracking -0.01em, escala relativa 1.05
- **Secundario:** Albert Sans
- **Apoyo:** Courier Prime
- **Registro:** 25 (Enterprise)
- **Concepto:** Bodoni de moda y lujo, una sans limpia y una máquina de escribir para los datos. La opción más sofisticada y teatral.
- **Ojo:** Bodoni sufre en tamaños pequeños y en pantallas de baja resolución: solo para titulares de 32 px en adelante.
- **Google Fonts:** `family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Albert+Sans:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400`

### T12 · Serif amable

- **Principal:** Young Serif · regular 400, negrilla 400, titular 400, tracking -0.015em, escala relativa 0.95 · sin itálica nativa
- **Secundario:** Figtree
- **Apoyo:** Overpass Mono
- **Registro:** 60 (Equilibrio)
- **Concepto:** Young Serif es robusta y redonda, de rótulo de tienda bien hecho; Figtree es geométrica y amistosa. Cercana sin perder seriedad.
- **Ojo:** Young Serif tiene un solo peso: no admite negrilla real ni itálica en el titular.
- **Google Fonts:** `family=Young+Serif&family=Figtree:ital,wght@0,400;0,600;1,400&family=Overpass+Mono:wght@400;600`

### T13 · Ingeniero con lápiz

- **Principal:** Geist + Caveat · regular 400, negrilla 700, titular 700, tracking -0.035em, escala relativa 1 · sin itálica nativa
- **Secundario:** Geist
- **Apoyo:** Geist Mono · acento manuscrito: Caveat (solo anotaciones, nunca párrafos)
- **Registro:** 50 (Equilibrio)
- **Concepto:** Geist es seria y técnica para todo el sistema; Caveat aparece solo como anotación a mano, como el lápiz del ingeniero sobre el plano.
- **Ojo:** La manuscrita es un acento, nunca un párrafo. Pareja natural de la textura Trazo a lápiz.
- **Google Fonts:** `family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Caveat:wght@400;700`

### Reglas tipográficas para todo el sistema

- Escala sugerida (px): 11 · 13 · 15 · 17 · 22 · 28 · 36 · 48 · 64 · 88. Cuerpo base 15–17 px, interlineado 1.5–1.6, línea de lectura ≤ 68 caracteres.
- Titulares con `text-wrap: balance`. Cifras en columnas con `font-variant-numeric: tabular-nums`.
- Etiquetas: monoespaciada, MAYÚSCULAS, 11 px, tracking +0.12em, color de texto secundario.
- Cargar solo los pesos que se usan; `display=swap`; preconectar `fonts.googleapis.com` y `fonts.gstatic.com`. En producción, autohospedar con `@fontsource` o equivalente.
- Si una fuente no tiene un peso o itálica real, el laboratorio debe decirlo ("itálica sintética", "un solo peso") en lugar de esconderlo.

---

## 2. Sistemas de color

Cada paleta tiene **seis roles** y una versión **clara** y otra **oscura**. Roles: `bg` (fondo), `surface` (superficie de tarjetas), `ink` (texto principal), `muted` (texto secundario), `primary` (acción principal), `accent` (acento, insignias, luz).

**Reglas que cumplen todas** (medidas con WCAG 2.x):

- `ink` sobre `bg` ≥ 13:1 y `muted` sobre `bg` ≥ 5.4:1 en ambos modos.
- El texto sobre `primary` y sobre `accent` **no es fijo**: se calcula eligiendo entre `#FFFFFF`, `ink` y `bg` el que más contraste dé (ver 5.3). Así funcionan acentos claros como el lima o el maíz.
- Modo oscuro: nunca negro puro ni blanco puro; acentos más claros y menos saturados; la elevación se expresa con superficies más claras, no con sombras.
- Algunos acentos no sirven como texto sobre fondo claro (lima, maíz, lavanda, pistacho, mandarina). Son de **relleno**; el laboratorio debe marcarlos.

### Tabla resumen

| Código | Nombre | Reg. | Claro: primario / acento | Oscuro: primario / acento |
|---|---|---|---|---|
| C01 | Tinta & Cobre | 20 | `#1B2A41` / `#A65628` | `#8FA7C9` / `#E0935C` |
| C02 | Café de origen | 70 | `#3B2416` / `#B3261E` | `#D9B48F` / `#F07A6E` |
| C03 | Páramo | 40 | `#2F4A3E` / `#A57A12` | `#9CC2AE` / `#E3B95A` |
| C04 | Esmeralda | 15 | `#0B5D45` / `#9A7A25` | `#4FC59A` / `#D6B35C` |
| C05 | Caribe eléctrico | 85 | `#FF5A3C` / `#007479` | `#FF7A5E` / `#3FD1C8` |
| C06 | Grafito & Señal | 35 | `#2B2D31` / `#E25F00` | `#D6D7DA` / `#FF8A33` |
| C07 | Índigo & Lima | 60 | `#3A2E9E` / `#B8E62E` | `#A99CFF` / `#C8F25A` |
| C08 | Arcilla | 65 | `#A4472A` / `#4A5A57` | `#E58A68` / `#9DB3AE` |
| C09 | Prusia & Lápiz rojo | 30 | `#12355B` / `#C8322B` | `#8DB5E8` / `#FF7468` |
| C10 | Guayaba | 90 | `#1F4D3A` / `#E8476F` | `#7FC8A3` / `#FF8AA5` |
| C11 | Tinta & Maíz | 45 | `#0B0B0C` / `#F2C230` | `#F4F4F0` / `#F7CE4A` |
| C12 | Orquídea | 55 | `#5B1E52` / `#C2378F` | `#E39BD0` / `#F06BB8` |
| C13 | Micelio | 60 | `#3E3328` / `#1F7A70` | `#CDBBA4` / `#5FD1C1` |
| C14 | Petróleo & Ámbar | 30 | `#0E4E5A` / `#A35B0B` | `#6FC2CF` / `#F0A640` |
| C15 | Borgoña & Acero | 20 | `#6B1E2A` / `#3E6B8A` | `#E08A96` / `#8CB6D4` |
| C16 | Cobalto & Arena | 55 | `#1F3FBF` / `#B5822A` | `#8CA2FF` / `#E3B861` |
| C17 | Oliva & Mandarina | 75 | `#4A5A23` / `#E36B1F` | `#B3C77A` / `#FF9550` |
| C18 | Pizarra & Lavanda | 50 | `#3B3F5C` / `#8C7BDB` | `#B9BCE0` / `#B4A6FF` |
| C19 | Cacao & Pistacho | 70 | `#4A2C21` / `#8DB255` | `#D9B7A0` / `#A9CF6E` |
| C20 | Neón biológico | 65 | `#0C3B35` / `#007A6C` | `#2DE2C4` / `#B488FF` |
| C21 | Raíz & Óxido | 45 | `#7A2E1C` / `#4E6A2E` | `#E8896E` / `#A3C27A` |
| C22 | Cromo & Cian | 35 | `#2A2F38` / `#0076A3` | `#C9D1DC` / `#3CC8F0` |

### Detalle de cada paleta

#### C01 · Tinta & Cobre

Un azul tan oscuro que se lee como tinta de contrato, no como banco, y un acento cobre: el metal que conduce. Seriedad de consultora con un guiño de ingeniería.

_Riesgo:_ Cerca del territorio de las consultoras grandes. El cobre debe ser escaso o empieza a leerse como lujo. · _Registro:_ 20 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F6F3EE` | `#0E1117` |
| Superficie (`surface`) | `#FFFFFF` | `#171B23` |
| Tinta (`ink`) | `#12161F` | `#ECE7DF` |
| Texto 2º (`muted`) | `#5A6170` | `#9AA1AE` |
| Primario (`primary`) | `#1B2A41` | `#8FA7C9` |
| Acento (`accent`) | `#A65628` | `#E0935C` |

#### C02 · Café de origen

Espresso, crema y el rojo de la cereza del café. Calidez de origen colombiano sin caer en el sombrero; el rojo cereza es el color de la acción.

_Riesgo:_ El café es un territorio muy usado por marcas colombianas y puede leerse como gastronomía. · _Registro:_ 70 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F5EFE6` | `#15100C` |
| Superficie (`surface`) | `#FFFDF9` | `#1F1813` |
| Tinta (`ink`) | `#241A14` | `#F1E7DA` |
| Texto 2º (`muted`) | `#6B5A4D` | `#B3A08E` |
| Primario (`primary`) | `#3B2416` | `#D9B48F` |
| Acento (`accent`) | `#B3261E` | `#F07A6E` |

#### C03 · Páramo

Musgo de frailejón, neblina y ocre. Sale del mar azul con un verde serio y poco saturado que transmite calma y permanencia.

_Riesgo:_ Los verdes apagados pueden confundirse con sostenibilidad u ONG si la tipografía no es técnica. · _Registro:_ 40 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F1F2EC` | `#101614` |
| Superficie (`surface`) | `#FFFFFF` | `#18201D` |
| Tinta (`ink`) | `#1A2420` | `#E6EBE4` |
| Texto 2º (`muted`) | `#56635C` | `#9FAEA5` |
| Primario (`primary`) | `#2F4A3E` | `#9CC2AE` |
| Acento (`accent`) | `#A57A12` | `#E3B95A` |

#### C04 · Esmeralda

Verde esmeralda profundo y oro viejo: la piedra colombiana. Valor, rareza y solidez; es la paleta más premium de la serie.

_Riesgo:_ Verde con oro puede leer a banca privada o licores. El oro en pantalla se ve marrón si se satura poco. · _Registro:_ 15 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F4F1E8` | `#07120F` |
| Superficie (`surface`) | `#FFFFFF` | `#0F1D18` |
| Tinta (`ink`) | `#0E1A16` | `#E9E4D3` |
| Texto 2º (`muted`) | `#4F5E57` | `#9DB0A6` |
| Primario (`primary`) | `#0B5D45` | `#4FC59A` |
| Acento (`accent`) | `#9A7A25` | `#D6B35C` |

#### C05 · Caribe eléctrico

Coral eléctrico y turquesa sobre marfil. Energía, cercanía y recordación; ideal para demos de pyme, redes y eventos.

_Riesgo:_ El coral no soporta texto blanco: el texto sobre coral va en tinta. Pierde credibilidad frente a un comprador de ERP. · _Registro:_ 85 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#FBF8F3` | `#0D1016` |
| Superficie (`surface`) | `#FFFFFF` | `#161A22` |
| Tinta (`ink`) | `#10131A` | `#F2EFEA` |
| Texto 2º (`muted`) | `#5B6070` | `#9CA3B0` |
| Primario (`primary`) | `#FF5A3C` | `#FF7A5E` |
| Acento (`accent`) | `#007479` | `#3FD1C8` |

#### C06 · Grafito & Señal

Grises de grafito y el naranja de la señalización industrial. Lenguaje de taller y herramienta: una marca que trabaja.

_Riesgo:_ Gris con naranja es frecuente en logística, ferretería y herramientas eléctricas. · _Registro:_ 35 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#EEEEEC` | `#121315` |
| Superficie (`surface`) | `#FAFAF9` | `#1C1D20` |
| Tinta (`ink`) | `#18191B` | `#EDEDEB` |
| Texto 2º (`muted`) | `#5C5F66` | `#A0A3A9` |
| Primario (`primary`) | `#2B2D31` | `#D6D7DA` |
| Acento (`accent`) | `#E25F00` | `#FF8A33` |

#### C07 · Índigo & Lima

Índigo profundo con un lima ácido. Tecnológico y contemporáneo. El lima solo funciona como relleno con texto en tinta, nunca como texto sobre claro.

_Riesgo:_ El lima es muy de tendencia y puede envejecer rápido; el índigo-violeta está creciendo en SaaS. · _Registro:_ 60 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F4F3F8` | `#0F0E1C` |
| Superficie (`surface`) | `#FFFFFF` | `#1A1830` |
| Tinta (`ink`) | `#15132B` | `#ECEAF7` |
| Texto 2º (`muted`) | `#5E5B78` | `#A3A0C2` |
| Primario (`primary`) | `#3A2E9E` | `#A99CFF` |
| Acento (`accent`) | `#B8E62E` | `#C8F25A` |

#### C08 · Arcilla

Terracota de Barichara, cal y pizarra. Artesanal y humano: la idea de software hecho a la medida, a mano.

_Riesgo:_ Puede parecer arquitectura o decoración; necesita una tipografía técnica que lo ancle a tecnología. · _Registro:_ 65 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F3EDE4` | `#17110E` |
| Superficie (`surface`) | `#FBF8F3` | `#221915` |
| Tinta (`ink`) | `#2A1E19` | `#F0E6DB` |
| Texto 2º (`muted`) | `#6E5D53` | `#B8A597` |
| Primario (`primary`) | `#A4472A` | `#E58A68` |
| Acento (`accent`) | `#4A5A57` | `#9DB3AE` |

#### C09 · Prusia & Lápiz rojo

El azul de Prusia de los planos técnicos, el papel y el rojo del lápiz de corrección. Es azul, pero un azul con historia; pareja natural de la textura Plano técnico.

_Riesgo:_ Sigue siendo azul: la diferencia la cargan el rojo y la textura. Sin ellos se pierde en el mar azul. · _Registro:_ 30 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F3F1EA` | `#0A1626` |
| Superficie (`surface`) | `#FFFFFF` | `#10213A` |
| Tinta (`ink`) | `#0F1E33` | `#E8EDF4` |
| Texto 2º (`muted`) | `#4F5D70` | `#9DB0C8` |
| Primario (`primary`) | `#12355B` | `#8DB5E8` |
| Acento (`accent`) | `#C8322B` | `#FF7468` |

#### C10 · Guayaba

Rosa guayaba, verde hoja y crema. Inesperado en tecnología, muy memorable, tropical sin caricatura.

_Riesgo:_ Difícil de vender a un gerente de planta para un ERP. Funciona mejor como submarca de la línea pyme. · _Registro:_ 90 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#FFF6F1` | `#160D0F` |
| Superficie (`surface`) | `#FFFFFF` | `#22151A` |
| Tinta (`ink`) | `#2A1418` | `#F8E9E7` |
| Texto 2º (`muted`) | `#74555B` | `#C2A2A6` |
| Primario (`primary`) | `#1F4D3A` | `#7FC8A3` |
| Acento (`accent`) | `#E8476F` | `#FF8AA5` |

#### C11 · Tinta & Maíz

Blanco y negro casi absolutos con un solo amarillo maíz que actúa como resaltador. El sistema más disciplinado: todo el carácter lo carga la tipografía.

_Riesgo:_ Amarillo con negro es el código de precaución; el amarillo tiene que ser escaso y nunca de fondo completo. · _Registro:_ 45 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#FAFAF7` | `#0E0E10` |
| Superficie (`surface`) | `#FFFFFF` | `#18181B` |
| Tinta (`ink`) | `#0B0B0C` | `#F4F4F0` |
| Texto 2º (`muted`) | `#5A5A5E` | `#A1A1A6` |
| Primario (`primary`) | `#0B0B0C` | `#F4F4F0` |
| Acento (`accent`) | `#F2C230` | `#F7CE4A` |

#### C12 · Orquídea

Ciruela profunda y el magenta de la Cattleya trianae, la flor nacional. Sofisticado y poco común en software empresarial.

_Riesgo:_ El magenta se asocia a telecomunicaciones y belleza; la ciruela debe dominar para sostener la seriedad. · _Registro:_ 55 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F8F4F6` | `#140C13` |
| Superficie (`surface`) | `#FFFFFF` | `#20141E` |
| Tinta (`ink`) | `#221420` | `#F3E9F0` |
| Texto 2º (`muted`) | `#6A5666` | `#BBA3B5` |
| Primario (`primary`) | `#5B1E52` | `#E39BD0` |
| Acento (`accent`) | `#C2378F` | `#F06BB8` |

#### C13 · Micelio (nueva)

Pardo de hongo, crema y un turquesa bioluminiscente: la red invisible que conecta un bosque. Metáfora directa de software que conecta los procesos de una empresa.

_Riesgo:_ El turquesa sobre pardo puede leerse como marca de bienestar o cosmética natural. · _Registro:_ 60 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F4F0E8` | `#12100D` |
| Superficie (`surface`) | `#FFFFFF` | `#1C1915` |
| Tinta (`ink`) | `#1E1A16` | `#EFE9DF` |
| Texto 2º (`muted`) | `#635A50` | `#ACA196` |
| Primario (`primary`) | `#3E3328` | `#CDBBA4` |
| Acento (`accent`) | `#1F7A70` | `#5FD1C1` |

#### C14 · Petróleo & Ámbar (nueva)

Azul petróleo profundo y ámbar de miel: técnico como un panel de control, cálido como una luz de taller. Una pareja complementaria con mucha legibilidad.

_Riesgo:_ El petróleo es frecuente en salud y aseguradoras; el ámbar necesita presencia para diferenciar. · _Registro:_ 30 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#EEF2F2` | `#081316` |
| Superficie (`surface`) | `#FFFFFF` | `#102125` |
| Tinta (`ink`) | `#0D1C20` | `#E3EEEF` |
| Texto 2º (`muted`) | `#4F6166` | `#9AB0B4` |
| Primario (`primary`) | `#0E4E5A` | `#6FC2CF` |
| Acento (`accent`) | `#A35B0B` | `#F0A640` |

#### C15 · Borgoña & Acero (nueva)

Vino tinto y azul acero sobre hueso: tradición, criterio y peso institucional, con un toque frío que lo ancla a la tecnología.

_Riesgo:_ El borgoña puede leerse como bodega de vinos, firma de abogados o universidad privada. · _Registro:_ 20 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F5F1EB` | `#140D0E` |
| Superficie (`surface`) | `#FFFFFF` | `#1F1517` |
| Tinta (`ink`) | `#1F1416` | `#F1E8E6` |
| Texto 2º (`muted`) | `#665A5C` | `#B5A6A8` |
| Primario (`primary`) | `#6B1E2A` | `#E08A96` |
| Acento (`accent`) | `#3E6B8A` | `#8CB6D4` |

#### C16 · Cobalto & Arena (nueva)

Un cobalto vivo sobre arena: azul, pero con energía de pigmento puro, no de banco. La arena lo calienta y lo vuelve cercano.

_Riesgo:_ Sigue en la familia azul; necesita una tipografía con carácter para no parecer otra fintech. · _Registro:_ 55 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F2EEE6` | `#0C0F1C` |
| Superficie (`surface`) | `#FFFFFF` | `#151A2C` |
| Tinta (`ink`) | `#121628` | `#ECEDF5` |
| Texto 2º (`muted`) | `#585D70` | `#A0A5BD` |
| Primario (`primary`) | `#1F3FBF` | `#8CA2FF` |
| Acento (`accent`) | `#B5822A` | `#E3B861` |

#### C17 · Oliva & Mandarina (nueva)

Verde oliva y mandarina: mercado, cosecha, tienda de barrio. Muy cálida y optimista, ideal para la línea de pymes.

_Riesgo:_ La mandarina no alcanza contraste con texto blanco: el texto sobre ella va en tinta. · _Registro:_ 75 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F5F2E8` | `#11130B` |
| Superficie (`surface`) | `#FFFFFF` | `#1B1E13` |
| Tinta (`ink`) | `#1C1F12` | `#EEF0E2` |
| Texto 2º (`muted`) | `#5E6250` | `#A9AE96` |
| Primario (`primary`) | `#4A5A23` | `#B3C77A` |
| Acento (`accent`) | `#E36B1F` | `#FF9550` |

#### C18 · Pizarra & Lavanda (nueva)

Gris pizarra con un lavanda suave: calma, orden y algo de imaginación. Poco común en el software colombiano.

_Riesgo:_ El lavanda no se lee bien como texto sobre claro: úsalo como relleno. · _Registro:_ 50 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F3F3F6` | `#101118` |
| Superficie (`surface`) | `#FFFFFF` | `#1A1B26` |
| Tinta (`ink`) | `#181A26` | `#EBEBF3` |
| Texto 2º (`muted`) | `#5C5F72` | `#A4A6BA` |
| Primario (`primary`) | `#3B3F5C` | `#B9BCE0` |
| Acento (`accent`) | `#8C7BDB` | `#B4A6FF` |

#### C19 · Cacao & Pistacho (nueva)

Chocolate de cacao santandereano y verde pistacho: cálido, artesanal y fresco a la vez.

_Riesgo:_ Puede leerse como marca de alimentos; necesita una tipografía técnica que la ancle. · _Registro:_ 70 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F6F1EA` | `#150D09` |
| Superficie (`surface`) | `#FFFFFF` | `#20160F` |
| Tinta (`ink`) | `#24160F` | `#F2E8DE` |
| Texto 2º (`muted`) | `#6B5B50` | `#B7A598` |
| Primario (`primary`) | `#4A2C21` | `#D9B7A0` |
| Acento (`accent`) | `#8DB255` | `#A9CF6E` |

#### C20 · Neón biológico (nueva)

Un verde abismal casi negro con cian y violeta luminosos, como organismos que brillan en la oscuridad. Pensada sobre todo para el modo oscuro y las texturas futuristas.

_Riesgo:_ En modo claro pierde la mitad de su efecto; el neón cansa si aparece en todo. · _Registro:_ 65 (Pyme)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F1F5F3` | `#060B0A` |
| Superficie (`surface`) | `#FFFFFF` | `#0E1716` |
| Tinta (`ink`) | `#08201C` | `#E2F2EE` |
| Texto 2º (`muted`) | `#4D625D` | `#93ABA5` |
| Primario (`primary`) | `#0C3B35` | `#2DE2C4` |
| Acento (`accent`) | `#007A6C` | `#B488FF` |

#### C21 · Raíz & Óxido (nueva)

Óxido de raíz, pergamino y verde musgo: tierra trabajada, algo que crece despacio pero firme. Pareja natural de las texturas de raíces y herbario.

_Riesgo:_ Puede parecer marca agrícola o de café especial. · _Registro:_ 45 (Equilibrio)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#F2EADB` | `#140E09` |
| Superficie (`surface`) | `#FBF6EC` | `#1F1710` |
| Tinta (`ink`) | `#22170F` | `#F0E6D6` |
| Texto 2º (`muted`) | `#695A4B` | `#B5A48F` |
| Primario (`primary`) | `#7A2E1C` | `#E8896E` |
| Acento (`accent`) | `#4E6A2E` | `#A3C27A` |

#### C22 · Cromo & Cian (nueva)

Grises metálicos fríos y un cian eléctrico: precisión de máquina, superficies de aluminio. La más futurista de las paletas sobrias.

_Riesgo:_ Fría e impersonal; la cercanía tendría que venir del lenguaje y de la textura. · _Registro:_ 35 (Enterprise)

| Rol | Claro | Oscuro |
|---|---|---|
| Fondo (`bg`) | `#EEF0F3` | `#0C0F13` |
| Superficie (`surface`) | `#FAFBFC` | `#151A20` |
| Tinta (`ink`) | `#14181E` | `#E8EBEF` |
| Texto 2º (`muted`) | `#576070` | `#9CA5B2` |
| Primario (`primary`) | `#2A2F38` | `#C9D1DC` |
| Acento (`accent`) | `#0076A3` | `#3CC8F0` |

### Datos listos para importar (`palettes.json`)

```json
[
 {
  "id": "C01",
  "name": "Tinta & Cobre",
  "reg": 20,
  "light": {
   "bg": "#F6F3EE",
   "surface": "#FFFFFF",
   "ink": "#12161F",
   "muted": "#5A6170",
   "primary": "#1B2A41",
   "accent": "#A65628"
  },
  "dark": {
   "bg": "#0E1117",
   "surface": "#171B23",
   "ink": "#ECE7DF",
   "muted": "#9AA1AE",
   "primary": "#8FA7C9",
   "accent": "#E0935C"
  }
 },
 {
  "id": "C02",
  "name": "Café de origen",
  "reg": 70,
  "light": {
   "bg": "#F5EFE6",
   "surface": "#FFFDF9",
   "ink": "#241A14",
   "muted": "#6B5A4D",
   "primary": "#3B2416",
   "accent": "#B3261E"
  },
  "dark": {
   "bg": "#15100C",
   "surface": "#1F1813",
   "ink": "#F1E7DA",
   "muted": "#B3A08E",
   "primary": "#D9B48F",
   "accent": "#F07A6E"
  }
 },
 {
  "id": "C03",
  "name": "Páramo",
  "reg": 40,
  "light": {
   "bg": "#F1F2EC",
   "surface": "#FFFFFF",
   "ink": "#1A2420",
   "muted": "#56635C",
   "primary": "#2F4A3E",
   "accent": "#A57A12"
  },
  "dark": {
   "bg": "#101614",
   "surface": "#18201D",
   "ink": "#E6EBE4",
   "muted": "#9FAEA5",
   "primary": "#9CC2AE",
   "accent": "#E3B95A"
  }
 },
 {
  "id": "C04",
  "name": "Esmeralda",
  "reg": 15,
  "light": {
   "bg": "#F4F1E8",
   "surface": "#FFFFFF",
   "ink": "#0E1A16",
   "muted": "#4F5E57",
   "primary": "#0B5D45",
   "accent": "#9A7A25"
  },
  "dark": {
   "bg": "#07120F",
   "surface": "#0F1D18",
   "ink": "#E9E4D3",
   "muted": "#9DB0A6",
   "primary": "#4FC59A",
   "accent": "#D6B35C"
  }
 },
 {
  "id": "C05",
  "name": "Caribe eléctrico",
  "reg": 85,
  "light": {
   "bg": "#FBF8F3",
   "surface": "#FFFFFF",
   "ink": "#10131A",
   "muted": "#5B6070",
   "primary": "#FF5A3C",
   "accent": "#007479"
  },
  "dark": {
   "bg": "#0D1016",
   "surface": "#161A22",
   "ink": "#F2EFEA",
   "muted": "#9CA3B0",
   "primary": "#FF7A5E",
   "accent": "#3FD1C8"
  }
 },
 {
  "id": "C06",
  "name": "Grafito & Señal",
  "reg": 35,
  "light": {
   "bg": "#EEEEEC",
   "surface": "#FAFAF9",
   "ink": "#18191B",
   "muted": "#5C5F66",
   "primary": "#2B2D31",
   "accent": "#E25F00"
  },
  "dark": {
   "bg": "#121315",
   "surface": "#1C1D20",
   "ink": "#EDEDEB",
   "muted": "#A0A3A9",
   "primary": "#D6D7DA",
   "accent": "#FF8A33"
  }
 },
 {
  "id": "C07",
  "name": "Índigo & Lima",
  "reg": 60,
  "light": {
   "bg": "#F4F3F8",
   "surface": "#FFFFFF",
   "ink": "#15132B",
   "muted": "#5E5B78",
   "primary": "#3A2E9E",
   "accent": "#B8E62E"
  },
  "dark": {
   "bg": "#0F0E1C",
   "surface": "#1A1830",
   "ink": "#ECEAF7",
   "muted": "#A3A0C2",
   "primary": "#A99CFF",
   "accent": "#C8F25A"
  }
 },
 {
  "id": "C08",
  "name": "Arcilla",
  "reg": 65,
  "light": {
   "bg": "#F3EDE4",
   "surface": "#FBF8F3",
   "ink": "#2A1E19",
   "muted": "#6E5D53",
   "primary": "#A4472A",
   "accent": "#4A5A57"
  },
  "dark": {
   "bg": "#17110E",
   "surface": "#221915",
   "ink": "#F0E6DB",
   "muted": "#B8A597",
   "primary": "#E58A68",
   "accent": "#9DB3AE"
  }
 },
 {
  "id": "C09",
  "name": "Prusia & Lápiz rojo",
  "reg": 30,
  "light": {
   "bg": "#F3F1EA",
   "surface": "#FFFFFF",
   "ink": "#0F1E33",
   "muted": "#4F5D70",
   "primary": "#12355B",
   "accent": "#C8322B"
  },
  "dark": {
   "bg": "#0A1626",
   "surface": "#10213A",
   "ink": "#E8EDF4",
   "muted": "#9DB0C8",
   "primary": "#8DB5E8",
   "accent": "#FF7468"
  }
 },
 {
  "id": "C10",
  "name": "Guayaba",
  "reg": 90,
  "light": {
   "bg": "#FFF6F1",
   "surface": "#FFFFFF",
   "ink": "#2A1418",
   "muted": "#74555B",
   "primary": "#1F4D3A",
   "accent": "#E8476F"
  },
  "dark": {
   "bg": "#160D0F",
   "surface": "#22151A",
   "ink": "#F8E9E7",
   "muted": "#C2A2A6",
   "primary": "#7FC8A3",
   "accent": "#FF8AA5"
  }
 },
 {
  "id": "C11",
  "name": "Tinta & Maíz",
  "reg": 45,
  "light": {
   "bg": "#FAFAF7",
   "surface": "#FFFFFF",
   "ink": "#0B0B0C",
   "muted": "#5A5A5E",
   "primary": "#0B0B0C",
   "accent": "#F2C230"
  },
  "dark": {
   "bg": "#0E0E10",
   "surface": "#18181B",
   "ink": "#F4F4F0",
   "muted": "#A1A1A6",
   "primary": "#F4F4F0",
   "accent": "#F7CE4A"
  }
 },
 {
  "id": "C12",
  "name": "Orquídea",
  "reg": 55,
  "light": {
   "bg": "#F8F4F6",
   "surface": "#FFFFFF",
   "ink": "#221420",
   "muted": "#6A5666",
   "primary": "#5B1E52",
   "accent": "#C2378F"
  },
  "dark": {
   "bg": "#140C13",
   "surface": "#20141E",
   "ink": "#F3E9F0",
   "muted": "#BBA3B5",
   "primary": "#E39BD0",
   "accent": "#F06BB8"
  }
 },
 {
  "id": "C13",
  "name": "Micelio",
  "reg": 60,
  "light": {
   "bg": "#F4F0E8",
   "surface": "#FFFFFF",
   "ink": "#1E1A16",
   "muted": "#635A50",
   "primary": "#3E3328",
   "accent": "#1F7A70"
  },
  "dark": {
   "bg": "#12100D",
   "surface": "#1C1915",
   "ink": "#EFE9DF",
   "muted": "#ACA196",
   "primary": "#CDBBA4",
   "accent": "#5FD1C1"
  }
 },
 {
  "id": "C14",
  "name": "Petróleo & Ámbar",
  "reg": 30,
  "light": {
   "bg": "#EEF2F2",
   "surface": "#FFFFFF",
   "ink": "#0D1C20",
   "muted": "#4F6166",
   "primary": "#0E4E5A",
   "accent": "#A35B0B"
  },
  "dark": {
   "bg": "#081316",
   "surface": "#102125",
   "ink": "#E3EEEF",
   "muted": "#9AB0B4",
   "primary": "#6FC2CF",
   "accent": "#F0A640"
  }
 },
 {
  "id": "C15",
  "name": "Borgoña & Acero",
  "reg": 20,
  "light": {
   "bg": "#F5F1EB",
   "surface": "#FFFFFF",
   "ink": "#1F1416",
   "muted": "#665A5C",
   "primary": "#6B1E2A",
   "accent": "#3E6B8A"
  },
  "dark": {
   "bg": "#140D0E",
   "surface": "#1F1517",
   "ink": "#F1E8E6",
   "muted": "#B5A6A8",
   "primary": "#E08A96",
   "accent": "#8CB6D4"
  }
 },
 {
  "id": "C16",
  "name": "Cobalto & Arena",
  "reg": 55,
  "light": {
   "bg": "#F2EEE6",
   "surface": "#FFFFFF",
   "ink": "#121628",
   "muted": "#585D70",
   "primary": "#1F3FBF",
   "accent": "#B5822A"
  },
  "dark": {
   "bg": "#0C0F1C",
   "surface": "#151A2C",
   "ink": "#ECEDF5",
   "muted": "#A0A5BD",
   "primary": "#8CA2FF",
   "accent": "#E3B861"
  }
 },
 {
  "id": "C17",
  "name": "Oliva & Mandarina",
  "reg": 75,
  "light": {
   "bg": "#F5F2E8",
   "surface": "#FFFFFF",
   "ink": "#1C1F12",
   "muted": "#5E6250",
   "primary": "#4A5A23",
   "accent": "#E36B1F"
  },
  "dark": {
   "bg": "#11130B",
   "surface": "#1B1E13",
   "ink": "#EEF0E2",
   "muted": "#A9AE96",
   "primary": "#B3C77A",
   "accent": "#FF9550"
  }
 },
 {
  "id": "C18",
  "name": "Pizarra & Lavanda",
  "reg": 50,
  "light": {
   "bg": "#F3F3F6",
   "surface": "#FFFFFF",
   "ink": "#181A26",
   "muted": "#5C5F72",
   "primary": "#3B3F5C",
   "accent": "#8C7BDB"
  },
  "dark": {
   "bg": "#101118",
   "surface": "#1A1B26",
   "ink": "#EBEBF3",
   "muted": "#A4A6BA",
   "primary": "#B9BCE0",
   "accent": "#B4A6FF"
  }
 },
 {
  "id": "C19",
  "name": "Cacao & Pistacho",
  "reg": 70,
  "light": {
   "bg": "#F6F1EA",
   "surface": "#FFFFFF",
   "ink": "#24160F",
   "muted": "#6B5B50",
   "primary": "#4A2C21",
   "accent": "#8DB255"
  },
  "dark": {
   "bg": "#150D09",
   "surface": "#20160F",
   "ink": "#F2E8DE",
   "muted": "#B7A598",
   "primary": "#D9B7A0",
   "accent": "#A9CF6E"
  }
 },
 {
  "id": "C20",
  "name": "Neón biológico",
  "reg": 65,
  "light": {
   "bg": "#F1F5F3",
   "surface": "#FFFFFF",
   "ink": "#08201C",
   "muted": "#4D625D",
   "primary": "#0C3B35",
   "accent": "#007A6C"
  },
  "dark": {
   "bg": "#060B0A",
   "surface": "#0E1716",
   "ink": "#E2F2EE",
   "muted": "#93ABA5",
   "primary": "#2DE2C4",
   "accent": "#B488FF"
  }
 },
 {
  "id": "C21",
  "name": "Raíz & Óxido",
  "reg": 45,
  "light": {
   "bg": "#F2EADB",
   "surface": "#FBF6EC",
   "ink": "#22170F",
   "muted": "#695A4B",
   "primary": "#7A2E1C",
   "accent": "#4E6A2E"
  },
  "dark": {
   "bg": "#140E09",
   "surface": "#1F1710",
   "ink": "#F0E6D6",
   "muted": "#B5A48F",
   "primary": "#E8896E",
   "accent": "#A3C27A"
  }
 },
 {
  "id": "C22",
  "name": "Cromo & Cian",
  "reg": 35,
  "light": {
   "bg": "#EEF0F3",
   "surface": "#FAFBFC",
   "ink": "#14181E",
   "muted": "#576070",
   "primary": "#2A2F38",
   "accent": "#0076A3"
  },
  "dark": {
   "bg": "#0C0F13",
   "surface": "#151A20",
   "ink": "#E8EBEF",
   "muted": "#9CA5B2",
   "primary": "#C9D1DC",
   "accent": "#3CC8F0"
  }
 }
]
```

---

## 3. Fondos atmosféricos (las 14 atmósferas + 4 propuestas)

Son los fondos de luz difusa del laboratorio de cristal. **Todos se construyen solo con los roles de la paleta activa**, así que cambian de color cuando cambia la paleta (este es un requisito, ver 5.3).

**Notación de las recetas.** `luz(x, y, d, color, α)` es un círculo de diámetro `d` (en % del ancho del contenedor), centrado en `(x %, y %)`, pintado con `radial-gradient(circle, color 0, transparent 68%)` y opacidad `α`. `mix(a, b, t)` mezcla los colores a y b, con `t` como la proporción de a.

**Estático vs. dinámico.** Cada atmósfera debe existir en dos versiones:

- **Estática:** CSS/SVG puro, sin JavaScript en tiempo de ejecución; sirve para documentos, exportar PNG y `prefers-reduced-motion`.
- **Dinámica:** movimiento lento y continuo (16–60 s por ciclo, nunca parpadeo), que se pausa fuera de pantalla y respeta `prefers-reduced-motion`.

`peso` es la fracción del color sobre el fondo, y se usa para estimar la legibilidad del vidrio encima.

### A01 · Aurora (X01)

La del ejemplo: luz difusa que entra por un lado y deja el otro en sombra. Profunda, calmada, con dirección.

- **Estático:** `bg` · luz(78, 28, 78, accent, .9) · luz(58, 78, 62, mix(accent, primary, .45), .55) · luz(98, 96, 60, primary, .95) · luz(30, 40, 50, mix(bg, accent, .85), .6). El lado izquierdo queda en sombra a propósito: ahí va el texto.
- **Dinámico:** Las luces derivan despacio (translate ±6 %, scale .95–1.08, 18–27 s, `alternate`, desfasadas). Opcional: WebGL con ruido simplex para la deriva.
- **Peso (legibilidad):** 0.35

### A02 · Malla de gradiente (Mesh)

Cuatro colores que se funden de esquina a esquina, sin bordes. Es el fondo típico de producto digital, versátil y limpio.

- **Estático:** base mix(primary, accent, .5) · luz(0, 0, 130, primary, 1) · luz(100, 0, 120, accent, 1) · luz(0, 100, 120, mix(primary, bg, .5), 1) · luz(100, 100, 130, mix(accent, primary, .4), 1).
- **Dinámico:** Mesh gradient con 4 puntos de control que orbitan (WebGL, estilo Stripe) o luces CSS que derivan.
- **Peso (legibilidad):** 0.7

### A03 · Gradiente con grano (Grainy)

La malla de gradiente con un grano fuerte encima, como impresión o fotografía analógica. Una de las tendencias más vistas en 2026.

- **Estático:** luz(15, 20, 110, primary, 1) · luz(85, 25, 100, accent, .95) · luz(60, 95, 110, mix(accent, primary, .5), .9) + ruido SVG `feTurbulence` (baseFrequency .75, 3 octavas) con `mix-blend-mode: overlay`, α .9.
- **Dinámico:** Deriva de luces + grano vivo (desplazar `background-position` del ruido en saltos de 80–120 ms, `steps()`).
- **Peso (legibilidad):** 0.6

### A04 · Bokeh (Lente)

Puntos de luz desenfocados, como las luces de una ciudad de noche vistas a través de una lente abierta. Íntimo y cálido.

- **Estático:** luz(70, 60, 90, mix(accent, bg, .35), .6) + 16 discos de 6–22 % con borde semiduro (`color 0 52%, transparent 70%`), α .25–.75, colores rotando accent / primary / mix(accent, primary, .5). Semilla fija.
- **Dinámico:** Flotación vertical lenta + "respiración" de enfoque (blur 0→3 px) desfasada por disco.
- **Peso (legibilidad):** 0.3

### A05 · Bioluminiscencia (Noche)

Fondo casi negro con pequeñas luces que flotan y brillan, como hongos y plancton luminosos. Une el cristal con las texturas de micelio.

- **Estático:** `bg` (en oscuro, oscurecer 30–40 % hacia negro) · luz(40, 70, 90, mix(accent, bg, .25), .7) + 34 partículas: núcleo `color 0 8%`, halo `color 45 % α` hasta 14 %, tamaño 1.2–3.6 %; 1 de cada 4 en primary, el resto en accent.
- **Dinámico:** Canvas 2D o WebGL: partículas con deriva por campo de ruido, pulso de brillo senoidal por partícula y, cuando dos se acercan, una línea fina de "sinapsis" (guiño a la textura de micelio). Es la atmósfera insignia.
- **Peso (legibilidad):** 0.2

### A06 · Haz de luz (Volumétrico)

Un rayo de luz que cae en diagonal desde arriba, como en un escenario o un estudio. Dramático y elegante; señala hacia el contenido.

- **Estático:** `conic-gradient(from 145deg at 12% -6%, transparent 0deg, accent·55% 10deg, mix(accent, primary)·35% 22deg, transparent 38deg)` con `filter: blur(28px)` sobre `inset: -20%` · luz(55, 105, 90, primary, .55) · luz(20, 8, 40, accent, .5).
- **Dinámico:** El haz oscila ±4° (20 s) y flotan partículas de polvo dentro del cono.
- **Peso (legibilidad):** 0.25

### A07 · Eclipse (Corona)

Un disco oscuro con un anillo de luz detrás, como la corona solar en un eclipse. Muy reconocible y con un centro natural para el logo.

- **Estático:** Anillo `radial-gradient(circle, transparent 0 36%, accent 40%, mix(accent, primary)·70% 47%, transparent 66%)` con blur 14 px, centrado en (68 %, 50 %), tamaño 58 %; disco `bg` de 30 % con filo de 1 px en accent·40 %; luz(100, 100, 50, primary, .45).
- **Dinámico:** La corona respira (scale 1→1.04) y unas llamaradas cónicas giran muy despacio (90 s/vuelta).
- **Peso (legibilidad):** 0.25

### A08 · Seda líquida (Ondas)

Bandas de color que se curvan y se cruzan, como una tela de seda en movimiento. Fluido, suave y muy de producto premium.

- **Estático:** SVG 400×300 con 3 curvas Bézier de grosor 70 / 50 / 60 en primary / accent / mix, `feGaussianBlur` 16.
- **Dinámico:** Las curvas ondulan (morph de puntos de control con senos) o se reemplazan por un flow field en WebGL.
- **Peso (legibilidad):** 0.5

### A09 · Horizonte (Atardecer)

Un cielo que se calienta hacia el horizonte con un sol bajo y difuso. Optimista, cálido y con sensación de comienzo.

- **Estático:** `linear-gradient(180deg, bg 0%, mix(primary, bg, .35) 62%, mix(accent, primary, .5) 100%)` · sol: luz(72, 80, 46, accent, 1) + núcleo luz(72, 80, 16, mix(accent, #FFF, .6), .9) · línea de horizonte de 1 px en accent·60 % al 80 %.
- **Dinámico:** El sol sube o baja en un ciclo de 60 s y la temperatura del cielo cambia con él.
- **Peso (legibilidad):** 0.45

### A10 · Plasma duotono (Fusión)

Dos colores que se funden y producen un tercero donde se tocan, como luz proyectada. Energético y moderno.

- **Estático:** Dos luces grandes, primary (38, 46, 80) y accent (66, 56, 78), con `mix-blend-mode: screen` en oscuro y `multiply` en claro · luz(85, 10, 40, mix, .6).
- **Dinámico:** Las dos luces orbitan una alrededor de la otra (40 s).
- **Peso (legibilidad):** 0.6

### A11 · Rejilla iluminada (Tech)

Una cuadrícula fina que solo se ve donde cae la luz, el estilo de las marcas de software más recientes. Técnico sin ser frío.

- **Estático:** Cuadrícula de 44 px en ink·14 % enmascarada con `radial-gradient(circle at 65% 40%, #000 0, transparent 60%)` · luz(65, 40, 70, accent, .55) · luz(95, 95, 50, primary, .5).
- **Dinámico:** La máscara y la luz siguen al cursor (spotlight) y deambulan solas cuando no hay puntero.
- **Peso (legibilidad):** 0.25

### A12 · Manchas (Original)

Las manchas de color nítidas del laboratorio original. Útiles para ver cómo cada vidrio deforma formas definidas.

- **Estático:** 4 círculos nítidos (blur 6 px): primary 52 % en (46, −22), accent 40 % en (68, 42), mix(primary, accent) 34 % en (2, 46), mix(accent, bg, .7) 22 % en (30, 4).
- **Dinámico:** Deriva lenta (16–25 s).
- **Peso (legibilidad):** 0.55

### A13 · Tipografía (Original)

Texto grande detrás del vidrio. La mejor prueba para el acanalado y el grabado, que deforman las letras.

- **Estático:** Tres líneas gigantes (17vw, 700, tracking −0.05em): "KippiCore" en primary, "sistemas" en accent, "a la medida" en ink.
- **Dinámico:** Marquesina muy lenta (30 s, alternate).
- **Peso (legibilidad):** 0.55

### A14 · Datos (Original)

Barras y líneas de un tablero detrás del vidrio, como una pantalla de producto real.

- **Estático:** SVG con 16 barras (primary, cada cuarta en accent), una polilínea accent de 4 px y un círculo accent.
- **Dinámico:** El gráfico se actualiza con datos de ejemplo cada pocos segundos (transiciones de 600 ms).
- **Peso (legibilidad):** 0.5

### Propuestas nuevas en el mismo estilo

### A15 · Niebla de páramo
Bandas horizontales de niebla (elipses muy anchas, mix(ink, bg)·10 % con un tinte de accent), en tres planos de profundidad.
- **Estático:** 3 bandas con opacidades .25 / .4 / .6.
- **Dinámico:** parallax lento; cada plano a distinta velocidad.

### A16 · Constelación (micelio de luz)
Nodos luminosos en accent unidos por líneas finas cuando están cerca: la red de micelio convertida en luz.
- **Estático:** grafo fijo, con semilla.
- **Dinámico:** los nodos derivan y las conexiones aparecen y desaparecen con un fundido. Si hay cursor, atrae los nodos cercanos.

### A17 · Cáusticas
La luz que se forma en el fondo de una piscina, teñida de accent sobre bg.
- **Estático:** textura pregenerada.
- **Dinámico:** shader WebGL de cáusticas animadas a 0.2× de velocidad.

### A18 · Ondas de interferencia
Anillos concéntricos desde dos focos (primary y accent) con α baja; donde se cruzan forman un moiré suave.
- **Estático:** SVG.
- **Dinámico:** los anillos se propagan hacia afuera.

---

## 4. Texturas

### 4.1 Vidrios del laboratorio de cristal (G01–G10)

Todos los vidrios usan la misma base: `--glass-bg: color-mix(in srgb, var(--surface) <velo>%, transparent)` y `--blur: <n>px`. El texto va siempre por encima de cualquier pseudoelemento (`.vidrio > * { position: relative; z-index: 2 }`). Los valores recomendados de desenfoque y velo ya están ajustados para que el texto se lea bien sobre las atmósferas.

#### G01 · Esmerilado clásico — Velo parejo y filo de luz

El vidrio esmerilado de siempre: desenfoque parejo, un velo claro y un filo de luz de un píxel. Es la base de las otras nueve.

- **Usar en:** Tarjetas flotantes, menús, modales y overlays de demos.
- **Cuidado:** Por sí solo es muy común: la diferencia tiene que venir del color de fondo y de la tipografía.
- **Valores recomendados:** desenfoque 18 px · velo 55 % · registro 55 (Equilibrio)

```css
.vidrio {
  background: color-mix(in srgb, var(--surface) 55%, transparent);
  backdrop-filter: blur(18px) saturate(1.4);
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.55),
              0 18px 40px rgba(0,0,0,.16);
}
```

#### G02 · Vidrio líquido — Brillo especular, bordes vivos

La lectura de KippiCore del lenguaje que Apple llamó Liquid Glass: menos desenfoque, más saturación, un brillo especular arriba y bordes que atrapan la luz. Se siente como un objeto, no como una capa.

- **Usar en:** Botones principales, barras de navegación, controles flotantes de la app.
- **Cuidado:** Apple recibió críticas fuertes de legibilidad con este estilo y recomienda usarlo con moderación: solo en controles, nunca en párrafos.
- **Valores recomendados:** desenfoque 16 px · velo 45 % · registro 65 (Pyme)

```css
.vidrio {
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255,255,255,.26), transparent 45%),
              color-mix(in srgb, var(--surface) 45%, transparent);
  backdrop-filter: blur(9px) saturate(1.9) brightness(1.05);
  box-shadow: inset 0 1.5px 0 rgba(255,255,255,.75),
              inset 0 -1px 0 rgba(255,255,255,.55),
              inset 0 0 26px rgba(255,255,255,.14),
              0 14px 34px rgba(0,0,0,.2);
}
.vidrio::before { /* brillo especular */
  content: ""; position: absolute; left: -15%; top: -70%;
  width: 75%; height: 130%;
  background: radial-gradient(closest-side, rgba(255,255,255,.32), transparent);
}
```

#### G03 · Vidrio acanalado — Estrías verticales de vitrina

El vidrio estriado de las puertas y vitrinas de los años setenta, hoy muy de arquitectura: el fondo se lee en franjas verticales. Tiene textura física sin perder sobriedad.

- **Usar en:** Fondos de secciones, portadas, separadores, piezas impresas en acrílico.
- **Cuidado:** Las estrías compiten con el texto pequeño: sube el velo o deja el texto en un bloque más opaco.
- **Valores recomendados:** desenfoque 20 px · velo 52 % · registro 45 (Equilibrio)

```css
.vidrio {
  background: repeating-linear-gradient(90deg,
                rgba(255,255,255,.32) 0, rgba(255,255,255,.03) 5px,
                rgba(0,0,0,.09) 11px, rgba(255,255,255,.32) 12px),
              color-mix(in srgb, var(--surface) 52%, transparent);
  backdrop-filter: blur(8px) saturate(1.3);
  border-radius: 18px;
}
```

#### G04 · Esmerilado con grano — Vidrio mate con ruido fino

El esmerilado clásico con un grano fino por encima: deja de verse digital y se siente como vidrio arenado o papel vegetal. Une el cristal con la tendencia táctil de 2026.

- **Usar en:** Web, redes, portadas; es la versión más cálida.
- **Cuidado:** Sobre pantallas de baja calidad el grano puede verse como suciedad: mantenerlo sutil.
- **Valores recomendados:** desenfoque 20 px · velo 56 % · registro 60 (Equilibrio)

```css
.vidrio {
  background: color-mix(in srgb, var(--surface) 56%, transparent);
  backdrop-filter: blur(20px) saturate(1.2);
  border-radius: 18px;
}
.vidrio::before {
  content: ""; position: absolute; inset: 0;
  background: url(ruido.svg) 0 0 / 150px; /* feTurbulence */
  opacity: .55; mix-blend-mode: overlay;
}
```

#### G05 · Vidrio ahumado — Oscuro, sobrio, enterprise

Vidrio tintado oscuro, como el de una sala de juntas o un automóvil: el fondo se intuye y el texto claro manda. Es la variante más seria y la que mejor contraste da.

- **Usar en:** Propuestas enterprise, dashboards, presentaciones, modo oscuro.
- **Cuidado:** En modo claro se vuelve una mancha oscura: úsalo como acento, no como superficie principal.
- **Valores recomendados:** desenfoque 22 px · velo 55 % · registro 15 (Enterprise)

```css
.vidrio {
  color: #F3F4F6;
  background: rgba(11,13,18,0.80);
  backdrop-filter: blur(22px) saturate(.85);
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.12),
              0 22px 44px rgba(0,0,0,.35);
}
```

#### G06 · Escarcha — Bordes empañados, centro claro

Vidrio empañado por el frío: más desenfoque, más brillo y los bordes blanquecinos, como una ventana en el páramo. Muy limpio y luminoso.

- **Usar en:** Modales, onboarding, pantallas de bienvenida, modo claro.
- **Cuidado:** Pierde fuerza en modo oscuro; el halo blanco puede verse lechoso si el velo es alto.
- **Valores recomendados:** desenfoque 16 px · velo 48 % · registro 55 (Equilibrio)

```css
.vidrio {
  background: radial-gradient(ellipse at 50% 45%, transparent 35%,
                rgba(255,255,255,.55) 120%),
              color-mix(in srgb, var(--surface) 48%, transparent);
  backdrop-filter: blur(24px) brightness(1.12);
  box-shadow: inset 0 0 34px rgba(255,255,255,.55),
              inset 0 0 0 1px rgba(255,255,255,.75);
  border-radius: 18px;
}
```

#### G07 · Vidrio dicroico — Filo iridiscente que cambia de color

El vidrio dicroico refleja colores distintos según el ángulo. Aquí aparece como un filo iridiscente y un velo tornasol muy suave: futurista y premium sin perder la base sobria.

- **Usar en:** Lanzamientos, tarjetas destacadas, planes premium, eventos.
- **Cuidado:** Si se usa en todas las tarjetas pierde lo especial: reservarlo para lo que debe destacar.
- **Valores recomendados:** desenfoque 18 px · velo 52 % · registro 70 (Pyme)

```css
.vidrio {
  background: linear-gradient(120deg, rgba(255,122,217,.14),
                rgba(122,215,255,.14) 50%, rgba(141,255,184,.14)),
              color-mix(in srgb, var(--surface) 52%, transparent);
  backdrop-filter: blur(18px) saturate(1.5);
  border-radius: 18px;
}
.vidrio::after { /* filo iridiscente */
  content: ""; position: absolute; inset: 0; padding: 1.6px;
  border-radius: inherit;
  background: conic-gradient(from 210deg, #FF7AD9, #7AD7FF,
              #8DFFB8, #FFE57A, #C08CFF, #FF7AD9);
  mask: linear-gradient(#000 0 0) content-box exclude,
        linear-gradient(#000 0 0);
}
```

#### G08 · Desenfoque progresivo — Se aclara de arriba hacia abajo

El desenfoque es fuerte arriba y se desvanece hacia abajo, como en los encabezados de las apps modernas. El vidrio deja de ser una caja y se funde con el contenido.

- **Usar en:** Barras de navegación fijas, encabezados de tablas largas, pies de imagen.
- **Cuidado:** La parte baja queda casi transparente: el texto importante va arriba.
- **Valores recomendados:** desenfoque 24 px · velo 52 % · registro 50 (Equilibrio)

```css
.vidrio {
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 52%, transparent), transparent);
  border-radius: 18px;
}
.vidrio::before {
  content: ""; position: absolute; inset: 0;
  backdrop-filter: blur(24px) saturate(1.4);
  mask-image: linear-gradient(180deg, #000 35%, rgba(0,0,0,.25));
}
```

#### G09 · Grabado al ácido — Rayas transparentes sobre esmerilado

El vidrio de las puertas de oficina con un patrón grabado: el esmerilado tiene líneas finas que dejan ver el fondo nítido. Se puede grabar cualquier patrón, incluso el isotipo.

- **Usar en:** Señalética, oficinas, portadas institucionales, papelería en acetato.
- **Cuidado:** Las líneas nítidas pueden pasar por detrás del texto: mantenerlas finas y espaciadas.
- **Valores recomendados:** desenfoque 20 px · velo 56 % · registro 35 (Enterprise)

```css
.vidrio { border-radius: 18px; }
.vidrio::before {
  content: ""; position: absolute; inset: 0;
  background: color-mix(in srgb, var(--surface) 56%, transparent);
  backdrop-filter: blur(20px) saturate(1.3);
  mask-image: repeating-linear-gradient(135deg,
              #000 0 22px, transparent 22px 24px);
}
```

#### G10 · Vitral — Paños de color con emplomado

Paños de vidrio de colores separados por líneas de plomo, como los vitrales de las iglesias coloniales. Usa los colores de la marca como vidrio teñido: cálido, festivo y muy reconocible.

- **Usar en:** Campañas, redes, temporada de fin de año, piezas para pymes.
- **Cuidado:** Es el más decorativo: en interfaces densas cansa y en enterprise puede leerse como juguete.
- **Valores recomendados:** desenfoque 18 px · velo 52 % · registro 80 (Pyme)

```css
.vidrio {
  --plomo: color-mix(in srgb, var(--tinta) 55%, transparent);
  background: linear-gradient(115deg,
      color-mix(in srgb, var(--primario) 26%, transparent) 0 32%,
      color-mix(in srgb, var(--acento) 26%, transparent) 32% 58%,
      color-mix(in srgb, var(--primario) 14%, transparent) 58% 76%,
      color-mix(in srgb, var(--acento) 18%, transparent) 76%),
    color-mix(in srgb, var(--surface) 52%, transparent);
  backdrop-filter: blur(18px) saturate(1.9);
  box-shadow: inset 0 0 0 3px var(--plomo);
  border-radius: 18px;
}
/* ::after dibuja las líneas de plomo con gradientes duros */
```

**Nota técnica.** Un hijo con `backdrop-filter` dentro de un padre que también lo tiene no ve el fondo real, porque el padre se vuelve la raíz del backdrop. Por eso **G08** (progresivo) y **G09** (grabado) ponen el desenfoque en `::before` y no en el elemento.

### 4.2 Texturas nuevas para explorar (G11–G20)

Siguen la línea de vidrio y luz. Todas toman sus colores de la paleta activa.

| Código | Nombre | Qué es | Técnica sugerida | Estático | Dinámico |
|---|---|---|---|---|---|
| G11 | Vidrio refractivo | Lente real: el fondo se deforma en los bordes, como una gota | `backdrop-filter: url(#svg)` con `feDisplacementMap` (Chromium) o WebGL con mapa de normales; respaldo: G02 | Distorsión fija en los bordes | La refracción sigue la inclinación (puntero o giroscopio) |
| G12 | Cáustica en vidrio | Patrones de luz de agua proyectados dentro de la tarjeta | Shader de cáusticas en un `<canvas>` detrás del vidrio, enmascarado al borde | Cuadro fijo del shader | Animación a 0.2× |
| G13 | Prisma / aberración cromática | Bordes que separan el color en RGB, como un prisma | Tres copias del borde desplazadas 1–2 px en primary / accent / ink con `mix-blend-mode: screen` | Desplazamiento fijo | Desplazamiento que sigue al cursor |
| G14 | Acrílico | Vidrio mate con luminosidad y ruido, al estilo del Acrylic de Microsoft Fluent | Desenfoque 30 px + capa de luminosidad (`mix-blend-mode: luminosity`) + ruido 2 % | Igual | No aplica (es mate) |
| G15 | Vidrio con puntos grabados | Esmerilado con una retícula de puntos transparentes | `mask-image: radial-gradient(...)` repetido en el `::before` desenfocado | Retícula fija | Los puntos se encienden en onda al pasar el cursor |
| G16 | Vidrio biselado | Bloque grueso con bisel de luz en los bordes, como vidrio de 10 mm | Varias sombras internas escalonadas + degradado en el filo | Igual | El brillo del bisel gira con el puntero |
| G17 | Borde de luz | Un haz que recorre el contorno de la tarjeta | `conic-gradient` animado en `::after` con la máscara de borde (como G07) usando `@property --angle` | Arco fijo en una esquina | Vuelta completa en 6–8 s; solo en elementos destacados |
| G18 | Lupa | Zona circular más nítida y ampliada que sigue al cursor | Capa clonada con `transform: scale(1.15)` y `clip-path: circle()` | Sin lupa | La lupa sigue al puntero |
| G19 | Hielo craquelado | Esmerilado con grietas finas de luz (Voronoi) | SVG de Voronoi con semilla, trazos en `mix(#FFF, accent)` α .5 sobre el vidrio | Grietas fijas | Las grietas brillan en secuencia muy lenta |
| G20 | Holograma inclinable | Iridiscencia que cambia de tono según el ángulo, como una tarjeta coleccionable | `conic-gradient` con `--angle` ligado a la inclinación + `mix-blend-mode: color-dodge` a α baja | Ángulo fijo | Ángulo según puntero o giroscopio, con resorte |

### 4.3 Anexo: las 40 texturas de la exploración (X01–X40)

Se construyeron con CSS y SVG generado por código (semillas fijas). Todas usan los roles de la paleta. Familias: **base** (X01–X15), **micelio, raíces y plantas** (X16–X30), **futuristas** (X31–X35) y **otras** (X36–X40). Cada textura tiene un modo `full` (pieza completa) y un modo `ambient` (detrás de una tarjeta, con menos opacidad).

| Código | Familia | Nombre | Reg. | Qué es | Usar en | Evitar |
|---|---|---|---|---|---|---|
| X01 | Base | Cristal esmerilado | 55 | Vidrio esmerilado sobre manchas de color: profundidad y modernidad en la línea de Apple. | Tarjetas flotantes en la web, overlays de demos, piezas de lanzamiento. | Texto largo sobre vidrio. Liquid Glass de Apple recibió fuertes críticas de legibilidad: siempre con un respaldo opaco detrás del texto. |
| X02 | Base | Trazo a lápiz | 70 | Diagramas dibujados a mano y notas manuscritas, en la línea de Anthropic: humano, pensado, cercano. | Explicar procesos, propuestas de diagnóstico, redes, onboarding de clientes. | La interfaz del producto y los contratos: ahí el trazo resta precisión. |
| X03 | Base | Plano técnico | 30 | Retícula y cotas de plano de ingeniería. Dice: esto se diseñó antes de construirse. | Portadas de propuesta, arquitectura de sistemas, fondos de la web corporativa. | Retícula muy visible: debe ir entre 8 y 18 % de opacidad o compite con el contenido. |
| X04 | Base | Art Déco | 25 | Abanicos, rayos y marcos escalonados de los años veinte. Lujo geométrico: orden con celebración. | Piezas premium, invitaciones a eventos, certificados, aniversarios. | Interfaces. Puede leerse como hotel o licor si se usa en todo. |
| X05 | Base | Guilloché | 10 | El tramado de líneas entrelazadas de billetes y títulos valores: seguridad, autenticidad, valor. | Contratos, actas de entrega, licencias de uso, facturas y certificados. | Fondos grandes o tamaños pequeños en pantalla: las líneas finas vibran. |
| X06 | Base | Grano de papel | 60 | Ruido fino sobre color plano: calidez analógica. Es una de las tendencias más citadas para 2026 como respuesta a lo demasiado liso de la IA. | Fondos de web y redes, fotografía, portadas. | Tablas y datos: el ruido ensucia la lectura de cifras. |
| X07 | Base | Risografía | 80 | Tintas planas superpuestas con un leve desregistro y grano, como la impresora riso. Creativo y artesanal. | Campañas, redes, merch, la línea pyme. | El registro enterprise: puede leerse informal. |
| X08 | Base | Retícula suiza | 5 | Columnas, filetes finos y números grandes: el lenguaje sobrio de los informes corporativos y de las marcas enterprise. | Informes, propuestas formales, dashboards, la web corporativa. | Usarla sola: es segura, y por eso poco memorable sin un color o textura de firma. |
| X09 | Base | Isométrico modular | 40 | Bloques en perspectiva isométrica que se apilan: módulos que componen un sistema. Metáfora directa del Núcleo. | Explicar arquitectura, planes por módulos, la escalera Diagnóstico → Plataforma. | La ilustración isométrica genérica de bancos de imágenes, muy gastada. |
| X10 | Base | Curvas de nivel | 45 | Las líneas topográficas de la cordillera: terreno, recorrido, mapa de la operación. | Fondos, separadores, piezas de diagnóstico y de mapa de procesos. | Que la marca parezca de turismo o deportes de montaña. |
| X11 | Base | Semitono | 55 | Puntos de trama de imprenta que construyen degradados: retro-industrial, gráfico, se reproduce en una sola tinta. | Fotos tratadas, banners, empaques, camisetas. | El exceso: con mucho contraste se vuelve cómic. |
| X12 | Base | Terminal | 35 | Texto monoespaciado, cursor y caracteres de caja: lo que ve el ingeniero. Honesto y técnico. | Demos en vivo, contenido para desarrolladores, detrás de cámaras. | Clientes no técnicos: puede intimidar al dueño de una panadería. |
| X13 | Base | Trenza | 75 | Zigzag inspirado en el trenzado de caña flecha: una firma colombiana inconfundible. | Bordes, detalles, merch, regalos corporativos. | Copiar diseños tradicionales zenúes: las pintas tienen significado. Solo en colaboración y con crédito a artesanos. |
| X14 | Base | Cuño seco | 15 | Relieve sin tinta, como el sello notarial sobre el papel: discreción, legitimidad, documento oficial. | Papelería, actas de entrega, portada de propuestas, certificados impresos. | Pantallas pequeñas y fondos oscuros: el relieve se pierde. |
| X15 | Base | Cuadrícula de puntos | 50 | La hoja punteada del cuaderno de bocetos: neutra, ordenada, invita a construir. La más útil dentro del producto. | Fondos de interfaz, onboarding, pizarras de demo. | Esperar que firme la marca: es base, no firma. |
| X16 | Micelio / raíces / plantas | Red de micelio | 55 | Hifas que se ramifican desde varias colonias, vistas al microscopio. La red invisible que conecta un bosque es la metáfora más directa de software que conecta los procesos de una empresa. | Fondos de la web, diagramas de integración, portadas de propuestas. | Detrás de párrafos largos: las líneas finas compiten con el texto. |
| X17 | Micelio / raíces / plantas | Micelio bioluminiscente | 60 | La misma red, de noche y brillando, como los hongos que emiten luz en el bosque húmedo. Tecnología orgánica: vivo, conectado, un poco mágico. | Modo oscuro, lanzamientos, piezas de IA y automatización. | Modo claro: el brillo desaparece y queda una red gris. |
| X18 | Micelio / raíces / plantas | Raíces en corte de suelo | 50 | Vista lateral, como una lámina escolar de ciencias: lo que se ve arriba es poco, lo que sostiene está debajo. Sirve para hablar de la infraestructura que el cliente no ve. | Explicar arquitectura, soporte y mantenimiento; infografías. | Fondos de interfaz: los estratos marcan bandas horizontales. |
| X19 | Micelio / raíces / plantas | Raíz vista desde arriba | 45 | Perspectiva cenital: las raíces se abren en círculo desde el tallo, como un sistema que crece hacia todos los lados desde un núcleo. KippiCore, literalmente. | Logo en contexto, portadas, piezas sobre el Núcleo y sus módulos. | Tamaños pequeños: el detalle de las ramificaciones se vuelve ruido. |
| X20 | Micelio / raíces / plantas | Rizoma | 35 | Tallos subterráneos horizontales, como el jengibre: cada nudo puede brotar hacia arriba y echar raíz hacia abajo. Un sistema sin centro único, igual que una arquitectura de integraciones. | Diagramas de procesos, mapas de integración, presentaciones técnicas. | Usarlo como decoración suelta: funciona mejor cuando explica algo. |
| X21 | Micelio / raíces / plantas | Grabado botánico | 25 | Lámina de botánica del siglo XIX, como las de la Expedición Botánica de Mutis: tramado fino, marco y rótulo en itálica. Rigor científico con belleza. | Portadas de propuestas, certificados, papelería, piezas institucionales. | Pantallas pequeñas: las líneas de tramado se pierden. |
| X22 | Micelio / raíces / plantas | Cianotipia | 40 | Hojas puestas al sol sobre papel sensible, como los primeros libros de fotografía botánica de Anna Atkins. Silueta blanca sobre azul de Prusia: técnica antigua, aspecto de plano. | Portadas, fondos de secciones, piezas impresas, pareja de la paleta Prusia. | Fondos detrás de texto oscuro: en su versión completa el fondo es azul profundo. |
| X23 | Micelio / raíces / plantas | Herbario | 50 | Un ejemplar prensado, pegado con cinta y con su ficha de catálogo. Habla de método, inventario y clasificación, que es justo lo que hace un buen sistema de información. | Casos de éxito, fichas de cliente, redes, presentaciones de catálogo o inventario. | Repetirlo en todas las piezas: es una ilustración, no un patrón. |
| X24 | Micelio / raíces / plantas | Linograbado | 75 | Hojas grandes talladas en linóleo: una sola tinta, formas gruesas y las marcas blancas de la gubia. Artesanal, gráfico y con mucha presencia. | Redes, afiches, merch, campañas para pymes. | Piezas enterprise y documentos formales. |
| X25 | Micelio / raíces / plantas | Sombras de hojas | 65 | La sombra de una palma sobre una pared al final de la tarde: fotográfico, cálido, tropical sin ser literal. Da vida a superficies vacías. | Hero de la web, fondos de redes, fotografía de producto. | Modo oscuro: la sombra casi no se nota. |
| X26 | Micelio / raíces / plantas | Venación de hoja | 45 | Macro de una hoja: nervio central, nervios secundarios y la retícula fina entre ellos. Una red de distribución perfecta, igual que un buen flujo de datos. | Fondos de secciones técnicas, empaques, piezas de datos. | Detrás de tablas: la retícula interfiere con las celdas. |
| X27 | Micelio / raíces / plantas | Anillos de crecimiento | 40 | El corte transversal de un tronco: cada anillo es un año. Habla de permanencia, de crecer con el cliente y de una empresa que va a seguir ahí. | Aniversarios, casos de clientes de largo plazo, piezas de confianza. | Confundirlo con curvas de nivel: necesita la médula y las grietas para leerse como madera. |
| X28 | Micelio / raíces / plantas | Filotaxis | 30 | La espiral de Fibonacci con la que un girasol acomoda sus semillas: el ángulo áureo convertido en patrón. La naturaleza optimizando el espacio, igual que un buen algoritmo. | Ícono de marca en movimiento, portadas, piezas de IA y optimización. | Fondos completos: es un objeto central, no un patrón repetido. |
| X29 | Micelio / raíces / plantas | Musgo en puntillismo | 70 | Colonias de musgo y liquen sobre piedra, dibujadas con miles de puntos. Textura viva y suave a la distancia, detallada de cerca. | Fondos de redes, empaques, papelería de la línea pyme. | Piezas que se imprimen muy pequeñas: el punto se empasta. |
| X30 | Micelio / raíces / plantas | Botánica geométrica | 60 | Hojas, semillas y brotes reducidos a círculos y cuartos de círculo, al estilo Bauhaus. La naturaleza traducida a sistema modular, que es lo que hace el software. | Iconografía, patrones de marca, presentaciones, merch. | Mezclarla con texturas orgánicas detalladas: es su opuesto formal. |
| X31 | Futurista | Malla en perspectiva | 35 | Un terreno de alambre que se pierde en el horizonte, como la vista de un simulador. Dice: modelamos tu operación antes de construirla. | Hero de lanzamiento, demos de IA, piezas de modo oscuro. | Exceso de neón: con colores saturados cae en estética retro de los ochenta. |
| X32 | Futurista | Holográfico | 70 | Lámina iridiscente que cambia de color con la luz, con un brillo diagonal y grano de foil. Futuro, premium y llamativo. | Tarjetas de presentación, empaques, lanzamientos, sellos de calidad. | Superficies de lectura y documentos: compite con todo. |
| X33 | Futurista | Circuito impreso | 25 | Pistas de cobre con quiebres a 45° y vías que conectan capas. Ingeniería visible: el mapa literal de cómo viaja la información. | Contenido técnico, fondos de la sección de ingeniería, eventos de tecnología. | Clientes no técnicos y la línea pyme: puede sentirse frío. |
| X34 | Futurista | Nube de puntos | 30 | Una superficie en 3D dibujada solo con puntos, como un escaneo láser. Datos, medición y modelado: lo que hace la IA con la operación de un negocio. | Piezas de IA y analítica, dashboards de presentación, portadas. | Tamaños pequeños: la profundidad se pierde y quedan puntos sueltos. |
| X35 | Futurista | Interfaz HUD | 40 | Anillos, marcas de escala, mira y lecturas en monoespaciado, como la pantalla de un piloto. Control total y monitoreo en tiempo real. | Dashboards de demo, piezas de monitoreo y soporte, eventos. | Exagerar los datos falsos: las lecturas deben ser del cliente o claramente de ejemplo. |
| X36 | Otra | Mapa de rutas | 30 | Un mapa de metro donde cada línea es un proceso y cada estación es un paso: pedido, bodega, despacho, factura. La forma más clara de explicar cómo fluye la operación. | Diagramas de procesos, onboarding de clientes, propuestas, la web. | Rutas con demasiadas estaciones: pierde la claridad que es su gracia. |
| X37 | Otra | Baldosa hidráulica | 70 | El piso de cemento pintado de las casas antiguas de Bogotá, Cartagena o Medellín: geometría repetida que forma rosetones al unirse. Nostalgia, oficio y patrimonio. | Papelería, empaques, fondos de redes, espacios físicos y merch. | Detrás de texto: el patrón es muy activo. |
| X38 | Otra | Papel plegado | 45 | Una hoja doblada muchas veces, con facetas de luz y sombra, como un origami desplegado. Sutil, táctil y moderno: profundidad sin brillo. | Fondos de la web, portadas, presentaciones; funciona en claro y oscuro. | Contrastes fuertes entre facetas: debe sentirse como relieve, no como mosaico. |
| X39 | Otra | Pantalla de puntos | 60 | Una matriz de LED como la de los buses o los aeropuertos: el nombre escrito con puntos encendidos. Retro-digital, legible y muy reconocible. | Avisos, animaciones cortas, pantallas en eventos, redes. | Textos largos: la matriz de puntos solo sirve para palabras cortas. |
| X40 | Otra | Tarjeta perforada | 20 | La tarjeta perforada con la que se programaban los computadores en los años sesenta: columnas de dígitos y agujeros que eran código. Un homenaje a la historia del software. | Contenido de marca sobre ingeniería, papelería, tarjetas de presentación, merch. | Explicarla demasiado: funciona como guiño para quien la reconoce. |

**Ideas dinámicas para las texturas X.** Micelio (X16–X17): las hifas crecen y se ramifican en tiempo real (L-system o random walk con semilla). Raíces (X18–X19): crecimiento hacia abajo o hacia afuera. Filotaxis (X28): las semillas aparecen una a una. Malla en perspectiva (X31): desplazamiento hacia el horizonte. Nube de puntos (X34): rotación 3D lenta. HUD (X35): anillos que giran. Mapa de rutas (X36): un "tren" recorre la línea de un proceso. Pantalla de puntos (X39): texto que corre.

---

## 5. Instrucciones para construir el laboratorio

### 5.1 Objetivo

Una herramienta interna donde Miguel, Ian y el equipo comercial puedan combinar **tipografía × paleta × modo claro/oscuro × atmósfera × vidrio/textura × estático/dinámico**, ver la combinación aplicada a piezas reales de KippiCore, compararla con otras y exportar la que elijan (tokens CSS/JSON y PNG). Tiene que sentirse como un producto de KippiCore: sofisticado, fluido y rápido.

### 5.2 Stack: decídelo tú con estos criterios

Miguel pidió que elijas el stack buscando **la mayor sofisticación, dinamismo y eficiencia posibles**. Criterios, en orden:

1. **Fluidez:** 60 fps en las atmósferas dinámicas en un portátil normal, y una carga inicial rápida.
2. **Calidad visual:** debe permitir shaders (WebGL/WebGPU) para las atmósferas más ricas (bioluminiscencia, cáusticas, malla de gradiente, refracción) y CSS moderno para lo demás.
3. **Reutilización:** los tokens, atmósferas y vidrios deben poder llevarse luego a la web de KippiCore y a las demos comerciales.
4. **Mantenimiento:** TypeScript estricto y datos separados de los componentes.

Punto de partida razonable, que puedes cambiar si lo justificas en el README: Vite + React + TypeScript; CSS con variables (o Tailwind 4 con tokens en CSS); estado en la URL y en un store liviano; WebGL con una librería pequeña (OGL o regl) o three.js / React Three Fiber solo si hace falta; Canvas 2D para partículas simples; Motion para las transiciones de interfaz.

**Escribe la decisión y las alternativas que descartaste en `docs/decisiones.md`.**

### 5.3 Motor de temas (lo más importante)

Toda la estética sale de **seis colores por paleta y modo**. Nada debe tener colores fijos, salvo el blanco y negro de los cálculos de contraste.

1. **Entrada:** `palette` (C01–C22) + `mode` (light | dark) → los seis roles.
2. **Derivados**, calculados en un único módulo puro (`theme/derive.ts`) y testeados:
   - `onPrimary` / `onAccent`: entre `#FFFFFF`, `ink` y `bg`, el que dé más contraste WCAG.
   - `accentAsText`: `accent` si su contraste con `bg` es ≥ 4.5; si no, `primary` (para acentos de relleno como lima o maíz).
   - `glow` = accent · `glow2` = primary · `glowMix` = mix(accent, primary, .5) · `ambient` = mix(accent, bg, .15–.25).
   - `glassBg(velo)` = color-mix(surface, velo %) · `smoke(velo)` = rgba(11, 13, 18, velo + .25).
   - `blendMode` = `screen` en oscuro, `multiply` en claro.
   - Escalas tonales (50–950) de primary y accent en OKLCH, para gráficos y estados.
3. **Salida:** variables CSS en un contenedor (`--kc-bg`, `--kc-primary`, `--kc-glow`, …) **y** un objeto JS para los shaders y el canvas.
4. **Regla de oro:** las atmósferas, los vidrios y las texturas **solo** leen estos tokens. Así la bioluminiscencia, los vidrios y todas las texturas cambian de color al cambiar la paleta. Escribe un test que lo verifique en cada atmósfera y textura.
5. **Transición entre paletas:** interpolar los colores en OKLCH durante 400–600 ms (CSS `@property` para las variables registradas; uniforms interpolados en los shaders).

### 5.4 Estático vs. dinámico

Cada atmósfera, vidrio y textura implementa la misma interfaz:

```ts
interface Layer {
  id: string;                // "A05", "G07", "X16"
  name: string;
  kind: 'atmosphere' | 'glass' | 'texture';
  reg: number;               // 0 enterprise … 100 pyme
  weight?: number;           // peso para estimar legibilidad (atmósferas)
  renderStatic(t: Theme, opts): ReactNode | string;   // CSS/SVG, sin JS en ejecución
  renderDynamic?(t: Theme, opts): ReactNode;           // canvas/WebGL/CSS animado
  defaults?: { blur?: number; veil?: number; speed?: number; density?: number };
}
```

- Control global: **Estático / Dinámico**, y un regulador de velocidad (0.25×–2×).
- Si `prefers-reduced-motion` está activo, arranca en estático y lo indica.
- **Rendimiento:** pausar lo que no está en pantalla (IntersectionObserver) y lo que está en una pestaña oculta (`visibilitychange`); limitar `devicePixelRatio` a 1.5 en los canvas; un solo contexto WebGL compartido para las miniaturas (render a textura o `OffscreenCanvas`), o miniaturas estáticas; un medidor de FPS en modo desarrollo.
- **Semillas fijas:** todo lo procedural usa un PRNG con semilla (mulberry32), así cada opción se ve siempre igual y se puede compartir.

### 5.5 Vistas del laboratorio

1. **Combinador** (vista principal): selectores con flechas y atajos de teclado para T, C, A, G/X, modo y movimiento. A la derecha, la pieza grande aplicada. Debajo, el código de la combinación (`C05 · T00 · A05 · G01`), con botón de copiar y enlace compartible (estado en la URL).
2. **Plantillas de aplicación** (pestañas sobre la vista grande):
   - Portada web (barra, titular, botones, tarjeta de pedidos).
   - Tarjeta suelta: "Pedido #4821 · Entregado 22:14".
   - Dashboard de producto (KPIs, tabla, gráfico).
   - Post de Instagram 1080×1350.
   - Diapositiva 16:9.
   - Tarjeta de presentación.
   - Firma de correo.
   - Usar textos reales de KippiCore, nunca lorem ipsum.
3. **Matriz:** fija dos ejes (por ejemplo, paleta × atmósfera) y muestra la cuadrícula completa con la misma tarjeta de vidrio, en miniaturas estáticas para que cargue rápido.
4. **Galerías** por tipo (tipografías, paletas, atmósferas, vidrios, texturas X), con filtro por registro (Enterprise / Equilibrio / Pyme) y por familia.
5. **Ficha** de cada opción: descripción, dónde usarla, qué evitar, registro, CSS/código listo para copiar.
6. **Favoritos y comparación:** marcar combinaciones y verlas lado a lado (2–4).
7. **Exportar:** tokens (CSS custom properties y JSON) de la combinación actual, PNG de la vista (html-to-image o render del canvas) y un `.md` con la ficha.

### 5.6 Legibilidad (medida, no estimada)

En el laboratorio de Claude la legibilidad se estimaba con un color promedio. En el nuevo:

- Renderizar el fondo y el vidrio a un canvas fuera de pantalla.
- Muestrear la luminancia en la zona exacta donde va el texto (percentil 10 y 90).
- Calcular el contraste WCAG del peor caso para el texto principal y el secundario.
- Mostrar el semáforo: ≥ 7 excelente · ≥ 4.5 suficiente · ≥ 3 solo texto grande · menor, insuficiente.
- Botón **"Ajustar velo"**: sube el velo hasta que el texto secundario llegue a 4.5:1.
- En modo dinámico, medir cada ~500 ms y mostrar el peor valor del ciclo.

### 5.7 Accesibilidad y calidad

- Navegación completa con teclado (atajos visibles), foco visible y controles nativos (`button`, `select`, `input`).
- Contraste AA en toda la interfaz del propio laboratorio, en claro y en oscuro.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- Sin dependencias pesadas innecesarias; presupuesto inicial < 250 KB de JS comprimido, sin contar las fuentes.
- Tests unitarios para `derive.ts`, el contraste y las semillas, y tests visuales (Playwright) de cada atmósfera y vidrio en las 22 paletas × 2 modos, en estático.

### 5.8 Estructura sugerida

```
kippicore-lab/
  src/
    data/        palettes.json · type.ts · atmospheres.ts · glass.ts · textures.ts · directions.ts
    theme/       derive.ts · contrast.ts · oklch.ts · ThemeProvider.tsx
    layers/
      atmospheres/   A01-aurora/ (static.tsx, dynamic.tsx o shader.glsl) …
      glass/         G01 … G20
      textures/      X01 … X40
    templates/   Hero · OrderCard · Dashboard · InstagramPost · Slide · BusinessCard · EmailSignature
    views/       Combinador · Matriz · Galerias · Ficha · Comparar
    lib/         prng.ts · url-state.ts · export.ts · fps.ts
  docs/          decisiones.md · este archivo
```

### 5.9 Plan por etapas

1. **Base:** motor de temas, datos, T00 + 22 paletas, plantilla Portada, combinador estático.
2. **Atmósferas:** A01–A14 estáticas; A01, A05, A10 y A11 dinámicas.
3. **Vidrios:** G01–G10, medidor de legibilidad real, exportar tokens.
4. **Dinámico completo:** el resto de atmósferas dinámicas, A15–A18, G11–G20.
5. **Texturas X01–X40** en modo `full` y `ambient`; Matriz, Comparar y el resto de plantillas.
6. **Pulido:** transiciones entre paletas, atajos, PNG, favoritos.

Al terminar cada etapa, el laboratorio tiene que poder abrirse y usarse.

### 5.10 Criterios de aceptación

- Cambiar la paleta recolorea **todo** (interfaz de muestra, atmósferas, partículas bioluminiscentes, vidrios y texturas) en menos de 600 ms, sin recargar la página.
- Cada atmósfera y cada vidrio funciona en estático y en dinámico; el dinámico se pausa fuera de pantalla.
- La combinación activa se puede compartir por URL y exportar como tokens.
- La legibilidad que se muestra es medida y coincide con la realidad (verificar a mano en 5 casos).
- 60 fps sostenidos en el Combinador con A05 dinámica y G01 en un portátil de gama media.

---

## 6. Direcciones combinadas de la exploración

### D-A · Plano y lápiz (la recomendada en la exploración)

`C09 · T13 · X03` — C09 Prusia & Lápiz rojo · T13 Geist + Caveat · X03 Plano técnico · X02 Trazo a lápiz · X15 Puntos

A la medida es una palabra de sastre y de ingeniero: primero se dibuja, luego se construye. El plano técnico carga el rigor para el comprador enterprise; la anotación a lápiz carga la cercanía para la pyme. La misma paleta sirve a los dos: el dial es la textura.

- **Para quién:** Ambos registros. Es la que mejor resuelve la tensión central del encargo.
- **Riesgo:** Depende de que la anotación a mano se use con disciplina; si aparece en todas partes, la marca se vuelve informal.

### D-B · Esmeralda institucional

`C04 · T06 · X05` — C04 Esmeralda · T06 Caslon + Franklin · X05 Guilloché · X14 Cuño seco

La lectura más seria: piedra colombiana, letra de documento público y el tramado de los títulos valores. Conecta con el lado jurídico de la sociedad y con el valor de un contrato bien hecho.

- **Para quién:** Medianas empresas, sector financiero y jurídico, licitaciones.
- **Riesgo:** Se aleja del dueño de pyme; para la línea de automatizaciones necesitaría una submarca más cálida.

### D-C · Arcilla viva

`C08 · T02 · X06` — C08 Arcilla · T02 Fraunces + Hanken · X06 Grano · X07 Riso

La más humana: terracota, serif blanda y grano de papel. Le habla al dueño del negocio con calidez y sin jerga, y se ve bien en redes y en WhatsApp.

- **Para quién:** Pyme: panaderías, tiendas naturistas, restaurantes, comercio de barrio.
- **Riesgo:** Le cuesta sostener una propuesta de ERP grande frente a un comité.

### D-D · Cristal bioluminiscente (propuesta a validar en el laboratorio)

`C05 o C20 · T00 · A05 / A01 · G01 o G02` — Geist sobre fondos de luz difusa y vidrio esmerilado: es la dirección hacia la que se ha inclinado Miguel. Une lo tecnológico (IA, sistemas vivos) con lo orgánico (micelio, bioluminiscencia).

- **Por validar:** que funcione en modo claro y en documentos impresos, donde la luz difusa pierde fuerza. Ahí conviene pasar a G05 ahumado o a X16 red de micelio como versión sobria.

---

## 7. Decisiones abiertas

1. Tipografía: ¿T00 Geist es la de KippiLex? Confirmar y decidir si KippiCore comparte o se diferencia.
2. Paleta final y si habrá submarca para la línea pyme.
3. Atmósfera de firma (una) y de apoyo (una o dos).
4. Vidrio de firma: uno para interfaz (G01/G02) y uno para enterprise (G05).
5. Logo e isotipo: pendientes; se diseñan después de cerrar color y tipografía.

## 8. Referencias

- Labrecque & Milne (2012), *Exciting red and competent blue: the importance of color in marketing*, J. of the Academy of Marketing Science.
- Brumberger (2003), *The Rhetoric of Typography: The Persona of Typeface and Text*, Technical Communication.
- Material Design, guías de tema oscuro (superficie #121212, elevación por superposición).
- Apple, *Meet Liquid Glass* (WWDC 2025) y críticas de legibilidad (Infinum, MacStories).
- Pronósticos de diseño 2026: Creative Bloq, Kota, Canva Design Trends.
- Artefactos de origen en Claude: "Exploración de marca KippiCore" (22 paletas, 13 tipografías, 40 texturas, combinador) y "Laboratorio de cristal KippiCore" (10 vidrios, 14 atmósferas).
