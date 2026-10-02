import type { Theme, TypeSystem } from '../contracts';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/** Nombres (sin el prefijo --kc-) de las variables de color registradas como <color>. */
const COLOR_VAR_NAMES = [
  'bg', 'surface', 'ink', 'muted', 'primary', 'accent', 'on-primary', 'on-accent', 'accent-text', 'glow', 'glow-2',
  'glow-mix', 'ambient', 'bg-deep', 'smoke-base', 'on-smoke', 'muted-on-smoke',
  ...STEPS.map((s) => `primary-${s}`), ...STEPS.map((s) => `accent-${s}`),
] as const;
export const COLOR_VARS: readonly string[] = COLOR_VAR_NAMES.map((n) => `--kc-${n}`);

export const toCssVars = (theme: Theme, type?: TypeSystem): Record<string, string> => {
  const { roles: r, derived: d } = theme;
  const v: Record<string, string> = {
    '--kc-bg': r.bg, '--kc-surface': r.surface, '--kc-ink': r.ink, '--kc-muted': r.muted,
    '--kc-primary': r.primary, '--kc-accent': r.accent,
    '--kc-on-primary': d.onPrimary, '--kc-on-accent': d.onAccent, '--kc-accent-text': d.accentAsText,
    '--kc-glow': d.glow, '--kc-glow-2': d.glow2, '--kc-glow-mix': d.glowMix, '--kc-ambient': d.ambient,
    '--kc-bg-deep': d.bgDeep, '--kc-smoke-base': d.smokeBase, '--kc-on-smoke': d.onSmoke,
    '--kc-muted-on-smoke': d.mutedOnSmoke,
    '--kc-blend': d.blendMode, '--kc-mode': theme.mode,
  };
  for (const s of STEPS) {
    v[`--kc-primary-${s}`] = d.scales.primary[s];
    v[`--kc-accent-${s}`] = d.scales.accent[s];
  }
  if (type) {
    v['--kc-font-display'] = type.display.stack;
    v['--kc-font-text'] = type.text.stack;
    v['--kc-font-mono'] = type.mono.stack;
    v['--kc-font-accent'] = type.accent ? type.accent.stack : type.text.stack;
    v['--kc-display-weight'] = String(type.display.headingWeight);
    v['--kc-display-tracking'] = type.display.tracking;
    v['--kc-display-scale'] = String(type.display.scale);
    v['--kc-display-transform'] = type.display.uppercase ? 'uppercase' : 'none';
    v['--kc-label-tracking'] = type.mono.labelTracking;
  }
  return v;
};

let registered = false;
/** Registra las variables de color como <color> para poder interpolarlas con transition. Idempotente. */
export const registerThemeProperties = (): void => {
  if (registered) return;
  registered = true;
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return;
  for (const name of COLOR_VARS) {
    try {
      CSS.registerProperty({ name, syntax: '<color>', inherits: true, initialValue: '#000000' });
    } catch {
      // ya registrada o sin soporte
    }
  }
};

