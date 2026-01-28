import type { Card as CardType } from '../domain/card/card';
import {
  WorkerOutputCalculator,
  type ColumnColor,
  type RandomFn,
} from '../domain/worker/worker-output';
import type { ColumnKey } from '../domain/wip/wip-limits';

export function getColumnColor(stage: CardType['stage']): ColumnColor {
  if (stage.includes('red')) return 'red';
  if (stage.includes('blue')) return 'blue';
  return 'green';
}

export function stageToColumnKey(stage: CardType['stage']): ColumnKey {
  switch (stage) {
    case 'options':
      return 'options';
    case 'red-active':
      return 'redActive';
    case 'red-finished':
      return 'redFinished';
    case 'blue-active':
      return 'blueActive';
    case 'blue-finished':
      return 'blueFinished';
    case 'green':
      return 'green';
    case 'done':
      return 'done';
  }
}

export function isActiveStage(stage: CardType['stage']): boolean {
  return stage.includes('active') || stage === 'green';
}

export function countCardsInStage(
  cards: readonly CardType[],
  stage: CardType['stage']
): number {
  return cards.filter((c) => c.stage === stage).length;
}

export function applyWorkerOutputToCard(
  card: CardType,
  random: RandomFn
): CardType {
  if (card.assignedWorkers.length === 0 || !isActiveStage(card.stage)) {
    return card;
  }

  const columnColor = getColumnColor(card.stage);
  let workItems = { ...card.workItems };

  for (const worker of card.assignedWorkers) {
    const output = WorkerOutputCalculator.calculate(
      worker.type,
      columnColor,
      random
    );

    const colorItems = workItems[columnColor];
    const newCompleted = Math.min(colorItems.total, colorItems.completed + output);

    workItems = {
      ...workItems,
      [columnColor]: {
        ...colorItems,
        completed: newCompleted,
      },
    };
  }

  return { ...card, workItems };
}
