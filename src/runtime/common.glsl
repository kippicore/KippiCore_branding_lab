precision highp float;

// Hash sin seno (Dave Hoskins), estable entre GPUs.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i), b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Réplica de radial-gradient(circle, color 0, transparent 68%) sobre un cuadrado de lado d.
float luz(vec2 px, vec2 c, float dPx, float alpha) {
  float r = length(px - c);
  return alpha * clamp(1.0 - r / (0.4808 * dPx), 0.0, 1.0);
}
vec3 blendScreen(vec3 b, vec3 s)   { return 1.0 - (1.0 - b) * (1.0 - s); }
vec3 blendMultiply(vec3 b, vec3 s) { return b * s; }
// Dither triangular estático (uno animado «hierve»).
vec3 dither(vec3 c, vec2 fragCoord) {
  return c + (hash12(fragCoord) + hash12(fragCoord + 17.17) - 1.0) / 255.0;
}
