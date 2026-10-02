uniform vec2  uRes;
uniform float uTime;
uniform float uWarpAmt;
uniform vec3  uBg;
uniform vec4  uL0, uL1, uL2, uL3;   // (cx, cy, dPx, alpha) en px de backing
uniform vec3  uC0, uC1, uC2, uC3;   // sRGB gamma
varying vec2  vUv;

void main() {
  vec2 px = vUv * uRes;
  px.y = uRes.y - px.y;
  float w = uRes.x;
  vec2 q = px / (0.5 * w) + vec2(uTime * 0.01, -uTime * 0.007);
  px += uWarpAmt * 0.015 * w * (vec2(vnoise(q), vnoise(q + 7.3)) - 0.5) * 2.0;

  vec3 col = uBg;
  col = mix(col, uC0, luz(px, uL0.xy, uL0.z, uL0.w));
  col = mix(col, uC1, luz(px, uL1.xy, uL1.z, uL1.w));
  col = mix(col, uC2, luz(px, uL2.xy, uL2.z, uL2.w));
  col = mix(col, uC3, luz(px, uL3.xy, uL3.z, uL3.w));
  gl_FragColor = vec4(dither(col, gl_FragCoord.xy), 1.0);
}
