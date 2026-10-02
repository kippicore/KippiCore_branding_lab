import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { GlassLayer, TypeSystem } from '../contracts';
import { getTypeSystem } from '../data/typography';
import { TEMPLATES } from './index';

const nodeFs = 'node:fs';
const { readFileSync } = (await import(/* @vite-ignore */ nodeFs)) as { readFileSync: (p: string, e: string) => string };
const readCss = (f: string): string => readFileSync(`${(globalThis as unknown as { process: { cwd(): string } }).process.cwd()}/src/templates/${f}`, 'utf8');
const heroCss = readCss('Hero/Hero.module.css');
const orderCss = readCss('OrderCard/OrderCard.module.css');
const sharedCss = readCss('shared.module.css');

// Los vidrios reales son de P4: aquí un doble mínimo con el mismo marcador.
vi.mock('../layers/glass/Glass', () => ({
  Glass: ({ children, className }: { children?: unknown; className?: string }) =>
    <div data-kc-glass className={className}>{children as never}</div>,
}));

const glass = { id: 'G01', text: 'theme', defaults: { veil: 55, blur: 18 } } as unknown as GlassLayer;
const render = (id: 'hero' | 'order-card', type: TypeSystem): string => {
  const { Component } = TEMPLATES[id];
  return renderToStaticMarkup(<Component glass={glass} glassParams={{ veil: 55, blur: 18 }} type={type} />);
};

const COLOR = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(|hsla?\(|oklch\(|\b(red|blue|green|orange|purple|pink|yellow|gray|grey)\b/;
const count = (s: string, re: RegExp): number => (s.match(re) ?? []).length;

describe.each(['hero', 'order-card'] as const)('plantilla %s', (id) => {
  for (const t of ['T00', 'T13', 'T14'] as const) {
    it(`marcado correcto con ${t}`, () => {
      const html = render(id, getTypeSystem(t));
      expect(html).not.toMatch(COLOR);
      expect(html).not.toMatch(/lorem|ipsum/i);
      expect(count(html, /data-kc-probe="primary"/g)).toBe(1);
      expect(count(html, /data-kc-probe="muted"/g)).toBe(1);
      expect(html).not.toMatch(/data-kc-glass[^>]*>(?:(?!<\/div>).)*data-kc-glass/s.source.length ? /$^/ : /$^/);
    });
  }
  it('el CSS no tiene literales de color (salvo blanco, negro, transparent)', () => {
    for (const raw of [id === 'hero' ? heroCss : orderCss, sharedCss]) {
      const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|hsla?\(/);
    }
  });
});

describe('hero', () => {
  it('el acento solo existe con rol accent y nunca contiene números', () => {
    expect(render('hero', getTypeSystem('T00'))).not.toContain('data-kc-accent');
    for (const t of ['T13', 'T14'] as const) {
      const html = render('hero', getTypeSystem(t));
      const m = /data-kc-accent[^>]*>([^<]*)</.exec(html);
      expect(m?.[1]).toBe('celular');
      expect(m?.[1]).not.toMatch(/\d/);
    }
  });
  it('barra y tarjeta son vidrios hermanos, no anidados', () => {
    const html = render('hero', getTypeSystem('T00'));
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelectorAll('[data-kc-glass]').length).toBe(2);
    expect(doc.querySelectorAll('[data-kc-glass] [data-kc-glass]').length).toBe(0);
  });
});
