import type { Card } from '../card/card';
import { MAX_ASSIGNED_WORKERS } from '../card/card';
import type { Worker } from '../worker/worker';
import type { WorkerType } from '../worker/worker-type';
import type { Policy } from './policy';

function byAgeDescending(first: Card, second: Card): number {
  return second.age - first.age;
}

function cardsInStage(cards: readonly Card[], stage: Card['stage']): Card[] {
  return cards.filter((card) => card.stage === stage).sort(byAgeDescending);
}

function shareWorkersRoundRobin(
  workersToAssign: readonly Worker[],
  cardCount: number
): Worker[][] {
  const assignmentsPerCard: Worker[][] = Array.from({ length: cardCount }, () => []);

  let workerIndex = 0;
  let cardIndex = 0;

  while (workerIndex < workersToAssign.length && cardIndex < cardCount) {
    assignmentsPerCard[cardIndex].push(workersToAssign[workerIndex]);
    workerIndex++;
    cardIndex++;
  }

  cardIndex = 0;

  while (workerIndex < workersToAssign.length) {
    if (assignmentsPerCard[cardIndex].length < MAX_ASSIGNED_WORKERS) {
      assignmentsPerCard[cardIndex].push(workersToAssign[workerIndex]);
      workerIndex++;
    }

    cardIndex++;

    if (cardIndex >= cardCount) {
      const anyCardHasRoom = assignmentsPerCard.some(
        (assignments) => assignments.length < MAX_ASSIGNED_WORKERS
      );

      if (!anyCardHasRoom) {
        break;
      }

      cardIndex = 0;
    }
  }

  return assignmentsPerCard;
}

function assignWorkersToCards(
  workersToAssign: readonly Worker[],
  cardsToAssign: readonly Card[],
  allCards: Card[]
): Card[] {
  if (workersToAssign.length === 0 || cardsToAssign.length === 0) {
    return allCards;
  }

  const assignmentsPerCard = shareWorkersRoundRobin(
    workersToAssign,
    cardsToAssign.length
  );

  const assignmentsByCardId = new Map(
    cardsToAssign.map((card, index) => [card.id, assignmentsPerCard[index]])
  );

  return allCards.map((card) => {
    const assignments = assignmentsByCardId.get(card.id);
    if (assignments === undefined || assignments.length === 0) {
      return card;
    }

    return {
      ...card,
      assignedWorkers: [
        ...card.assignedWorkers,
        ...assignments.map((worker) => ({ id: worker.id, type: worker.type })),
      ],
    };
  });
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
};
