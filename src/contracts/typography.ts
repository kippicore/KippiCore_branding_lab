export type TypeId = 'T00' | 'T02' | 'T03' | 'T06' | 'T07' | 'T09' | 'T10' | 'T11' | 'T14';

export interface FontRole {
  readonly family: string;                 // nombre exacto en Google Fonts
  readonly stack: string;                  // `"Geist", system-ui, sans-serif`
  readonly weights: readonly number[];
  readonly italic: 'native' | 'synthetic' | 'none';
  readonly singleWeight?: boolean;
}

export interface TypeSystem {
  readonly id: TypeId;
  readonly name: string;
  readonly reg: number;
  readonly concept: string;
  readonly caution: string;
  readonly display: FontRole & {
    readonly headingWeight: number;
    readonly tracking: string;             // '-0.035em'
    readonly scale: number;                // escala relativa de la spec
    readonly uppercase?: boolean;          // T10
  };
  readonly text: FontRole;
  readonly mono: FontRole & { readonly labelTracking: string };   // '0.12em' | '0.18em'
  readonly accent?: FontRole & { readonly use: string };          // T13 Caveat, T14 Playfair
  readonly googleFontsQuery: string;       // la parte después de css2?
  readonly source?: string;
}
