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

export const WorkItems = {
  create(red: WorkProgress, blue: WorkProgress, green: WorkProgress): WorkItems {
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
