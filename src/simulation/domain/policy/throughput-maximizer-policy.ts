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

const DESCRIPTION =
  'Stop starting, start finishing: workers serve the cards closest to Done first ' +
  '(green before blue before red), and no new card leaves Options until the pipeline is clear.';

const STAGES_CLOSEST_TO_DONE_FIRST: readonly Card['stage'][] = [
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

function colorOfStage(stage: Card['stage']): ColumnColor {
  if (stage === 'red-active') return 'red';
  if (stage === 'blue-active') return 'blue';
  return 'green';
}

function remainingWorkOn(card: Card): number {
  const progress = card.workItems[colorOfStage(card.stage)];
  return progress.total - progress.completed;
}

function byLeastWorkRemaining(first: Card, second: Card): number {
  const remainingDifference = remainingWorkOn(first) - remainingWorkOn(second);
  if (remainingDifference !== 0) {
    return remainingDifference;
  }
  return first.id.localeCompare(second.id);
}

function isWorkable(card: Card): boolean {
  return !card.isBlocked;
}

function cardsClosestToDoneFirst(cards: readonly Card[]): Card[] {
  return STAGES_CLOSEST_TO_DONE_FIRST.flatMap((stage) =>
    cards
      .filter((card) => card.stage === stage && isWorkable(card))
      .sort(byLeastWorkRemaining)
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
      (card) => IN_PROGRESS_STAGES.includes(card.stage) && isWorkable(card)
    );
  },
};
