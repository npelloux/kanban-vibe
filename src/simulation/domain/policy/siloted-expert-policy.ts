import type { Card } from '../card/card';
import type { Worker } from '../worker/worker';
import type { WorkerType } from '../worker/worker-type';
import {
  WorkerOutputCalculator,
  type ColumnColor,
  type OutputRange,
} from '../worker/worker-output';
import type { Policy } from './policy';
import { assignWorkersToCards } from './worker-sharing';

function byAgeDescending(first: Card, second: Card): number {
  return second.age - first.age;
}

function cardsInStage(cards: readonly Card[], stage: Card['stage']): Card[] {
  return cards.filter((card) => card.stage === stage).sort(byAgeDescending);
}


const DESCRIPTION =
  'Workers always work on cards in their own active color (producing 3-6 work items). ' +
  'Finished tasks move to the next column as soon as possible. ' +
  'Max WIP limits are respected at all times.';

interface WorkLane {
  readonly stage: Card['stage'];
  readonly workerType: WorkerType;
}

const LANES: readonly WorkLane[] = [
  { stage: 'red-active', workerType: 'red' },
  { stage: 'blue-active', workerType: 'blue' },
  { stage: 'green', workerType: 'green' },
];

export const SilotedExpertPolicy: Policy = {
  id: 'siloted-expert',
  name: 'Siloted Expert',
  description: DESCRIPTION,

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[] {
    const noWorkers: Card['assignedWorkers'] = [];
    const unassignedCards = cards.map((card) => ({
      ...card,
      assignedWorkers: noWorkers,
    }));

    return LANES.reduce(
      (assignedCards, lane) =>
        assignWorkersToCards(
          workers.filter((worker) => worker.type === lane.workerType),
          cardsInStage(assignedCards, lane.stage),
          assignedCards
        ),
      unassignedCards
    );
  },

  outputRangeFor(workerType: WorkerType, columnColor: ColumnColor): OutputRange {
    return WorkerOutputCalculator.getOutputRange(workerType, columnColor);
  },
};
