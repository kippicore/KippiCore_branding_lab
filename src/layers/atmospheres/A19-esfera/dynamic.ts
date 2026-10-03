// A19 Esfera de partículas dinámica: miles de puntos (OGL, gl.POINTS) sobre una esfera que gira en un eje inclinado
// (90 s), filamentos que fluyen por desplazamiento de un campo de ondas, rim que respira (30 s) y polvo que se desprende (18 s).
import { Geometry, Mesh, Program, Renderer, Triangle } from 'ogl';
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { hexToRgb01 } from '../../../theme/color';
import { springStep, ThemeTween, type Spring } from '../../../runtime/motion';
import common from '../../../runtime/common.glsl?raw';
import vertex from './sphere.vert.glsl?raw';
import pointsFrag from './points.frag.glsl?raw';
import haloFrag from './halo.frag.glsl?raw';
import { breath, cloud, layout, N_DYNAMIC, sphereColors, waves, type Waves } from './sphere';

const QUAD_VERTEX = `attribute vec2 uv;attribute vec2 position;varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;
const TILT_MAX = 0.16;     // rad de parallax con el puntero
const SPRING_W = 2.2;      // rad/s: el orbe sigue al puntero con inercia lenta

const rgb = (h: Hex): number[] => [...hexToRgb01(h)];

export interface SphereGeom { cx: number; cy: number; R: number }
/** Cuadro que recibe la capa 2D que se pinta encima de la esfera (A20: células y rótulos). */
export interface OverlayFrame { t: number; size: Size; geom: SphereGeom; colors: readonly Hex[]; dark: number; tilt: readonly [number, number] }
export interface SphereOverlay {
  readonly canvas: HTMLCanvasElement | null;
  mount(host: HTMLElement): void;
  resize(size: Size, dpr: number): void;
  draw(f: OverlayFrame): void;
  dispose(): void;
}
export interface SphereOptions { layout: (s: Size) => SphereGeom; overlay?: SphereOverlay; n?: number }

export class Esfera implements DynamicLayerInstance {
  private tween: ThemeTween;
  private colors: readonly Hex[];
  private waves: Waves;
  private seed: number;
  private density: number;
  private pointer: { x: number; y: number } | null;
  private sx: Spring = { x: 0, v: 0 };
  private sy: Spring = { x: 0, v: 0 };
  private size: Size = { w: 1, h: 1 };
  private dpr = 1;
  private tMs = 0;
  private renderer: Renderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private halo: Mesh | null = null;
  private points: Mesh | null = null;
  private pointsProgram: Program | null = null;
  private haloProgram: Program | null = null;
  private lightMode = -1;

  constructor(init: DynamicInit, private opts: SphereOptions = { layout }) {
    this.tween = new ThemeTween(init.theme);
    this.colors = sphereColors(init.theme);
    this.seed = init.seed;
    this.waves = waves(init.seed);
    this.density = init.params.density;
    this.pointer = init.params.pointer;
  }
  mount(host: HTMLElement): void {
    const renderer = new Renderer({ alpha: false, antialias: false, depth: false, premultipliedAlpha: false, powerPreference: 'low-power', dpr: 1 });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.appendChild(canvas);
    this.renderer = renderer;
    this.canvas = canvas;
    const w = this.waves;
    this.haloProgram = new Program(gl, {
      vertex: QUAD_VERTEX, fragment: `${common}\n${haloFrag}`, depthTest: false, depthWrite: false, cullFace: false,
      uniforms: { uRes: { value: [1, 1] }, uDark: { value: 0 }, uBg: { value: [0, 0, 0] }, uHalo: { value: [0, 0, 0] }, uIn: { value: [0, 0, 0] },
        uRimC: { value: [0, 0, 0] }, uCenter: { value: [0, 0] }, uR: { value: 1 }, uBreath: { value: 1 } },
    });
    this.halo = new Mesh(gl, { geometry: new Triangle(gl), program: this.haloProgram });
    this.pointsProgram = new Program(gl, {
      vertex, fragment: pointsFrag, depthTest: false, depthWrite: false, cullFace: false, transparent: true,
      uniforms: { uRes: { value: [1, 1] }, uCenter: { value: [0, 0] }, uR: { value: 1 }, uPx: { value: 1 }, uTime: { value: 0 },
        uBreath: { value: 1 }, uTilt: { value: [0, 0] }, uK0: { value: w.k[0] }, uK1: { value: w.k[1] }, uK2: { value: w.k[2] },
        uPh: { value: w.ph }, uDust: { value: [0, 0, 0] }, uFil: { value: [0, 0, 0] }, uRimC: { value: [0, 0, 0] }, uEj: { value: [0, 0, 0] },
        uLightMode: { value: 0 } },
    });
    this.buildPoints();
    this.pushColors();
    this.opts.overlay?.mount(host);
  }
  resize(size: Size, dpr: number): void {
    this.size = size;
    this.dpr = dpr;
    if (!this.renderer) return;
    this.renderer.dpr = dpr;
    this.renderer.setSize(Math.max(1, Math.round(size.w)), Math.max(1, Math.round(size.h)));
    if (this.canvas) { this.canvas.style.width = '100%'; this.canvas.style.height = '100%'; }
    this.opts.overlay?.resize(size, dpr);
    this.draw();
  }
  setTheme(theme: Theme, ms: number): void {
    this.tween.set(theme, ms);
    if (ms <= 0) this.pushColors();
  }
  setParams(p: Partial<DynamicParams>): void {
    if (p.pointer !== undefined) this.pointer = p.pointer;
    if (p.density !== undefined && p.density !== this.density) { this.density = p.density; this.buildPoints(); }
  }
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.renderer) return;
    this.tMs = tMs;
    const dt = Math.min(50, Math.max(0, dtMs)) / 1000;
    const px = this.pointer ? this.pointer.x - 0.5 : 0, py = this.pointer ? this.pointer.y - 0.5 : 0;
    springStep(this.sx, px * 2 * TILT_MAX, SPRING_W, dt);
    springStep(this.sy, py * 2 * TILT_MAX, SPRING_W, dt);
    if (this.tween.update(dtMs)) this.pushColors();
    this.draw();
  }
  capture(): Promise<CanvasImageSource> {
    if (!this.renderer || !this.canvas) return Promise.reject(new Error('A19: sin superficie'));
    this.draw();
    const w = Math.max(1, Math.round(this.size.w)), h = Math.max(1, Math.round(this.size.h));
    const over = this.opts.overlay?.canvas;
    if (!over) return createImageBitmap(this.canvas, { resizeWidth: w, resizeHeight: h });
    const flat = document.createElement('canvas');      // esfera + capa 2D en una sola imagen (para el medidor)
    flat.width = w; flat.height = h;
    const ctx = flat.getContext('2d');
    if (!ctx) return Promise.reject(new Error('A19: sin 2D'));
    ctx.drawImage(this.canvas, 0, 0, w, h);
    ctx.globalCompositeOperation = this.tween.dark >= 0.5 ? 'screen' : 'multiply';
    ctx.drawImage(over, 0, 0, w, h);
    return createImageBitmap(flat);
  }
  dispose(): void {
    if (!this.renderer) return;
    this.opts.overlay?.dispose();
    this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.canvas?.remove();
    this.renderer = null; this.canvas = null; this.halo = null; this.points = null;
  }
  inspectColors(): readonly Hex[] { return this.colors; }

  private buildPoints(): void {
    if (!this.renderer || !this.pointsProgram) return;
    const gl = this.renderer.gl;
    const n = Math.max(500, Math.round((this.opts.n ?? N_DYNAMIC) * Math.min(1.5, Math.max(0.5, this.density))));
    const c = cloud(this.seed, n);
    this.points?.geometry.remove();
    const geometry = new Geometry(gl, { position: { size: 3, data: c.pos }, aRand: { size: 4, data: c.rand } });
    this.points = new Mesh(gl, { geometry, program: this.pointsProgram, mode: gl.POINTS });
  }
  private pushColors(): void {
    this.colors = sphereColors(this.tween.current);
    const hp = this.haloProgram?.uniforms, pp = this.pointsProgram?.uniforms;
    if (!hp || !pp) return;
    const [bg, dust, fil, halo, rimD, rimL] = this.colors.map(rgb) as number[][];
    const dark = this.tween.dark;
    const rimC = rimD!.map((v, i) => rimL![i]! + (v - rimL![i]!) * dark);
    hp.uBg!.value = bg; hp.uHalo!.value = halo; hp.uIn!.value = fil; hp.uRimC!.value = rimC; hp.uDark!.value = dark;
    pp.uDust!.value = dust; pp.uFil!.value = fil; pp.uRimC!.value = rimC; pp.uEj!.value = halo;
  }
  private draw(): void {
    const r = this.renderer, hp = this.haloProgram, pp = this.pointsProgram;
    if (!r || !hp || !pp || !this.halo || !this.points || !this.canvas) return;
    const gl = r.gl;
    const k = this.canvas.width / Math.max(1, this.size.w);
    const geom = this.opts.layout(this.size), { cx, cy, R } = geom;
    const t = this.tMs / 1000;
    const b = breath(t);
    const light = this.tween.dark < 0.5 ? 1 : 0;
    if (light !== this.lightMode) {                    // blendMode discreto: cambia en el punto medio del tween
      this.lightMode = light;
      if (light) pp.setBlendFunc(gl.ZERO, gl.SRC_COLOR); else pp.setBlendFunc(gl.ONE, gl.ONE);
      pp.uniforms.uLightMode!.value = light;
    }
    const res = [this.canvas.width, this.canvas.height], center = [cx * k, cy * k];
    hp.uniforms.uRes!.value = res; hp.uniforms.uCenter!.value = center; hp.uniforms.uR!.value = R * k; hp.uniforms.uBreath!.value = b;
    const u = pp.uniforms;
    u.uRes!.value = res; u.uCenter!.value = center; u.uR!.value = R * k; u.uBreath!.value = b; u.uTime!.value = t;
    u.uPx!.value = this.dpr * Math.min(1.35, Math.max(0.7, R / 260));
    u.uTilt!.value = [this.sx.x, this.sy.x];
    r.render({ scene: this.halo });
    r.render({ scene: this.points, clear: false });
    this.opts.overlay?.draw({ t, size: this.size, geom, colors: this.colors, dark: this.tween.dark, tilt: [this.sx.x, this.sy.x] });
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Esfera(init, { layout });
