import type { AtmosphereId, AtmosphereLayer, StaticOpts, Theme } from '../../contracts';
import type { ReactNode } from 'react';
import { ATMOSPHERE_META } from '../../data/atmospheres';
import { DYNAMIC_ATMOSPHERES } from './dynamic-registry';
import * as A01 from './A01-aurora/static'; import { paint as p01 } from './A01-aurora/paint';
import * as A02 from './A02-malla/static'; import { paint as p02 } from './A02-malla/paint';
import * as A03 from './A03-grano/static'; import { paint as p03 } from './A03-grano/paint';
import * as A04 from './A04-bokeh/static'; import { paint as p04 } from './A04-bokeh/paint';
import * as A06 from './A06-haz/static'; import { paint as p06 } from './A06-haz/paint';
import * as A08 from './A08-seda/static'; import { paint as p08 } from './A08-seda/paint';
import * as A10 from './A10-plasma/static'; import { paint as p10 } from './A10-plasma/paint';
import * as A11 from './A11-rejilla/static'; import { paint as p11 } from './A11-rejilla/paint';
import * as A12 from './A12-manchas/static'; import { paint as p12 } from './A12-manchas/paint';
import * as A13 from './A13-tipografia/static'; import { paint as p13 } from './A13-tipografia/paint';
import * as A14 from './A14-datos/static'; import { paint as p14 } from './A14-datos/paint';

type Mod = { renderStatic: (t: Theme, o: StaticOpts) => ReactNode; css: () => string };
const PARTS: Record<AtmosphereId, [Mod, AtmosphereLayer['paint']]> = {
  A01: [A01, p01], A02: [A02, p02], A03: [A03, p03], A04: [A04, p04], A06: [A06, p06],
  A08: [A08, p08], A10: [A10, p10], A11: [A11, p11], A12: [A12, p12], A13: [A13, p13], A14: [A14, p14],
};

export const ATMOSPHERES: readonly AtmosphereLayer[] = ATMOSPHERE_META.map((m) => {
  const [mod, paint] = PARTS[m.id];
  return {
    id: m.id, name: m.name, subtitle: m.subtitle, kind: 'atmosphere', reg: m.reg, description: m.description, weight: m.weight,
    renderStatic: mod.renderStatic, paint, staticCss: mod.css, dynamic: DYNAMIC_ATMOSPHERES[m.id],
  } satisfies AtmosphereLayer;
});

export const getAtmosphere = (id: AtmosphereId): AtmosphereLayer => {
  const a = ATMOSPHERES.find((x) => x.id === id);
  if (!a) throw new Error(`Atmósfera desconocida: ${id}`);
  return a;
};
