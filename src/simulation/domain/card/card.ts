import type { CardId } from './card-id';

/**
 * Stage represents the workflow stages a card can be in
 */
export type Stage =
  | 'options'
  | 'red-active'
  | 'red-finished'
  | 'blue-active'
  | 'blue-finished'
  | 'green'
  | 'done';

/**
 * WorkerType represents the specialization of a worker
 */
export type WorkerType = 'red' | 'blue' | 'green';

/**
 * WorkItem represents work to be completed for a specific color
 */
export interface WorkItem {
  readonly total: number;
  readonly completed: number;
}

/**
 * WorkItems contains work items for each color
 */
export interface WorkItems {
  readonly red: WorkItem;
  readonly blue: WorkItem;
  readonly green: WorkItem;
}

/**
 * AssignedWorker represents a worker assigned to a card
 */
export interface AssignedWorker {
  readonly id: string;
  readonly type: WorkerType;
}

/**
 * Card represents an immutable work item in the Kanban simulation
 */
export interface Card {
  readonly id: CardId;
  readonly content: string;
  readonly stage: Stage;
  readonly age: number;
  readonly workItems: WorkItems;
  readonly isBlocked: boolean;
  readonly startDay: number;
  readonly completionDay: number | null;
  readonly assignedWorkers: readonly AssignedWorker[];
}

/**
 * Properties required to create a new Card
 */
export interface CardCreateProps {
  readonly id: CardId;
  readonly content: string;
  readonly stage: Stage;
  readonly workItems: WorkItems;
  readonly startDay: number;
  readonly age?: number;
  readonly isBlocked?: boolean;
  readonly completionDay?: number | null;
  readonly assignedWorkers?: readonly AssignedWorker[];
}

const MAX_ASSIGNED_WORKERS = 3;

/**
 * Card factory and utility functions for immutable operations
 */
export const Card = {
  /**
   * Creates a new Card with the given properties.
   * Throws if age is negative or more than 3 workers are assigned.
   */
  create(props: CardCreateProps): Card {
    const age = props.age ?? 0;
    const assignedWorkers = props.assignedWorkers ?? [];

    if (age < 0) {
      throw new Error('Age cannot be negative');
    }

    if (assignedWorkers.length > MAX_ASSIGNED_WORKERS) {
      throw new Error('Cannot assign more than 3 workers to a card');
    }

    return {
      id: props.id,
      content: props.content,
      stage: props.stage,
      age,
      workItems: props.workItems,
      isBlocked: props.isBlocked ?? false,
      startDay: props.startDay,
      completionDay: props.completionDay ?? null,
      assignedWorkers: [...assignedWorkers],
    };
  },

  /**
   * Returns a new Card with the stage updated
   */
  withStage(card: Card, stage: Stage): Card {
    return { ...card, stage };
  },

  /**
   * Returns a new Card with the age updated.
   * Throws if age is negative.
   */
  withAge(card: Card, age: number): Card {
    if (age < 0) {
      throw new Error('Age cannot be negative');
    }
    return { ...card, age };
  },

  /**
   * Returns a new Card with the isBlocked flag updated
   */
  withBlocked(card: Card, isBlocked: boolean): Card {
    return { ...card, isBlocked };
  },

  /**
   * Returns a new Card with the completion day set
   */
  withCompletionDay(card: Card, completionDay: number): Card {
    return { ...card, completionDay };
  },

  /**
   * Returns a new Card with updated work items
   */
  withWorkItems(card: Card, workItems: WorkItems): Card {
    return { ...card, workItems };
  },

  /**
   * Returns a new Card with a worker added.
   * Throws if adding would exceed the maximum of 3 workers.
   */
  addWorker(card: Card, worker: AssignedWorker): Card {
    if (card.assignedWorkers.length >= MAX_ASSIGNED_WORKERS) {
      throw new Error('Cannot assign more than 3 workers to a card');
    }
    return {
      ...card,
      assignedWorkers: [...card.assignedWorkers, worker],
    };
  },

  /**
   * Returns a new Card with the specified worker removed
   */
  removeWorker(card: Card, workerId: string): Card {
    return {
      ...card,
      assignedWorkers: card.assignedWorkers.filter((w) => w.id !== workerId),
    };
  },

  /**
   * Returns a new Card with all workers removed
   */
  clearWorkers(card: Card): Card {
    return {
      ...card,
      assignedWorkers: [],
    };
  },
} as const;
