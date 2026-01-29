import { z } from 'zod';
import { Board } from '../domain/board/board';
import { Card } from '../domain/card/card';
import { CardId } from '../domain/card/card-id';
import { Worker } from '../domain/worker/worker';
import { WipLimits } from '../domain/wip/wip-limits';

const STORAGE_KEY = 'kanban-vibe-state';

const WorkProgressSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
});

const WorkItemsSchema = z.object({
  red: WorkProgressSchema,
  blue: WorkProgressSchema,
  green: WorkProgressSchema,
});

const WorkerTypeSchema = z.enum(['red', 'blue', 'green']);

const AssignedWorkerSchema = z.object({
  id: z.string(),
  type: WorkerTypeSchema,
});

const StageSchema = z.enum([
  'options',
  'red-active',
  'red-finished',
  'blue-active',
  'blue-finished',
  'green',
  'done',
]);

const CardSchema = z.object({
  id: z.string().refine((val) => CardId.isValid(val), {
    message: 'Invalid card id format',
  }),
  content: z.string(),
  stage: StageSchema,
  age: z.number().int().nonnegative(),
  workItems: WorkItemsSchema,
  isBlocked: z.boolean(),
  startDay: z.number().int().nonnegative(),
  completionDay: z.number().int().nonnegative().nullable(),
  assignedWorkers: z.array(AssignedWorkerSchema),
});

const WorkerSchema = z.object({
  id: z.string().min(1),
  type: WorkerTypeSchema,
});

const ColumnLimitSchema = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});

const WipLimitsSchema = z.object({
  options: ColumnLimitSchema,
  redActive: ColumnLimitSchema,
  redFinished: ColumnLimitSchema,
  blueActive: ColumnLimitSchema,
  blueFinished: ColumnLimitSchema,
  green: ColumnLimitSchema,
  done: ColumnLimitSchema,
});

const BoardStateSchema = z.object({
  currentDay: z.number().int().nonnegative(),
  cards: z.array(CardSchema),
  workers: z.array(WorkerSchema),
  wipLimits: WipLimitsSchema,
});

type BoardState = z.infer<typeof BoardStateSchema>;

function serializeBoard(board: Board): BoardState {
  return {
    currentDay: board.currentDay,
    cards: board.cards.map((card) => ({
      id: card.id,
      content: card.content,
      stage: card.stage,
      age: card.age,
      workItems: {
        red: { total: card.workItems.red.total, completed: card.workItems.red.completed },
        blue: { total: card.workItems.blue.total, completed: card.workItems.blue.completed },
        green: { total: card.workItems.green.total, completed: card.workItems.green.completed },
      },
      isBlocked: card.isBlocked,
      startDay: card.startDay,
      completionDay: card.completionDay,
      assignedWorkers: card.assignedWorkers.map((w) => ({
        id: w.id,
        type: w.type,
      })),
    })),
    workers: board.workers.map((worker) => ({
      id: worker.id,
      type: worker.type,
    })),
    wipLimits: {
      options: { min: board.wipLimits.options.min, max: board.wipLimits.options.max },
      redActive: { min: board.wipLimits.redActive.min, max: board.wipLimits.redActive.max },
      redFinished: { min: board.wipLimits.redFinished.min, max: board.wipLimits.redFinished.max },
      blueActive: { min: board.wipLimits.blueActive.min, max: board.wipLimits.blueActive.max },
      blueFinished: { min: board.wipLimits.blueFinished.min, max: board.wipLimits.blueFinished.max },
      green: { min: board.wipLimits.green.min, max: board.wipLimits.green.max },
      done: { min: board.wipLimits.done.min, max: board.wipLimits.done.max },
    },
  };
}

function deserializeBoard(state: BoardState): Board {
  const cards = state.cards.map((cardState) => {
    const cardId = CardId.create(cardState.id);
    if (cardId === null) {
      throw new Error(`Invalid card id: ${cardState.id}`);
    }
    return Card.create({
      id: cardId,
      content: cardState.content,
      stage: cardState.stage,
      age: cardState.age,
      workItems: cardState.workItems,
      isBlocked: cardState.isBlocked,
      startDay: cardState.startDay,
      completionDay: cardState.completionDay,
      assignedWorkers: cardState.assignedWorkers,
    });
  });

  const workers = state.workers.map((workerState) =>
    Worker.create(workerState.id, workerState.type)
  );

  const wipLimits = WipLimits.create(state.wipLimits);

  return Board.create({
    currentDay: state.currentDay,
    cards,
    workers,
    wipLimits,
  });
}

export const StateRepository = {
  saveBoard(board: Board): void {
    const state = serializeBoard(board);
    const json = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded while saving board.', error);
        return;
      }
      throw error;
    }
  },

  loadBoard(): Board | null {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(json);
      const result = BoardStateSchema.safeParse(parsed);

      if (!result.success) {
        console.error(
          'Failed to parse saved board state:',
          result.error.format()
        );
        return null;
      }

      return deserializeBoard(result.data);
    } catch (error) {
      console.error('Failed to load board from localStorage:', error);
      return null;
    }
  },

  clearBoard(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
} as const;
