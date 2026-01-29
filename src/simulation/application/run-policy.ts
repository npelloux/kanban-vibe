import type { Card as CardType } from '../domain/card/card';
import type { Worker } from '../domain/worker/worker';
import { CardAgingService } from '../domain/card/card-aging';
import {
  canTransition,
  nextStage as getNextStage,
} from '../domain/stage/stage-transition';
import { parseStage } from '../domain/stage/stage';
import type { RandomFn } from '../domain/worker/worker-output';
import { WipLimitEnforcer } from '../domain/wip/wip-enforcer';
import { WipLimits } from '../domain/wip/wip-limits';
import type { StageType } from '../domain/stage/stage';
import {
  applyWorkerOutputToCard,
  countCardsInStage,
  stageToColumnKey,
} from './card-stage-helpers';

export type PolicyType = 'siloted-expert';

export interface RunPolicyInput {
  readonly policyType: PolicyType;
  readonly cards: readonly CardType[];
  readonly workers: readonly Worker[];
  readonly currentDay: number;
  readonly wipLimits: ReturnType<typeof WipLimits.empty>;
  readonly random?: RandomFn;
}

export interface RunPolicyResult {
  readonly cards: CardType[];
  readonly newDay: number;
}

function moveOptionsToRedActive(
  cards: CardType[],
  currentDay: number,
  wipLimits: ReturnType<typeof WipLimits.empty>
): CardType[] {
  let updatedCards = [...cards];
  const optionsCards = updatedCards
    .filter((card) => card.stage === 'options')
    .sort((a, b) => a.id.localeCompare(b.id));

  const optionsCount = optionsCards.length;
  const minOptions = WipLimits.getColumnLimit(wipLimits, 'options').min;
  const canMoveFromOptions = minOptions === 0 || optionsCount > minOptions;

  if (!canMoveFromOptions) {
    return updatedCards;
  }

  const redActiveCount = countCardsInStage(updatedCards, 'red-active');
  const maxRedActive = WipLimits.getColumnLimit(wipLimits, 'redActive').max;
  const canMoveToRedActive = maxRedActive === 0 || redActiveCount < maxRedActive;

  if (!canMoveToRedActive) {
    return updatedCards;
  }

  for (const card of optionsCards) {
    const currentRedActiveCount = countCardsInStage(updatedCards, 'red-active');
    if (maxRedActive !== 0 && currentRedActiveCount >= maxRedActive) {
      break;
    }

    updatedCards = updatedCards.map((c) =>
      c.id === card.id ? { ...c, stage: 'red-active', startDay: currentDay } : c
    );
  }

  return updatedCards;
}

function isStageComplete(card: CardType): boolean {
  if (card.isBlocked) {
    return false;
  }

  if (card.stage === 'red-active' || card.stage === 'red-finished') {
    return (
      card.workItems.red.total > 0 &&
      card.workItems.red.completed >= card.workItems.red.total
    );
  } else if (card.stage === 'blue-active' || card.stage === 'blue-finished') {
    return (
      card.workItems.blue.total > 0 &&
      card.workItems.blue.completed >= card.workItems.blue.total &&
      card.workItems.red.completed >= card.workItems.red.total
    );
  } else if (card.stage === 'green') {
    return (
      card.workItems.green.total > 0 &&
      card.workItems.green.completed >= card.workItems.green.total &&
      card.workItems.red.completed >= card.workItems.red.total &&
      card.workItems.blue.completed >= card.workItems.blue.total
    );
  }

  return canTransition(card);
}

function moveFinishedToNextActivity(
  cards: CardType[],
  wipLimits: ReturnType<typeof WipLimits.empty>
): CardType[] {
  let updatedCards = [...cards];

  updatedCards = moveToNextStage(
    updatedCards,
    'red-finished',
    'blue-active',
    wipLimits
  );

  updatedCards = moveToNextStage(
    updatedCards,
    'blue-finished',
    'green',
    wipLimits
  );

  return updatedCards;
}

function moveToNextStage(
  cards: CardType[],
  fromStage: CardType['stage'],
  toStage: CardType['stage'],
  wipLimits: ReturnType<typeof WipLimits.empty>
): CardType[] {
  let updatedCards = [...cards];
  const cardsToMove = updatedCards
    .filter((card) => card.stage === fromStage)
    .sort((a, b) => b.age - a.age);

  const fromCount = cardsToMove.length;
  const minFrom = WipLimits.getColumnLimit(wipLimits, stageToColumnKey(fromStage)).min;
  const canMoveFrom = minFrom === 0 || fromCount > minFrom;

  if (!canMoveFrom) {
    return updatedCards;
  }

  const toCount = countCardsInStage(updatedCards, toStage);
  const maxTo = WipLimits.getColumnLimit(wipLimits, stageToColumnKey(toStage)).max;
  const canMoveTo = maxTo === 0 || toCount < maxTo;

  if (!canMoveTo) {
    return updatedCards;
  }

  for (const card of cardsToMove) {
    const currentToCount = countCardsInStage(updatedCards, toStage);
    if (maxTo !== 0 && currentToCount >= maxTo) {
      break;
    }

    if (isStageComplete(card)) {
      updatedCards = updatedCards.map((c) =>
        c.id === card.id ? { ...c, stage: toStage } : c
      );
    }
  }

  return updatedCards;
}

function assignWorkersToMatchingCards(
  cards: CardType[],
  workers: readonly Worker[]
): CardType[] {
  const emptyWorkers: CardType['assignedWorkers'] = [];
  let updatedCards = cards.map((card) => ({
    ...card,
    assignedWorkers: emptyWorkers,
  }));

  const redActiveCards = updatedCards
    .filter((card) => card.stage === 'red-active')
    .sort((a, b) => b.age - a.age);
  const blueActiveCards = updatedCards
    .filter((card) => card.stage === 'blue-active')
    .sort((a, b) => b.age - a.age);
  const greenCards = updatedCards
    .filter((card) => card.stage === 'green')
    .sort((a, b) => b.age - a.age);

  const redWorkers = workers.filter((w) => w.type === 'red');
  const blueWorkers = workers.filter((w) => w.type === 'blue');
  const greenWorkers = workers.filter((w) => w.type === 'green');

  updatedCards = assignWorkersToCards(redWorkers, redActiveCards, updatedCards);
  updatedCards = assignWorkersToCards(blueWorkers, blueActiveCards, updatedCards);
  updatedCards = assignWorkersToCards(greenWorkers, greenCards, updatedCards);

  return updatedCards;
}

function assignWorkersToCards(
  workersToAssign: readonly Worker[],
  cardsToAssign: readonly CardType[],
  allCards: CardType[]
): CardType[] {
  if (workersToAssign.length === 0 || cardsToAssign.length === 0) {
    return allCards;
  }

  let updatedCards = allCards.map((c) => ({ ...c }));
  let workerIndex = 0;
  let cardIndex = 0;

  while (workerIndex < workersToAssign.length && cardIndex < cardsToAssign.length) {
    const worker = workersToAssign[workerIndex];
    const targetCardId = cardsToAssign[cardIndex].id;

    updatedCards = updatedCards.map((c) =>
      c.id === targetCardId
        ? { ...c, assignedWorkers: [...c.assignedWorkers, { id: worker.id, type: worker.type }] }
        : c
    );

    workerIndex++;
    cardIndex++;
  }

  if (workerIndex < workersToAssign.length) {
    cardIndex = 0;

    while (workerIndex < workersToAssign.length) {
      const worker = workersToAssign[workerIndex];
      const targetCardId = cardsToAssign[cardIndex].id;
      const targetCard = updatedCards.find((c) => c.id === targetCardId);

      if (targetCard && targetCard.assignedWorkers.length < 3) {
        updatedCards = updatedCards.map((c) =>
          c.id === targetCardId
            ? { ...c, assignedWorkers: [...c.assignedWorkers, { id: worker.id, type: worker.type }] }
            : c
        );
        workerIndex++;
      }

      cardIndex++;

      if (cardIndex >= cardsToAssign.length) {
        const canAnyCardAcceptWorkers = cardsToAssign.some((c) => {
          const card = updatedCards.find((uc) => uc.id === c.id);
          return card && card.assignedWorkers.length < 3;
        });

        if (!canAnyCardAcceptWorkers) {
          break;
        }

        cardIndex = 0;
      }
    }
  }

  return updatedCards;
}

function applyWorkerOutput(cards: CardType[], random: RandomFn): CardType[] {
  return cards.map((card) => applyWorkerOutputToCard(card, random));
}

function transitionReadyCards(
  cards: CardType[],
  currentDay: number,
  wipLimits: ReturnType<typeof WipLimits.empty>
): CardType[] {
  return cards.map((card) => {
    if (!isStageComplete(card)) {
      return card;
    }

    const sourceColumnKey = stageToColumnKey(card.stage);
    const sourceCount = countCardsInStage(cards, card.stage);

    if (
      !WipLimitEnforcer.canMoveOutFromColumn(
        wipLimits,
        sourceColumnKey,
        sourceCount
      )
    ) {
      return card;
    }

    const stageObj = parseStage(card.stage);
    if (!stageObj) {
      return card;
    }

    const nextStageObj = getNextStage(stageObj);
    if (!nextStageObj) {
      return card;
    }

    const nextStage: StageType = nextStageObj.type;
    const targetColumnKey = stageToColumnKey(nextStage);
    const targetCount = countCardsInStage(cards, nextStage);

    if (
      !WipLimitEnforcer.canMoveInToColumn(
        wipLimits,
        targetColumnKey,
        targetCount
      )
    ) {
      return card;
    }

    if (nextStage === 'done') {
      return { ...card, stage: nextStage, completionDay: currentDay };
    }

    return { ...card, stage: nextStage };
  });
}

function clearWorkerAssignments(cards: CardType[]): CardType[] {
  return cards.map((card) => ({ ...card, assignedWorkers: [] }));
}

export function runPolicyDay(input: RunPolicyInput): RunPolicyResult {
  const {
    cards,
    workers,
    currentDay,
    wipLimits,
    random = Math.random,
  } = input;

  const newDay = currentDay + 1;

  const cardsAfterOptionsMove = moveOptionsToRedActive(
    [...cards],
    currentDay,
    wipLimits
  );

  const cardsAfterFinishedMove = moveFinishedToNextActivity(
    cardsAfterOptionsMove,
    wipLimits
  );

  const cardsWithWorkers = assignWorkersToMatchingCards(
    cardsAfterFinishedMove,
    workers
  );

  const agedCards = CardAgingService.ageCards(cardsWithWorkers);

  const cardsWithOutput = applyWorkerOutput(agedCards, random);

  const transitionedCards = transitionReadyCards(
    cardsWithOutput,
    newDay,
    wipLimits
  );

  const finalCards = clearWorkerAssignments(transitionedCards);

  return { cards: finalCards, newDay };
}
