import type { CardId } from './card-id';
import type {
  WorkProgress,
  WorkItems,
  WorkerType,
} from './work-items';

export type { WorkProgress, WorkItems, WorkerType };

export type Stage =
  | 'options'
  | 'red-active'
  | 'red-finished'
  | 'blue-active'
  | 'blue-finished'
  | 'green'
  | 'done';

export interface AssignedWorker {
  readonly id: string;
  readonly type: WorkerType;
}

export interface Card {
  readonly id: CardId;
  readonly content: string;
  readonly stage: Stage;
  readonly age: number;
  readonly workItems: WorkItems;
  readonly isBlocked: boolean;
  readonly blockReason?: string;
  readonly startDay: number;
  readonly completionDay: number | null;
  readonly assignedWorkers: readonly AssignedWorker[];
}

export interface CardCreateProps {
  readonly id: CardId;
  readonly content: string;
  readonly stage: Stage;
  readonly workItems: WorkItems;
  readonly startDay: number;
  readonly age?: number;
  readonly isBlocked?: boolean;
  readonly blockReason?: string;
  readonly completionDay?: number | null;
  readonly assignedWorkers?: readonly AssignedWorker[];
}

export const MAX_ASSIGNED_WORKERS = 3;

export const Card = {
  create(props: CardCreateProps): Card {
    const age = props.age ?? 0;
    const assignedWorkers = props.assignedWorkers ?? [];

    if (age < 0) {
      throw new Error('Age cannot be negative');
    }

    if (assignedWorkers.length > MAX_ASSIGNED_WORKERS) {
      throw new Error(
        `Cannot assign more than ${MAX_ASSIGNED_WORKERS} workers to a card`
      );
    }

    return {
      id: props.id,
      content: props.content,
      stage: props.stage,
      age,
      workItems: props.workItems,
      isBlocked: props.isBlocked ?? false,
      blockReason: props.blockReason,
      startDay: props.startDay,
      completionDay: props.completionDay ?? null,
      assignedWorkers: [...assignedWorkers],
    };
  },

  withStage(card: Card, stage: Stage): Card {
    return { ...card, stage };
  },

  withAge(card: Card, age: number): Card {
    if (age < 0) {
      throw new Error('Age cannot be negative');
    }
    return { ...card, age };
  },

  withBlocked(card: Card, isBlocked: boolean): Card {
    if (isBlocked) {
      return { ...card, isBlocked };
    }
    const { blockReason: _blockReason, ...rest } = card;
    void _blockReason;
    return { ...rest, isBlocked: false };
  },

  withBlockReason(card: Card, blockReason: string | undefined): Card {
    if (blockReason === undefined) {
      const { blockReason: _removed, ...rest } = card;
      void _removed;
      return rest as Card;
    }
    return { ...card, blockReason };
  },

  withCompletionDay(card: Card, completionDay: number | null): Card {
    return { ...card, completionDay };
  },

  withWorkItems(card: Card, workItems: WorkItems): Card {
    return { ...card, workItems };
  },

  addWorker(card: Card, worker: AssignedWorker): Card {
    if (card.assignedWorkers.length >= MAX_ASSIGNED_WORKERS) {
      throw new Error(
        `Cannot assign more than ${MAX_ASSIGNED_WORKERS} workers to a card`
      );
    }
    return {
      ...card,
      assignedWorkers: [...card.assignedWorkers, worker],
    };
  },

  removeWorker(card: Card, workerId: string): Card {
    return {
      ...card,
      assignedWorkers: card.assignedWorkers.filter((w) => w.id !== workerId),
    };
  },

  clearWorkers(card: Card): Card {
    return {
      ...card,
      assignedWorkers: [],
    };
  },
} as const;
