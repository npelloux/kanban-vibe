import { useCallback, useState, useRef } from 'react';
import { useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import { advanceDay as advanceDayUseCase } from '../application/advance-day';
import { runPolicyDay } from '../application/run-policy';

export function useSimulationControls() {
  const { board, updateBoard } = useBoardContext();
  const [isRunning, setIsRunning] = useState(false);
  const [policyProgress, setPolicyProgress] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

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

      isRunningRef.current = true;
      setIsRunning(true);
      abortControllerRef.current = new AbortController();

      const abortController = abortControllerRef.current;

      for (let i = 1; i <= days; i++) {
        if (abortController.signal.aborted) {
          break;
        }

        await Promise.resolve();

        if (abortController.signal.aborted) {
          break;
        }

        setPolicyProgress(i);

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

        if (shouldBreak || abortController.signal.aborted) {
          break;
        }
      }

      isRunningRef.current = false;
      setIsRunning(false);
      setPolicyProgress(null);
    },
    [updateBoard]
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
