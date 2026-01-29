import type { Card as CardType } from '../domain/card/card';
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

export interface AdvanceDayInput {
  readonly cards: readonly CardType[];
  readonly currentDay: number;
  readonly wipLimits: ReturnType<typeof WipLimits.empty>;
  readonly random?: RandomFn;
}

export interface AdvanceDayResult {
  readonly cards: CardType[];
  readonly newDay: number;
}

function transitionCard(
  card: CardType,
  cards: readonly CardType[],
  currentDay: number,
  wipLimits: ReturnType<typeof WipLimits.empty>
): CardType {
  if (!canTransition(card)) {
    return card;
  }

  const sourceColumnKey = stageToColumnKey(card.stage);
  const sourceCount = countCardsInStage(cards, card.stage);

  if (
    !WipLimitEnforcer.canMoveOutFromColumn(wipLimits, sourceColumnKey, sourceCount)
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
    !WipLimitEnforcer.canMoveInToColumn(wipLimits, targetColumnKey, targetCount)
  ) {
    return card;
  }

  if (nextStage === 'done') {
    return { ...card, stage: nextStage, completionDay: currentDay };
  }

  return { ...card, stage: nextStage };
}

function clearWorkerAssignments(card: CardType): CardType {
  return { ...card, assignedWorkers: [] };
}

export function advanceDay(input: AdvanceDayInput): AdvanceDayResult {
  const { cards, currentDay, wipLimits, random = Math.random } = input;
  const newDay = currentDay + 1;

  const agedCards = CardAgingService.ageCards([...cards]);

  const cardsWithOutput = agedCards.map((card) =>
    applyWorkerOutputToCard(card, random)
  );

  const transitionedCards = cardsWithOutput.map((card) =>
    transitionCard(card, cardsWithOutput, currentDay, wipLimits)
  );

  const finalCards = transitionedCards.map(clearWorkerAssignments);

  return { cards: finalCards, newDay };
}
