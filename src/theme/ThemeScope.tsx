import { useMemo, type CSSProperties, type ElementType, type ReactNode } from 'react';
import type { Theme, TypeSystem } from '../contracts';
import { COLOR_VARS, registerThemeProperties, toCssVars } from './css-vars';

export interface ThemeScopeProps { theme: Theme; type?: TypeSystem; as?: ElementType; className?: string; children?: ReactNode }

const TRANSITION = COLOR_VARS.map((n) => `${n} 500ms ease`).join(', ');

/** Aplica las variables --kc-* como style y data-kc-mode; los colores registrados transicionan 500 ms. */
export function ThemeScope({ theme, type, as, className, children }: ThemeScopeProps): ReactNode {
  registerThemeProperties();
  const style = useMemo(
    () => ({ ...toCssVars(theme, type), transition: TRANSITION }) as CSSProperties,
    [theme, type],
  );
  const Tag: ElementType = as ?? 'div';
  return <Tag className={className} style={style} data-kc-mode={theme.mode}>{children}</Tag>;
}
