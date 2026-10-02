uniform vec2  uRes;
uniform float uTime;
uniform float uWarpAmt;
uniform float uDark;                  // 0 claro … 1 oscuro (interpolado)
uniform vec3  uBg, uPrimary, uAccent, uGlowMix;
uniform vec4  uP, uA, uM;             // (cx, cy, dPx, alpha) en px de backing
varying vec2  vUv;

vec3 blendMode(vec3 b, vec3 s) { return mix(blendMultiply(b, s), blendScreen(b, s), uDark); }
vec3 layer(vec3 b, vec3 s, float a) { return mix(b, blendMode(b, s), a); }

void main() {
  vec2 px = vUv * uRes;
  px.y = uRes.y - px.y;
  float w = uRes.x;
  vec2 q = px / (0.35 * w) + vec2(uTime * 0.015, uTime * -0.011);
  px += uWarpAmt * 0.025 * w * (vec2(vnoise(q), vnoise(q + 3.7)) - 0.5) * 2.0;

  vec3 col = uBg;
  col = layer(col, uPrimary, luz(px, uP.xy, uP.z, uP.w));
  col = layer(col, uAccent,  luz(px, uA.xy, uA.z, uA.w));
  col = layer(col, uGlowMix, luz(px, uM.xy, uM.z, uM.w));
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
