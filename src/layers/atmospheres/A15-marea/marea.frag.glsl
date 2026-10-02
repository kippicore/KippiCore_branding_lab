// A15 Marea luminosa: playa nocturna en perspectiva. La orilla converge al punto de fuga (uVp, uHorizon);
// en coordenadas de mundo X = (x' - xv)·Z las rectas hacia la fuga son X = cte, así que dn = X/a - xs es
// la distancia transversal a la orilla (dn > 0 = mar) y Z la coordenada a lo largo de la orilla.
uniform vec2  uRes;
uniform float uTime;
uniform float uSeed;
uniform float uDark;                  // 0 claro … 1 oscuro (interpolado)
uniform float uRunup;                 // 0 (retirada) … 1 (máximo avance) en el ciclo actual
uniform float uFoam;                  // intensidad de la espuma del borde
uniform float uResid;                 // brillo residual sobre la arena mojada
uniform float uRun;                   // alcance de esta ola (varía por ciclo)
uniform float uCycle;                 // índice del ciclo (para las cúspides)
uniform float uPh;                    // fase 0..1 del ciclo
uniform float uWarmup;                // 0→1 en los primeros segundos
uniform vec3  uBgDeep, uSea, uHalo, uCore, uAmbient, uSpark;
varying vec2  vUv;

const float YH = 0.8;                 // horizonte (fracción de alto, desde abajo)
const float XV = 0.66;                // punto de fuga (fracción de ancho)
const float XS = -0.585;              // orilla: toca el borde inferior en x = 0.075
const float E0 = 0.05;                // borde del agua en retirada (dn)
const float SP = 0.16;                // separación entre crestas (dn)
const float RUN = 0.13;               // avance máximo nominal (dn)

vec3 blendMode(vec3 b, vec3 s) { return mix(blendMultiply(b, s), blendScreen(b, s), uDark); }
vec3 layer(vec3 b, vec3 s, float a) { return mix(b, blendMode(b, s), clamp(a, 0.0, 1.0)); }

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v / 0.875;
}
// Ondulación de un frente a lo largo de la orilla; evoluciona con su posición transversal (continua en el ciclo).
float warp(float u, float pos) {
  return 0.034 * (fbm(vec2(u * 1.5 + uSeed, pos * 5.0 + uTime * 0.015)) - 0.5) * 2.0;
}
// Perfil de un frente de espuma: núcleo fino muy brillante + halo + estela de espuma hacia el mar.
vec3 front(float dd, float w, float band, float tex) {
  float core = exp(-(dd * dd) / (w * w));
  float halo = exp(-abs(dd) / (w * 7.0));
  float trail = dd > 0.0 ? exp(-dd / band) * tex : 0.0;
  return vec3(core, halo, trail);
}

void main() {
  float a = uRes.x / uRes.y;
  vec2 uv = vUv;
  float xp = uv.x * a;
  float t = uTime;
  vec3 col = uBgDeep;

  // Cielo y resplandor cálido del horizonte (ambient).
  float hx = (uv.x - 0.84) / 0.3;
  float skyGlow = exp(-max(uv.y - YH, 0.0) / 0.07) * exp(-hx * hx);

  if (uv.y < YH) {
    float Z = YH / (YH - uv.y);
    float X = (xp - XV * a) * Z / a;
    float dn = X - XS;
    float u = Z;
    float pix = Z / uRes.x;                                      // un píxel de backing en unidades dn
    float fz = 1.0 - smoothstep(4.0, 11.0, Z);                   // el detalle se apaga hacia el horizonte
    float w = max(0.0032, 0.9 * pix);

    // Borde del agua (swash) y línea de pleamar de este ciclo.
    float run = RUN * uRun;
    float e0 = E0 - run * uRunup;
    float cusp = 0.03 * (vnoise(vec2(u * 2.2 + 3.0, uCycle * 3.7 + uSeed)) - 0.5) * 2.0;
    float e = e0 + warp(u, e0) + cusp * uRunup;
    float ep0 = E0 - run;
    float ePeak = ep0 + warp(u, ep0) + cusp;

    float tex = smoothstep(0.38, 0.78, fbm(vec2(u * 3.2 - t * 0.04, dn * 34.0 + t * 0.06)));
    float sea = smoothstep(-pix, pix, dn - e);

    // Agua: tinte de mar que se hace un poco más claro lejos (reflejo cálido en la franja lejana).
    float far = smoothstep(1.5, 9.0, Z);
    vec3 water = mix(uBgDeep, uSea, 0.55 + 0.45 * far);
    float rx = (uv.x - 0.84) / 0.09;
    float ripple = 0.55 + 0.45 * vnoise(vec2(uv.x * 60.0, uv.y * 260.0 - t * 0.35));
    float refl = exp(-rx * rx) * exp(-(YH - uv.y) / 0.14) * ripple;
    col = mix(col, water, sea);
    col = layer(col, uAmbient, 0.55 * refl * sea);

    // Arena mojada: lo que cubrió la ola conserva un brillo residual que se desvanece.
    float wet = smoothstep(ePeak - pix, ePeak + pix, dn) * (1.0 - sea);
    col = mix(col, mix(uBgDeep, uSea, 0.5), 0.6 * wet * uResid);
    float mq = (dn - ePeak) / (w * 1.4);
    float mark = exp(-mq * mq);
    float resid = uResid * fz * (wet * (0.12 + 0.25 * tex) + 0.35 * mark);

    // Espuma del borde.
    vec3 f = front(dn - e, w, 0.05, tex) * uFoam * fz;
    float film = sea * exp(-(dn - e) / 0.06) * 0.22 * uFoam * fz;   // lámina fina de agua luminosa

    // Crestas que llegan (líneas de nivel desplazadas por fbm) y se encienden al romper cerca de la orilla.
    vec3 cr = vec3(0.0);
    for (int k = 0; k < 4; k++) {
      float dk = E0 + SP * (float(k) + 1.0 - uPh);
      float bk = 0.9 * pow(1.0 - smoothstep(0.0, 4.0 * SP, dk - E0), 1.5);
      float nk = smoothstep(0.0, SP, dk - E0);                   // al llegar adopta el perfil del borde
      vec3 fk = front(dn - (dk + warp(u, dk)), w * mix(1.0, 0.8, nk), mix(0.05, 0.03, nk), tex) * bk;
      cr += fk;
    }
    cr *= fz;

    float haloA = 0.45 * (f.y + cr.y) + 0.55 * (f.z + cr.z) + film + resid * 0.6;
    float coreA = 1.0 * (f.x + cr.x) + 0.25 * (f.z + cr.z) * tex + resid * 0.5;
    col = layer(col, uHalo, haloA * uWarmup);
    col = layer(col, uCore, coreA * uWarmup);

    // Destellos granulados en la espuma y en la arena mojada.
    vec2 cell = floor(gl_FragCoord.xy / 1.5);
    float h = hash12(cell + uSeed * 13.0);
    float h2 = hash12(cell + 71.3);
    float tw = pow(0.5 + 0.5 * sin(t * (1.2 + 2.6 * h2) + h * 62.83), 14.0);
    float zone = clamp(f.z * 2.2 + f.x + cr.z * 1.5 + resid * 2.5, 0.0, 1.0);
    float spark = step(0.86, h) * tw * zone;
    col = layer(col, uSpark, spark * uWarmup);
  } else {
    col = layer(col, uAmbient, 0.6 * skyGlow);
  }
  // Línea de horizonte suave (agua lejana).
  float hl = exp(-abs(uv.y - YH) / 0.004) * smoothstep(XV - 0.05, XV + 0.08, uv.x) * (0.3 + 0.7 * exp(-hx * hx));
  col = layer(col, uAmbient, 0.35 * hl);
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
