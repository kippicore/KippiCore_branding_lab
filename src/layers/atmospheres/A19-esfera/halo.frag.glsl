// Fondo: bgDeep + halo glowMix + interior glow2 + bruma de rim en el lado iluminado (common.glsl delante).
uniform vec2  uRes;
uniform float uDark;
uniform vec3  uBg, uHalo, uIn, uRimC;
uniform vec2  uCenter;   // backing px, y hacia abajo
uniform float uR;
uniform float uBreath;
varying vec2  vUv;

vec3 blendMode(vec3 b, vec3 s) { return mix(blendMultiply(b, s), blendScreen(b, s), uDark); }
vec3 layer(vec3 b, vec3 s, float a) { return mix(b, blendMode(b, s), a); }

void main() {
  vec2 px = vUv * uRes;
  px.y = uRes.y - px.y;
  vec2 d = (px - uCenter) / uR;
  d.y = -d.y;                                   // y hacia arriba, como la esfera
  float r = length(d);
  float side = smoothstep(-0.35, 0.9, dot(d, vec2(0.871, 0.49)) / max(r, 1e-4));
  float halo = 0.22 * (1.0 - smoothstep(0.55, 2.1, r));
  float inner = 0.12 * (1.0 - smoothstep(0.0, 1.0, r));
  float e1 = (r - 1.03) / 0.07, e2 = (r - 1.05) / 0.32;
  float ring = exp(-e1 * e1) * 0.30 + exp(-e2 * e2) * 0.16;
  float rim = ring * (0.2 + 0.8 * side) * uBreath;
  vec3 col = uBg;
  col = layer(col, uHalo, halo);
  col = layer(col, uIn, inner);
  col = layer(col, uRimC, rim);
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
