import type { Ref } from 'react';

interface Props {
  canvasRef: Ref<HTMLCanvasElement>;
  label: string;
}

/** Responsive canvas that fills its parent. `touch-none` keeps drags from scrolling the page. */
export function SimulationStage({ canvasRef, label }: Props) {
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block h-full w-full touch-none select-none bg-stage"
    />
  );
}
