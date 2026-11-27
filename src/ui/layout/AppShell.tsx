import { Outlet } from 'react-router';
import { HeaderBar } from './HeaderBar';

/** Full-viewport shell: fixed header + a scroll container for each screen. */
export function AppShell() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <HeaderBar />
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
