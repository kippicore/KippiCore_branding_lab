import { describe, expect, it } from 'vitest';
import { themeA, themeB } from '../../../test/two-themes';
import { create } from './dynamic';
import { paint } from './paint';
import { scene } from './static';
import { createRecordingContext } from '../../../test/recording-context';

const init = (seed = 1, theme = themeA) => ({ theme, seed, params: { speed: 1, density: 1, pointer: null } });

describe('A17 Cortina boreal', () => {
  it('la escena estática es determinista por semilla', () => {
    expect(scene(3)).toEqual(scene(3));
    expect(scene(3).stars).not.toEqual(scene(4).stars);
  });
  it('frame sin montar no falla y es determinista', () => {
    const a = create(init(5)), b = create(init(5));
    a.frame(1000, 16); b.frame(1000, 16);
    expect(a.inspectColors!()).toEqual(b.inspectColors!());
  });
  it('inspectColors cambia por completo tras setTheme(B, 0)', () => {
    const inst = create(init());
    const before = inst.inspectColors!();
    inst.setTheme(themeB, 0);
    const after = inst.inspectColors!();
    expect(after.length).toBe(before.length);
    after.forEach((c, i) => expect(c).not.toBe(before[i]));
    expect(after.every((c) => /^#[0-9A-F]{6}$/.test(c))).toBe(true);
  });
  it('paint dibuja sin error', async () => {
    const r = createRecordingContext();
    await paint(r.ctx, themeA, { w: 480, h: 300 }, { seed: 1 });
  });
});
