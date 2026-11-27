import type { BodySample, History, SampleRecord, SimEvent } from './types';

export function createHistory(): History {
  return { samples: [], events: [] };
}

export function recordSample(history: History, sample: SampleRecord): void {
  const last = history.samples[history.samples.length - 1];
  if (last && last.t === sample.t) {
    history.samples[history.samples.length - 1] = sample;
  } else {
    history.samples.push(sample);
  }
}

export function recordEvents(history: History, events: readonly SimEvent[]): void {
  for (const e of events) history.events.push(e);
}

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

function lerpBody(a: BodySample, b: BodySample, f: number): BodySample {
  return {
    id: a.id,
    pos: { x: lerp(a.pos.x, b.pos.x, f), y: lerp(a.pos.y, b.pos.y, f) },
    vel: { x: lerp(a.vel.x, b.vel.x, f), y: lerp(a.vel.y, b.vel.y, f) },
    acc: { x: lerp(a.acc.x, b.acc.x, f), y: lerp(a.acc.y, b.acc.y, f) },
  };
}

/**
 * Interpolated snapshot at time t. Clamps to the first/last sample outside the recorded range.
 * Returns undefined for an empty history.
 */
export function sampleAt(history: History, t: number): SampleRecord | undefined {
  const s = history.samples;
  const first = s[0];
  const last = s[s.length - 1];
  if (!first || !last) return undefined;
  if (t <= first.t) return first;
  if (t >= last.t) return last;

  // Binary search for the segment containing t.
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid]!.t <= t) lo = mid;
    else hi = mid;
  }
  const a = s[lo]!;
  const b = s[hi]!;
  const f = (t - a.t) / (b.t - a.t);
  return { t, bodies: a.bodies.map((body, i) => lerpBody(body, b.bodies[i] ?? body, f)) };
}

/** Snapshots at equal time intervals (strobe / ticker-tape dots), from t=0 up to `untilT`. */
export function resampleEvery(history: History, interval: number, untilT: number): SampleRecord[] {
  if (interval <= 0) return [];
  const out: SampleRecord[] = [];
  const last = history.samples[history.samples.length - 1];
  const end = Math.min(untilT, last?.t ?? 0);
  const count = Math.floor(end / interval + 1e-9);
  for (let i = 0; i <= count; i++) {
    const snap = sampleAt(history, i * interval);
    if (snap) out.push(snap);
  }
  return out;
}

export function findBody(sample: SampleRecord | undefined, id: string): BodySample | undefined {
  return sample?.bodies.find((b) => b.id === id);
}
