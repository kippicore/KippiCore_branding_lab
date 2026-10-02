uniform float uTime;
uniform float uAmt;                   // entrada suave 0 → 1
uniform float uSeed;
uniform float uDark;
uniform vec3  uBg, uPrimary, uAccent, uGlowMix, uInk;
varying vec2  vUv;

#define TAU 6.2831853
vec3 blendMode(vec3 b, vec3 s) { return mix(blendMultiply(b, s), blendScreen(b, s), uDark); }
vec3 layer(vec3 b, vec3 s, float a) { return mix(b, blendMode(b, s), clamp(a, 0.0, 1.0)); }
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s / 0.875;
}

void main() {
  vec2 px = vUv * uRes;
  px.y = uRes.y - px.y;
  float yn = px.y / uRes.y;                       // 0 arriba … 1 abajo
  float x = (px.x - 0.5 * uRes.x) / uRes.y;       // unidades de altura
  float hy = 0.84;
  float up = max((hy - yn) / hy, 0.0);            // 0 en el horizonte … 1 arriba
  float t = uTime;
  float sd = uSeed * 13.1;

  // pulso lento del núcleo (10 s) y fases que cierran en 50 s
  float pulse = 1.0 + 0.10 * sin(TAU * t / 10.0);
  float ph50 = TAU * t / 50.0, ph25 = TAU * t / 25.0;

  // abanico de rayos desde un foco bajo el horizonte
  float fy = hy + 0.30;
  float dx = x, dy = fy - yn;
  float a = atan(dx, max(dy, 0.001));
  float dist = length(vec2(dx, dy));
  a += 0.06 * sin(ph50) + 0.02 * sin(ph25 * 2.0 + 1.3);       // deriva lateral
  vec2 c25 = vec2(cos(ph25), sin(ph25));
  float widthBreath = 0.5 + 0.5 * sin(ph25 + 1.7);            // ancho que respira
  float n1 = vnoise(vec2(a * 15.0 + sd + c25.x * 0.9, 3.1 + c25.y * 0.9));
  float n2 = vnoise(vec2(a * 34.0 - sd + c25.y * 1.3, 8.4 - c25.x * 1.3));
  float lo = mix(0.50, 0.38, widthBreath);
  float ray = smoothstep(lo, 0.92, n1) * (0.65 + 0.55 * n2);
  float rayLen = exp(-max(dist - 0.30, 0.0) * 1.5) * smoothstep(0.0, 0.10, hy - yn + 0.02);
  float rays = ray * rayLen * (0.85 + 0.25 * sin(ph25 + n1 * 6.0));

  // base: bruma ascendente centrada en el foco
  float spread = exp(-pow(x / (0.55 + 0.35 * up), 2.0));
  float haze = exp(-up * 2.0) * spread * pulse;

  // nubes de luz con ruido, ciclo exacto de 50 s
  vec2 cq = vec2(x * 2.4, yn * 3.2) + 1.1 * vec2(cos(ph50), sin(ph50)) + sd;
  float cloud = fbm(cq);
  float cmod = smoothstep(0.25, 0.85, cloud);
  float clouds = cmod * exp(-up * 1.6) * spread;

  float I = haze * (0.55 + 0.75 * cmod) + rays * 0.55 * (0.5 + 0.5 * spread) + clouds * 0.35;
  I *= uAmt;
  float core = exp(-pow(length(vec2(x * 1.1, (yn - hy) * 1.8)) * 2.2, 2.0)) * pulse * uAmt;

  vec3 warm = uAccent, cool = uPrimary;
  vec3 glowCol = mix(warm, cool, smoothstep(0.0, 0.75, up));
  vec3 col = uBg;
  col = layer(col, glowCol, I * 0.95);
  col = layer(col, uGlowMix, clouds * 0.30 * uAmt);
  col = layer(col, warm, core * 0.55);

  // estrellas titilantes (puntos en rejilla, más débiles dentro del resplandor)
  vec2 g = vec2(x, yn) * 70.0;
  vec2 cell = floor(g);
  float h1 = hash12(cell + sd), h2 = hash12(cell + 31.7 + sd), h3 = hash12(cell + 57.3 + sd);
  vec2 sp = vec2(0.2 + 0.6 * h2, 0.2 + 0.6 * h3);
  float d = length(fract(g) - sp);
  float on = step(0.935, h1);
  float per = h1 > 0.975 ? 5.0 : 10.0;
  float tw = 0.65 + 0.35 * sin(TAU * t / per + h2 * 40.0);
  float star = on * smoothstep(0.17, 0.0, d) * tw * (0.45 + 0.55 * h3);
  star *= smoothstep(hy - 0.01, hy - 0.10, yn) * (1.0 - clamp(I * 1.6, 0.0, 0.95)) * uAmt;
  col = layer(col, uInk, star * 0.85);

  // línea baja de horizonte oscura
  float hz = smoothstep(hy - 0.004, hy + 0.012, yn);
  col = mix(col, uBg, hz * 0.94);

  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
