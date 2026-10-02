import type { ElementType, ReactNode } from 'react';
import type { Theme, TypeSystem } from '../contracts';
export interface ThemeScopeProps { theme: Theme; type?: TypeSystem; as?: ElementType; className?: string; children?: ReactNode }
export function ThemeScope(_p: ThemeScopeProps): ReactNode { throw new Error('pendiente: P1') }
