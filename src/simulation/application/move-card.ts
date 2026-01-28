import type { Card as CardType } from '../domain/card/card';
import type { CardId } from '../domain/card/card-id';
import { WipLimitEnforcer } from '../domain/wip/wip-enforcer';
import { WipLimits, type ColumnKey } from '../domain/wip/wip-limits';
import { countCardsInStage } from './card-stage-helpers';

export interface MoveCardInput {
  readonly cardId: CardId;
  readonly cards: readonly CardType[];
  readonly currentDay: number;
  readonly wipLimits: ReturnType<typeof WipLimits.empty>;
}

export interface MoveCardResult {
  readonly cards: CardType[];
  readonly alertMessage: string | null;
}

type ClickableStage = 'options' | 'red-finished' | 'blue-finished';

interface MoveDefinition {
  readonly targetStage: CardType['stage'];
  readonly targetColumnKey: ColumnKey;
  readonly sourceColumnKey: ColumnKey;
  readonly targetColumnName: string;
  readonly sourceColumnName: string;
  readonly updateStartDay: boolean;
}

const MOVE_DEFINITIONS: Record<ClickableStage, MoveDefinition> = {
  options: {
    targetStage: 'red-active',
    targetColumnKey: 'redActive',
    sourceColumnKey: 'options',
    targetColumnName: 'Red Active',
    sourceColumnName: 'Options',
    updateStartDay: true,
  },
  'red-finished': {
    targetStage: 'blue-active',
    targetColumnKey: 'blueActive',
    sourceColumnKey: 'redFinished',
    targetColumnName: 'Blue Active',
    sourceColumnName: 'Red Finished',
    updateStartDay: false,
  },
  'blue-finished': {
    targetStage: 'green',
    targetColumnKey: 'green',
    sourceColumnKey: 'blueFinished',
    targetColumnName: 'Green Activities',
    sourceColumnName: 'Blue Finished',
    updateStartDay: false,
  },
};

function isClickableStage(stage: CardType['stage']): stage is ClickableStage {
  return stage === 'options' || stage === 'red-finished' || stage === 'blue-finished';
}

export function moveCard(input: MoveCardInput): MoveCardResult {
  const { cardId, cards, currentDay, wipLimits } = input;

  const clickedCard = cards.find((card) => card.id === cardId);
  if (!clickedCard) {
    return { cards: [...cards], alertMessage: null };
  }

  if (!isClickableStage(clickedCard.stage)) {
    return { cards: [...cards], alertMessage: null };
  }

  const moveDef = MOVE_DEFINITIONS[clickedCard.stage];

  // Check max WIP on target column
  const targetCount = countCardsInStage(cards, moveDef.targetStage);
  if (!WipLimitEnforcer.canMoveInToColumn(wipLimits, moveDef.targetColumnKey, targetCount)) {
    const maxLimit = WipLimits.getColumnLimit(wipLimits, moveDef.targetColumnKey).max;
    return {
      cards: [...cards],
      alertMessage: `Cannot move card to ${moveDef.targetColumnName}: Max WIP limit of ${maxLimit} would be exceeded.`,
    };
  }

  // Check min WIP on source column
  const sourceCount = countCardsInStage(cards, clickedCard.stage);
  if (!WipLimitEnforcer.canMoveOutFromColumn(wipLimits, moveDef.sourceColumnKey, sourceCount)) {
    const minLimit = WipLimits.getColumnLimit(wipLimits, moveDef.sourceColumnKey).min;
    return {
      cards: [...cards],
      alertMessage: `Cannot move card out of ${moveDef.sourceColumnName}: Min WIP limit of ${minLimit} would be violated.`,
    };
  }

  // Perform the move
  const updatedCards = cards.map((card) => {
    if (card.id === cardId) {
      if (moveDef.updateStartDay) {
        return { ...card, stage: moveDef.targetStage, startDay: currentDay };
      }
      return { ...card, stage: moveDef.targetStage };
    }
    return card;
  });

  return { cards: updatedCards, alertMessage: null };
}
