export type Hex = `#${string}`;                    // siempre #RRGGBB en mayúsculas
export type Mode = 'light' | 'dark';
export type RoleKey = 'bg' | 'surface' | 'ink' | 'muted' | 'primary' | 'accent';
export type Roles = Readonly<Record<RoleKey, Hex>>;

export type PaletteId =
  | 'C01' | 'C02' | 'C03' | 'C04' | 'C05' | 'C06' | 'C07' | 'C08' | 'C09' | 'C10' | 'C11'
  | 'C12' | 'C13' | 'C14' | 'C15' | 'C16' | 'C17' | 'C18' | 'C19' | 'C20' | 'C21' | 'C22';

export interface Palette {
  readonly id: PaletteId;
  readonly name: string;
  readonly reg: number;                            // 0 enterprise … 100 pyme
  readonly concept: string;
  readonly risk: string;
  readonly light: Roles;
  readonly dark: Roles;
}

export type ToneStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type ToneScale = Readonly<Record<ToneStep, Hex>>;

export interface Derived {
  readonly onPrimary: Hex;          // el de más contraste entre #FFFFFF, ink y bg
  readonly onAccent: Hex;           // ídem
  readonly accentAsText: Hex;       // accent si contraste(accent, bg) ≥ 4.5; si no, primary
  readonly accentIsFillOnly: boolean;
  readonly glow: Hex;               // = accent
  readonly glow2: Hex;              // = primary
  readonly glowMix: Hex;            // = mix(accent, primary, .5)
  readonly ambient: Hex;            // = mix(accent, bg, .2)
  readonly bgDeep: Hex;             // dark: mix(bg, #000000, .65); light: = bg   (A05)
  readonly smokeBase: Hex;          // = #0B0D12 (constante única, G05)
  readonly onSmoke: Hex;            // = mix(#FFFFFF, ink, .92)
  readonly mutedOnSmoke: Hex;       // = mix(#FFFFFF, muted, .72)
  readonly blendMode: 'screen' | 'multiply';   // dark → screen; light → multiply
  readonly scales: { readonly primary: ToneScale; readonly accent: ToneScale };
}

export type Rgb01 = readonly [number, number, number];  // sRGB gamma, 0..1 (para shaders)

export type ThemeColorKey = RoleKey | 'glow' | 'glow2' | 'glowMix' | 'ambient' | 'bgDeep'
  | 'onPrimary' | 'onAccent' | 'accentAsText' | 'onSmoke' | 'mutedOnSmoke';

export interface Theme {
  readonly paletteId: PaletteId;
  readonly mode: Mode;
  readonly roles: Roles;
  readonly derived: Derived;
  readonly rgb: Readonly<Record<ThemeColorKey, Rgb01>>;
  readonly cssVars: Readonly<Record<`--kc-${string}`, string>>;   // ver §4.1.1
}
