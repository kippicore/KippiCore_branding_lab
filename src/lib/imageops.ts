/** Operaciones de imagen puras (sin canvas) para el medidor de legibilidad. */

const makeImage = (data: Uint8ClampedArray<ArrayBuffer>, w: number, h: number): ImageData =>
  typeof ImageData !== 'undefined'
    ? new ImageData(data, w, h)
    : ({ data, width: w, height: h, colorSpace: 'srgb' } as unknown as ImageData);

/** Anchos de caja para aproximar una gaussiana de sigma dado con n pasadas. */
const boxSizes = (sigma: number, n: number): number[] => {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal);
  if (wl % 2 === 0) wl--;
  const wu = wl + 2;
  const mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);
  return Array.from({ length: n }, (_, i) => (i < m ? wl : wu));
};

/** Una pasada de caja (radio r) a lo largo de un eje, con bordes replicados. */
const boxPass = (src: Float32Array, dst: Float32Array, w: number, h: number, r: number, horizontal: boolean): void => {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const stride = horizontal ? 1 : w;
  const lineStep = horizontal ? w : 1;
  const div = 2 * r + 1;
  for (let ch = 0; ch < 4; ch++) {
    for (let ln = 0; ln < lines; ln++) {
      const base = ln * lineStep;
      const at = (i: number): number => src[(base + Math.min(len - 1, Math.max(0, i)) * stride) * 4 + ch] as number;
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += at(i);
      for (let i = 0; i < len; i++) {
        dst[(base + i * stride) * 4 + ch] = acc / div;
        acc += at(i + r + 1) - at(i - r);
      }
    }
  }
};

/** Desenfoque ≈ gaussiano (3 cajas); `radiusPx` = radio del blur CSS (sigma). */
export const blurImageData = (img: ImageData, radiusPx: number): ImageData => {
  const { width: w, height: h } = img;
  const out = new Uint8ClampedArray(img.data.length);
  if (radiusPx <= 0.01) { out.set(img.data); return makeImage(out, w, h); }
  let a = Float32Array.from(img.data);
  let b = new Float32Array(a.length);
  for (const size of boxSizes(radiusPx, 3)) {
    const r = (size - 1) / 2;
    if (r < 1) continue;
    boxPass(a, b, w, h, r, true);
    boxPass(b, a, w, h, r, false);
  }
  for (let i = 0; i < a.length; i++) out[i] = a[i] as number;
  return makeImage(out, w, h);
};

/** Matrices de filter CSS: saturate(sat) y luego brightness(bright). */
export const saturateBrightness = (img: ImageData, sat: number, bright: number): ImageData => {
  const src = img.data;
  const out = new Uint8ClampedArray(src.length);
  const m = [
    0.213 + 0.787 * sat, 0.715 - 0.715 * sat, 0.072 - 0.072 * sat,
    0.213 - 0.213 * sat, 0.715 + 0.285 * sat, 0.072 - 0.072 * sat,
    0.213 - 0.213 * sat, 0.715 - 0.715 * sat, 0.072 + 0.928 * sat,
  ] as const;
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i] as number, g = src[i + 1] as number, b = src[i + 2] as number;
    out[i] = (m[0] * r + m[1] * g + m[2] * b) * bright;
    out[i + 1] = (m[3] * r + m[4] * g + m[5] * b) * bright;
    out[i + 2] = (m[6] * r + m[7] * g + m[8] * b) * bright;
    out[i + 3] = src[i + 3] as number;
  }
  return makeImage(out, img.width, img.height);
};

const lin = (c: number): number => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

/** Percentiles (ps en 0..100) de la luminancia relativa WCAG; `mask[i] !== 0` incluye el píxel i. */
export const luminancePercentiles = (img: ImageData, mask: Uint8Array | undefined, ps: number[]): number[] => {
  const n = img.width * img.height;
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    if (mask && !mask[i]) continue;
    const o = i * 4;
    vals.push(0.2126 * lin(img.data[o] as number) + 0.7152 * lin(img.data[o + 1] as number) + 0.0722 * lin(img.data[o + 2] as number));
  }
  if (!vals.length) return ps.map(() => 0);
  vals.sort((a, b) => a - b);
  return ps.map((p) => {
    const idx = Math.min(vals.length - 1, Math.max(0, Math.ceil((p / 100) * vals.length) - 1));
    return vals[idx] as number;
  });
};
