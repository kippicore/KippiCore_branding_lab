// A11 Rejilla iluminada dinámica (MOTION.md §6): CSS para el dibujo + resortes en JS para el foco.
import type { DynamicInit, DynamicLayerInstance, DynamicParams, Hex, Size, Theme } from '../../../contracts';
import { clamp01, easeInOut, springStep, ThemeTween, type Spring } from '../../../runtime/motion';

const SPOT = { x: 0.65, y: 0.4 };                 // posición estática del foco
const GRID = 44;
const OMEGA_MASK = 7.0, OMEGA_LIGHT = 4.5;
const IDLE_MS = 2500, HANDOFF_MS = 1500;
const TAU = Math.PI * 2;

export const rejillaColors = (t: Theme): readonly [Hex, Hex, Hex] => [t.roles.ink, t.derived.glow, t.derived.glow2];

class Rejilla implements DynamicLayerInstance {
  private tween: ThemeTween;
  private size: Size = { w: 640, h: 400 };
  private root: HTMLDivElement | null = null;
  private light!: HTMLDivElement; private light2!: HTMLDivElement;
  private mx: Spring; private my: Spring; private lx: Spring; private ly: Spring;
  private pointer: { x: number; y: number } | null = null;
  private lastPointer = { x: SPOT.x, y: SPOT.y };
  private idleMs = Infinity;          // sin puntero desde el inicio: deambula desde t = 0
  private handoff = 1;                // 0 = cursor, 1 = deambulación
  private written = new Map<string, string>();
  private colors: readonly Hex[];
  private r = 0;
  private lightAlpha = 0.55;
  constructor(init: DynamicInit) {
    this.tween = new ThemeTween(init.theme);
    this.colors = rejillaColors(init.theme);
    this.pointer = init.params.pointer;
    const w = this.size.w, h = this.size.h;
    this.mx = { x: SPOT.x * w, v: 0 }; this.my = { x: SPOT.y * h, v: 0 };
    this.lx = { x: SPOT.x * w, v: 0 }; this.ly = { x: SPOT.y * h, v: 0 };
  }
  mount(host: HTMLElement): void {
    const root = document.createElement('div');
    root.style.cssText = 'position:absolute;inset:0;overflow:hidden';
    const mk = (css: string): HTMLDivElement => { const d = document.createElement('div'); d.style.cssText = `position:absolute;${css}`; root.appendChild(d); return d; };
    const mask = 'radial-gradient(circle var(--r) at var(--mx) var(--my), #000000 0, transparent 100%)';
    const maskDots = 'radial-gradient(circle calc(var(--r) * 0.35) at var(--mx) var(--my), #000000 0, transparent 100%)';
    mk(`inset:0;background-image:linear-gradient(to right,color-mix(in oklab,var(--c-ink) 14%,transparent) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in oklab,var(--c-ink) 14%,transparent) 1px,transparent 1px);background-size:${GRID}px ${GRID}px;-webkit-mask-image:${mask};mask-image:${mask}`);
    mk(`inset:0;background-image:radial-gradient(circle,color-mix(in oklab,var(--c-ink) 30%,transparent) 1.5px,transparent 1.6px);background-size:${GRID}px ${GRID}px;-webkit-mask-image:${maskDots};mask-image:${maskDots}`);
    this.light = mk('left:65%;top:40%;translate:-50% -50%;will-change:transform;background:radial-gradient(circle,var(--c-accent) 0,transparent 68%)');
    this.light2 = mk('left:95%;top:95%;translate:-50% -50%;will-change:transform;background:radial-gradient(circle,var(--c-primary) 0,transparent 68%)');
    this.light2.style.opacity = '0.5';
    host.appendChild(root);
    this.root = root;
    this.applyColors();
    this.layout();
    this.writeAll(0);
  }
  resize(size: Size, _dpr: number): void {
    const prev = this.size;
    this.size = size;
    // Los resortes conservan su posición relativa: el foco no salta al redimensionar.
    for (const [s, k] of [[this.mx, size.w / prev.w], [this.lx, size.w / prev.w], [this.my, size.h / prev.h], [this.ly, size.h / prev.h]] as const) { s.x *= k; }
    this.layout();
    this.writeAll(0);
  }
  setTheme(theme: Theme, ms: number): void { this.tween.set(theme, ms); if (ms <= 0) this.applyColors(); }
  setParams(p: Partial<DynamicParams>): void {
    if (p.pointer !== undefined) {
      this.pointer = p.pointer;
      if (p.pointer) { this.handoff = 0; this.idleMs = 0; this.lastPointer = p.pointer; }
    }
  }
  start(): void {}
  stop(): void {}
  frame(tMs: number, dtMs: number): void {
    if (!this.root) return;
    if (this.tween.update(dtMs)) this.applyColors();
    const dt = dtMs / 1000;
    const { w, h } = this.size;
    // Objetivo: cursor, o mezcla cursor → deambulación (1.5 s) tras 2.5 s sin puntero.
    if (this.pointer) { this.idleMs = 0; this.handoff = 0; this.lastPointer = this.pointer; }
    else { this.idleMs += dtMs; if (this.idleMs > IDLE_MS) this.handoff = clamp01(this.handoff + dtMs / HANDOFF_MS); }
    const t = tMs / 1000;
    const wander = { x: SPOT.x + 0.14 * Math.sin((TAU * t) / 29), y: SPOT.y + 0.1 * Math.sin((TAU * t) / 37) };
    const k = easeInOut(this.handoff);
    const src = this.pointer ?? this.lastPointer;
    const tx = Math.min(1.1, Math.max(-0.1, src.x + (wander.x - src.x) * k));
    const ty = Math.min(1.1, Math.max(-0.1, src.y + (wander.y - src.y) * k));
    springStep(this.mx, tx * w, OMEGA_MASK, dt); springStep(this.my, ty * h, OMEGA_MASK, dt);
    springStep(this.lx, tx * w, OMEGA_LIGHT, dt); springStep(this.ly, ty * h, OMEGA_LIGHT, dt);
    this.writeAll(t);
  }
  async capture(): Promise<CanvasImageSource> {
    const { w, h } = this.size;
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w)); out.height = Math.max(1, Math.round(h));
    const c = out.getContext('2d');
    if (!c) return out;
    const th = this.tween.current;
    c.fillStyle = th.roles.bg; c.fillRect(0, 0, w, h);
    // Rejilla enmascarada.
    const g = document.createElement('canvas'); g.width = out.width; g.height = out.height;
    const gc = g.getContext('2d');
    if (gc) {
      gc.strokeStyle = th.roles.ink; gc.globalAlpha = 0.14; gc.lineWidth = 1;
      for (let x = 0; x <= w; x += GRID) { gc.beginPath(); gc.moveTo(x + 0.5, 0); gc.lineTo(x + 0.5, h); gc.stroke(); }
      for (let y = 0; y <= h; y += GRID) { gc.beginPath(); gc.moveTo(0, y + 0.5); gc.lineTo(w, y + 0.5); gc.stroke(); }
      gc.globalAlpha = 1; gc.globalCompositeOperation = 'destination-in';
      const m = gc.createRadialGradient(this.mx.x, this.my.x, 0, this.mx.x, this.my.x, Math.max(1, this.r));
      m.addColorStop(0, '#000000'); m.addColorStop(1, 'rgba(0,0,0,0)');
      gc.fillStyle = m; gc.fillRect(0, 0, w, h);
      c.drawImage(g, 0, 0);
    }
    const lamp = (cx: number, cy: number, d: number, col: Hex, a: number): void => {
      const rr = 0.4808 * d;
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, rr);
      gr.addColorStop(0, col); gr.addColorStop(1, col + '00');
      c.globalAlpha = a; c.fillStyle = gr; c.fillRect(cx - rr, cy - rr, 2 * rr, 2 * rr); c.globalAlpha = 1;
    };
    lamp(this.lx.x, this.ly.x, 0.7 * w, th.derived.glow, this.lightAlpha);
    lamp(0.95 * w, 0.95 * h, 0.5 * w, th.derived.glow2, 0.5);
    return out;
  }
  dispose(): void { this.root?.remove(); this.root = null; this.written.clear(); }
  inspectColors(): readonly Hex[] { return this.colors; }

  private applyColors(): void {
    this.colors = rejillaColors(this.tween.current);
    const r = this.root;
    if (!r) return;
    r.style.setProperty('--c-ink', this.colors[0]!);
    r.style.setProperty('--c-accent', this.colors[1]!);
    r.style.setProperty('--c-primary', this.colors[2]!);
  }
  /** Dimensiones dependientes del tamaño: radio explícito de la máscara y lado de las luces. */
  private layout(): void {
    const { w, h } = this.size;
    // 60 % de la distancia a la esquina más lejana desde la posición estática (65 %, 40 %).
    const far = Math.hypot(Math.max(SPOT.x, 1 - SPOT.x) * w, Math.max(SPOT.y, 1 - SPOT.y) * h);
    this.r = 0.6 * far;
    this.root?.style.setProperty('--r', `${this.r.toFixed(1)}px`);
    this.light.style.width = this.light.style.height = `${(0.7 * w).toFixed(1)}px`;
    this.light2.style.width = this.light2.style.height = `${(0.5 * w).toFixed(1)}px`;
  }
  private writeAll(t: number): void {
    const r = this.root;
    if (!r) return;
    const { w, h } = this.size;
    const q = (v: number): string => (Math.round(v * 10) / 10).toFixed(1);
    const px = (key: string, v: string): void => { if (this.written.get(key) !== v) { this.written.set(key, v); r.style.setProperty(key, v); } };
    px('--mx', `${q(this.mx.x)}px`); px('--my', `${q(this.my.x)}px`);
    // La luz se desplaza con transform (sin layout) respecto a su posición estática.
    const tx = this.lx.x - SPOT.x * w, ty = this.ly.x - SPOT.y * h;
    // Protección del texto: α baja de .55 a .35 al entrar en el 45 % izquierdo (franja del 10 %).
    const overlap = clamp01((0.45 * w - this.lx.x) / (0.1 * w));
    this.lightAlpha = 0.55 - 0.2 * overlap;
    const lt = `translate3d(${q(tx)}px, ${q(ty)}px, 0)`;
    if (this.written.get('lt') !== lt) { this.written.set('lt', lt); this.light.style.transform = lt; }
    const la = this.lightAlpha.toFixed(3);
    if (this.written.get('la') !== la) { this.written.set('la', la); this.light.style.opacity = la; }
    // Luz secundaria: deriva sola ±3 % con periodos 47 s / 59 s.
    const l2 = `translate3d(${q(0.03 * w * Math.sin((TAU * t) / 47))}px, ${q(0.03 * h * Math.sin((TAU * t) / 59))}px, 0)`;
    if (this.written.get('l2') !== l2) { this.written.set('l2', l2); this.light2.style.transform = l2; }
  }
}

export const create = (init: DynamicInit): DynamicLayerInstance => new Rejilla(init);
