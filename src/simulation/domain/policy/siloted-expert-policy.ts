import type { Card } from '../card/card';
import { MAX_ASSIGNED_WORKERS } from '../card/card';
import type { Worker } from '../worker/worker';
import type { Policy } from './policy';

function byAgeDescending(first: Card, second: Card): number {
  return second.age - first.age;
}

function cardsInStage(cards: readonly Card[], stage: Card['stage']): Card[] {
  return cards.filter((card) => card.stage === stage).sort(byAgeDescending);
}

/**
 * Hands the workers out one per card in order, then keeps cycling over the same
 * cards — round-robin, not fill-the-first — until every worker is placed or no
 * card has room left.
 */
function shareOutWorkers(
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

  const assignmentsPerCard = shareOutWorkers(workersToAssign, cardsToAssign.length);

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
  'Each worker only works on cards matching their own colour, oldest cards first.';

export const SilotedExpertPolicy: Policy = {
  id: 'siloted-expert',
  name: 'Siloted Expert',
  description: DESCRIPTION,

  assignWorkers(cards: readonly Card[], workers: readonly Worker[]): Card[] {
    const noWorkers: Card['assignedWorkers'] = [];
    let updatedCards = cards.map((card) => ({ ...card, assignedWorkers: noWorkers }));

    const redActiveCards = cardsInStage(updatedCards, 'red-active');
    const blueActiveCards = cardsInStage(updatedCards, 'blue-active');
    const greenCards = cardsInStage(updatedCards, 'green');

    const redWorkers = workers.filter((worker) => worker.type === 'red');
    const blueWorkers = workers.filter((worker) => worker.type === 'blue');
    const greenWorkers = workers.filter((worker) => worker.type === 'green');

    updatedCards = assignWorkersToCards(redWorkers, redActiveCards, updatedCards);
    updatedCards = assignWorkersToCards(blueWorkers, blueActiveCards, updatedCards);
    updatedCards = assignWorkersToCards(greenWorkers, greenCards, updatedCards);

    return updatedCards;
  },
};
