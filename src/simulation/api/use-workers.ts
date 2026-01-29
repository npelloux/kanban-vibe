import { useCallback, useState } from 'react';
import { useBoardContext } from './board-context';
import { Board } from '../domain/board/board';
import { Worker } from '../domain/worker/worker';
import type { WorkerType } from '../domain/worker/worker-type';

function generateNextWorkerId(
  workers: readonly Worker[],
  type: WorkerType
): string {
  const prefix = type[0].toUpperCase();
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  const maxSequence = workers.reduce((max, worker) => {
    if (worker.type !== type) return max;
    const match = pattern.exec(worker.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${maxSequence + 1}`;
}

export function useWorkerManagement() {
  const { board, updateBoard } = useBoardContext();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const addWorker = useCallback(
    (type: WorkerType) => {
      updateBoard((current) => {
        const nextId = generateNextWorkerId(current.workers, type);
        const worker = Worker.create(nextId, type);
        return Board.addWorker(current, worker);
      });
    },
    [updateBoard]
  );

  const deleteWorker = useCallback(
    (workerId: string) => {
      const exists = board.workers.some((worker) => worker.id === workerId);
      updateBoard((current) => Board.removeWorker(current, workerId));
      if (exists) {
        setSelectedWorkerId((current) =>
          current === workerId ? null : current
        );
      }
    },
    [board.workers, updateBoard]
  );

  const selectWorker = useCallback((workerId: string | null) => {
    setSelectedWorkerId(workerId);
  }, []);

  return {
    workers: board.workers,
    addWorker,
    deleteWorker,
    selectedWorkerId,
    selectWorker,
  };
}
