import type { Card } from '../card/card';
import { MAX_ASSIGNED_WORKERS } from '../card/card';
import type { Worker } from '../worker/worker';

export function shareWorkersRoundRobin(
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

export function assignWorkersToCards(
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

  return applyAssignments(cardsToAssign, assignmentsPerCard, allCards);
}

function applyAssignments(
  assignedCards: readonly Card[],
  assignmentsPerCard: readonly Worker[][],
  allCards: Card[]
): Card[] {
  const assignmentsByCardId = new Map(
    assignedCards.map((card, index) => [card.id, assignmentsPerCard[index]])
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

export function withoutAssignments(cards: readonly Card[]): Card[] {
  const noWorkers: Card['assignedWorkers'] = [];
  return cards.map((card) => ({ ...card, assignedWorkers: noWorkers }));
}

export function fillCardsInOrder(
  workersToAssign: readonly Worker[],
  cardsInPriorityOrder: readonly Card[],
  allCards: Card[]
): Card[] {
  if (workersToAssign.length === 0 || cardsInPriorityOrder.length === 0) {
    return allCards;
  }

  const assignmentsPerCard: Worker[][] = cardsInPriorityOrder.map(() => []);

  let cardIndex = 0;
  for (const worker of workersToAssign) {
    while (
      cardIndex < cardsInPriorityOrder.length &&
      assignmentsPerCard[cardIndex].length >= MAX_ASSIGNED_WORKERS
    ) {
      cardIndex++;
    }

    if (cardIndex >= cardsInPriorityOrder.length) {
      break;
    }

    assignmentsPerCard[cardIndex].push(worker);
  }

  return applyAssignments(cardsInPriorityOrder, assignmentsPerCard, allCards);
}
