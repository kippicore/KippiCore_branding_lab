import type { GlassId, GlassLayer, GlassModel } from '../../contracts';
import { GLASS_META } from '../../data/glass';
import cssG01 from './G01-esmerilado/glass.css?raw';
import cssG02 from './G02-liquido/glass.css?raw';
import cssG03 from './G03-acanalado/glass.css?raw';
import cssG04 from './G04-grano/glass.css?raw';
import cssG05 from './G05-ahumado/glass.css?raw';
import cssG06 from './G06-escarcha/glass.css?raw';
import cssG07 from './G07-dicroico/glass.css?raw';
import cssG08 from './G08-progresivo/glass.css?raw';
import cssG09 from './G09-grabado/glass.css?raw';
import cssG10 from './G10-vitral/glass.css?raw';
import { g01 } from './G01-esmerilado/model';
import { g02 } from './G02-liquido/model';
import { g03 } from './G03-acanalado/model';
import { g04 } from './G04-grano/model';
import { g05 } from './G05-ahumado/model';
import { g06 } from './G06-escarcha/model';
import { g07 } from './G07-dicroico/model';
import { g08 } from './G08-progresivo/model';
import { g09 } from './G09-grabado/model';
import { g10 } from './G10-vitral/model';

const PARTS: Record<GlassId, { css: string; model: GlassModel }> = {
  G01: { css: cssG01, model: g01 }, G02: { css: cssG02, model: g02 }, G03: { css: cssG03, model: g03 },
  G04: { css: cssG04, model: g04 }, G05: { css: cssG05, model: g05 }, G06: { css: cssG06, model: g06 },
  G07: { css: cssG07, model: g07 }, G08: { css: cssG08, model: g08 }, G09: { css: cssG09, model: g09 },
  G10: { css: cssG10, model: g10 },
};

export const GLASSES: readonly GlassLayer[] = GLASS_META.map((m): GlassLayer => ({
  id: m.id, name: m.name, subtitle: m.subtitle, kind: 'glass', reg: m.reg,
  description: m.description, useIn: m.useIn, avoid: m.avoid,
  defaults: m.defaults, recommendedBlur: m.recommendedBlur,
  className: `kc-glass--${m.id}`,
  css: PARTS[m.id].css,
  text: m.id === 'G05' ? 'smoke' : 'theme',
  model: PARTS[m.id].model,
}));

export const getGlass = (id: GlassId): GlassLayer => {
  const g = GLASSES.find((x) => x.id === id);
  if (!g) throw new Error(`Vidrio desconocido: ${id}`);
  return g;
};
