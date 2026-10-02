uniform vec2  uRes;
uniform float uTime;
uniform float uWarpAmt;
uniform float uDark;
uniform float uSeed;
uniform vec3  uBg, uDeep, uGlow, uGlow2, uMix, uInk;
varying vec2  vUv;

float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}
vec3 blendMode(vec3 b, vec3 s) { return mix(blendMultiply(b, s), blendScreen(b, s), uDark); }
vec3 layer(vec3 b, vec3 s, float a) { return mix(b, blendMode(b, s), clamp(a, 0.0, 1.0)); }

// Una cortina: x en unidades de ancho, y hacia arriba (0 = abajo). Devuelve (intensidad, pliegue 0..1).
vec2 curtain(float x, float y, float t, float off, float base, float amp, float height) {
  vec2 q = vec2(x * 1.6 + off, t * 0.05);
  // dominio deformado: el pliegue es fbm(fbm)
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.03)), fbm(q + vec2(5.2, 1.3 - t * 0.02)));
  float fold = fbm(q * 1.3 + 2.5 * w + vec2(off, 0.0));
  float xw = x + (fold - 0.5) * 0.35 * uWarpAmt + (w.x - 0.5) * 0.12 * uWarpAmt;
  float yb = base + (fbm(vec2(xw * 2.2 + off * 1.7, t * 0.04 + off)) - 0.5) * amp;
  float d = y - yb;
  // rayos verticales: ruido de alta frecuencia en x, modulado por una envolvente lenta
  float rays = vnoise(vec2(xw * 70.0 + off * 9.0, t * 0.15)) * 0.6 + vnoise(vec2(xw * 190.0 + off, t * 0.25 + 3.0)) * 0.4;
  rays = 0.35 + 0.9 * smoothstep(0.2, 0.9, rays);
  float up = exp(-max(d, 0.0) / (height * (0.55 + 0.9 * fold)));      // desvanece hacia arriba
  float below = smoothstep(-0.012, 0.0, d);                           // borde inferior nítido
  float edge = exp(-pow(max(d, 0.0) / 0.035, 1.0));                   // borde inferior más brillante
  float travel = 0.65 + 0.35 * sin(xw * 9.0 - t * 0.35 + 6.0 * w.y);  // brillo que viaja
  float inten = below * up * rays * travel * (0.55 + 0.9 * edge);
  return vec2(inten, fold);
}

void main() {
  vec2 px = vUv * uRes;                // y hacia arriba
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(px.x / uRes.x, px.y / uRes.y);
  float t = uTime;

  // cielo
  vec3 col = mix(uBg, uDeep, 0.35 + 0.65 * p.y);
  col = mix(col, uDeep, 0.0);

  // estrellas (celdas ~ 9 px de backing)
  float cell = max(6.0, uRes.x / 90.0);
  vec2 g = px / cell, gi = floor(g), gf = fract(g);
  float h = hash12(gi + uSeed), h2 = hash12(gi + 31.7 + uSeed);
  vec2 sp = vec2(0.2 + 0.6 * h2, 0.2 + 0.6 * fract(h * 7.31));
  float star = step(0.9, h) * smoothstep(0.34, 0.0, length(gf - sp) * cell / (cell * 0.5)) ;
  float tw = 0.6 + 0.4 * sin(t * (0.7 + 2.2 * h2) + h * 60.0);
  float sky = smoothstep(0.14, 0.4, p.y);

  // cortinas
  vec2 c1 = curtain(p.x, p.y, t, 0.0 + uSeed * 0.01, 0.46, 0.20, 0.17);
  vec2 c2 = curtain(p.x, p.y, t * 0.8 + 40.0, 3.7 + uSeed * 0.01, 0.38, 0.16, 0.12);
  float inten = clamp(c1.x * 0.95 + c2.x * 0.55, 0.0, 1.4);
  col = mix(col, uInk, 0.0);
  col = layer(col, uInk, star * tw * sky * (1.0 - 0.9 * min(inten, 1.0)) * (0.55 + 0.25 * uDark));

  vec3 curt = mix(uGlow, uGlow2, smoothstep(0.35, 0.75, c1.y));
  curt = mix(curt, uMix, smoothstep(0.55, 0.9, c1.y * 0.6 + c2.y * 0.5) * 0.9);
  vec3 curt2 = mix(uGlow2, uMix, c2.y);
  col = layer(col, curt, c1.x * 0.95 * smoothstep(0.1, 0.25, p.y));
  col = layer(col, curt2, c2.x * 0.55 * smoothstep(0.1, 0.25, p.y));
  // núcleo del borde: un toque de blanco donde la cortina es más intensa
  col = layer(col, vec3(1.0), uDark * smoothstep(0.9, 1.4, inten) * 0.25);

  // reflejo tenue en el suelo + horizonte de abetos
  float x = p.x * asp;
  float row1 = 1.0 - abs(2.0 * fract(x * 14.0 + hash12(vec2(floor(x * 14.0), 3.0))) - 1.0);
  float hh1 = 0.05 + 0.05 * hash12(vec2(floor(x * 14.0), 9.0));
  float row2 = 1.0 - abs(2.0 * fract(x * 23.0 + 0.37) - 1.0);
  float hh2 = 0.035 + 0.035 * hash12(vec2(floor(x * 23.0 + 0.37), 5.0));
  float ridge = 0.075 + 0.02 * vnoise(vec2(p.x * 3.0, 1.0)) + 0.045 * smoothstep(0.7, 1.0, abs(p.x * 2.0 - 1.0));
  float tree = max(ridge + hh1 * pow(row1, 1.6), ridge - 0.012 + hh2 * pow(row2, 1.6));
  float aa = 1.5 / uRes.y;
  float m = 1.0 - smoothstep(tree - aa, tree + aa, p.y);
  vec3 hor = mix(uDeep, uInk, 0.2 * (1.0 - uDark));
  col = mix(col, hor, m);
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
