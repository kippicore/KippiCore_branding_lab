import { model } from '../model-base';
/** máscara del CSS: negro al 100 % hasta el 35 % y luego lineal hasta .25 abajo. */
export const g08 = model({
  saturate: 1.4, brightness: 1,
  blurMaskAt: (y) => (y <= 0.35 ? 1 : 1 - 0.75 * ((Math.min(1, y) - 0.35) / 0.65)),
});
