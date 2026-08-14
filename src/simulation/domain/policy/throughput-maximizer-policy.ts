import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';
import type { WorkerType } from '../worker/worker-type';
import {
  WorkerOutputCalculator,
  type ColumnColor,
  type OutputRange,
} from '../worker/worker-output';
import type { Policy } from './policy';
import { fillCardsInOrder, withoutAssignments } from './worker-sharing';
import {
  remainingWorkOn,
  isWorkableCard,
  type ActiveCard,
  type ActiveStage,
} from './active-card';

const DESCRIPTION =
  'Stop starting, start finishing: workers serve the cards closest to Done first ' +
  '(green before blue before red), and no new card leaves Options until the pipeline is clear.';

const STAGES_CLOSEST_TO_DONE_FIRST: readonly ActiveStage[] = [
  'green',
  'blue-active',
  'red-active',
];

const IN_PROGRESS_STAGES: readonly Card['stage'][] = [
  'red-active',
  'red-finished',
  'blue-active',
  'blue-finished',
  'green',
];

function byLeastWorkRemaining(first: ActiveCard, second: ActiveCard): number {
  const remainingDifference = remainingWorkOn(first) - remainingWorkOn(second);
  if (remainingDifference !== 0) {
    return remainingDifference;
  }
  return first.id.localeCompare(second.id);
}

function cardsClosestToDoneFirst(cards: readonly Card[]): Card[] {
  const workableCards = cards.filter(isWorkableCard);

  return STAGES_CLOSEST_TO_DONE_FIRST.flatMap((stage) =>
    workableCards.filter((card) => card.stage === stage).sort(byLeastWorkRemaining)
  );
}

export const ThroughputMaximizerPolicy: Policy = {
  id: 'throughput-maximizer',
  name: 'Throughput Maximizer',
  description: DESCRIPTION,

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[] {
    const unassignedCards = withoutAssignments(cards);

    return fillCardsInOrder(
      workers,
      cardsClosestToDoneFirst(unassignedCards),
      unassignedCards
    );
  },

  outputRangeFor(workerType: WorkerType, columnColor: ColumnColor): OutputRange {
    return WorkerOutputCalculator.getOutputRange(workerType, columnColor);
  },

  allowsPullFromOptions(cards: readonly Card[]): boolean {
    return !cards.some(
      (card) => IN_PROGRESS_STAGES.includes(card.stage) && !card.isBlocked
    );
  },
};
