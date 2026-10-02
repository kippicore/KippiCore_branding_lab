import type {
  AtmosphereLayer, Derived, GlassLayer, GlassParams, LabState, Palette, Roles, Theme, TypeSystem,
} from '../contracts';
import { comboCode, serializeState } from '../lib/url-state';
import { getPalette } from '../data/palettes';
import { toCssVars } from '../theme/css-vars';

export interface TokenBundle {
  code: string;
  url: string;
  mode: Theme['mode'];
  palette: { id: Palette['id']; name: string; roles: Roles; derived: Omit<Derived, 'scales'>; scales: Derived['scales'] };
  typography: {
    id: TypeSystem['id']; name: string; display: TypeSystem['display']; text: TypeSystem['text'];
    mono: TypeSystem['mono']; accent?: TypeSystem['accent']; googleFontsQuery: string;
  };
  atmosphere: { id: string; name: string; css: string };
  glass: { id: string; name: string; veil: number; blur: number; css: string };
  /** Variables --kc-* ya resueltas (las mismas que aplica ThemeScope). */
  vars: Record<string, string>;
}

export interface TokenInput {
  theme: Theme; type: TypeSystem; atmosphere: AtmosphereLayer; glass: GlassLayer; params: GlassParams; state: LabState;
}

export function buildTokenBundle({ theme, type, atmosphere, glass, params, state }: TokenInput): TokenBundle {
  const { scales, ...derived } = theme.derived;
  return {
    code: comboCode(state),
    url: `/${serializeState(state)}`,
    mode: theme.mode,
    palette: { id: theme.paletteId, name: paletteName(theme), roles: theme.roles, derived, scales },
    typography: {
      id: type.id, name: type.name, display: type.display, text: type.text, mono: type.mono,
      ...(type.accent ? { accent: type.accent } : {}), googleFontsQuery: type.googleFontsQuery,
    },
    atmosphere: { id: atmosphere.id, name: atmosphere.name, css: atmosphere.staticCss() },
    glass: { id: glass.id, name: glass.name, veil: params.veil, blur: params.blur, css: glass.css },
    vars: toCssVars(theme, type),
  };
}

// El Theme no lleva el nombre de la paleta; se resuelve de forma diferida para no acoplar el contrato.
const paletteName = (t: Theme): string => { try { return getPalette(t.paletteId).name; } catch { return t.paletteId; } };

export const tokenFileName = (b: Pick<TokenBundle, 'code' | 'mode'>, ext: 'css' | 'json'): string =>
  `kippicore-${b.code.split(' · ').join('-')}-${b.mode}.${ext}`;

const ROLE_ORDER = ['bg', 'surface', 'ink', 'muted', 'primary', 'accent'] as const;

/** CSS listo para pegar: cabecera, @import de fuentes, :root con todas las variables y el CSS del vidrio. */
export function toCssFile(b: TokenBundle): string {
  const vars = Object.entries(b.vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const roles = ROLE_ORDER.map((r) => `${r} ${b.palette.roles[r]}`).join(' · ');
  return [
    '/*',
    ` * KippiCore · ${b.code} · ${b.mode === 'dark' ? 'oscuro' : 'claro'}`,
    ` * ${b.palette.name} / ${b.typography.name} / ${b.atmosphere.name} / ${b.glass.name}`,
    ` * Reproducir: ${b.url}`,
    ` * Roles: ${roles}`,
    ' */',
    `@import url('https://fonts.googleapis.com/css2?${b.typography.googleFontsQuery}&display=swap');`,
    '',
    ':root {',
    vars,
    `  --kc-glass-veil: ${b.glass.veil}%;`,
    `  --kc-glass-blur: ${b.glass.blur}px;`,
    '}',
    '',
    `/* Atmósfera ${b.atmosphere.id} */`,
    b.atmosphere.css.trim(),
    '',
    `/* Vidrio ${b.glass.id} */`,
    b.glass.css.trim(),
    '',
  ].join('\n');
}

export const toJsonFile = (b: TokenBundle): string => JSON.stringify(b, null, 2);
