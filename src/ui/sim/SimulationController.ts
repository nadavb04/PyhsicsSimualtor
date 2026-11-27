/**
 * Imperative bridge between React and the engine: owns the runner, the
 * requestAnimationFrame loop and the canvas. React talks to it via the
 * `useSimulation` hook and reads `status` through useSyncExternalStore.
 */
import { simulate } from '@/engine/headless';
import { SimulationRunner, type RunStatus } from '@/engine/loop';
import type { BaseSimState, Params, VisualOverlays } from '@/engine/types';
import type { GhostComparison } from '@/content/schema';
import { fitCamera, syncCanvasSize, unionBounds } from '@/render/camera';
import { DEFAULT_THEME, readTheme, type Theme } from '@/render/theme';
import type { AnySimTemplate, GhostRun } from '@/templates/types';

export interface SimulationConfig {
  template: AnySimTemplate;
  params: Params;
  overlays: VisualOverlays;
  focusCue?: string;
  ghost?: GhostComparison;
}

function sameParams(a: Params, b: Params): boolean {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
}

export class SimulationController {
  private config: SimulationConfig;
  private runner: SimulationRunner<BaseSimState>;
  private ghostRun: GhostRun | undefined;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private theme: Theme = DEFAULT_THEME;
  private resizeObserver: ResizeObserver | null = null;
  private rafId = 0;
  private lastFrame = 0;
  private listeners = new Set<() => void>();
  private finishedListener: (() => void) | undefined;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.runner = new SimulationRunner(config.template, config.params);
    this.ghostRun = this.computeGhost();
  }

  // ── External store API ────────────────────────────────────────────────
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getStatus = (): RunStatus => this.runner.status;

  onFinished(listener: (() => void) | undefined): void {
    this.finishedListener = listener;
  }

  // ── Configuration ─────────────────────────────────────────────────────
  configure(next: SimulationConfig): void {
    const prev = this.config;
    this.config = next;
    if (next.template !== prev.template) {
      this.stopLoop();
      this.runner = new SimulationRunner(next.template, next.params);
      this.ghostRun = this.computeGhost();
      this.emit();
    } else if (!sameParams(next.params, prev.params)) {
      this.stopLoop();
      this.runner.reset(next.params);
      this.ghostRun = this.computeGhost();
      this.emit();
    } else if (next.ghost !== prev.ghost) {
      this.ghostRun = this.computeGhost();
    }
    this.draw();
  }

  // ── Canvas lifecycle ──────────────────────────────────────────────────
  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.theme = readTheme(canvas);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(canvas);
    }
    document.addEventListener('visibilitychange', this.onVisibility);
    this.draw();
    if (this.runner.status === 'running') this.startLoop();
  }

  detach(): void {
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas = null;
    this.ctx = null;
  }

  // ── Playback ──────────────────────────────────────────────────────────
  play(): void {
    this.runner.play();
    this.emit();
    this.startLoop();
  }

  pause(): void {
    this.runner.pause();
    this.stopLoop();
    this.emit();
    this.draw();
  }

  reset(): void {
    this.stopLoop();
    this.runner.reset(this.config.params);
    this.emit();
    this.draw();
  }

  /** Reset and immediately play (used when a prediction is locked in). */
  restart(): void {
    this.runner.reset(this.config.params);
    this.play();
  }

  step(): void {
    this.stopLoop();
    const before = this.runner.status;
    this.runner.stepOnce();
    this.afterAdvance(before);
    this.draw();
  }

  /** Jump straight to the end of the run. */
  finish(): void {
    this.stopLoop();
    const before = this.runner.status;
    this.runner.runToEnd();
    this.afterAdvance(before);
    this.draw();
  }

  // ── Internals ─────────────────────────────────────────────────────────
  private emit(): void {
    for (const l of this.listeners) l();
  }

  /** Notify subscribers; fire onFinished only on the transition into 'finished'. */
  private afterAdvance(before: RunStatus): void {
    this.emit();
    if (before !== 'finished' && this.runner.status === 'finished') this.finishedListener?.();
  }

  private computeGhost(): GhostRun | undefined {
    const { ghost, overlays, template, params } = this.config;
    if (!ghost || !overlays.showGhostComparison) return undefined;
    const ghostParams = { ...params, ...ghost.paramOverrides };
    return {
      history: simulate(template, ghostParams).history,
      params: ghostParams,
      label: ghost.label,
    };
  }

  private startLoop(): void {
    if (this.rafId || !this.canvas) return;
    this.lastFrame = performance.now();
    const loop = (now: number) => {
      const dt = (now - this.lastFrame) / 1000;
      this.lastFrame = now;
      this.runner.advance(dt);
      this.draw();
      if (this.runner.status === 'running') {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = 0;
        this.afterAdvance('running');
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stopLoop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private onVisibility = (): void => {
    if (document.hidden && this.runner.status === 'running') this.pause();
  };

  draw(): void {
    const { canvas, ctx } = this;
    if (!canvas || !ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!syncCanvasSize(canvas, ctx, width, height, window.devicePixelRatio || 1)) return;

    const { template, params, overlays, focusCue } = this.config;
    const bounds = unionBounds(
      template.worldBounds(params),
      this.ghostRun ? template.worldBounds(this.ghostRun.params) : undefined,
    );
    template.render(
      { ctx, camera: fitCamera(bounds, width, height), theme: this.theme, width, height },
      {
        state: this.runner.state,
        params: this.runner.params,
        history: this.runner.history,
        status: this.runner.status,
        overlays,
        ...(focusCue ? { focusCue } : {}),
        ...(this.ghostRun ? { ghost: this.ghostRun } : {}),
      },
    );
  }
}
