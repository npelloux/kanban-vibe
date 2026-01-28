import type { Card } from '../card/card';
import type { WorkItems, WorkerType } from '../card/work-items';
import { WorkItems as WorkItemsUtil } from '../card/work-items';

export function canTransition(card: Card): boolean {
  if (card.isBlocked) {
    return false;
  }

  const { workItems, stage } = card;

  switch (stage) {
    case 'options':
      return false;

    case 'red-active':
    case 'red-finished':
      return hasWorkAndComplete(workItems, 'red');

    case 'blue-active':
    case 'blue-finished':
      return (
        hasWorkAndComplete(workItems, 'blue') &&
        WorkItemsUtil.isColorComplete(workItems, 'red')
      );

    case 'green':
      return (
        hasWorkAndComplete(workItems, 'green') &&
        WorkItemsUtil.isColorComplete(workItems, 'red') &&
        WorkItemsUtil.isColorComplete(workItems, 'blue')
      );

    case 'done':
      return false;

    default: {
      const _exhaustive: never = stage;
      throw new Error(`Unsupported stage: ${_exhaustive}`);
    }
  }
}

function hasWorkAndComplete(workItems: WorkItems, color: WorkerType): boolean {
  const progress = workItems[color];
  return progress.total > 0 && progress.completed >= progress.total;
}
