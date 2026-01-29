import { useCallback, useState, useRef } from 'react';
import { useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import { advanceDay as advanceDayUseCase } from '../application/advance-day';
import { runPolicyDay } from '../application/run-policy';

type PolicyRunState = { status: 'idle' } | { status: 'running'; progress: number };

function validateDays(days: number): void {
  if (!Number.isFinite(days) || !Number.isInteger(days) || days <= 0) {
    throw new Error(`Invalid days parameter: ${days}. Must be a positive integer.`);
  }
}

export interface UseSimulationControlsOptions {
  createAbortController?: () => AbortController;
}

export function useSimulationControls(
  options: UseSimulationControlsOptions = {}
) {
  const { createAbortController = () => new AbortController() } = options;
  const { board, updateBoard } = useBoardContext();
  const [policyRunState, setPolicyRunState] = useState<PolicyRunState>({ status: 'idle' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  const isRunning = policyRunState.status === 'running';
  const policyProgress = policyRunState.status === 'running' ? policyRunState.progress : null;

  const advanceDay = useCallback(() => {
    if (isRunningRef.current) return;

    updateBoard((current) => {
      const result = advanceDayUseCase({
        cards: current.cards,
        currentDay: current.currentDay,
        wipLimits: current.wipLimits,
      });

      return Board.withCurrentDay(Board.withCards(current, result.cards), result.newDay);
    });
  }, [updateBoard]);

  const runPolicy = useCallback(
    async (days: number) => {
      if (isRunningRef.current) return;

      validateDays(days);

      isRunningRef.current = true;
      abortControllerRef.current = createAbortController();
      const abortController = abortControllerRef.current;

      try {
        for (let i = 1; i <= days; i++) {
          if (abortController.signal.aborted) break;

          await Promise.resolve();

          if (abortController.signal.aborted) break;

          setPolicyRunState({ status: 'running', progress: i });

          let shouldBreak = false;
          updateBoard((current) => {
            if (abortController.signal.aborted) {
              shouldBreak = true;
              return current;
            }

            const result = runPolicyDay({
              policyType: 'siloted-expert',
              cards: current.cards,
              workers: current.workers,
              currentDay: current.currentDay,
              wipLimits: current.wipLimits,
            });

            if (abortController.signal.aborted) {
              shouldBreak = true;
              return current;
            }

            return Board.withCurrentDay(Board.withCards(current, result.cards), result.newDay);
          });

          if (shouldBreak || abortController.signal.aborted) break;
        }
      } finally {
        isRunningRef.current = false;
        setPolicyRunState({ status: 'idle' });
      }
    },
    [updateBoard, createAbortController]
  );

  const cancelPolicy = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    currentDay: board.currentDay,
    advanceDay,
    runPolicy,
    cancelPolicy,
    isRunning,
    policyProgress,
  };
}
