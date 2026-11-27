import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { SimulationController, type SimulationConfig } from './SimulationController';

export interface UseSimulationOptions extends SimulationConfig {
  /** Called once each time a run reaches its natural end. */
  onFinished?: () => void;
}

export function useSimulation({ onFinished, ...config }: UseSimulationOptions) {
  const [controller] = useState(() => new SimulationController(config));
  const status = useSyncExternalStore(controller.subscribe, controller.getStatus);

  const { template, params, overlays, focusCue, ghost } = config;
  useEffect(() => {
    controller.configure({
      template,
      params,
      overlays,
      ...(focusCue ? { focusCue } : {}),
      ...(ghost ? { ghost } : {}),
    });
  }, [controller, template, params, overlays, focusCue, ghost]);

  useEffect(() => {
    controller.onFinished(onFinished);
  }, [controller, onFinished]);

  /** Callback ref with React 19 cleanup: attaches the canvas and detaches on unmount. */
  const canvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      if (!el) return;
      controller.attach(el);
      return () => controller.detach();
    },
    [controller],
  );

  const controls = useMemo(
    () => ({
      play: () => controller.play(),
      pause: () => controller.pause(),
      reset: () => controller.reset(),
      restart: () => controller.restart(),
      step: () => controller.step(),
      finish: () => controller.finish(),
    }),
    [controller],
  );

  return { canvasRef, status, controls };
}
