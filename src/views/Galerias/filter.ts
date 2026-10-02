import type { RegFilter } from '../../contracts';

/** Rangos de registro (plan §3.5): Enterprise ≤ 35 · Equilibrio 36–64 · Pyme ≥ 65. Sin registro solo aparece en «Todos». */
export const regBand = (reg: number): Exclude<RegFilter, 'all'> => (reg <= 35 ? 'enterprise' : reg >= 65 ? 'pyme' : 'equilibrio');
export const matchesReg = (reg: number | null | undefined, f: RegFilter): boolean =>
  f === 'all' ? true : typeof reg === 'number' && regBand(reg) === f;
export const filterByReg = <T extends { reg: number | null }>(items: readonly T[], f: RegFilter): T[] => items.filter((i) => matchesReg(i.reg, f));
