import type { Derived, Roles, Theme, ToneScale, ToneStep } from '../contracts';
import { lerpOklch } from './oklch';
import { buildTheme, TONE_STEPS } from './derive';

const lerpScale = (a: ToneScale, b: ToneScale, t: number): ToneScale => {
  const out = {} as Record<ToneStep, ToneScale[ToneStep]>;
  for (const s of TONE_STEPS) out[s] = lerpOklch(a[s], b[s], t);
  return out;
};

/** Interpola cada color del tema en OKLCH (t=0 → a, t=1 → b). Lo no cromático (modo, mezcla,
 *  paletteId, accentIsFillOnly) salta a los valores de `b` al pasar de la mitad. */
export const lerpTheme = (a: Theme, b: Theme, t: number): Theme => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const half = t < 0.5 ? a : b;
  const roles = {} as Record<keyof Roles, string>;
  for (const k of Object.keys(a.roles) as (keyof Roles)[]) roles[k] = lerpOklch(a.roles[k], b.roles[k], t);
  const da = a.derived, db = b.derived;
  const L = (x: keyof Derived & ('onPrimary' | 'onAccent' | 'accentAsText' | 'glow' | 'glow2' | 'glowMix' | 'ambient' | 'bgDeep' | 'smokeBase' | 'onSmoke' | 'mutedOnSmoke')) =>
    lerpOklch(da[x], db[x], t);
  const derived: Derived = {
    onPrimary: L('onPrimary'), onAccent: L('onAccent'), accentAsText: L('accentAsText'),
    accentIsFillOnly: half.derived.accentIsFillOnly,
    glow: L('glow'), glow2: L('glow2'), glowMix: L('glowMix'), ambient: L('ambient'), bgDeep: L('bgDeep'),
    smokeBase: da.smokeBase, onSmoke: L('onSmoke'), mutedOnSmoke: L('mutedOnSmoke'),
    blendMode: half.derived.blendMode,
    scales: { primary: lerpScale(da.scales.primary, db.scales.primary, t), accent: lerpScale(da.scales.accent, db.scales.accent, t) },
  };
  return buildTheme(half.paletteId, half.mode, roles as unknown as Roles, derived);
};
