import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { activeGhost, getQuestion, initialParams, subQuestionKey } from '@/content';
import { pickPraise } from '@/content/praise';
import type { PhysicsQuestion, SliderParam, SubQuestion } from '@/content/schema';
import { canFreePlay, flowReducer, initialFlowState, type FlowOutcome } from '@/game/questionFlow';
import { useProgressStore } from '@/state/progressStore';
import { getTemplate } from '@/templates/registry';
import type { AnySimTemplate } from '@/templates/types';
import { ParamSlider } from '../controls/ParamSlider';
import { ParamToggle } from '../controls/ParamToggle';
import { PlaybackControls } from '../controls/PlaybackControls';
import { DebriefPanel } from '../question/DebriefPanel';
import { PredictionCard } from '../question/PredictionCard';
import { SimulationStage } from '../sim/SimulationStage';
import { useSimulation } from '../sim/useSimulation';
import { useI18n } from '../i18n/useI18n';
import { NotFound } from './NotFound';

export function QuestionScreen() {
  const { topicId = '', questionId = '' } = useParams();
  const navigate = useNavigate();
  const question = getQuestion(topicId, questionId);
  const template = question ? getTemplate(question.simulationTemplate) : undefined;
  const results = useProgressStore((s) => s.results);
  const { t, tr } = useI18n();

  // Open on the first unsolved part.
  const [subIndex, setSubIndex] = useState(() => {
    const i =
      question?.subQuestions.findIndex(
        (s) => !results[subQuestionKey(topicId, questionId, s.id)]?.solved,
      ) ?? 0;
    return Math.max(0, i);
  });

  if (!question || !template) return <NotFound />;
  const sub = question.subQuestions[subIndex] ?? question.subQuestions[0]!;
  const isLast = subIndex >= question.subQuestions.length - 1;

  const header = (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/topic/${topicId}`}
          className="inline-flex min-h-11 items-center text-sm text-sky-300"
        >
          {t.backToTopic}
        </Link>
        <nav className="flex gap-1.5" aria-label={t.questionParts}>
          {question.subQuestions.map((s, i) => {
            const solved = results[subQuestionKey(topicId, question.id, s.id)]?.solved;
            return (
              <button
                key={s.id}
                type="button"
                aria-current={i === subIndex ? 'step' : undefined}
                onClick={() => setSubIndex(i)}
                className={`flex size-11 items-center justify-center rounded-xl text-sm font-bold ${
                  i === subIndex
                    ? 'bg-sky-600 text-white'
                    : solved
                      ? 'bg-emerald-600/30 text-emerald-200'
                      : 'bg-slate-800'
                }`}
              >
                {solved ? '✓' : `(${t.partLetter(i)})`}
              </button>
            );
          })}
        </nav>
      </div>
      <h1 className="text-lg font-bold leading-tight">{tr(question.title)}</h1>
      <details className="text-sm text-slate-300">
        <summary className="min-h-8 cursor-pointer text-slate-400">{t.scenario}</summary>
        <p className="mt-1 leading-relaxed">{tr(question.scenarioDescription)}</p>
      </details>
    </div>
  );

  return (
    <SubQuestionRunner
      key={`${question.id}/${sub.id}`}
      topicId={topicId}
      question={question}
      sub={sub}
      template={template}
      header={header}
      nextLabel={isLast ? t.finishQuestion : t.nextPart(t.partLetter(subIndex + 1))}
      onNext={() => (isLast ? navigate(`/topic/${topicId}`) : setSubIndex(subIndex + 1))}
    />
  );
}

interface RunnerProps {
  topicId: string;
  question: PhysicsQuestion;
  sub: SubQuestion;
  template: AnySimTemplate;
  header: ReactNode;
  nextLabel: string;
  onNext(): void;
}

/** One sub-question's full predict → observe → debrief loop. Remounted per sub-question. */
function SubQuestionRunner({
  topicId,
  question,
  sub,
  template,
  header,
  nextLabel,
  onNext,
}: RunnerProps) {
  const key = subQuestionKey(topicId, question.id, sub.id);
  const recordOutcome = useProgressStore((s) => s.recordOutcome);
  const { t, tr } = useI18n();
  // Captured at mount so the debrief keeps showing earned points after this attempt is saved.
  const [practice] = useState(() => useProgressStore.getState().results[key]?.solved ?? false);

  const [presets] = useState(() => initialParams(question.parameters, sub, question.fixedParams));
  const ghost = activeGhost(question, sub);
  const [params, setParams] = useState(presets);
  const [flow, dispatch] = useReducer(flowReducer, initialFlowState);
  const correctOptionId = sub.options.find((o) => o.isCorrect)?.id ?? '';

  const onFinished = useCallback(
    () => dispatch({ type: 'reveal', correctOptionId, praise: pickPraise() }),
    [correctOptionId],
  );

  const sim = useSimulation({
    template,
    params,
    overlays: question.visualOverlays,
    ...(sub.visualFocusCue ? { focusCue: sub.visualFocusCue } : {}),
    ...(ghost ? { ghost } : {}),
    onFinished,
  });

  // Persist each debriefed outcome exactly once (guard survives StrictMode effect replays).
  const recorded = useRef<FlowOutcome | null>(null);
  useEffect(() => {
    if (flow.outcome && recorded.current !== flow.outcome) {
      recorded.current = flow.outcome;
      recordOutcome(key, flow.outcome);
    }
  }, [flow.outcome, key, recordOutcome]);

  const freePlay = canFreePlay(flow);
  const observing = flow.phase === 'observe';
  const isLocked = (p: SliderParam) =>
    observing || (!!p.lockedDuringPrediction && flow.phase !== 'debrief');

  const setParam = (id: string, value: number) => {
    setParams((prev) => ({ ...prev, [id]: value }));
    dispatch({ type: 'param-changed' });
  };

  const submit = () => {
    dispatch({ type: 'submit' });
    sim.controls.restart();
  };

  const retry = () => {
    // Locked parameters snap back to this sub-question's presets for the new prediction.
    setParams((prev) => {
      const next = { ...prev };
      for (const p of question.parameters)
        if (p.lockedDuringPrediction) next[p.id] = presets[p.id] ?? p.defaultValue;
      return next;
    });
    dispatch({ type: 'retry' });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Figure stays LTR/English: canvas text inherits direction from its element. */}
      <div
        dir="ltr"
        data-testid="sim-stage"
        className="relative h-[46dvh] min-h-56 shrink-0 border-b border-slate-800"
      >
        <SimulationStage canvasRef={sim.canvasRef} label={t.simulationAria(tr(question.title))} />
        <VectorLegend question={question} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-xl space-y-4 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {header}

          <PlaybackControls
            status={sim.status}
            disabled={!freePlay && !observing}
            disabledHint={t.lockedHint}
            onPlay={sim.controls.play}
            onPause={sim.controls.pause}
            onReset={sim.controls.reset}
            onStep={sim.controls.step}
          />

          {flow.phase === 'debrief' && flow.outcome ? (
            <DebriefPanel
              sub={sub}
              outcome={flow.outcome}
              practice={practice}
              nextLabel={nextLabel}
              onRetry={retry}
              onNext={onNext}
            />
          ) : (
            <PredictionCard
              sub={sub}
              selectedOptionId={flow.selectedOptionId}
              observing={observing}
              onSelect={(optionId) => dispatch({ type: 'select', optionId })}
              onSubmit={submit}
              onSkip={sim.controls.finish}
            />
          )}

          <section
            aria-label={t.experimentSettings}
            className="space-y-4 rounded-2xl bg-slate-900 p-4"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.experimentSettings}
            </h2>
            {question.parameters.map((p) => {
              const Control = p.kind === 'toggle' ? ParamToggle : ParamSlider;
              return (
                <Control
                  key={p.id}
                  param={p}
                  value={params[p.id] ?? p.defaultValue}
                  disabled={isLocked(p)}
                  onChange={(v) => setParam(p.id, v)}
                />
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}

function VectorLegend({ question }: { question: PhysicsQuestion }) {
  const o = question.visualOverlays;
  if (!o.showVelocityVector && !o.showAccelerationVector) return null;
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 flex gap-3 rounded-lg bg-slate-950/70 px-2 py-1 text-xs font-semibold">
      {o.showVelocityVector && <span className="text-velocity">→ velocity</span>}
      {o.showAccelerationVector && <span className="text-acceleration">→ acceleration</span>}
    </div>
  );
}
