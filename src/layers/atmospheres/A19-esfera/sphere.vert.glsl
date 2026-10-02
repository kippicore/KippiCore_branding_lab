// Réplica GLSL de sample() en sphere.ts (mantener en sincronía).
precision highp float;
attribute vec3 position;
attribute vec4 aRand;            // x tamaño, y 1 = partícula que se desprende, z/w fases
uniform vec2  uRes;              // backing px
uniform vec2  uCenter;           // backing px, y hacia abajo
uniform float uR;                // radio en backing px
uniform float uPx;               // escala de tamaño de punto (backing px)
uniform float uTime;
uniform float uBreath;
uniform vec2  uTilt;             // parallax del puntero (rad)
uniform vec3  uK0, uK1, uK2, uPh;
uniform vec3  uDust, uFil, uRimC, uEj;
varying vec3  vCol;
varying float vA;

const float TAU = 6.28318530718;
const float W0 = TAU / 45.0;
const float W1 = TAU / 30.0;
const float W2 = TAU / 90.0;
const float CAM_D = 3.6;
const vec2  LIGHT = vec2(0.871, 0.49);

vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }

float field(vec3 p, float t) {
  vec3 q = p + 0.32 * vec3(sin(1.7 * p.y + 0.9 + t * W1), sin(1.9 * p.z + 2.1 - t * W1), sin(1.5 * p.x + 4.0 + t * W2));
  float a = sin(dot(uK0, q) + uPh.x + t * W0);
  float b = sin(dot(uK1, q) + uPh.y - t * W2);
  float c = sin(dot(uK2, q) + uPh.z + t * W1);
  return (a + 0.8 * b + 0.6 * c) / 2.4;
}

void main() {
  float t = uTime;
  vec3 p = position;
  float len0 = length(p);
  bool ejecta = aRand.y > 0.5;
  float spin = 0.0, fil = 0.0, ej = 0.0;
  if (ejecta) {
    float u = fract(t / 18.0 + aRand.z);
    p = p / len0 * (1.0 + u * (0.45 + 0.7 * aRand.x));
    spin = -u * 0.35;
    ej = smoothstep(0.0, 0.12, u) * pow(1.0 - u, 1.6) * 0.85;
  } else {
    float f = field(p, t);
    fil = exp(-f * f * 45.0);
    p *= 1.0 + 0.06 * f + 0.04 * fil * uBreath;
    p += 0.012 * vec3(sin(t * 2.0 * W1 + aRand.z * TAU), cos(t * 3.0 * W0 + aRand.w * TAU), sin(t * W1 + (aRand.z + aRand.w) * TAU));
  }
  p = rotY(p, TAU * t / 90.0 + spin);
  p = rotZ(p, 0.38);
  p = rotX(p, 0.22);
  p = rotX(p, uTilt.y);
  p = rotY(p, uTilt.x);

  float len = max(length(p), 1e-4);
  float nz = p.z / len;
  float front = (nz + 1.0) * 0.5;
  float side = smoothstep(-0.35, 0.9, dot(p.xy, LIGHT) / max(length(p.xy), 1e-4));
  float shell = smoothstep(0.9, 0.98, len0);
  float inner = shell > 0.5 ? 1.0 : 0.7;
  float rim = ejecta ? 0.0 : pow(1.0 - abs(nz), 2.5) * (0.25 + 0.75 * side) * uBreath * shell * 0.9;
  float dust = ejecta ? 0.0 : (0.1 + 0.2 * front) * inner;
  float filA = fil * (0.25 + 0.6 * front) * (shell > 0.5 ? 1.0 : 0.8);

  float s = CAM_D / (CAM_D - p.z);
  vec2 px = uCenter + vec2(p.x, -p.y) * s * uR;
  gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
  float size = (0.8 + 1.2 * aRand.x) * s * (ejecta ? 0.9 : 1.0) * uPx;
  // Puntos subpíxel: se mantienen a 1 px y se compensa el alfa (no parpadean).
  float cover = clamp(size, 0.0, 1.0);
  gl_PointSize = max(size, 1.0) + 1.0;   // +1 px de borde suave
  float aTot = dust + filA + rim + ej;
  vec3 col = uDust * dust + uFil * filA + uRimC * rim + uEj * ej;
  float k = aTot > 1.0 ? 1.0 / aTot : 1.0;
  vCol = col * k * cover;
  vA = min(aTot, 1.0) * cover;
}
