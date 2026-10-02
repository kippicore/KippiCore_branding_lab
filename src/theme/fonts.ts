import type { FontRole, TypeSystem } from '../contracts';

const injected = new Set<string>();

/** Inyecta un <link> de Google Fonts por sistema (una sola vez) y espera a que carguen los roles. */
export const ensureFonts = async (t: TypeSystem): Promise<void> => {
  if (typeof document === 'undefined') return;
  const id = `kc-fonts-${t.id}`;
  if (!injected.has(id) && !document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${t.googleFontsQuery}&display=swap`;
    document.head.appendChild(link);
  }
  injected.add(id);
  if (!document.fonts?.load) return;
  const roles: FontRole[] = [t.display, t.text, t.mono, ...(t.accent ? [t.accent] : [])];
  const loads = roles.map((r) => {
    const w = r === t.display ? t.display.headingWeight : (r.weights[0] ?? 400);
    return document.fonts.load(`${w} 16px "${r.family}"`).catch(() => []);
  });
  await Promise.all(loads);
};
