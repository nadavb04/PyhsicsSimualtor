import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { useLocaleStore } from '@/state/localeStore';
import { useProgressStore } from '@/state/progressStore';
import { TOPICS } from '@/content';

const QUESTION_URL = '/topic/kinematics-1d/stone-thrown-upward';

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  return render(<RouterProvider router={router} />);
}

describe('QuestionScreen prediction loop', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
    useLocaleStore.getState().setLocale('en');
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

describe('QuestionScreen in Hebrew (default locale)', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
    useLocaleStore.getState().setLocale('he');
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('defaults to Hebrew with a right-to-left document', () => {
    useLocaleStore.persist.clearStorage();
    useLocaleStore.setState(useLocaleStore.getInitialState());
    expect(useLocaleStore.getState().locale).toBe('he');

    renderAt(QUESTION_URL);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');
    expect(screen.getByText(/כמה פעמים האבן עוברת/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /פעמיים/ })).toBeInTheDocument();
  });

  it('keeps the simulation figure and its legend left-to-right and in English', () => {
    renderAt(QUESTION_URL);
    const stage = screen.getByTestId('sim-stage');
    expect(stage).toHaveAttribute('dir', 'ltr');
    expect(stage).toHaveTextContent(/velocity/);
    expect(stage).toHaveTextContent(/acceleration/);
  });

  it('runs the full prediction loop in Hebrew', async () => {
    const user = userEvent.setup();
    renderAt(QUESTION_URL);

    await user.click(screen.getByRole('radio', { name: /פעמיים/ }));
    await user.click(screen.getByRole('button', { name: /נעילה/ }));
    await user.click(screen.getByRole('button', { name: /דילוג לתוצאה/ }));

    expect(await screen.findByText(/\+10⁩? נק׳/)).toBeInTheDocument();
    expect(screen.getByText(/שתי הטבעות על הקו הסגול/)).toBeInTheDocument();
    expect(screen.getByTestId('total-score')).toHaveTextContent('10');

    await user.click(screen.getByRole('button', { name: /סעיף \(ב\)/ }));
    expect(screen.getByText(/השוו את גודל המהירות/)).toBeInTheDocument();
  });

  it('switches language from the header toggle', async () => {
    const user = userEvent.setup();
    renderAt(QUESTION_URL);

    await user.click(screen.getByRole('button', { name: /switch to english/i }));
    expect(document.documentElement.dir).toBe('ltr');
    expect(screen.getByText(/how many times does the stone pass/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'החלפה לעברית' }));
    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByText(/כמה פעמים האבן עוברת/)).toBeInTheDocument();
  });
});

describe('every Topic 1 question', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
    useLocaleStore.getState().setLocale('en');
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  const topic = TOPICS[0]!;
  it.each(topic.questions.map((q) => [q.id, q] as const))(
    '%s: every part can be answered correctly through the UI',
    async (_id, question) => {
      const user = userEvent.setup();
      renderAt(`/topic/${topic.id}/${question.id}`);
      for (const [i, sub] of question.subQuestions.entries()) {
        const correct = sub.options.find((o) => o.isCorrect)!;
        expect(screen.getByText(sub.prompt.en)).toBeInTheDocument();
        await user.click(screen.getByRole('radio', { name: correct.text.en }));
        await user.click(screen.getByRole('button', { name: /lock in/i }));
        await user.click(screen.getByRole('button', { name: /skip to result/i }));
        expect(await screen.findByText(/\+10 pts/)).toBeInTheDocument();
        expect(screen.getByText(correct.feedback.en)).toBeInTheDocument();
        const isLast = i === question.subQuestions.length - 1;
        if (!isLast) await user.click(screen.getByRole('button', { name: /next: part/i }));
      }
      expect(screen.getByTestId('total-score')).toHaveTextContent(
        String(10 * question.subQuestions.length),
      );
    },
  );
});
