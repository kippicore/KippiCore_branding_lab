precision highp float;
uniform float uLightMode;   // 0 = suma (oscuro), 1 = multiplicación (claro); el blendFunc cambia a la vez
varying vec3  vCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float m = 1.0 - smoothstep(0.22, 0.5, d);
  if (m <= 0.0) discard;
  vec3 add = vCol * m;
  vec3 mul = clamp(vec3(1.0 - m * vA) + add, 0.0, 1.0);
  gl_FragColor = vec4(mix(add, mul, uLightMode), 1.0);
}
