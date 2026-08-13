import type { Card } from '../card/card';
import type { ColumnColor } from '../worker/worker-output';

export type ActiveStage = 'red-active' | 'blue-active' | 'green';

export const ACTIVE_STAGES_IN_PIPELINE_ORDER: readonly ActiveStage[] = [
  'red-active',
  'blue-active',
  'green',
];

export interface ActiveCard extends Card {
  readonly stage: ActiveStage;
}

function isActiveStage(stage: Card['stage']): stage is ActiveStage {
  return stage === 'red-active' || stage === 'blue-active' || stage === 'green';
}

export function isWorkableCard(card: Card): card is ActiveCard {
  return isActiveStage(card.stage) && !card.isBlocked;
}

export function colorOfActiveStage(stage: ActiveStage): ColumnColor {
  if (stage === 'red-active') return 'red';
  if (stage === 'blue-active') return 'blue';
  return 'green';
}

export function remainingWorkOn(card: ActiveCard): number {
  const progress = card.workItems[colorOfActiveStage(card.stage)];
  return progress.total - progress.completed;
}
