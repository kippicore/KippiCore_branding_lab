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
import * as A15 from './A15-marea/static'; import { paint as p15 } from './A15-marea/paint';
import * as A16 from './A16-plancton/static'; import { paint as p16 } from './A16-plancton/paint';
import * as A17 from './A17-cortina/static'; import { paint as p17 } from './A17-cortina/paint';
import * as A18 from './A18-resplandor/static'; import { paint as p18 } from './A18-resplandor/paint';
import * as A19 from './A19-esfera/static'; import { paint as p19 } from './A19-esfera/paint';
import * as A20 from './A20-ecosistema/static'; import { paint as p20 } from './A20-ecosistema/paint';

type Mod = { renderStatic: (t: Theme, o: StaticOpts) => ReactNode; css: () => string };
const PARTS: Record<AtmosphereId, [Mod, AtmosphereLayer['paint']]> = {
  A01: [A01, p01], A02: [A02, p02], A03: [A03, p03], A04: [A04, p04], A06: [A06, p06],
  A08: [A08, p08], A10: [A10, p10], A11: [A11, p11], A12: [A12, p12], A13: [A13, p13], A14: [A14, p14],
  A15: [A15, p15], A16: [A16, p16], A17: [A17, p17], A18: [A18, p18], A19: [A19, p19], A20: [A20, p20],
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
