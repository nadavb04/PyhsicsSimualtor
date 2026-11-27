import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { useProgressStore } from '@/state/progressStore';

const QUESTION_URL = '/topic/kinematics-1d/stone-thrown-upward';

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  return render(<RouterProvider router={router} />);
}

describe('QuestionScreen prediction loop', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
    // jsdom has no canvas; the controller tolerates a null context.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('locks playback until a prediction is made', () => {
    renderAt(QUESTION_URL);
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /lock in/i })).toBeDisabled();
  });

  it('correct prediction → praise, points in header, next part', async () => {
    const user = userEvent.setup();
    renderAt(QUESTION_URL);

    await user.click(screen.getByRole('radio', { name: /twice/i }));
    await user.click(screen.getByRole('button', { name: /lock in/i }));
    await user.click(screen.getByRole('button', { name: /skip to result/i }));

    expect(await screen.findByText(/\+10 pts/)).toBeInTheDocument();
    expect(screen.getByTestId('total-score')).toHaveTextContent('10');
    expect(useProgressStore.getState().streak).toBe(1);

    await user.click(screen.getByRole('button', { name: /next: part \(b\)/i }));
    expect(screen.getByText(/speed at the purple line/i)).toBeInTheDocument();
  });

  it('wrong prediction → hint → retry earns retry points', async () => {
    const user = userEvent.setup();
    renderAt(QUESTION_URL);

    await user.click(screen.getByRole('radio', { name: /only goes up/i }));
    await user.click(screen.getByRole('button', { name: /lock in/i }));
    await user.click(screen.getByRole('button', { name: /skip to result/i }));
    expect(await screen.findByText(/not quite/i)).toBeInTheDocument();
    expect(screen.getByTestId('total-score')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: /tweak & retry/i }));
    expect(screen.getByRole('button', { name: /play/i })).toBeEnabled(); // free play after a miss
    await user.click(screen.getByRole('radio', { name: /twice/i }));
    await user.click(screen.getByRole('button', { name: /lock in/i }));
    await user.click(screen.getByRole('button', { name: /skip to result/i }));
    expect(await screen.findByText(/\+5 pts/)).toBeInTheDocument();
  });

  it('shows not-found for an unknown question', () => {
    renderAt('/topic/kinematics-1d/nope');
    expect(screen.getByText(/nothing here/i)).toBeInTheDocument();
  });
});
