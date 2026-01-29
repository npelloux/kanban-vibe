import type { Card as CardType } from '../domain/card/card';
import type { CardId } from '../domain/card/card-id';
import type { Worker } from '../domain/worker/worker';

export interface AssignWorkerInput {
  readonly cardId: CardId;
  readonly workerId: string;
  readonly cards: readonly CardType[];
  readonly workers: readonly Worker[];
}

export interface AssignWorkerResult {
  readonly cards: CardType[];
}

const MAX_WORKERS = 3;

export function assignWorker(input: AssignWorkerInput): AssignWorkerResult {
  const { cardId, workerId, cards, workers } = input;

  const selectedWorker = workers.find((worker) => worker.id === workerId);
  if (!selectedWorker) {
    return { cards: [...cards] };
  }

  const targetCard = cards.find((card) => card.id === cardId);
  if (!targetCard) {
    return { cards: [...cards] };
  }

  const updatedCards = cards.map((card) => {
    // Remove worker from any card it was previously assigned to
    if (card.assignedWorkers.some((worker) => worker.id === workerId)) {
      // If this is the target card and worker is already assigned, keep it
      if (card.id === cardId) {
        return card;
      }
      return {
        ...card,
        assignedWorkers: card.assignedWorkers.filter(
          (worker) => worker.id !== workerId
        ),
      };
    }

    // Assign worker to the target card (up to MAX_WORKERS workers)
    if (card.id === cardId) {
      // Only add if there are fewer than MAX_WORKERS workers
      if (card.assignedWorkers.length < MAX_WORKERS) {
        return {
          ...card,
          assignedWorkers: [
            ...card.assignedWorkers,
            { id: selectedWorker.id, type: selectedWorker.type },
          ],
        };
      }
    }

    return card;
  });

  return { cards: updatedCards };
}
