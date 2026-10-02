import { insetEdge, model, white } from '../model-base';
export const g01 = model({
  saturate: 1.4, brightness: 1,
  paintOverlays(ctx, _t, r) { insetEdge(ctx, r, white(0.55)); },
});
