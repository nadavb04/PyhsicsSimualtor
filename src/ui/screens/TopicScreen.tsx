import { Link, useParams } from 'react-router';
import { getTopic } from '@/content';
import { questionScore, topicScore } from '@/game/scoring';
import { useProgressStore } from '@/state/progressStore';
import { ScoreBar } from '../layout/ScoreBar';
import { NotFound } from './NotFound';

export function TopicScreen() {
  const { topicId = '' } = useParams();
  const topic = getTopic(topicId);
  const results = useProgressStore((s) => s.results);
  if (!topic) return <NotFound />;

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <Link to="/" className="inline-flex min-h-11 items-center text-sm text-sky-300">
        ← All topics
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="mb-3 text-sm text-slate-400">{topic.description}</p>
        <ScoreBar score={topicScore(topic, results)} label={`${topic.title} progress`} />
      </div>

      <ol className="space-y-2">
        {topic.questions.map((q, i) => {
          const s = questionScore(topic.id, q, results);
          const done = s.solved === s.total;
          return (
            <li key={q.id}>
              <Link
                to={`/topic/${topic.id}/${q.id}`}
                className="flex min-h-14 items-center gap-3 rounded-xl bg-slate-800/70 p-3 active:bg-slate-800"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{q.title}</span>
                <span className="text-xs tabular-nums text-slate-400">
                  {s.earned}/{s.max}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
