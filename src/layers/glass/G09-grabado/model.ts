import { model } from '../model-base';
/** (x, y) en px locales al vidrio. Rayas a 135°: 22 px de vidrio, 2 px de grabado nítido cada 24. */
export const g09 = model({
  saturate: 1.3, brightness: 1,
  sharpAt: (x, y) => ((((x + y) * Math.SQRT1_2) % 24) + 24) % 24 >= 22,
});
