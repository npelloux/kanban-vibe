export interface WorkProgress {
  readonly total: number;
  readonly completed: number;
}

export interface WorkItems {
  readonly red: WorkProgress;
  readonly blue: WorkProgress;
  readonly green: WorkProgress;
}

export type WorkerType = 'red' | 'blue' | 'green';

function validateWorkProgress(progress: WorkProgress, colorName: string): void {
  if (!Number.isInteger(progress.total) || progress.total < 0) {
    throw new Error(`${colorName} total must be a non-negative integer`);
  }
  if (!Number.isInteger(progress.completed) || progress.completed < 0) {
    throw new Error(`${colorName} completed must be a non-negative integer`);
  }
}

export const WorkItems = {
  create(red: WorkProgress, blue: WorkProgress, green: WorkProgress): WorkItems {
    validateWorkProgress(red, 'red');
    validateWorkProgress(blue, 'blue');
    validateWorkProgress(green, 'green');
    return { red, blue, green };
  },

  empty(): WorkItems {
    return {
      red: { total: 0, completed: 0 },
      blue: { total: 0, completed: 0 },
      green: { total: 0, completed: 0 },
    };
  },

  isColorComplete(items: WorkItems, color: WorkerType): boolean {
    const progress = items[color];
    return progress.completed >= progress.total;
  },

  isAllComplete(items: WorkItems): boolean {
    return (
      WorkItems.isColorComplete(items, 'red') &&
      WorkItems.isColorComplete(items, 'blue') &&
      WorkItems.isColorComplete(items, 'green')
    );
  },

  applyWork(items: WorkItems, color: WorkerType, amount: number): WorkItems {
    const effectiveAmount = Math.max(0, amount);
    const progress = items[color];
    const newCompleted = Math.min(
      progress.total,
      progress.completed + effectiveAmount
    );

    return {
      ...items,
      [color]: { ...progress, completed: newCompleted },
    };
  },
} as const;
