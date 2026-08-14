import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';
import {
  NON_SPECIALIZED_RANGE,
  type OutputRange,
} from '../worker/worker-output';
import type { Policy } from './policy';
import { assignWorkersToCards, withoutAssignments } from './worker-sharing';
import { remainingWorkOn, isWorkableCard, type ActiveCard } from './active-card';

const DESCRIPTION =
  'Workers take on any card needing work regardless of colour (producing 0-3 work items). ' +
  'The oldest cards are served first, then the ones closest to completion.';

function byOldestThenClosestToCompletion(first: ActiveCard, second: ActiveCard): number {
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
    const unassignedCards = withoutAssignments(cards);

    const cardsNeedingWork = unassignedCards
      .filter(isWorkableCard)
      .sort(byOldestThenClosestToCompletion);

    return assignWorkersToCards(workers, cardsNeedingWork, unassignedCards);
  },

  outputRangeFor(): OutputRange {
    return NON_SPECIALIZED_RANGE;
  },

  allowsPullFromOptions(): boolean {
    return true;
  },
};
