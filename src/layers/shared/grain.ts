import { exprToCss } from './color-expr';
export const GRAIN_ALPHA = 0.9;
/** Ruido feTurbulence (baseFrequency .75, 3 octavas, semilla fija), en grises: se mezcla con `overlay`. */
export const grainSvg = (seed = 7): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><filter id="kc-grain" x="0" y="0" width="100%" height="100%">` +
  `<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="${seed}" stitchTiles="stitch"/>` +
  `<feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#kc-grain)"/></svg>`;
export const grainDataUrl = (seed = 7): string => `data:image/svg+xml;utf8,${encodeURIComponent(grainSvg(seed))}`;
export const grainCss = (): string =>
  `.kc-grain {\n  position: absolute;\n  inset: 0;\n  background: url("<feTurbulence baseFrequency=.75 numOctaves=3>");\n  mix-blend-mode: overlay;\n  opacity: ${GRAIN_ALPHA};\n}`;
void exprToCss;
