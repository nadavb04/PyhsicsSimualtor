import { Link } from 'react-router';
import { TOPICS } from '@/content';
import { topicScore } from '@/game/scoring';
import { useProgressStore } from '@/state/progressStore';
import { ScoreBar } from '../layout/ScoreBar';

export function TopicList() {
  const results = useProgressStore((s) => s.results);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Build your physics intuition</h1>
        <p className="mt-1 text-sm text-slate-400">
          Predict first, then watch the simulation to check yourself.
        </p>
      </div>

      <ul className="space-y-3">
        {TOPICS.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/topic/${topic.id}`}
              className="block rounded-2xl bg-slate-800/70 p-4 transition active:scale-[0.99] active:bg-slate-800"
            >
              <h2 className="text-lg font-semibold">{topic.title}</h2>
              <p className="mb-3 text-sm text-slate-400">{topic.description}</p>
              <ScoreBar score={topicScore(topic, results)} label={`${topic.title} progress`} />
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="min-h-11 w-full rounded-xl text-sm text-slate-500 active:text-slate-300"
        onClick={() => {
          if (window.confirm('Reset all progress, points and streaks?')) resetProgress();
        }}
      >
        Reset progress
      </button>
    </div>
  );
}
