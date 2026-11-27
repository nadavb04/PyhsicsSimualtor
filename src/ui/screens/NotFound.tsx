import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <h1 className="text-xl font-bold">Nothing here</h1>
      <p className="mt-2 text-sm text-slate-400">This page doesn’t exist (yet).</p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sky-300">
        ← Back to topics
      </Link>
    </div>
  );
}
