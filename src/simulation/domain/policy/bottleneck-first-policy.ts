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
  'All workers pile onto the constraint: the active stage holding the most cards, ' +
  'oldest on average when stages are tied. Surplus workers spill downstream.';

const ACTIVE_STAGES_IN_PIPELINE_ORDER: readonly Card['stage'][] = [
  'red-active',
  'blue-active',
  'green',
];

function isWorkable(card: Card, stage: Card['stage']): boolean {
  return card.stage === stage && !card.isBlocked;
}

function averageAgeOf(cards: readonly Card[]): number {
  if (cards.length === 0) {
    return 0;
  }
  return cards.reduce((total, card) => total + card.age, 0) / cards.length;
}

function byAgeDescending(first: Card, second: Card): number {
  return second.age - first.age;
}

interface StageQueue {
  readonly stage: Card['stage'];
  readonly cards: readonly Card[];
}

function isMoreConstrainedThan(candidate: StageQueue, incumbent: StageQueue): boolean {
  if (candidate.cards.length !== incumbent.cards.length) {
    return candidate.cards.length > incumbent.cards.length;
  }
  return averageAgeOf(candidate.cards) > averageAgeOf(incumbent.cards);
}

function stageQueuesConstraintFirst(cards: readonly Card[]): StageQueue[] {
  const queues = ACTIVE_STAGES_IN_PIPELINE_ORDER.map((stage) => ({
    stage,
    cards: cards.filter((card) => isWorkable(card, stage)).sort(byAgeDescending),
  })).filter((queue) => queue.cards.length > 0);

  if (queues.length === 0) {
    return [];
  }

  const constraint = queues.reduce((incumbent, candidate) =>
    isMoreConstrainedThan(candidate, incumbent) ? candidate : incumbent
  );

  return [constraint, ...queues.filter((queue) => queue.stage !== constraint.stage)];
}

export const BottleneckFirstPolicy: Policy = {
  id: 'bottleneck-first',
  name: 'Bottleneck First',
  description: DESCRIPTION,

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[] {
    const unassignedCards = withoutAssignments(cards);

    const cardsConstraintFirst = stageQueuesConstraintFirst(unassignedCards).flatMap(
      (queue) => queue.cards
    );

    return fillCardsInOrder(workers, cardsConstraintFirst, unassignedCards);
  },

  outputRangeFor(workerType: WorkerType, columnColor: ColumnColor): OutputRange {
    return WorkerOutputCalculator.getOutputRange(workerType, columnColor);
  },

  allowsPullFromOptions(): boolean {
    return true;
  },
};
