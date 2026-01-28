import type { Card, WorkItems } from '../card/card';

/**
 * Determines if a card can transition to the next stage based on work completion.
 *
 * Rules:
 * - Blocked cards cannot transition
 * - Options stage: never auto-transitions (manual move only)
 * - Red stages: require red work complete (total > 0 and completed >= total)
 * - Blue stages: require blue work complete (total > 0) AND red work complete
 * - Green stage: require all colors complete (green total > 0)
 * - Done stage: never transitions (nowhere to go)
 */
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
      return isColorCompleteWithWork(workItems, 'red');

    case 'blue-active':
    case 'blue-finished':
      return (
        isColorCompleteWithWork(workItems, 'blue') &&
        isColorComplete(workItems, 'red')
      );

    case 'green':
      return (
        isColorCompleteWithWork(workItems, 'green') &&
        isColorComplete(workItems, 'red') &&
        isColorComplete(workItems, 'blue')
      );

    case 'done':
      return false;

    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}

/**
 * Checks if a color's work is complete (completed >= total).
 * A color with total = 0 is considered complete.
 */
function isColorComplete(workItems: WorkItems, color: keyof WorkItems): boolean {
  const progress = workItems[color];
  return progress.completed >= progress.total;
}

/**
 * Checks if a color has work AND that work is complete.
 * Returns false if total = 0 (no work to complete).
 */
function isColorCompleteWithWork(
  workItems: WorkItems,
  color: keyof WorkItems
): boolean {
  const progress = workItems[color];
  return progress.total > 0 && progress.completed >= progress.total;
}
