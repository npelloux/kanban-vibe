import { useCallback, useState, useRef } from 'react';
import { useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import type { Card } from '../domain/card/card';
import { advanceDay as advanceDayUseCase } from '../application/advance-day';
import { runPolicyDay } from '../application/run-policy';
import { useToast } from '../../api/use-toast';

const DAY_TOAST_DURATION = 2000;
const POLICY_TOAST_DURATION = 5000;

function findNewlyCompletedCards(
  previousCards: readonly Card[],
  newCards: readonly Card[]
): Card[] {
  const previousDoneIds = new Set(
    previousCards.filter(c => c.stage === 'done').map(c => c.id)
  );
  return newCards.filter(
    c => c.stage === 'done' && !previousDoneIds.has(c.id)
  );
}

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
  const { info, success, warning } = useToast();
  const [policyRunState, setPolicyRunState] = useState<PolicyRunState>({ status: 'idle' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  const isRunning = policyRunState.status === 'running';
  const policyProgress = policyRunState.status === 'running' ? policyRunState.progress : null;

  const advanceDay = useCallback(() => {
    if (isRunningRef.current) return;

    let newDay = 0;
    let completedCards: Card[] = [];

    updateBoard((current) => {
      const result = advanceDayUseCase({
        cards: current.cards,
        currentDay: current.currentDay,
        wipLimits: current.wipLimits,
      });

      newDay = result.newDay;
      completedCards = findNewlyCompletedCards(current.cards, result.cards);

      return Board.withCurrentDay(Board.withCards(current, result.cards), result.newDay);
    });

    info(`Day ${newDay}`, DAY_TOAST_DURATION);
    completedCards.forEach(card => {
      success(`Card ${card.id} completed!`);
    });
  }, [updateBoard, info, success]);

  const runPolicy = useCallback(
    async (days: number) => {
      if (isRunningRef.current) return;

      validateDays(days);

      isRunningRef.current = true;
      abortControllerRef.current = createAbortController();
      const abortController = abortControllerRef.current;

      info(`Running siloted-expert for ${days} days...`, POLICY_TOAST_DURATION);

      let totalCardsCompleted = 0;
      let lastDay = 0;

      try {
        for (let i = 1; i <= days; i++) {
          if (abortController.signal.aborted) {
            break;
          }

          await Promise.resolve();

          if (abortController.signal.aborted) {
            break;
          }

          setPolicyRunState({ status: 'running', progress: i });

          updateBoard((current) => {
            lastDay = current.currentDay;

            if (abortController.signal.aborted) {
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
              return current;
            }

            const newlyCompleted = findNewlyCompletedCards(current.cards, result.cards);
            totalCardsCompleted += newlyCompleted.length;
            lastDay = result.newDay;

            return Board.withCurrentDay(Board.withCards(current, result.cards), result.newDay);
          });

        }
      } finally {
        isRunningRef.current = false;
        setPolicyRunState({ status: 'idle' });

        if (abortController.signal.aborted) {
          warning(`Policy cancelled at day ${lastDay}`, POLICY_TOAST_DURATION);
        } else {
          success(`Policy completed. ${totalCardsCompleted} card${totalCardsCompleted === 1 ? '' : 's'} finished.`, POLICY_TOAST_DURATION);
        }
      }
    },
    [updateBoard, createAbortController, info, success, warning]
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
