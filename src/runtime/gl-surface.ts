// Superficie WebGL de pantalla completa (OGL: un triángulo + un Program) compartida por A01 y A10.
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import type { Size } from '../contracts';
import common from './common.glsl?raw';

const VERTEX = `attribute vec2 uv;attribute vec2 position;varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;

export type Uniforms = Record<string, { value: unknown }>;

export interface GlSurface {
  readonly canvas: HTMLCanvasElement;
  readonly uniforms: Uniforms;
  /** Tamaño CSS y dpr; el backing store = css × dpr × renderScale. */
  setSize(size: Size, dpr: number): void;
  draw(): void;
  /** Cuadro actual a resolución CSS (dpr 1). Dibuja y captura en la misma tarea (sin preserveDrawingBuffer). */
  capture(size: Size): Promise<ImageBitmap>;
  dispose(): void;
}

export function createGlSurface(host: HTMLElement, fragment: string, uniforms: Uniforms, renderScale: number): GlSurface {
  const renderer = new Renderer({
    alpha: false, antialias: false, depth: false, premultipliedAlpha: false, powerPreference: 'low-power', dpr: 1,
  });
  const gl = renderer.gl;
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  host.appendChild(canvas);
  const all: Uniforms = { uRes: { value: [1, 1] }, ...uniforms };
  const program = new Program(gl, { vertex: VERTEX, fragment: `${common}\n${fragment}`, uniforms: all, depthTest: false, cullFace: false });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  let disposed = false;
  return {
    canvas,
    uniforms: all,
    setSize(size, dpr) {
      if (disposed) return;
      renderer.dpr = dpr * renderScale;
      renderer.setSize(Math.max(1, Math.round(size.w)), Math.max(1, Math.round(size.h)));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      all.uRes!.value = [canvas.width, canvas.height];
    },
    draw() { if (!disposed) renderer.render({ scene: mesh }); },
    capture(size) {
      this.draw();
      return createImageBitmap(canvas, { resizeWidth: Math.max(1, Math.round(size.w)), resizeHeight: Math.max(1, Math.round(size.h)) });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
  };
}
