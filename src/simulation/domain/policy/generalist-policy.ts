import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';
import {
  NON_SPECIALIZED_RANGE,
  type ColumnColor,
  type OutputRange,
} from '../worker/worker-output';
import type { Policy } from './policy';
import { assignWorkersToCards } from './worker-sharing';

const DESCRIPTION =
  'Workers take on any card needing work regardless of colour (producing 0-3 work items). ' +
  'The oldest cards are served first, then the ones closest to completion.';

const ACTIVE_STAGES: readonly Card['stage'][] = [
  'red-active',
  'blue-active',
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

function isAvailableForWork(card: Card): boolean {
  return !card.isBlocked && ACTIVE_STAGES.includes(card.stage);
}

function byOldestThenClosestToCompletion(first: Card, second: Card): number {
  if (first.age !== second.age) {
    return second.age - first.age;
  }

  const remainingDifference = remainingWorkOn(first) - remainingWorkOn(second);
  if (remainingDifference !== 0) {
    return remainingDifference;
  }

  return first.id.localeCompare(second.id);
}

export const GeneralistPolicy: Policy = {
  id: 'generalist',
  name: 'Generalist',
  description: DESCRIPTION,

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[] {
    const noWorkers: Card['assignedWorkers'] = [];
    const unassignedCards = cards.map((card) => ({
      ...card,
      assignedWorkers: noWorkers,
    }));

    const cardsNeedingWork = unassignedCards
      .filter(isAvailableForWork)
      .sort(byOldestThenClosestToCompletion);

    return assignWorkersToCards(workers, cardsNeedingWork, unassignedCards);
  },

  outputRangeFor(): OutputRange {
    return NON_SPECIALIZED_RANGE;
  },
};
